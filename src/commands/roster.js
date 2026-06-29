import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoster, setRoster, clearRoster } from '../db.js';
import { tatariData } from '../ai.js';

export const data = new SlashCommandBuilder()
  .setName('roster')
  .setDescription('Manage your Tatari roster')
  .addSubcommand(sub =>
    sub.setName('add')
      .setDescription('Add or update a single Tatari in your roster')
      .addStringOption(opt =>
        opt.setName('name')
          .setDescription('Tatari name')
          .setRequired(true)
          .setAutocomplete(true))
      .addStringOption(opt =>
        opt.setName('tier')
          .setDescription('Evolution tier')
          .setRequired(true)
          .addChoices(
            { name: 'T1', value: 'T1' },
            { name: 'T2', value: 'T2' },
            { name: 'T3', value: 'T3' },
            { name: 'T4', value: 'T4' },
          )))
  .addSubcommand(sub =>
    sub.setName('remove')
      .setDescription('Remove a single Tatari from your roster')
      .addStringOption(opt =>
        opt.setName('name')
          .setDescription('Tatari name')
          .setRequired(true)
          .setAutocomplete(true)))
  .addSubcommand(sub =>
    sub.setName('set')
      .setDescription('Replace your entire roster at once. Format: "Magnedart T4, Frostluna T3"')
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
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused(true);
    if (focused.name === 'name') {
      const matches = tatariData
        .filter(t => t.name.toLowerCase().includes(focused.value.toLowerCase()))
        .slice(0, 25)
        .map(t => ({ name: t.name, value: t.name }));
      return interaction.respond(matches);
    }
    return interaction.respond([]);
  }

  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    const inputName = interaction.options.getString('name');
    const tier = interaction.options.getString('tier');

    const match = tatariData.find(t => t.name.toLowerCase() === inputName.toLowerCase());
    if (!match) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Not Recognised')
            .setDescription(`\`${inputName}\` is not a known Tatari. Check spelling or use the autocomplete.`)
            .setColor(0xE74C3C),
        ],
      });
    }

    const roster = getRoster(interaction.user.id);
    const updated = roster.filter(e => e.name.toLowerCase() !== match.name.toLowerCase());
    updated.push({ name: match.name, tier });
    setRoster(interaction.user.id, updated);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('✅ Roster Updated')
          .setDescription(`**${match.name} ${tier}** added to your roster.`)
          .setColor(0x5865F2),
      ],
    });
  }

  if (sub === 'remove') {
    const inputName = interaction.options.getString('name');
    const roster = getRoster(interaction.user.id);
    const idx = roster.findIndex(e => e.name.toLowerCase() === inputName.toLowerCase());

    if (idx === -1) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Not Found')
            .setDescription(`\`${inputName}\` not found in your roster.`)
            .setColor(0xE74C3C),
        ],
      });
    }

    const removed = roster[idx];
    roster.splice(idx, 1);
    setRoster(interaction.user.id, roster);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('✅ Removed')
          .setDescription(`**${removed.name}** removed from your roster.`)
          .setColor(0x5865F2),
      ],
    });
  }

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
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🗑️ Roster Cleared')
          .setDescription('Your roster has been cleared. Use `/roster set` to add Tatari again.')
          .setColor(0x5865F2),
      ],
    });
  }
}

function parseRosterInput(input) {
  const valid = [];
  const invalid = [];

  for (const raw of input.split(',')) {
    const parts = raw.trim().split(/\s+/);
    if (!parts.length || !parts[0]) continue;

    const rawLast = parts[parts.length - 1];
    const last = rawLast.replace(/-/g, '');
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
