'use client';

import { AIModel } from '@/types';
import { Select } from '@/components/ui/select';

interface ModelSelectorProps {
  models: AIModel[];
  selectedModelId: string;
  onChange: (modelId: string) => void;
}

export default function ModelSelector({
  models,
  selectedModelId,
  onChange,
}: ModelSelectorProps) {
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const providers = Object.keys(modelsByProvider).sort();

  return (
    <Select
      value={selectedModelId}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Choose a model...</option>
      {providers.map((provider) => (
        <optgroup key={provider} label={provider}>
          {modelsByProvider[provider].map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
