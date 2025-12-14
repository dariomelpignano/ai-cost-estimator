'use client';

import { useState, useEffect } from 'react';
import { AIModel, CostEstimate } from '@/types';
import { calculateCost, formatCurrency } from '@/lib/calculations';
import { shouldAutoUpdate, markPricingUpdated } from '@/lib/pricingStorage';
import ModelSelector from './ModelSelector';
import FolderUpload from './FolderUpload';
import ExportButton from './ExportButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Keyboard,
  FolderOpen,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Loader2,
  Info
} from 'lucide-react';

type InputMode = 'manual' | 'folder';

export default function CostCalculator() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [inputTokens, setInputTokens] = useState<number>(0);
  const [outputTokens, setOutputTokens] = useState<number>(0);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>('manual');

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Auto-update pricing if stale (>24 hours)
  useEffect(() => {
    const checkAndUpdatePricing = async () => {
      if (shouldAutoUpdate()) {
        try {
          const res = await fetch('/api/pricing-update', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            markPricingUpdated();
            // Refresh models if there were changes
            if (data.changes && data.changes.length > 0) {
              await fetchModels();
            }
          }
        } catch (err) {
          console.error('Auto-update pricing failed:', err);
        }
      }
    };

    checkAndUpdatePricing();
  }, []);

  useEffect(() => {
    if (selectedModelId && (inputTokens > 0 || outputTokens > 0)) {
      const model = models.find((m) => m.id === selectedModelId);
      if (model) {
        const cost = calculateCost(model, inputTokens, outputTokens);
        setEstimate(cost);
      }
    } else {
      setEstimate(null);
    }
  }, [selectedModelId, inputTokens, outputTokens, models]);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading models...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Model Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            Select Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ModelSelector
            models={models}
            selectedModelId={selectedModelId}
            onChange={setSelectedModelId}
          />
          {selectedModel && (
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                ${selectedModel.inputCostPerMillion}/1M input
              </span>
              <span className="flex items-center gap-1">
                <ArrowDown className="h-3 w-3" />
                ${selectedModel.outputCostPerMillion}/1M output
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={inputMode === 'manual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('manual')}
          className="gap-2"
        >
          <Keyboard className="h-4 w-4" />
          Manual Entry
        </Button>
        <Button
          variant={inputMode === 'folder' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('folder')}
          className="gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          From Folders
        </Button>
      </div>

      {/* Token Input Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">
            Token Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inputMode === 'manual' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="input-tokens" className="flex items-center gap-2">
                  <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  Input Tokens
                </Label>
                <Input
                  id="input-tokens"
                  type="number"
                  min="0"
                  value={inputTokens || ''}
                  onChange={(e) => setInputTokens(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="output-tokens" className="flex items-center gap-2">
                  <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                  Output Tokens
                </Label>
                <Input
                  id="output-tokens"
                  type="number"
                  min="0"
                  value={outputTokens || ''}
                  onChange={(e) => setOutputTokens(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FolderUpload
                  label="Input (prompts/context)"
                  onTokensCalculated={setInputTokens}
                  variant="input"
                />
                <FolderUpload
                  label="Output (responses)"
                  onTokensCalculated={setOutputTokens}
                  variant="output"
                />
              </div>

              {/* Token Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                    Input
                  </span>
                  <span className="font-mono font-semibold">
                    {inputTokens.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 px-4 py-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                    Output
                  </span>
                  <span className="font-mono font-semibold">
                    {outputTokens.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Estimate */}
      {estimate ? (
        <Card className="border-primary/20 bg-primary/5 animate-slideUp">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cost Estimate
                <span className="font-normal text-sm text-muted-foreground">
                  ({estimate.model.name})
                </span>
              </CardTitle>
              <ExportButton estimate={estimate} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                  Input ({inputTokens.toLocaleString()} tokens)
                </span>
                <span className="font-mono">{formatCurrency(estimate.inputCost)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
                  Output ({outputTokens.toLocaleString()} tokens)
                </span>
                <span className="font-mono">{formatCurrency(estimate.outputCost)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Cost</span>
                  <span className="text-2xl font-bold font-mono text-primary">
                    {formatCurrency(estimate.totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <Info className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Select a model and enter token counts to see cost estimate
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
