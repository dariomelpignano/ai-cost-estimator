'use client';

import { useState } from 'react';
import { AIModel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';

interface ModelFormProps {
  model?: AIModel;
  onSubmit: (model: Partial<AIModel>) => void;
  onCancel: () => void;
}

export default function ModelForm({ model, onSubmit, onCancel }: ModelFormProps) {
  const [name, setName] = useState(model?.name || '');
  const [provider, setProvider] = useState(model?.provider || '');
  const [inputCost, setInputCost] = useState(model?.inputCostPerMillion?.toString() || '');
  const [outputCost, setOutputCost] = useState(model?.outputCostPerMillion?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      provider,
      inputCostPerMillion: parseFloat(inputCost),
      outputCostPerMillion: parseFloat(outputCost),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Model Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., GPT-4o"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            required
            placeholder="e.g., OpenAI"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="input-cost">Input Cost ($/1M tokens)</Label>
          <Input
            id="input-cost"
            type="number"
            step="0.001"
            min="0"
            value={inputCost}
            onChange={(e) => setInputCost(e.target.value)}
            required
            placeholder="0.00"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="output-cost">Output Cost ($/1M tokens)</Label>
          <Input
            id="output-cost"
            type="number"
            step="0.001"
            min="0"
            value={outputCost}
            onChange={(e) => setOutputCost(e.target.value)}
            required
            placeholder="0.00"
            className="font-mono"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="gap-2">
          <Save className="h-4 w-4" />
          {model ? 'Update' : 'Add'} Model
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
