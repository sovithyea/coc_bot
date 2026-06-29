import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('tier')
  .setDescription('Show the current tier list for Clash of Critters')
  .addStringOption(option =>
    option.setName('mode')
      .setDescription('Filter by game mode')
      .setRequired(false)
      .addChoices(
        { name: 'PvP', value: 'pvp' },
        { name: 'Raid', value: 'raid' },
        { name: 'Arena', value: 'arena' },
      ));

export async function execute(interaction) {
  await interaction.reply('`/tier` — not yet implemented.');
}
