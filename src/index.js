import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { initDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(pathToFileURL(filePath).href);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARN] ${file} missing 'data' or 'execute' export — skipped`);
  }
}

// Handle slash commands and autocomplete
client.on(Events.InteractionCreate, async interaction => {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  if (interaction.isAutocomplete()) {
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Autocomplete error in /${interaction.commandName}:`, err);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error in /${interaction.commandName}:`, err);
    const msg = { content: 'An error occurred.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.once(Events.ClientReady, () => {
  console.log('CoC Advisor online');
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

initDb();
await client.login(process.env.DISCORD_TOKEN);
