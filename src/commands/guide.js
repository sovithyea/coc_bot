import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const COLOR = 0x5865F2;
const FOOTER = 'Use /comp or /counter to build your team';

export const data = new SlashCommandBuilder()
  .setName('guide')
  .setDescription('Learn how Clash of Critters works')
  .addSubcommand(sub => sub.setName('basics').setDescription('Pinball combat, Zobos, base defense, and the game loop'))
  .addSubcommand(sub => sub.setName('elements').setDescription('Element counter system — matchups, damage multipliers, examples'))
  .addSubcommand(sub => sub.setName('evolution').setDescription('T1→T4 evolution, why it matters, Glitter forms'))
  .addSubcommand(sub => sub.setName('auras').setDescription('What auras are and all 20 aura carriers by element'))
  .addSubcommand(sub => sub.setName('modes').setDescription('Campaign, Horde Invasion, Badge Dojo, Gold Rush — tips for each'))
  .addSubcommand(sub => sub.setName('comps').setDescription('Team building: role balance, formation, aura stacking, priorities'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const embed = buildEmbed(sub);
  await interaction.reply({ embeds: [embed] });
}

function buildEmbed(sub) {
  const base = new EmbedBuilder().setColor(COLOR).setFooter({ text: FOOTER });

  switch (sub) {
    case 'basics':
      return base
        .setTitle('🎮 Clash of Critters — The Basics')
        .addFields(
          {
            name: 'How Combat Works',
            value: 'Pinball-style launcher — aim your Tatari at enemy Zobos using trajectory angles. Bank shots hit multiple enemies, trigger chain damage, and build your ultimate faster.',
          },
          {
            name: 'Zobos',
            value: 'Enemy creatures that march toward your base in waves. Each wave is harder than the last. Stop them before they break through.',
          },
          {
            name: 'Base Defense',
            value: 'Your base has HP. Every Zobo that reaches the end deals damage. Reach 0 HP = stage failed. Protect your backline carries — they deal the most damage.',
          },
          {
            name: 'Pinball Physics',
            value: '**Heavy units** — maintain momentum, punch through clusters.\n**Light units** — bounce unpredictably, great against spread formations.\n**Bank shots** — angled ricochets hit multiple rows and charge ultimates faster.',
          },
          {
            name: 'The Game Loop',
            value: '1. Build a team of 5 Tatari\n2. Launch them at incoming Zobo waves\n3. Collect resources from cleared stages\n4. Evolve your core Tatari\n5. Tackle harder stages and unlock new content',
          },
        );

    case 'elements':
      return base
        .setTitle('⚔️ Element Counter System')
        .addFields(
          {
            name: 'Damage Multipliers',
            value: '**Advantage** (you counter them): **200% damage**\n**Disadvantage** (they counter you): **50% damage**\n**Neutral**: 100% damage',
          },
          {
            name: '⚡ Lightning',
            value: '✅ Counters **Water** (200%)\n❌ Weak to **Rock** (50%)',
            inline: true,
          },
          {
            name: '💧 Water',
            value: '✅ Counters **Fire** (200%)\n❌ Weak to **Lightning** (50%)',
            inline: true,
          },
          {
            name: '🔥 Fire',
            value: '✅ Counters **Grass** (200%)\n❌ Weak to **Water** (50%)',
            inline: true,
          },
          {
            name: '🌿 Grass',
            value: '✅ Counters **Rock** (200%)\n❌ Weak to **Fire** (50%)',
            inline: true,
          },
          {
            name: '🪨 Rock',
            value: '✅ Counters **Lightning** (200%)\n❌ Weak to **Grass** (50%)',
            inline: true,
          },
          {
            name: 'The Cycle',
            value: '⚡ Lightning → 💧 Water → 🔥 Fire → 🌿 Grass → 🪨 Rock → ⚡ Lightning',
          },
          {
            name: 'Practical Tips',
            value: '• Check the enemy element before locking in your team\n• A T2 unit at element advantage beats a T4 unit at disadvantage\n• Mono-element teams hit hardest but are one-dimensional — know the enemy',
          },
        );

    case 'evolution':
      return base
        .setTitle('⬆️ Evolution System')
        .addFields(
          {
            name: 'Tiers',
            value: '**T1 → T2 → T3 → T4** (mythic)\nEach tier unlocks stronger skills. T4 often changes the skill entirely — piercing, unlimited bounces, summoning clones, invincibility.',
          },
          {
            name: 'Why It Matters',
            value: 'A T3 common beats a T1 legendary almost every time. Evolution multiplies a Tatari\'s effectiveness. Never spread resources across many units — pick 3-4 and rush them.',
          },
          {
            name: 'How to Evolve',
            value: '• **Feed duplicates** — sacrifice copies of the same Tatari to gain EXP toward the next tier\n• **Trials** — complete challenge stages to earn evolution materials\n• Resources are scarce: commit to your core team before branching out',
          },
          {
            name: 'Glitter Forms',
            value: 'Special shiny variants of existing Tatari. Same stats and skills as the base form at the same tier — cosmetic difference only. Still worth evolving if you pull one.',
          },
          {
            name: 'Evolution Priority Rule',
            value: 'Always evolve your **primary carry** to T4 before investing in supports. A T4 Magnedart with unlimited pierce wins stages that T2 versions can\'t. Check /tatari for evolution priority notes on specific units.',
          },
        );

    case 'auras':
      return base
        .setTitle('✨ Aura System')
        .addFields(
          {
            name: 'What is an Aura?',
            value: 'Certain mythic (and some legendary) Tatari radiate a permanent passive aura that buffs your entire team as long as they\'re on the field. Auras stack — 2 Lightning aura carriers means double ATK SPD bonus.',
          },
          {
            name: '⚡ Lightning Aura — ATK SPD',
            value: 'Increases attack speed of all allies.\n**Carriers:** Magnedart, Stormlion, Voltreaver',
          },
          {
            name: '💧 Water Aura — HP Regen',
            value: 'Passively recovers HP for all allies during battle.\n**Carriers:** Frostluna, Haplysia, Sealord, Cribking',
          },
          {
            name: '🔥 Fire Aura — ATK Boost',
            value: 'Boosts the attack power of all allies.\n**Carriers:** Pyrodaemon, Newflamander, Phantifox, Chrysolaria',
          },
          {
            name: '🌿 Grass Aura — Max HP',
            value: 'Increases the maximum HP of all allies.\n**Carriers:** Frugantuan, Beetleknight, Pandagrand, Orchitoria, Hypnostrix',
          },
          {
            name: '🪨 Rock Aura — DMG Reduction',
            value: 'Reduces damage taken by all allies.\n**Carriers:** Meteorax, Rockwu, Terraton, Cratzar',
          },
          {
            name: 'Aura Strategy',
            value: '• Mono-element teams benefit most — every carry gets the buff\n• The 4+1 split (4 same element + 1 off-element) is safer when countered\n• Stacking 2 aura carriers from the same element is the fastest path to an overwhelming advantage',
          },
        );

    case 'modes':
      return base
        .setTitle('🗺️ Game Modes')
        .addFields(
          {
            name: '📖 Campaign',
            value: 'Standard stage progression. Always check the enemy element before selecting your team. Boss appears at the end on the centre lane — bring a frontline that can tank centre pressure.\n**Tip:** Bring your strongest aura carrier even if slightly under-leveled.',
          },
          {
            name: '🌊 Horde Invasion',
            value: 'Co-op survival — wave after wave of Zobos, increasing difficulty. Speed and DPS matter more than CC here.\n**Tip:** Bring the highest-damage team you have. Survival over control.',
          },
          {
            name: '🏆 Badge Dojo',
            value: 'Single-element per run — you can only bring Tatari matching the run\'s element. Best rewards in the game. Know your mono-element comps cold before entering.\n**Tip:** Badge Dojo is where rushing a T4 aura carrier pays off hardest.',
          },
          {
            name: '💰 Gold Rush',
            value: 'Speed mode — clear stages as fast as possible for bonus gold. AoE units and multi-hit Tatari dominate.\n**Tip:** Prioritise wide-coverage units over single-target DPS. Magnedart\'s unlimited pierce and Pandagrand\'s lane-filling bamboo are top picks.',
          },
        );

    case 'comps':
      return base
        .setTitle('🧩 Team Building Guide')
        .addFields(
          {
            name: 'The Ideal 5',
            value: '1 frontline tank/guardian\n1 primary DPS carry\n1 CC or support\n1 aura provider\n1 flex (second carry or utility)',
          },
          {
            name: 'Formation',
            value: '**Frontline** — Tanks and Guardians. Absorb damage, protect carries.\n**Midline** — Support and CC. Safe from front pressure, covers multiple lanes.\n**Backline** — Primary DPS and Healers. Maximum safety for your carries.',
          },
          {
            name: 'Aura Stacking',
            value: 'Mono-element team = full aura uptime for every member. 4+1 split is safer when the enemy hard-counters your element. Never bring a unit just for its aura at T1 — evolve the carrier first.',
          },
          {
            name: 'Evolution Priority',
            value: 'Pick 3-4 core Tatari and rush their evolution. Never spread upgrade materials. A T3 common with the right element beats a T1 legendary at disadvantage.',
          },
          {
            name: 'Known Strong Comps',
            value: '⚡ **Lightning Speed** — Stormlion + Magnedart + Cheerstella + Voltreaver + Boltallion\n💧 **Water Sustain** — Frostluna + Sealord + Haplysia + Glideflip + Waveflutter\n🔥 **Fire Aggro** — Pyrodaemon + Newflamander + Phantifox + Searhog + Chrysolaria\n🌿 **Grass Control** — Hypnostrix + Frugantuan + Beetleknight + Pandagrand + Weaverfang',
          },
          {
            name: 'Counter Rule',
            value: 'If you know the enemy element, always bring the element that counters it. If you can\'t, at least avoid bringing the element the enemy counters — 50% damage output loses every fight.',
          },
        );

    default:
      return base.setTitle('Unknown subcommand');
  }
}
