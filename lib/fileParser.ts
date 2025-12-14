import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Disable worker for server-side usage
GlobalWorkerOptions.workerSrc = '';

export interface ParseResult {
  text: string;
  fileName: string;
  fileType: string;
  error?: string;
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocument({ data: uint8Array, useSystemFonts: true }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

export async function parseFile(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const fileType = extension;

  try {
    let text = '';

    switch (extension) {
      case 'txt':
      case 'md':
      case 'json':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'h':
      case 'css':
      case 'html':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'sql':
      case 'sh':
      case 'rb':
      case 'go':
      case 'rs':
        text = buffer.toString('utf-8');
        break;

      case 'pdf':
        text = await extractTextFromPdf(buffer);
        break;

      case 'doc':
      case 'docx':
        const docResult = await mammoth.extractRawText({ buffer });
        text = docResult.value;
        break;

      case 'xls':
      case 'xlsx':
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheets: string[] = [];
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetText = XLSX.utils.sheet_to_txt(sheet);
          sheets.push(sheetText);
        });
        text = sheets.join('\n\n');
        break;

      case 'csv':
        text = buffer.toString('utf-8');
        break;

      default:
        // Try to read as text
        text = buffer.toString('utf-8');
        // Check if it's actually readable text (ASCII + common unicode)
        const sample = text.slice(0, 1000);
        if (sample.includes('\x00') || !/^[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]*$/m.test(sample)) {
          return {
            text: '',
            fileName,
            fileType,
            error: `Unsupported file type: ${extension}`,
          };
        }
    }

    return { text, fileName, fileType };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      text: '',
      fileName,
      fileType,
      error: `Failed to parse ${fileName}: ${message}`,
    };
  }
}

export async function parseFiles(
  files: Array<{ buffer: Buffer; name: string }>
): Promise<{
  totalText: string;
  results: ParseResult[];
  errors: string[];
}> {
  const results: ParseResult[] = [];
  const errors: string[] = [];
  const textParts: string[] = [];

  for (const file of files) {
    const result = await parseFile(file.buffer, file.name);
    results.push(result);
    if (result.error) {
      errors.push(result.error);
    } else if (result.text) {
      textParts.push(result.text);
    }
  }

  return {
    totalText: textParts.join('\n\n'),
    results,
    errors,
  };
}
