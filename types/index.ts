export interface AIModel {
  id: string;
  name: string;
  provider: string;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
  isCustom: boolean;
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  model: AIModel;
  inputTokens: number;
  outputTokens: number;
}
