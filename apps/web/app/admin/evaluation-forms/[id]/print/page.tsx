'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/app/components/ui/button';
import { getEvaluationForm } from '@/lib/api/evaluation-forms.api';
import type { EvaluationForm } from '@/types/evaluation-form';

export default function EvaluationFormPrintPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const hasValidId = Boolean(id) && id !== 'undefined' && id !== 'null';

  const { data: form, isLoading, isError } = useQuery<EvaluationForm>({
    queryKey: ['evaluation-forms', id],
    queryFn: () => getEvaluationForm(String(id)),
    enabled: hasValidId,
  });

  useEffect(() => {
    if (!hasValidId) return undefined;
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, [hasValidId]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!hasValidId) {
    return <div className="p-4">Invalid form id.</div>;
  }

  if (isError || !form) {
    return (
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">Unable to load form.</p>
        <Button asChild variant="outline">
          <Link href="/admin/evaluation-forms">Back to forms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 print-area">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Printable Evaluation Form</h1>
          <p className="text-sm text-muted-foreground">
            {form.name} · {form.audience === 'teaching' ? 'Teaching' : 'Non-teaching'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/evaluation-forms">Back</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-white">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <img
              src="/smcc-logo.svg"
              alt="Saint Michael College of Caraga"
              className="h-16 w-16"
            />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold">Saint Michael College of Caraga</p>
              <p className="text-xs text-muted-foreground">
                Teacher Evaluation on Teaching Performance
              </p>
            </div>
          </div>
          <div className="grid gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="min-w-[120px] font-semibold text-black">Name of Teacher</span>
              <span className="flex-1 border-b border-dashed border-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="min-w-[120px] font-semibold">Department</span>
              <span className="flex-1 border-b border-dashed border-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="min-w-[120px] font-semibold">Date of Evaluation</span>
              <span className="flex-1 border-b border-dashed border-gray-400" />
              <span className="min-w-[80px] font-semibold">Semester</span>
              <span className="flex-1 border-b border-dashed border-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="min-w-[120px] font-semibold">Evaluator</span>
              <span className="flex-1 border-b border-dashed border-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold">{form.name}</h2>
          {form.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {form.description}
            </p>
          )}
        </div>

        {(form.scale || []).length > 0 && (
          <div className="text-sm">
            <p className="font-semibold mb-2">Rating Scale</p>
            <div className="flex flex-wrap gap-2">
              {(form.scale || []).map((item) => (
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

        {(form.evaluatorOptions || []).length > 0 && (
          <div className="text-sm">
            <p className="font-semibold mb-2">Evaluators</p>
            <div className="flex flex-wrap gap-2">
              {(form.evaluatorOptions || []).map((option) => (
                <span
                  key={option}
                  className="px-2 py-1 rounded border text-xs bg-background"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}

        {(form.sections || []).map((section, sectionIndex) => (
          <div key={`${section.title}-${sectionIndex}`} className="space-y-2">
            <p className="font-semibold">{section.title}</p>
            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items provided.</p>
            ) : (
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={`${sectionIndex}-${itemIndex}`}
                    className="flex items-center justify-between gap-4 border rounded-md px-3 py-2"
                  >
                    <span className="text-sm">
                      {itemIndex + 1}. {item || 'Untitled item'}
                    </span>
                    <div className="flex gap-1">
                      {(form.scale || []).map((scaleItem) => (
                        <span
                          key={`${scaleItem.value}-${itemIndex}`}
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
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
