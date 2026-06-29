import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoster, setRoster, clearRoster } from '../db.js';
import { tatariData } from '../ai.js';

export const data = new SlashCommandBuilder()
  .setName('roster')
  .setDescription('Manage your Tatari roster')
  .addSubcommand(sub =>
    sub.setName('set')
      .setDescription('Set your roster (replaces existing). Format: "Magnedart T4, Frostluna T3"')
      .addStringOption(opt =>
        opt.setName('tatari_list')
          .setDescription('Comma-separated Tatari names with optional tier (T1-T4)')
          .setRequired(true)))
  .addSubcommand(sub =>
    sub.setName('view')
      .setDescription('View your current roster'))
  .addSubcommand(sub =>
    sub.setName('clear')
      .setDescription('Clear your entire roster'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'set') {
    const input = interaction.options.getString('tatari_list');
    const { valid, invalid } = parseRosterInput(input);

    if (valid.length > 0) {
      setRoster(interaction.user.id, valid);
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Roster Updated')
      .setColor(0x5865F2);

    if (valid.length > 0) {
      embed.addFields({
        name: `✅ Saved (${valid.length})`,
        value: valid.map(e => `${e.name} — ${e.tier}`).join('\n'),
      });
    }
    if (invalid.length > 0) {
      embed.addFields({
        name: `❌ Not recognised (${invalid.length})`,
        value: invalid.join(', '),
      });
    }
    if (valid.length === 0) {
      embed.setDescription('No valid Tatari names found. Check spelling and try again.');
    }

    return interaction.reply({ embeds: [embed] });
  }

  if (sub === 'view') {
    const roster = getRoster(interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle('📋 Your Roster')
      .setColor(0x5865F2);

    if (roster.length === 0) {
      embed.setDescription('Your roster is empty.\nUse `/roster set` to save your Tatari. Example: `Magnedart T4, Frostluna T3`');
    } else {
      embed.setDescription(roster.map(e => `**${e.name}** — ${e.tier}`).join('\n'));
      embed.setFooter({ text: `${roster.length} Tatari saved` });
    }

    return interaction.reply({ embeds: [embed] });
  }

  if (sub === 'clear') {
    clearRoster(interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Roster Cleared')
      .setDescription('Your roster has been cleared. Use `/roster set` to add Tatari again.')
      .setColor(0x5865F2);
    return interaction.reply({ embeds: [embed] });
  }
}

function parseRosterInput(input) {
  const valid = [];
  const invalid = [];

  for (const raw of input.split(',')) {
    const parts = raw.trim().split(/\s+/);
    if (!parts.length || !parts[0]) continue;

    const last = parts[parts.length - 1];
    let tier = 'T1';
    let nameParts = parts;

    if (/^T[1-4]$/i.test(last)) {
      tier = last.toUpperCase();
      nameParts = parts.slice(0, -1);
    }

    const name = nameParts.join(' ');
    if (!name) continue;

    const match = tatariData.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (match) {
      valid.push({ name: match.name, tier });
    } else {
      invalid.push(name);
    }
  }

  return { valid, invalid };
}
