import { NextResponse } from 'next/server';
import { getModels, addModel } from '@/lib/models';

export async function GET() {
  try {
    const models = getModels();
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, provider, inputCostPerMillion, outputCostPerMillion } = body;

    if (!name || !provider || inputCostPerMillion === undefined || outputCostPerMillion === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newModel = addModel({
      name,
      provider,
      inputCostPerMillion: Number(inputCostPerMillion),
      outputCostPerMillion: Number(outputCostPerMillion),
    });

    return NextResponse.json(newModel, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}
