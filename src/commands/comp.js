import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('comp')
  .setDescription('Get team composition advice for Clash of Critters')
  .addStringOption(option =>
    option.setName('mode')
      .setDescription('Game mode (pvp, raid, arena)')
      .setRequired(false)
      .addChoices(
        { name: 'PvP', value: 'pvp' },
        { name: 'Raid', value: 'raid' },
        { name: 'Arena', value: 'arena' },
      ));

export async function execute(interaction) {
  await interaction.reply('`/comp` — not yet implemented.');
}
