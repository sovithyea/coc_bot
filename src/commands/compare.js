import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { askClaudeRateLimited, tatariData } from '../ai.js';

export const data = new SlashCommandBuilder()
  .setName('compare')
  .setDescription('Compare two Tatari head-to-head')
  .addStringOption(opt =>
    opt.setName('first')
      .setDescription('First Tatari name')
      .setRequired(true)
      .setAutocomplete(true))
  .addStringOption(opt =>
    opt.setName('second')
      .setDescription('Second Tatari name')
      .setRequired(true)
      .setAutocomplete(true));

export async function execute(interaction) {
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused(true);
    const matches = tatariData
      .filter(t => t.name.toLowerCase().includes(focused.value.toLowerCase()))
      .slice(0, 25)
      .map(t => ({ name: t.name, value: t.name }));
    return interaction.respond(matches);
  }

  await interaction.deferReply();

  const first = interaction.options.getString('first');
  const second = interaction.options.getString('second');

  const prompt = `Compare ${first} vs ${second} — which is better and in what situations? Consider their roles, skills, auras, synergies, and evolution value.

Respond with JSON matching this exact schema:
{
  "winner": "name of the better overall pick",
  "winnerReason": "why this one wins overall",
  "firstStrengths": ["strength 1", "strength 2"],
  "secondStrengths": ["strength 1", "strength 2"],
  "firstBestFor": "what situation first excels in",
  "secondBestFor": "what situation second excels in",
  "verdict": "2 sentence plain english verdict"
}`;

  try {
    const result = await askClaudeRateLimited(interaction.user.id, prompt);

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${first} vs ${second}`)
      .setColor(0xE74C3C);

    if (result.winner && result.winnerReason) {
      embed.addFields({ name: '🏆 Overall Winner', value: `**${result.winner}** — ${result.winnerReason}` });
    }

    if (result.firstStrengths?.length || result.firstBestFor) {
      const bullets = (result.firstStrengths ?? []).map(s => `• ${s}`).join('\n');
      const best = result.firstBestFor ? `\n**Best for:** ${result.firstBestFor}` : '';
      embed.addFields({ name: `${first} Strengths`, value: (bullets + best).trim() });
    }

    if (result.secondStrengths?.length || result.secondBestFor) {
      const bullets = (result.secondStrengths ?? []).map(s => `• ${s}`).join('\n');
      const best = result.secondBestFor ? `\n**Best for:** ${result.secondBestFor}` : '';
      embed.addFields({ name: `${second} Strengths`, value: (bullets + best).trim() });
    }

    if (result.verdict) {
      embed.addFields({ name: 'Verdict', value: result.verdict });
    }

    embed.setFooter({ text: 'Use /comp to build a team around your chosen Tatari' });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply({ embeds: [claudeErrorEmbed(err)] });
  }
}

function claudeErrorEmbed(err) {
  if (err?.message === 'DAILY_LIMIT_REACHED') {
    return new EmbedBuilder()
      .setTitle('⚠️ Daily Limit Reached')
      .setDescription('The bot has hit its daily limit of Claude API calls. Try again tomorrow.')
      .setColor(0xE74C3C);
  }
  if (err?.message?.toLowerCase().includes('bottleneck')) {
    return new EmbedBuilder()
      .setTitle('⏳ Slow Down')
      .setDescription("You're using the bot too fast. Wait 15 seconds between commands.")
      .setColor(0xF39C12);
  }
  return errorEmbed();
}

function errorEmbed() {
  return new EmbedBuilder()
    .setTitle('Something went wrong')
    .setDescription("Couldn't reach the advisor. Try again in a moment.")
    .setColor(0xFF0000);
}
