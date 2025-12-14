import { AIModel } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'models.json');

interface ModelsData {
  models: AIModel[];
}

// Read-only: returns base models from the static JSON file
export function getModels(): AIModel[] {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed: ModelsData = JSON.parse(data);
  return parsed.models;
}

export function getModelById(id: string): AIModel | undefined {
  const models = getModels();
  return models.find((m) => m.id === id);
}

export function getModelsByProvider(): Record<string, AIModel[]> {
  const models = getModels();
  return models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);
}
