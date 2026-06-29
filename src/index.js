import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { initDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
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

// Handle mention-based message commands  (@BotName command args...)
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const botId = client.user?.id;
  if (!botId) return;
  if (!message.content.startsWith(`<@${botId}>`) && !message.content.startsWith(`<@!${botId}>`)) return;

  const body = message.content.replace(/^<@!?\d+>\s*/, '').trim();
  if (!body) return;

  const words = body.split(/\s+/);
  const commandName = words[0].toLowerCase();
  const argWords = words.slice(1);

  const command = client.commands.get(commandName);
  if (!command) {
    return message.reply(`Unknown command \`${commandName}\`. Try \`@${message.guild?.members?.me?.displayName ?? 'CoC AI'} help\`.`);
  }

  // Parse key:value named opts and positional tokens
  const namedOpts = {};
  const positionalTokens = [];
  for (const word of argWords) {
    const colon = word.indexOf(':');
    if (colon > 0) {
      namedOpts[word.slice(0, colon)] = word.slice(colon + 1);
    } else {
      positionalTokens.push(word);
    }
  }

  const subcommand = positionalTokens[0]?.toLowerCase() ?? null;
  const rawArgString = argWords.join(' ');

  // Command-specific positional → named option mapping
  if (commandName === 'tatari' && !namedOpts.name) {
    namedOpts.name = rawArgString;
  }
  if (commandName === 'roster' && subcommand === 'set' && !namedOpts.tatari_list) {
    const m = rawArgString.match(/^set\s+(.+)$/i);
    if (m) namedOpts.tatari_list = m[1];
  }

  // Fake interaction object that satisfies the command API surface
  let thinkingMsg = null;
  const fakeInteraction = {
    commandName,
    user: { id: message.author.id },
    replied: false,
    deferred: false,
    isChatInputCommand: () => true,
    isAutocomplete: () => false,
    options: {
      getSubcommand: () => subcommand,
      getString: (name) => namedOpts[name] ?? null,
    },
    deferReply: async () => {
      fakeInteraction.deferred = true;
      thinkingMsg = await message.channel.send('⏳ Thinking...');
    },
    reply: async (payload) => {
      fakeInteraction.replied = true;
      await message.reply(payload);
    },
    editReply: async (payload) => {
      if (thinkingMsg) {
        await thinkingMsg.edit(payload);
      } else {
        await message.reply(payload);
      }
    },
    followUp: async (payload) => {
      await message.channel.send(payload);
    },
  };

  try {
    await command.execute(fakeInteraction);
  } catch (err) {
    console.error(`Message command error in ${commandName}:`, err);
    if (thinkingMsg) {
      await thinkingMsg.edit({ content: 'An error occurred.', embeds: [] }).catch(() => {});
    } else {
      await message.reply('An error occurred.').catch(() => {});
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
