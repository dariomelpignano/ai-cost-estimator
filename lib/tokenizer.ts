import { Tiktoken, encodingForModel } from 'js-tiktoken';

let encoder: Tiktoken | null = null;

function getEncoder(): Tiktoken {
  if (!encoder) {
    // Use cl100k_base encoding (used by GPT-4, GPT-3.5-turbo)
    // This is a good general-purpose tokenizer for estimation
    encoder = encodingForModel('gpt-4o');
  }
  return encoder;
}

export function countTokens(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }
  const enc = getEncoder();
  return enc.encode(text).length;
}

export function estimateTokens(text: string): number {
  // Fallback estimation: ~4 characters per token on average
  // Used when tiktoken is not available
  return Math.ceil(text.length / 4);
}
