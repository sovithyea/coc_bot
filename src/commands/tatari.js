import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('tatari')
  .setDescription('Look up a Tatari in the knowledge base')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Tatari name to look up')
      .setRequired(true));

export async function execute(interaction) {
  await interaction.reply('`/tatari` — not yet implemented.');
}
