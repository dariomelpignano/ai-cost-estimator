import Link from 'next/link';
import { Calculator, Settings } from 'lucide-react';
import CostCalculator from '@/components/CostCalculator';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b bg-[hsl(var(--card))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  AI Cost Estimator
                </h1>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Calculate API costs by token usage
                </p>
              </div>
            </div>
            <Link href="/models">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Manage Models</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <CostCalculator />
      </div>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
            Token counts are estimates using the cl100k_base tokenizer
          </p>
        </div>
      </footer>
    </main>
  );
}
