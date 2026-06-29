import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { buildSystemPrompt } from './prompts/system.js';
import { rateLimitedClaude } from './ratelimit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Load game data once at startup
const tatariData = JSON.parse(readFileSync(join(__dirname, 'data/tatari.json'), 'utf8'));
const mechanicsData = JSON.parse(readFileSync(join(__dirname, 'data/mechanics.json'), 'utf8'));
const SYSTEM_PROMPT = buildSystemPrompt(tatariData.tatari || tatariData, mechanicsData);

export async function askClaude(userMessage) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0].text;

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If JSON parse fails, return raw text wrapped in error format
    return { error: true, raw: text };
  }
}

export function buildCompPrompt(options) {
  const { roster, mode, enemyElement, stage } = options;
  let prompt = 'Build me the best team comp';
  if (stage) prompt += ` for stage ${stage}`;
  if (mode) prompt += ` in ${mode} mode`;
  if (enemyElement) prompt += `. The enemy element is ${enemyElement}`;
  if (roster && roster.length > 0) {
    prompt += `. I only own these Tatari: ${roster.map(t => `${t.name} (${t.tier || 'unknown tier'})`).join(', ')}`;
  } else {
    prompt += `. Assume I have access to all Tatari`;
  }
  return prompt;
}

export function buildCounterPrompt(options) {
  const { enemyElement, roster } = options;
  let prompt = `What is the best team to counter ${enemyElement} enemies?`;
  if (roster && roster.length > 0) {
    prompt += ` I only own: ${roster.map(t => `${t.name} (${t.tier || 'unknown tier'})`).join(', ')}`;
  }
  return prompt;
}

export function buildTatariPrompt(name) {
  return `Look up ${name} — give me their full profile including skills, evolution line, role, synergies, and any tips.`;
}

export function buildUpgradePrompt(roster) {
  const rosterStr = roster.map(t => `${t.name} (${t.tier || 'T1'})`).join(', ');
  return `Given my roster: ${rosterStr} — which Tatari should I prioritize evolving next and why?

Respond with JSON matching this exact schema:
{
  "topPick": {
    "name": "Tatari name",
    "currentTier": "T2",
    "nextTier": "T3",
    "why": "reason this is the priority evolution",
    "unlocks": "what mechanic or ability unlocks at next tier"
  },
  "alsoConsider": [
    { "name": "name", "currentTier": "T1", "nextTier": "T2", "why": "short reason" }
  ],
  "avoid": "which Tatari on their roster to deprioritize and why",
  "reasoning": "2-3 sentence overall upgrade strategy"
}`;
}

export async function askClaudeRateLimited(userId, userMessage) {
  return rateLimitedClaude(userId, () => askClaude(userMessage));
}

export { SYSTEM_PROMPT, tatariData, mechanicsData };
