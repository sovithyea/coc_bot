import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRoster } from '../db.js';
import { askClaude, buildUpgradePrompt } from '../ai.js';

export const data = new SlashCommandBuilder()
  .setName('upgrade')
  .setDescription('Get upgrade priority recommendations for your roster');

export async function execute(interaction) {
  const roster = getRoster(interaction.user.id);

  if (roster.length === 0) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('No Roster Found')
          .setDescription('Set your roster first with `/roster set`.\nExample: `Magnedart T3, Frostluna T2`')
          .setColor(0xF1C40F),
      ],
    });
  }

  await interaction.deferReply();

  try {
    const result = await askClaude(buildUpgradePrompt(roster));

    if (result.error) {
      return interaction.editReply({ embeds: [errorEmbed()] });
    }

    const embed = new EmbedBuilder()
      .setTitle('⬆️ Upgrade Priority')
      .setColor(0xF1C40F);

    if (result.topPick) {
      const tp = result.topPick;
      embed.addFields({
        name: '🥇 Evolve First',
        value: `**${tp.name}** ${tp.currentTier} → ${tp.nextTier}\n${tp.why}\n**Unlocks:** ${tp.unlocks}`,
      });
    }

    if (result.alsoConsider?.length) {
      embed.addFields({
        name: 'Also Consider',
        value: result.alsoConsider
          .map(e => `**${e.name}** ${e.currentTier} → ${e.nextTier}: ${e.why}`)
          .join('\n'),
      });
    }

    if (result.avoid) {
      embed.addFields({ name: 'Deprioritise', value: result.avoid });
    }

    if (result.reasoning) {
      embed.addFields({ name: 'Strategy', value: result.reasoning });
    }

    embed.setFooter({ text: 'Resources are scarce — focus on one Tatari at a time' });

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
