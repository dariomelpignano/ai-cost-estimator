import { NextResponse } from 'next/server';
import { getModelById } from '@/lib/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const model = getModelById(id);
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(model);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

// PUT is disabled - model updates are stored client-side in localStorage
export async function PUT() {
  return NextResponse.json(
    { error: 'Model updates are stored locally in your browser. This endpoint is read-only.' },
    { status: 405 }
  );
}

// DELETE is disabled - custom models are stored client-side in localStorage
export async function DELETE() {
  return NextResponse.json(
    { error: 'Custom models are stored locally in your browser. This endpoint is read-only.' },
    { status: 405 }
  );
}
