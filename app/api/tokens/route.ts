import { NextResponse } from 'next/server';
import { parseFile } from '@/lib/fileParser';
import { countTokens } from '@/lib/tokenizer';

export interface TokenCountResult {
  fileName: string;
  fileType: string;
  tokens: number;
  characters: number;
  error?: string;
}

export interface TokenCountResponse {
  totalTokens: number;
  totalCharacters: number;
  fileCount: number;
  files: TokenCountResult[];
  errors: string[];
}

// Process a single file
async function processFile(file: File): Promise<TokenCountResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parseResult = await parseFile(buffer, file.name);

    if (parseResult.error) {
      return {
        fileName: file.name,
        fileType: parseResult.fileType,
        tokens: 0,
        characters: 0,
        error: parseResult.error,
      };
    }

    const tokens = countTokens(parseResult.text);
    const characters = parseResult.text.length;

    return {
      fileName: file.name,
      fileType: parseResult.fileType,
      tokens,
      characters,
    };
  } catch (error) {
    return {
      fileName: file.name,
      fileType: file.name.split('.').pop() || 'unknown',
      tokens: 0,
      characters: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Process files in parallel batches
async function processFilesInBatches(
  files: File[],
  batchSize: number = 10
): Promise<TokenCountResult[]> {
  const results: TokenCountResult[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processFile));
    results.push(...batchResults);
  }

  return results;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Process all files in parallel batches
    const results = await processFilesInBatches(files, 10);

    // Aggregate results
    const errors: string[] = [];
    let totalTokens = 0;
    let totalCharacters = 0;

    for (const result of results) {
      if (result.error) {
        errors.push(result.error);
      } else {
        totalTokens += result.tokens;
        totalCharacters += result.characters;
      }
    }

    const response: TokenCountResponse = {
      totalTokens,
      totalCharacters,
      fileCount: files.length,
      files: results,
      errors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Token counting error:', error);
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    );
  }
}
