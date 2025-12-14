'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  X
} from 'lucide-react';
import {
  formatLastUpdate,
  markPricingUpdated,
  getPricingMetadata
} from '@/lib/pricingStorage';
import { PricingChangeLog } from '@/lib/pricingFetcher';

interface PricingUpdateButtonProps {
  onUpdate?: () => void;
}

interface UpdateResult {
  success: boolean;
  changes: PricingChangeLog[];
  errors: string[];
}

export default function PricingUpdateButton({ onUpdate }: PricingUpdateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [showChanges, setShowChanges] = useState(false);

  useEffect(() => {
    setLastUpdate(formatLastUpdate());
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/pricing-update', { method: 'POST' });
      const data = await res.json();

      setResult({
        success: data.success,
        changes: data.changes || [],
        errors: data.errors || [],
      });

      if (data.success) {
        markPricingUpdated();
        setLastUpdate(formatLastUpdate());
        if (data.changes.length > 0) {
          setShowChanges(true);
        }
        onUpdate?.();
      }
    } catch (error) {
      setResult({
        success: false,
        changes: [],
        errors: ['Failed to connect to server'],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPriceChange = (oldPrice: number, newPrice: number) => {
    if (oldPrice === 0) return `$${newPrice}`;
    const diff = newPrice - oldPrice;
    const sign = diff > 0 ? '+' : '';
    return `$${oldPrice} → $${newPrice} (${sign}${diff.toFixed(2)})`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdate}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Updating...' : 'Update Prices'}
        </Button>

        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last update: {lastUpdate}
        </span>
      </div>

      {/* Result feedback */}
      {result && !showChanges && (
        <div
          className={`flex items-center gap-2 text-sm ${
            result.success ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {result.success ? (
            <>
              <Check className="h-4 w-4" />
              {result.changes.length > 0 ? (
                <button
                  onClick={() => setShowChanges(true)}
                  className="underline hover:no-underline"
                >
                  {result.changes.length} price{result.changes.length > 1 ? 's' : ''} updated
                </button>
              ) : (
                'All prices are up to date'
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              {result.errors[0] || 'Update failed'}
            </>
          )}
        </div>
      )}

      {/* Changelog modal */}
      {showChanges && result && result.changes.length > 0 && (
        <Card className="animate-slideUp">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Price Changes</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChanges(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {result.changes.map((change) => (
                <div
                  key={change.modelId}
                  className="text-xs border rounded-lg p-2 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    {change.oldInput === 0 ? (
                      <Plus className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <RefreshCw className="h-3 w-3 text-blue-600" />
                    )}
                    <span className="font-medium">{change.modelName}</span>
                    <span className="text-muted-foreground">({change.provider})</span>
                  </div>
                  <div className="pl-5 space-y-0.5 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3 text-emerald-600" />
                      Input: {formatPriceChange(change.oldInput, change.newInput)}/1M
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowDown className="h-3 w-3 text-blue-600" />
                      Output: {formatPriceChange(change.oldOutput, change.newOutput)}/1M
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
