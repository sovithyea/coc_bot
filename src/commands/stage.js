import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoster } from '../db.js';
import { askClaudeRateLimited } from '../ai.js';

export const data = new SlashCommandBuilder()
  .setName('stage')
  .setDescription('Get advice for a specific stage')
  .addStringOption(opt =>
    opt.setName('stage')
      .setDescription('Stage number e.g. 8-70')
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('mode')
      .setDescription('Game mode')
      .setRequired(false)
      .addChoices(
        { name: 'Campaign', value: 'Campaign' },
        { name: 'Horde Invasion', value: 'HordeInvasion' },
        { name: 'Badge Dojo', value: 'BadgeDojo' },
        { name: 'Gold Rush', value: 'GoldRush' },
      ));

export async function execute(interaction) {
  await interaction.deferReply();

  const stage = interaction.options.getString('stage');
  const mode = interaction.options.getString('mode') ?? 'Campaign';
  const roster = getRoster(interaction.user.id);

  const rosterStr = roster.length > 0
    ? roster.map(t => `${t.name} (${t.tier})`).join(', ')
    : 'all Tatari available';

  const prompt = `Give me advice for stage ${stage} in ${mode}. What enemies appear, what element should I bring, what formation works best, and any specific tips for this stage. My roster is: ${rosterStr}

Respond with JSON matching this exact schema:
{
  "stageOverview": "what happens in this stage",
  "enemyElements": ["elements that appear"],
  "recommendedElement": "best element to bring",
  "formation": "frontline/midline/backline advice",
  "squad": [
    { "name": "name", "role": "role", "position": "position", "why": "why" }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "warning": "any specific danger or mechanic to watch out for, or null"
}`;

  try {
    const result = await askClaudeRateLimited(interaction.user.id, prompt);

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🗺️ Stage ${stage} Guide`)
      .setColor(0x9B59B6)
      .setFooter({ text: 'Use /roster set to get personalised squad suggestions' });

    if (result.stageOverview) {
      embed.addFields({ name: '📋 Overview', value: result.stageOverview });
    }
    if (result.enemyElements?.length) {
      embed.addFields({ name: '⚔️ Enemy Elements', value: result.enemyElements.join(', ') });
    }
    if (result.recommendedElement) {
      embed.addFields({ name: '✅ Recommended Element', value: result.recommendedElement });
    }
    if (result.formation) {
      embed.addFields({ name: '🏟️ Formation', value: result.formation });
    }
    if (result.squad?.length) {
      const squadLines = result.squad.map(m => `**${m.name}** (${m.position}) — ${m.role}: ${m.why}`);
      embed.addFields({ name: '🐾 Squad', value: squadLines.join('\n') });
    }
    if (result.tips?.length) {
      embed.addFields({ name: '💡 Tips', value: result.tips.map(t => `• ${t}`).join('\n') });
    }
    if (result.warning && result.warning !== 'null') {
      embed.addFields({ name: '⚠️ Watch Out', value: result.warning });
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
