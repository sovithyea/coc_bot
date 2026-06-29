import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('upgrade')
  .setDescription('Get upgrade priority recommendations')
  .addStringOption(option =>
    option.setName('critter')
      .setDescription('Critter name to evaluate (optional — uses your roster if omitted)')
      .setRequired(false));

export async function execute(interaction) {
  await interaction.reply('`/upgrade` — not yet implemented.');
}
