import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from './prompts/system.js';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function buildAdvice(userPrompt, context = {}) {
  // TODO: call anthropic.messages.create with systemPrompt + userPrompt + context
  // Returns the assistant's text response
  return 'AI advice placeholder — not yet implemented.';
}
