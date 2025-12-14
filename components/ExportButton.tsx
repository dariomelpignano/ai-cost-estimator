'use client';

import { useState, useRef, useEffect } from 'react';
import { CostEstimate } from '@/types';
import { exportAsCSV, exportAsPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  estimate: CostEstimate | null;
}

export default function ExportButton({ estimate }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCSV = async () => {
    if (!estimate) return;
    setExporting('csv');
    try {
      exportAsCSV(estimate);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const handleExportPDF = async () => {
    if (!estimate) return;
    setExporting('pdf');
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      exportAsPDF(estimate);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        disabled={!estimate}
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-lg z-50 animate-fadeIn">
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              disabled={exporting !== null}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {exporting === 'csv' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              )}
              Export as CSV
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-red-600" />
              )}
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
