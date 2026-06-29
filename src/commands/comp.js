import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoster } from '../db.js';
import { askClaude, buildCompPrompt } from '../ai.js';

const ELEMENT_COLORS = {
  Fire: 0xFF6B35,
  Water: 0x4FC3F7,
  Lightning: 0xFFD700,
  Grass: 0x66BB6A,
  Rock: 0x8D6E63,
};

export const data = new SlashCommandBuilder()
  .setName('comp')
  .setDescription('Get team composition advice for Clash of Critters')
  .addStringOption(opt =>
    opt.setName('mode')
      .setDescription('Game mode')
      .setRequired(false)
      .addChoices(
        { name: 'Campaign', value: 'Campaign' },
        { name: 'Horde Invasion', value: 'HordeInvasion' },
        { name: 'Badge Dojo', value: 'BadgeDojo' },
        { name: 'Gold Rush', value: 'GoldRush' },
      ))
  .addStringOption(opt =>
    opt.setName('enemy_element')
      .setDescription('Enemy element to counter')
      .setRequired(false)
      .addChoices(
        { name: 'Fire', value: 'Fire' },
        { name: 'Water', value: 'Water' },
        { name: 'Lightning', value: 'Lightning' },
        { name: 'Grass', value: 'Grass' },
        { name: 'Rock', value: 'Rock' },
      ))
  .addStringOption(opt =>
    opt.setName('stage')
      .setDescription('Stage or level number')
      .setRequired(false));

export async function execute(interaction) {
  await interaction.deferReply();

  const mode = interaction.options.getString('mode');
  const enemyElement = interaction.options.getString('enemy_element');
  const stage = interaction.options.getString('stage');
  const roster = getRoster(interaction.user.id);

  try {
    const result = await askClaude(buildCompPrompt({ roster, mode, enemyElement, stage }));

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎯 Team Comp Recommendation')
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
  } catch {
    await interaction.editReply({ embeds: [errorEmbed()] });
  }
}

function errorEmbed() {
  return new EmbedBuilder()
    .setTitle('Something went wrong')
    .setDescription("Couldn't reach the advisor. Try again in a moment.")
    .setColor(0xFF0000);
}
