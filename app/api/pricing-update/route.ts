import { NextResponse } from 'next/server';
import { getModels } from '@/lib/models';
import { fetchAllPricing, mergePricing, PricingChangeLog } from '@/lib/pricingFetcher';
import { AIModel } from '@/types';

export interface PricingUpdateResponse {
  success: boolean;
  changes: PricingChangeLog[];
  errors: string[];
  totalModels: number;
  updatedModels?: AIModel[];
}

export async function POST() {
  try {
    // Fetch latest pricing from all providers
    const { updates, errors: fetchErrors } = await fetchAllPricing();

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        changes: [],
        errors: ['No pricing data available'],
        totalModels: 0,
      } as PricingUpdateResponse);
    }

    // Get current models and merge with updates
    const currentModels = getModels();
    const { models: updatedModels, changes } = mergePricing(currentModels, updates);

    // Return updates for client-side storage (no file system write)
    return NextResponse.json({
      success: true,
      changes,
      errors: fetchErrors,
      totalModels: updatedModels.length,
      updatedModels, // Client will store price overrides in localStorage
    } as PricingUpdateResponse);
  } catch (error) {
    console.error('Pricing update failed:', error);
    return NextResponse.json(
      {
        success: false,
        changes: [],
        errors: [`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        totalModels: 0,
      } as PricingUpdateResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return current pricing status
  try {
    const models = getModels();
    const providers = [...new Set(models.map(m => m.provider))];

    return NextResponse.json({
      totalModels: models.length,
      providers,
      customModels: models.filter(m => m.isCustom).length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get pricing status' },
      { status: 500 }
    );
  }
}
