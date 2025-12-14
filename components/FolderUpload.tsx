'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  Folder,
  FileText,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface FileInfo {
  fileName: string;
  fileType: string;
  tokens: number;
  characters: number;
  error?: string;
}

interface FolderUploadProps {
  label: string;
  onTokensCalculated: (tokens: number) => void;
  variant?: 'input' | 'output';
}

export default function FolderUpload({
  label,
  onTokensCalculated,
  variant = 'input'
}: FolderUploadProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [processingCount, setProcessingCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const accentColor = variant === 'input' ? 'emerald' : 'blue';

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setLoading(true);
    setError(null);

    const firstPath = selectedFiles[0].webkitRelativePath;
    const rootFolder = firstPath.split('/')[0];
    setFolderName(rootFolder);

    try {
      const formData = new FormData();
      let validFileCount = 0;

      const supportedExtensions = [
        'txt', 'md', 'pdf', 'doc', 'docx', 'xls', 'xlsx',
        'json', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h',
        'css', 'html', 'xml', 'yaml', 'yml', 'csv', 'sql', 'sh', 'rb', 'go', 'rs'
      ];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        if (supportedExtensions.includes(extension)) {
          formData.append('files', file);
          validFileCount++;
        }
      }

      if (validFileCount === 0) {
        setError('No supported files found');
        setLoading(false);
        return;
      }

      setProcessingCount(validFileCount);

      const response = await fetch('/api/tokens', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to count tokens');
      }

      const data = await response.json();
      setFiles(data.files);
      setTotalTokens(data.totalTokens);
      onTokensCalculated(data.totalTokens);

      if (data.errors && data.errors.length > 0) {
        setError(`${data.errors.length} file(s) had errors`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
    setTotalTokens(0);
    setError(null);
    setFolderName(null);
    setExpanded(false);
    onTokensCalculated(0);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const inputId = `folder-${label.replace(/\s/g, '-')}`;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        /* @ts-expect-error webkitdirectory is a non-standard attribute */
        webkitdirectory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
        id={inputId}
      />

      <label
        htmlFor={inputId}
        className={cn(
          "block cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200",
          "hover:border-solid",
          loading && "pointer-events-none opacity-70",
          folderName
            ? variant === 'input'
              ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30"
              : "border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30"
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
            {folderName && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={handleClear}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col items-center justify-center py-4">
            {loading ? (
              <>
                <Loader2 className={cn(
                  "h-8 w-8 animate-spin mb-2",
                  variant === 'input' ? "text-emerald-600" : "text-blue-600"
                )} />
                <span className="text-sm text-muted-foreground">
                  Processing {processingCount} files...
                </span>
              </>
            ) : folderName ? (
              <>
                <div className={cn(
                  "p-2 rounded-lg mb-2",
                  variant === 'input'
                    ? "bg-emerald-100 dark:bg-emerald-900/50"
                    : "bg-blue-100 dark:bg-blue-900/50"
                )}>
                  <Folder className={cn(
                    "h-6 w-6",
                    variant === 'input' ? "text-emerald-600" : "text-blue-600"
                  )} />
                </div>
                <span className="text-sm font-medium text-foreground truncate max-w-full">
                  {folderName}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className={cn(
                    "text-lg font-bold font-mono",
                    variant === 'input' ? "text-emerald-600" : "text-blue-600"
                  )}>
                    {totalTokens.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">tokens</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-muted/50 mb-2">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Select folder
                </span>
                <span className="text-xs text-muted-foreground/70 mt-0.5">
                  All files scanned recursively
                </span>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 mt-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>
      </label>

      {/* File Details */}
      {files.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {expanded ? 'Hide' : 'Show'} details
          </button>

          {expanded && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md border bg-card animate-fadeIn">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      File
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">
                      Tokens
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {files.map((file, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "hover:bg-muted/30",
                        file.error && "text-destructive"
                      )}
                    >
                      <td className="py-1.5 px-3">
                        <div className="flex items-center gap-1.5 max-w-[180px]">
                          <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                          <span className="truncate" title={file.fileName}>
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-1.5 px-3 font-mono">
                        {file.error ? (
                          <span className="text-destructive">Error</span>
                        ) : (
                          file.tokens.toLocaleString()
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
