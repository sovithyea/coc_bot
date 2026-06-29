import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { askClaudeRateLimited } from '../ai.js';

const MODE_EMOJIS = {
  Campaign: '📖',
  HordeInvasion: '🌊',
  BadgeDojo: '🏆',
  GoldRush: '💰',
};

export const data = new SlashCommandBuilder()
  .setName('meta')
  .setDescription('Show the best meta team compositions by game mode')
  .addStringOption(opt =>
    opt.setName('mode')
      .setDescription('Filter to a specific game mode')
      .setRequired(false)
      .addChoices(
        { name: 'Campaign', value: 'Campaign' },
        { name: 'Horde Invasion', value: 'HordeInvasion' },
        { name: 'Badge Dojo', value: 'BadgeDojo' },
        { name: 'Gold Rush', value: 'GoldRush' },
      ));

export async function execute(interaction) {
  await interaction.deferReply();

  const mode = interaction.options.getString('mode');
  const modeLabel = mode ?? 'all game modes';

  const prompt = `What are the current best meta team compositions for ${modeLabel}? For each mode show the top comp, why it works, and who the key units are.

Respond with JSON matching this exact schema:
{
  "comps": [
    {
      "mode": "mode name",
      "name": "comp name e.g. Lightning Speed",
      "core": ["unit1", "unit2", "unit3", "unit4", "unit5"],
      "keyUnit": "most important unit",
      "strategy": "how the comp works",
      "weakness": "what counters it"
    }
  ]
}`;

  try {
    const result = await askClaudeRateLimited(interaction.user.id, prompt);

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const title = mode
      ? `🏆 Current Meta — ${mode}`
      : '🏆 Current Meta — All Modes';

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(0xF39C12)
      .setFooter({ text: 'Use /comp with your roster for personalised advice' });

    for (const comp of (result.comps ?? [])) {
      const emoji = MODE_EMOJIS[comp.mode] ?? '🎮';
      const fieldName = `${emoji} ${comp.mode} — ${comp.name}`;
      const core = comp.core?.join(', ') ?? '—';
      const value = [
        `**Core:** ${core}`,
        `**Key unit:** ${comp.keyUnit}`,
        `**Strategy:** ${comp.strategy}`,
        `**Weakness:** ${comp.weakness}`,
      ].join('\n');
      embed.addFields({ name: fieldName, value });
    }

    if (!result.comps?.length) {
      embed.setDescription('No meta comps found.');
    }

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
