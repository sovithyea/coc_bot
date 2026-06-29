import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { askClaude, buildTatariPrompt, tatariData } from '../ai.js';

const ELEMENT_COLORS = {
  Fire: 0xFF6B35,
  Water: 0x4FC3F7,
  Lightning: 0xFFD700,
  Grass: 0x66BB6A,
  Rock: 0x8D6E63,
};

export const data = new SlashCommandBuilder()
  .setName('tatari')
  .setDescription('Look up a Tatari in the knowledge base')
  .addStringOption(opt =>
    opt.setName('name')
      .setDescription('Tatari name to look up')
      .setRequired(true)
      .setAutocomplete(true));

export async function execute(interaction) {
  if (interaction.isAutocomplete()) {
    const focusedValue = interaction.options.getFocused();
    const matches = tatariData
      .filter(t => t.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25)
      .map(t => ({ name: t.name, value: t.name }));
    return interaction.respond(matches);
  }

  await interaction.deferReply();

  const name = interaction.options.getString('name');

  try {
    const result = await askClaude(buildTatariPrompt(name));

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const lu = result.lookup ?? {};
    const embed = new EmbedBuilder()
      .setTitle(lu.name ?? name)
      .setColor(ELEMENT_COLORS[lu.element] ?? 0x5865F2);

    if (lu.element || lu.class || lu.rarity) {
      embed.addFields({
        name: 'Element & Class',
        value: [lu.element, lu.class, lu.rarity].filter(Boolean).join(' · '),
        inline: true,
      });
    }

    if (lu.skill) embed.addFields({ name: 'Skill', value: lu.skill });

    if (lu.evolutionLine?.length) {
      embed.addFields({ name: 'Evolution Line', value: lu.evolutionLine.join(' → ') });
    }

    embed.addFields({ name: 'Aura', value: lu.aura ?? 'None', inline: true });

    if (lu.goodAgainst?.length) {
      embed.addFields({ name: 'Good Against', value: lu.goodAgainst.join(', '), inline: true });
    }
    if (lu.weakAgainst?.length) {
      embed.addFields({ name: 'Weak To', value: lu.weakAgainst.join(', '), inline: true });
    }

    embed.addFields({
      name: 'Synergies',
      value: lu.synergiesWith?.length ? lu.synergiesWith.join(', ') : 'None confirmed',
    });

    if (lu.evolutionPriority) embed.addFields({ name: 'Evolution Priority', value: lu.evolutionPriority });
    if (lu.notes)             embed.addFields({ name: 'Notes',              value: lu.notes });
    if (lu.position)          embed.setFooter({ text: lu.position });

    await interaction.editReply({ embeds: [embed] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed()] });
  }
}

function errorEmbed() {
  return new EmbedBuilder()
    .setTitle('Something went wrong')
    .setDescription("Couldn't reach the advisor. Try again in a moment.")
    .setColor(0xFF0000);
}
