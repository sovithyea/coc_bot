# coc-advisor

Discord bot for Clash of Critters — team composition, counters, and Tatari knowledge.

## Prerequisites

- Node.js 18+
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- An Anthropic API key
- **Windows users:** `better-sqlite3` requires native compilation. Install one of:
  - Visual C++ build tools: `npm install --global windows-build-tools` (or via Visual Studio installer)
  - OR use `npm install --ignore-scripts` for the scaffold phase; database operations (Task 3+) require the native build

## Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd coc-advisor
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and fill in all three values
   ```

3. **Register slash commands with Discord**
   ```bash
   npm run deploy
   ```
   This calls the Discord REST API to register all slash commands globally.
   Allow up to 1 hour for global propagation (use guild commands for instant dev testing).

4. **Start the bot**
   ```bash
   npm start
   ```
   Console should print: `CoC Advisor online`

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal → Bot tab |
| `DISCORD_CLIENT_ID` | Application ID from Discord Developer Portal → General Information |
| `ANTHROPIC_API_KEY` | API key from console.anthropic.com |

## Commands

| Command | Description |
|---|---|
| `/comp` | Suggest a team composition |
| `/counter` | Find counters for a critter or team |
| `/tatari` | Look up Tatari knowledge base entries |
| `/roster` | Manage your critter roster |
| `/tier` | Show tier list |
| `/upgrade` | Get upgrade recommendations |

## Project Structure

```
src/
  index.js            Bot entry point
  deploy-commands.js  Slash command registration
  db.js               SQLite database helpers
  ai.js               Claude API client
  commands/           One file per slash command
  data/               Static game data (JSON)
  prompts/            System prompt definitions
```

## Known Issues

### npm Audit Vulnerabilities (Discord.js)
- `discord.js@14.14.1` depends on `undici <=6.26.0`, which has 4 unresolved vulnerabilities (1 high, 3 moderate)
- Resolution requires downgrading to `discord.js@13.x`, a breaking change incompatible with current codebase
- **Recommendation:** Monitor discord.js releases for upstream undici fixes. For production, validate undici usage in non-HTTP contexts or isolate the bot in a secure environment
- Tracked: https://github.com/discordjs/discord.js/issues
