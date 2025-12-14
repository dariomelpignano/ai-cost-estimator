# AI Cost Estimator - Architecture Documentation

## Overview
A Next.js web application for estimating costs of AI API queries. Users can manage AI models with pricing (per million tokens) and calculate costs for their API usage.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Local JSON file
- **File Parsing**: pdfjs-dist, mammoth, xlsx
- **Tokenization**: js-tiktoken (GPT-4o tokenizer)

## Project Structure

```
ai-cost-estimator/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with global styles
│   ├── page.tsx                # Home page - Cost Calculator
│   ├── models/
│   │   └── page.tsx            # Model management page
│   └── api/
│       ├── models/
│       │   ├── route.ts        # GET all models, POST new model
│       │   └── [id]/
│       │       └── route.ts    # PUT update, DELETE model
│       └── tokens/
│           └── route.ts        # POST - count tokens from uploaded files
├── components/                 # React components
│   ├── CostCalculator.tsx      # Main calculator interface
│   ├── FolderUpload.tsx        # Folder upload for token counting
│   ├── ModelSelector.tsx       # Dropdown to select AI model
│   ├── ModelForm.tsx           # Form to add/edit models
│   └── ModelList.tsx           # Table of models with actions
├── lib/                        # Utility functions
│   ├── models.ts               # Model data CRUD operations
│   ├── calculations.ts         # Cost calculation logic
│   ├── tokenizer.ts            # Token counting using tiktoken
│   └── fileParser.ts           # Parse various file formats
├── data/
│   └── models.json             # Pre-loaded model pricing data
├── types/
│   └── index.ts                # TypeScript interfaces
└── ARCHITECTURE.md             # This file
```

## Data Model

### AIModel Interface
```typescript
interface AIModel {
  id: string;                    // Unique identifier
  name: string;                  // Model name (e.g., "GPT-4o")
  provider: string;              // Provider name (e.g., "OpenAI")
  inputCostPerMillion: number;   // Cost in $ per 1M input tokens
  outputCostPerMillion: number;  // Cost in $ per 1M output tokens
  isCustom: boolean;             // true for user-added models
}
```

## Core Functionality

### Cost Calculation
```
Total Cost = (Input Tokens / 1,000,000 * Input Cost) + (Output Tokens / 1,000,000 * Output Cost)
```

### Token Counting
Tokens are counted using the `js-tiktoken` library with the GPT-4o tokenizer (cl100k_base encoding). This provides accurate token estimates that are applicable across most modern LLMs.

### Folder Upload Feature
Users can select folders to automatically calculate token counts:
- **Input Folder**: Documents representing prompts/context sent to the AI
- **Output Folder**: Sample AI responses for estimating output costs
- Recursively processes all files in selected folders
- Supported file types: txt, md, pdf, doc, docx, xls, xlsx, json, csv, code files

### File Parsing
| Format | Library | Notes |
|--------|---------|-------|
| PDF | pdfjs-dist | Extracts text from all pages |
| DOC/DOCX | mammoth | Extracts raw text |
| XLS/XLSX | xlsx | Extracts text from all sheets |
| Text/Code | Native | UTF-8 decoding |

### Pre-loaded Models
The application comes with pricing data for popular AI models:
- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-5.2, o1, o1-mini
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, Claude Opus 4.5
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash, Gemini 3 Pro
- **Meta**: Llama 3.1 405B, Llama 3.1 70B
- **Mistral**: Mistral Large, Mistral Small

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models` | List all models |
| POST | `/api/models` | Add a custom model |
| PUT | `/api/models/[id]` | Update a model |
| DELETE | `/api/models/[id]` | Delete a custom model |
| POST | `/api/tokens` | Count tokens from uploaded files |

## Pages

### Home Page (`/`)
- Model selector dropdown (grouped by provider)
- Toggle between Manual input and Folder upload modes
- Input fields for token counts (input/output)
- Folder upload components for automatic token counting
- Real-time cost calculation display
- Link to model management

### Models Page (`/models`)
- Table of all models with pricing
- Add new model button
- Edit/delete actions for custom models
- Visual distinction between pre-loaded and custom models

## Data Flow

1. **On Load**: Models loaded from `data/models.json` + any custom models
2. **Manual Mode**: User enters token counts directly → instant cost display
3. **Folder Mode**: User selects folders → files parsed → tokens counted → cost displayed
4. **Model Management**: CRUD operations update the JSON file via API routes

## Token Count Accuracy

The token counting is **reasonably accurate** for estimation purposes:
- Uses the same tokenizer as GPT-4o (cl100k_base)
- Text extraction from PDFs/DOCs may have minor variations
- Different models use slightly different tokenizers, but estimates are within ~5-10%
- Best accuracy for plain text and code files

## Development Status
- [x] Project initialization
- [x] Types and data setup
- [x] Core library functions
- [x] API routes
- [x] UI components
- [x] Pages integration
- [x] Folder upload feature
- [x] Token counting from files
