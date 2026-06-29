import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('How to use CoC Advisor');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('CoC AI — How to Use This Bot')
    .setColor(0x5865F2)
    .addFields(
      {
        name: '⚡ Quick Start',
        value: '1. Save your Tatari with `/roster set`\n2. Run `/comp` to get a team built from what you own\n3. Use `/counter` to counter specific enemy elements\n4. Use `/tatari` to look up any critter in the game',
      },
      {
        name: '📋 /roster',
        value: '`/roster set` — Replace entire roster (format: `Frostluna T3, Magnedart T3`)\n`/roster add` — Add or update one Tatari with autocomplete\n`/roster remove` — Remove one Tatari with autocomplete\n`/roster view` — See your saved roster\n`/roster clear` — Wipe your roster',
      },
      {
        name: '🎯 /comp',
        value: 'Builds the best team from your roster. Options: `mode`, `enemy_element`, `stage` (all optional)\nExample: `/comp mode:Campaign enemy_element:Fire stage:8-70`',
      },
      {
        name: '🛡️ /counter',
        value: 'Counters a specific enemy element.\nExample: `/counter enemy_element:Fire`',
      },
      {
        name: '🔍 /tatari',
        value: 'Look up any Tatari — autocompletes as you type. Shows skills, evolution line, aura, synergies, upgrade priority.',
      },
      {
        name: '📊 /tier',
        value: 'Shows tier list by element — S/A/B tiers.\nExample: `/tier element:Fire`',
      },
      {
        name: '⚔️ /compare',
        value: 'Compare two Tatari head to head.\nExample: `/compare first:Magnedart second:Frostluna`',
      },
      {
        name: '⬆️ /upgrade',
        value: 'Which Tatari to evolve next based on your roster.\nRequires roster to be set first.',
      },
      {
        name: '🗺️ /stage',
        value: 'Stage-specific advice — enemies, element, formation, tips.\nExample: `/stage stage:8-70`',
      },
      {
        name: '🏆 /meta',
        value: 'Best meta comps per game mode, no roster needed.\nExample: `/meta mode:Campaign`',
      },
      {
        name: '📖 /guide',
        value: 'Learn game mechanics.\n`/guide basics` · `/guide elements` · `/guide evolution`\n`/guide auras` · `/guide modes` · `/guide comps`',
      },
      {
        name: '💡 Tips',
        value: '→ Always set your roster first for personalised comps\n→ Specify `enemy_element` for better advice\n→ Update your roster when you evolve a Tatari\n→ A T3 common beats a T1 rare every time',
      },
    );

  await interaction.reply({ embeds: [embed] });
}
