import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('counter')
  .setDescription('Find counters for a critter or enemy team')
  .addStringOption(option =>
    option.setName('target')
      .setDescription('Critter name or element to counter')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.reply('`/counter` — not yet implemented.');
}
