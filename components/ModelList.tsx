'use client';

import { AIModel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, Building2 } from 'lucide-react';

interface ModelListProps {
  models: AIModel[];
  onEdit: (model: AIModel) => void;
  onDelete: (id: string) => void;
}

export default function ModelList({ models, onEdit, onDelete }: ModelListProps) {
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const providers = Object.keys(modelsByProvider).sort();

  if (models.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No models found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {providers.map((provider) => (
        <div key={provider}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{provider}</h3>
            <Badge variant="secondary" className="text-xs">
              {modelsByProvider[provider].length}
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Input $/1M</TableHead>
                <TableHead className="text-right">Output $/1M</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelsByProvider[provider].map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      {model.isCustom && (
                        <Badge variant="success" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${model.inputCostPerMillion}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${model.outputCostPerMillion}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(model)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {model.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(model.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
