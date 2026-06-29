import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('roster')
  .setDescription('Manage your critter roster')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add a critter to your roster')
      .addStringOption(opt => opt.setName('critter').setDescription('Critter name').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove a critter from your roster')
      .addStringOption(opt => opt.setName('critter').setDescription('Critter name').setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('list')
      .setDescription('Show your roster'));

export async function execute(interaction) {
  await interaction.reply('`/roster` — not yet implemented.');
}
