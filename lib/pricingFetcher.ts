import { AIModel } from '@/types';

export interface PriceUpdate {
  id: string;
  name: string;
  provider: string;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
}

export interface PricingChangeLog {
  modelId: string;
  modelName: string;
  provider: string;
  oldInput: number;
  newInput: number;
  oldOutput: number;
  newOutput: number;
}

export interface FetchResult {
  updates: PriceUpdate[];
  errors: string[];
}

// Hardcoded latest pricing data - updated December 2024
// In a production app, these would be fetched from provider APIs or scraped from pricing pages
const LATEST_PRICING: Record<string, PriceUpdate[]> = {
  OpenAI: [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputCostPerMillion: 2.5, outputCostPerMillion: 10 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputCostPerMillion: 0.15, outputCostPerMillion: 0.6 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', inputCostPerMillion: 10, outputCostPerMillion: 30 },
    { id: 'o1', name: 'o1', provider: 'OpenAI', inputCostPerMillion: 15, outputCostPerMillion: 60 },
    { id: 'o1-mini', name: 'o1-mini', provider: 'OpenAI', inputCostPerMillion: 3, outputCostPerMillion: 12 },
    { id: 'o1-pro', name: 'o1 Pro', provider: 'OpenAI', inputCostPerMillion: 150, outputCostPerMillion: 600 },
  ],
  Anthropic: [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputCostPerMillion: 3, outputCostPerMillion: 15 },
    { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', inputCostPerMillion: 0.8, outputCostPerMillion: 4 },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', inputCostPerMillion: 15, outputCostPerMillion: 75 },
    { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'Anthropic', inputCostPerMillion: 15, outputCostPerMillion: 75 },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', inputCostPerMillion: 3, outputCostPerMillion: 15 },
  ],
  Google: [
    { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', inputCostPerMillion: 1.25, outputCostPerMillion: 5 },
    { id: 'gemini-1-5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', inputCostPerMillion: 0.075, outputCostPerMillion: 0.3 },
    { id: 'gemini-2-0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', inputCostPerMillion: 0.1, outputCostPerMillion: 0.4 },
    { id: 'gemini-2-0-flash-thinking', name: 'Gemini 2.0 Flash Thinking', provider: 'Google', inputCostPerMillion: 0.1, outputCostPerMillion: 0.4 },
  ],
  Mistral: [
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', inputCostPerMillion: 2, outputCostPerMillion: 6 },
    { id: 'mistral-small', name: 'Mistral Small', provider: 'Mistral', inputCostPerMillion: 0.2, outputCostPerMillion: 0.6 },
    { id: 'mistral-nemo', name: 'Mistral Nemo', provider: 'Mistral', inputCostPerMillion: 0.15, outputCostPerMillion: 0.15 },
    { id: 'codestral', name: 'Codestral', provider: 'Mistral', inputCostPerMillion: 0.2, outputCostPerMillion: 0.6 },
  ],
  Meta: [
    { id: 'llama-3-1-405b', name: 'Llama 3.1 405B', provider: 'Meta', inputCostPerMillion: 3, outputCostPerMillion: 3 },
    { id: 'llama-3-1-70b', name: 'Llama 3.1 70B', provider: 'Meta', inputCostPerMillion: 0.88, outputCostPerMillion: 0.88 },
    { id: 'llama-3-2-90b', name: 'Llama 3.2 90B', provider: 'Meta', inputCostPerMillion: 0.9, outputCostPerMillion: 0.9 },
    { id: 'llama-3-3-70b', name: 'Llama 3.3 70B', provider: 'Meta', inputCostPerMillion: 0.59, outputCostPerMillion: 0.79 },
  ],
};

export async function fetchAllPricing(): Promise<FetchResult> {
  const updates: PriceUpdate[] = [];
  const errors: string[] = [];

  for (const [provider, models] of Object.entries(LATEST_PRICING)) {
    try {
      updates.push(...models);
    } catch (error) {
      errors.push(`Failed to fetch ${provider} pricing: ${error}`);
    }
  }

  return { updates, errors };
}

export async function fetchProviderPricing(provider: string): Promise<FetchResult> {
  const updates: PriceUpdate[] = [];
  const errors: string[] = [];

  const providerPricing = LATEST_PRICING[provider];
  if (providerPricing) {
    updates.push(...providerPricing);
  } else {
    errors.push(`Unknown provider: ${provider}`);
  }

  return { updates, errors };
}

export function mergePricing(
  currentModels: AIModel[],
  updates: PriceUpdate[]
): { models: AIModel[]; changes: PricingChangeLog[] } {
  const changes: PricingChangeLog[] = [];
  const updatedModels = [...currentModels];
  const updateMap = new Map(updates.map(u => [u.id, u]));

  // Update existing models
  for (let i = 0; i < updatedModels.length; i++) {
    const model = updatedModels[i];
    const update = updateMap.get(model.id);

    if (update && !model.isCustom) {
      const hasInputChange = model.inputCostPerMillion !== update.inputCostPerMillion;
      const hasOutputChange = model.outputCostPerMillion !== update.outputCostPerMillion;

      if (hasInputChange || hasOutputChange) {
        changes.push({
          modelId: model.id,
          modelName: model.name,
          provider: model.provider,
          oldInput: model.inputCostPerMillion,
          newInput: update.inputCostPerMillion,
          oldOutput: model.outputCostPerMillion,
          newOutput: update.outputCostPerMillion,
        });

        updatedModels[i] = {
          ...model,
          inputCostPerMillion: update.inputCostPerMillion,
          outputCostPerMillion: update.outputCostPerMillion,
        };
      }
    }
  }

  // Add new models that don't exist yet
  const existingIds = new Set(currentModels.map(m => m.id));
  for (const update of updates) {
    if (!existingIds.has(update.id)) {
      const newModel: AIModel = {
        id: update.id,
        name: update.name,
        provider: update.provider,
        inputCostPerMillion: update.inputCostPerMillion,
        outputCostPerMillion: update.outputCostPerMillion,
        isCustom: false,
      };
      updatedModels.push(newModel);
      changes.push({
        modelId: update.id,
        modelName: update.name,
        provider: update.provider,
        oldInput: 0,
        newInput: update.inputCostPerMillion,
        oldOutput: 0,
        newOutput: update.outputCostPerMillion,
      });
    }
  }

  return { models: updatedModels, changes };
}

export function getAvailableProviders(): string[] {
  return Object.keys(LATEST_PRICING);
}
