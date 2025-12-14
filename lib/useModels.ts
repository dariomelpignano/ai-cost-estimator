'use client';

import { useState, useEffect, useCallback } from 'react';
import { AIModel } from '@/types';

const CUSTOM_MODELS_KEY = 'ai-cost-estimator-custom-models';
const PRICE_OVERRIDES_KEY = 'ai-cost-estimator-price-overrides';

interface PriceOverride {
  inputCostPerMillion: number;
  outputCostPerMillion: number;
}

function getCustomModels(): AIModel[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CUSTOM_MODELS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomModels(models: AIModel[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_MODELS_KEY, JSON.stringify(models));
  } catch {
    console.error('Failed to save custom models to localStorage');
  }
}

function getPriceOverrides(): Record<string, PriceOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PRICE_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePriceOverrides(overrides: Record<string, PriceOverride>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    console.error('Failed to save price overrides to localStorage');
  }
}

function generateId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `custom-${base}-${Date.now()}`;
}

export function useModels() {
  const [baseModels, setBaseModels] = useState<AIModel[]>([]);
  const [customModels, setCustomModels] = useState<AIModel[]>([]);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, PriceOverride>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load base models from API and custom models from localStorage
  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch('/api/models');
        if (!res.ok) throw new Error('Failed to fetch models');
        const data = await res.json();
        setBaseModels(data);
        setCustomModels(getCustomModels());
        setPriceOverrides(getPriceOverrides());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
      } finally {
        setLoading(false);
      }
    }
    loadModels();
  }, []);

  // Merge base models (with price overrides) and custom models
  const models: AIModel[] = [
    ...baseModels.map((model) => {
      const override = priceOverrides[model.id];
      if (override) {
        return {
          ...model,
          inputCostPerMillion: override.inputCostPerMillion,
          outputCostPerMillion: override.outputCostPerMillion,
        };
      }
      return model;
    }),
    ...customModels,
  ];

  const addModel = useCallback((modelData: Omit<AIModel, 'id' | 'isCustom'>): AIModel => {
    const newModel: AIModel = {
      ...modelData,
      id: generateId(modelData.name),
      isCustom: true,
    };
    const updated = [...customModels, newModel];
    setCustomModels(updated);
    saveCustomModels(updated);
    return newModel;
  }, [customModels]);

  const updateModel = useCallback((id: string, updates: Partial<AIModel>): AIModel | null => {
    // Check if it's a base model - store price override
    const baseModel = baseModels.find((m) => m.id === id);
    if (baseModel) {
      const newOverrides = {
        ...priceOverrides,
        [id]: {
          inputCostPerMillion: updates.inputCostPerMillion ?? baseModel.inputCostPerMillion,
          outputCostPerMillion: updates.outputCostPerMillion ?? baseModel.outputCostPerMillion,
        },
      };
      setPriceOverrides(newOverrides);
      savePriceOverrides(newOverrides);
      return { ...baseModel, ...updates };
    }

    // Custom model - update in localStorage
    const index = customModels.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const updated = [...customModels];
    updated[index] = { ...updated[index], ...updates, id };
    setCustomModels(updated);
    saveCustomModels(updated);
    return updated[index];
  }, [baseModels, customModels, priceOverrides]);

  const deleteModel = useCallback((id: string): boolean => {
    // Can't delete base models
    if (baseModels.some((m) => m.id === id)) {
      return false;
    }

    const index = customModels.findIndex((m) => m.id === id);
    if (index === -1) return false;

    const updated = customModels.filter((m) => m.id !== id);
    setCustomModels(updated);
    saveCustomModels(updated);
    return true;
  }, [baseModels, customModels]);

  const getModelById = useCallback((id: string): AIModel | undefined => {
    return models.find((m) => m.id === id);
  }, [models]);

  const bulkUpdatePrices = useCallback((updates: Array<{ id: string; inputCostPerMillion: number; outputCostPerMillion: number }>) => {
    const newOverrides = { ...priceOverrides };

    for (const update of updates) {
      // Only store overrides for base models
      if (baseModels.some((m) => m.id === update.id)) {
        newOverrides[update.id] = {
          inputCostPerMillion: update.inputCostPerMillion,
          outputCostPerMillion: update.outputCostPerMillion,
        };
      }
    }

    setPriceOverrides(newOverrides);
    savePriceOverrides(newOverrides);
  }, [baseModels, priceOverrides]);

  const refreshModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/models');
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      setBaseModels(data);
      setCustomModels(getCustomModels());
      setPriceOverrides(getPriceOverrides());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    models,
    loading,
    error,
    addModel,
    updateModel,
    deleteModel,
    getModelById,
    bulkUpdatePrices,
    refreshModels,
  };
}
