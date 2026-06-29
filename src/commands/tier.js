import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { tatariData } from '../ai.js';

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

const RARITY_TIER = { mythic: 'S', legendary: 'A', epic: 'B', rare: 'C', common: 'D' };

export const data = new SlashCommandBuilder()
  .setName('tier')
  .setDescription('Show the Tatari tier list by rarity')
  .addStringOption(opt =>
    opt.setName('element')
      .setDescription('Filter by element')
      .setRequired(false)
      .addChoices(
        { name: 'All', value: 'All' },
        { name: 'Fire 🔥', value: 'Fire' },
        { name: 'Water 💧', value: 'Water' },
        { name: 'Lightning ⚡', value: 'Lightning' },
        { name: 'Grass 🌿', value: 'Grass' },
        { name: 'Rock 🪨', value: 'Rock' },
      ));

export async function execute(interaction) {
  await interaction.deferReply();

  try {
    const element = interaction.options.getString('element') ?? 'All';

    const pool = element === 'All'
      ? tatariData
      : tatariData.filter(t => t.element === element);

    const groups = { S: [], A: [], B: [] };

    for (const t of pool) {
      const tier = RARITY_TIER[t.rarity];
      if (groups[tier]) {
        groups[tier].push(t);
      }
    }

    for (const tier of Object.keys(groups)) {
      groups[tier].sort((a, b) => a.name.localeCompare(b.name));
    }

    const fmt = t => `${t.name} — ${t.element} ${t.class}`;

    const emoji = ELEMENT_EMOJIS[element] ?? '🏆';
    const title = element === 'All' ? '🏆 Full Tier List' : `${emoji} ${element} Tier List`;
    const color = ELEMENT_COLORS[element] ?? 0x5865F2;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setFooter({ text: 'Tier = rarity. Higher rarity unlocks stronger final evolutions.' });

    if (groups.S.length) {
      embed.addFields({ name: '⭐ S Tier (Mythic)', value: groups.S.map(fmt).join('\n') });
    }
    if (groups.A.length) {
      embed.addFields({ name: '🔥 A Tier (Legendary)', value: groups.A.map(fmt).join('\n') });
    }
    if (groups.B.length) {
      embed.addFields({ name: '📊 B Tier (Epic)', value: groups.B.map(fmt).join('\n') });
    }

    if (!groups.S.length && !groups.A.length && !groups.B.length) {
      embed.setDescription('No Tatari found for this filter.');
    }

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Something went wrong')
          .setDescription("Couldn't load the tier list. Try again in a moment.")
          .setColor(0xE74C3C),
      ],
    });
  }
}
