import { AIModel } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'models.json');

interface ModelsData {
  models: AIModel[];
}

export function getModels(): AIModel[] {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed: ModelsData = JSON.parse(data);
  return parsed.models;
}

export function getModelById(id: string): AIModel | undefined {
  const models = getModels();
  return models.find((m) => m.id === id);
}

export function addModel(model: Omit<AIModel, 'id' | 'isCustom'>): AIModel {
  const models = getModels();
  const newModel: AIModel = {
    ...model,
    id: generateId(model.name),
    isCustom: true,
  };
  models.push(newModel);
  saveModels(models);
  return newModel;
}

export function updateModel(id: string, updates: Partial<AIModel>): AIModel | null {
  const models = getModels();
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return null;

  models[index] = { ...models[index], ...updates, id };
  saveModels(models);
  return models[index];
}

export function deleteModel(id: string): boolean {
  const models = getModels();
  const index = models.findIndex((m) => m.id === id);
  if (index === -1) return false;

  if (!models[index].isCustom) {
    throw new Error('Cannot delete pre-loaded models');
  }

  models.splice(index, 1);
  saveModels(models);
  return true;
}

function saveModels(models: AIModel[]): void {
  const data: ModelsData = { models };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${Date.now()}`;
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

export function bulkUpdateModels(models: AIModel[]): void {
  saveModels(models);
}
