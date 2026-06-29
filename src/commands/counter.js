import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoster } from '../db.js';
import { askClaudeRateLimited, buildCounterPrompt } from '../ai.js';

const ELEMENT_COLORS = {
  Fire: 0xFF6B35,
  Water: 0x4FC3F7,
  Lightning: 0xFFD700,
  Grass: 0x66BB6A,
  Rock: 0x8D6E63,
};

const ELEMENT_EMOJIS = {
  Fire: '🔥',
  Water: '💧',
  Lightning: '⚡',
  Grass: '🌿',
  Rock: '🪨',
};

export const data = new SlashCommandBuilder()
  .setName('counter')
  .setDescription('Find the best team to counter an enemy element')
  .addStringOption(opt =>
    opt.setName('enemy_element')
      .setDescription('Enemy element to counter')
      .setRequired(true)
      .addChoices(
        { name: 'Fire 🔥', value: 'Fire' },
        { name: 'Water 💧', value: 'Water' },
        { name: 'Lightning ⚡', value: 'Lightning' },
        { name: 'Grass 🌿', value: 'Grass' },
        { name: 'Rock 🪨', value: 'Rock' },
      ));

export async function execute(interaction) {
  await interaction.deferReply();

  const enemyElement = interaction.options.getString('enemy_element');
  const roster = getRoster(interaction.user.id);

  try {
    const result = await askClaudeRateLimited(interaction.user.id, buildCounterPrompt({ enemyElement, roster }));

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const emoji = ELEMENT_EMOJIS[enemyElement] ?? '';
    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Best Counter to ${enemyElement} Enemies`)
      .setColor(ELEMENT_COLORS[enemyElement] ?? 0x5865F2);

    const byPosition = { frontline: [], midline: [], backline: [] };
    for (const member of (result.squad ?? [])) {
      const pos = member.position?.toLowerCase();
      (byPosition[pos] ?? byPosition.backline).push(member);
    }

    const fmt = m => `**${m.name}** — ${m.role}: ${m.why}`;
    if (byPosition.frontline.length) embed.addFields({ name: 'Frontline', value: byPosition.frontline.map(fmt).join('\n') });
    if (byPosition.midline.length)   embed.addFields({ name: 'Midline',   value: byPosition.midline.map(fmt).join('\n') });
    if (byPosition.backline.length)  embed.addFields({ name: 'Backline',  value: byPosition.backline.map(fmt).join('\n') });

    if (result.auraCombo)   embed.addFields({ name: '⚡ Aura',          value: result.auraCombo });
    if (result.upgradeNext) embed.addFields({ name: '⬆️ Upgrade Next', value: result.upgradeNext });
    if (result.reasoning)   embed.addFields({ name: '📖 Strategy',      value: result.reasoning });

    embed.setFooter({
      text: result.elementWarning && result.elementWarning !== 'null'
        ? result.elementWarning
        : 'Tip: use /roster set to save your Tatari',
    });

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
