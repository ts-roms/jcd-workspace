'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import type { EvaluationScaleItem } from '@/types/evaluation-form';

const CREATE_FORM_STORAGE_KEY = 'evaluation-forms:create-draft';

type DraftItem = {
  id: string;
  text: string;
};

type DraftSection = {
  id: string;
  title: string;
  items: DraftItem[];
};

type DraftForm = {
  name: string;
  audience: 'teaching' | 'non-teaching';
  description?: string;
  scale?: EvaluationScaleItem[];
  sections: DraftSection[];
};

const defaultScale: EvaluationScaleItem[] = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Satisfactory' },
  { value: 3, label: 'Satisfactory' },
  { value: 2, label: 'Fair' },
  { value: 1, label: 'Poor' },
];

const emptyDraft: DraftForm = {
  name: '',
  audience: 'teaching',
  description: '',
  scale: defaultScale,
  sections: [],
};

const createId = () => crypto.randomUUID();

const hydrateDraftForm = (raw: unknown): DraftForm | null => {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<DraftForm>;
  return {
    ...emptyDraft,
    name: typeof data.name === 'string' ? data.name : '',
    audience:
      data.audience === 'teaching' || data.audience === 'non-teaching'
        ? data.audience
        : 'teaching',
    description: typeof data.description === 'string' ? data.description : '',
    scale:
      Array.isArray(data.scale) && data.scale.length > 0
        ? data.scale.map((item) => ({
            value:
              typeof item.value === 'number'
                ? item.value
                : Number(item.value) || 0,
            label: typeof item.label === 'string' ? item.label : '',
          }))
        : defaultScale,
    sections: Array.isArray(data.sections)
      ? data.sections.map((section) => ({
          id: typeof section.id === 'string' ? section.id : createId(),
          title: typeof section.title === 'string' ? section.title : '',
          items: Array.isArray(section.items)
            ? section.items.map((item) => ({
                id: typeof item.id === 'string' ? item.id : createId(),
                text: typeof item.text === 'string' ? item.text : '',
              }))
            : [],
        }))
      : [],
  };
};

export default function EvaluationFormDraftPreviewPage() {
  const [draft, setDraft] = useState<DraftForm | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CREATE_FORM_STORAGE_KEY);
    if (!saved) {
      setDraft(null);
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      setDraft(hydrateDraftForm(parsed));
    } catch (error) {
      console.warn('Failed to load evaluation form draft', error);
      setDraft(null);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Draft Preview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preview the draft you are currently building.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/evaluation-forms">Back to builder</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Print preview
          </Button>
        </div>
      </div>

      {!draft ? (
        <Card>
          <CardHeader>
            <CardTitle>No draft found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start creating a form to see a preview here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg p-4 space-y-4 bg-muted/20 print-area">
          <div>
            <h2 className="text-xl font-semibold">
              {draft.name || 'Untitled Evaluation Form'}
            </h2>
            {draft.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {draft.description}
              </p>
            )}
          </div>

          {(draft.scale || []).length > 0 && (
            <div className="text-sm">
              <p className="font-semibold mb-2">Rating Scale</p>
              <div className="flex flex-wrap gap-2">
                {(draft.scale || []).map((item) => (
                  <span
                    key={`${item.value}-${item.label}`}
                    className="px-2 py-1 rounded border text-xs bg-background"
                  >
                    {item.value} = {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {draft.sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <p className="font-semibold">{section.title}</p>
              {section.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items added yet.</p>
              ) : (
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 border rounded-md px-3 py-2 bg-background"
                    >
                      <span className="text-sm">
                        {itemIndex + 1}. {item.text || 'Untitled item'}
                      </span>
                      <div className="flex gap-1">
                        {(draft.scale || []).map((scaleItem) => (
                          <span
                            key={`${scaleItem.value}-${item.id}`}
                            className="w-6 h-6 flex items-center justify-center border rounded text-xs"
                          >
                            {scaleItem.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
