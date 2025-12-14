import { AIModel, CostEstimate } from '@/types';

export function calculateCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const inputCost = (inputTokens / 1_000_000) * model.inputCostPerMillion;
  const outputCost = (outputTokens / 1_000_000) * model.outputCostPerMillion;
  const totalCost = inputCost + outputCost;

  return {
    inputCost,
    outputCost,
    totalCost,
    model,
    inputTokens,
    outputTokens,
  };
}

export function formatCurrency(amount: number): string {
  if (amount < 0.01 && amount > 0) {
    return `$${amount.toFixed(6)}`;
  }
  return `$${amount.toFixed(4)}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
