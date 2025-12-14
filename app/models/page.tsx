'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AIModel } from '@/types';
import ModelList from '@/components/ModelList';
import ModelForm from '@/components/ModelForm';
import PricingUpdateButton from '@/components/PricingUpdateButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  Database,
  Loader2
} from 'lucide-react';

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleAddModel = async (modelData: Partial<AIModel>) => {
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData),
      });
      if (res.ok) {
        await fetchModels();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to add model:', error);
    }
  };

  const handleUpdateModel = async (modelData: Partial<AIModel>) => {
    if (!editingModel) return;
    try {
      const res = await fetch(`/api/models/${editingModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData),
      });
      if (res.ok) {
        await fetchModels();
        setEditingModel(null);
      }
    } catch (error) {
      console.error('Failed to update model:', error);
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    try {
      const res = await fetch(`/api/models/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchModels();
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    setShowForm(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading models...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b bg-[hsl(var(--card))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                    Model Pricing
                  </h1>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Manage AI model costs
                  </p>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setShowForm(true);
                setEditingModel(null);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Model</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
        {/* Pricing Update */}
        <Card>
          <CardContent className="pt-4">
            <PricingUpdateButton onUpdate={fetchModels} />
          </CardContent>
        </Card>

        {/* Form */}
        {(showForm || editingModel) && (
          <Card className="animate-slideUp">
            <CardHeader>
              <CardTitle className="text-base">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModelForm
                model={editingModel || undefined}
                onSubmit={editingModel ? handleUpdateModel : handleAddModel}
                onCancel={() => {
                  setShowForm(false);
                  setEditingModel(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Model List */}
        <Card>
          <CardContent className="pt-6">
            <ModelList
              models={models}
              onEdit={handleEdit}
              onDelete={handleDeleteModel}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
