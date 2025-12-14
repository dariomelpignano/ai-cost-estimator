import { NextResponse } from 'next/server';
import { getModels } from '@/lib/models';

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

// POST is disabled - custom models are stored client-side in localStorage
export async function POST() {
  return NextResponse.json(
    { error: 'Custom models are stored locally in your browser. This endpoint is read-only.' },
    { status: 405 }
  );
}
