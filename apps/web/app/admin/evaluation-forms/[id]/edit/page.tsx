'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { getEvaluationForm, updateEvaluationForm } from '@/lib/api/evaluation-forms.api';
import { useAlert } from '@/lib/contexts/AlertContext';
import { PERMISSIONS } from '@/config/permissions';
import { usePermission } from '@/lib/hooks/usePermission';
import type {
  CreateEvaluationFormDto,
  EvaluationForm,
  EvaluationScaleItem,
} from '@/types/evaluation-form';

type DraftItem = {
  id: string;
  text: string;
};

type DraftSection = {
  id: string;
  key?: string;
  title: string;
  items: DraftItem[];
};

type DraftForm = Omit<CreateEvaluationFormDto, 'sections'> & {
  sections: DraftSection[];
};


const defaultScale: EvaluationScaleItem[] = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Satisfactory' },
  { value: 3, label: 'Satisfactory' },
  { value: 2, label: 'Fair' },
  { value: 1, label: 'Poor' },
];

const evaluatorOptionsMap: Record<CreateEvaluationFormDto['audience'], string[]> =
  {
    teaching: ['Student', 'Peer', 'Self', 'Other'],
    'non-teaching': ['Administrator/Head', 'Peer', 'Self', 'Other'],
    dean: ['Faculty', 'Staff', 'Peer', 'Other'],
  };

const normalizeEvaluatorOptions = (
  options: string[] | undefined,
  audience: CreateEvaluationFormDto['audience'],
) => {
  const allowed = evaluatorOptionsMap[audience];
  const filtered = (options || []).filter((option) => allowed.includes(option));
  return filtered.length > 0 ? filtered : allowed;
};

const createId = () => crypto.randomUUID();

const toDraftForm = (form: CreateEvaluationFormDto): DraftForm => ({
  name: form.name,
  audience: form.audience,
  description: form.description,
  evaluatorOptions: normalizeEvaluatorOptions(form.evaluatorOptions, form.audience),
  scale: form.scale || defaultScale,
  sections: (form.sections || []).map((section) => ({
    id: createId(),
    key: section.key,
    title: section.title,
    items: (section.items || []).map((item) => ({
      id: createId(),
      text: item,
    })),
  })),
  semester: form.semester,
  schoolYear: form.schoolYear,
  endDate: form.endDate,
});

const toDtoForm = (form: DraftForm): CreateEvaluationFormDto => ({
  name: form.name,
  audience: form.audience,
  description: form.description,
  evaluatorOptions: form.evaluatorOptions,
  scale: form.scale,
  sections: form.sections.map((section) => ({
    key: section.key,
    title: section.title,
    items: section.items.map((item) => item.text),
  })),
  semester: form.semester,
  schoolYear: form.schoolYear,
  endDate: form.endDate,
});

const addSection = (form: DraftForm): DraftForm => ({
  ...form,
  sections: [
    ...form.sections,
    { id: createId(), title: 'New Section', items: [] },
  ],
});

const removeSection = (form: DraftForm, sectionId: string): DraftForm => {
  // Prevent removal of the "Other" section
  const sectionToRemove = form.sections.find((s) => s.id === sectionId);
  if (sectionToRemove?.key === 'OTHER') {
    return form;
  }
  return {
    ...form,
    sections: form.sections.filter((section) => section.id !== sectionId),
  };
};

const updateSectionTitle = (
  form: DraftForm,
  sectionId: string,
  value: string,
): DraftForm => ({
  ...form,
  sections: form.sections.map((section) =>
    section.id === sectionId ? { ...section, title: value } : section,
  ),
});

const addItem = (form: DraftForm, sectionId: string): DraftForm => ({
  ...form,
  sections: form.sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          items: [...section.items, { id: createId(), text: '' }],
        }
      : section,
  ),
});

const removeItem = (
  form: DraftForm,
  sectionId: string,
  itemId: string,
): DraftForm => ({
  ...form,
  sections: form.sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          items: section.items.filter((item) => item.id !== itemId),
        }
      : section,
  ),
});

const updateItem = (
  form: DraftForm,
  sectionId: string,
  itemId: string,
  value: string,
): DraftForm => ({
  ...form,
  sections: form.sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          items: section.items.map((item) =>
            item.id === itemId ? { ...item, text: value } : item,
          ),
        }
      : section,
  ),
});

const updateScale = (
  form: DraftForm,
  index: number,
  field: keyof EvaluationScaleItem,
  value: string,
): DraftForm => ({
  ...form,
  scale: (form.scale || []).map((item, idx) =>
    idx === index
      ? {
          ...item,
          [field]: field === 'value' ? Number(value) : value,
        }
      : item,
  ),
});

export default function EvaluationFormEditPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const canManageForms = usePermission(PERMISSIONS.EVALUATION_FORMS_MANAGE);
  const [draft, setDraft] = useState<DraftForm | null>(null);
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const hasValidId = Boolean(id) && id !== 'undefined' && id !== 'null';

  const { data: form, isLoading, isError } = useQuery<EvaluationForm>({
    queryKey: ['evaluation-forms', id],
    queryFn: () => getEvaluationForm(String(id)),
    enabled: hasValidId,
  });

  useEffect(() => {
    if (!form) return;
    setDraft(
      toDraftForm({
        name: form.name,
        audience: form.audience,
        description: form.description || '',
        scale: form.scale?.length ? form.scale : defaultScale,
        sections: form.sections || [],
        semester: form.semester || '',
        schoolYear: form.schoolYear || '',
        endDate: form.endDate ? new Date(form.endDate).toISOString().split('T')[0] : '',
      }),
    );
  }, [form]);

  const updateMutation = useMutation({
    mutationFn: (data: CreateEvaluationFormDto) =>
      updateEvaluationForm(String(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-forms'] });
      queryClient.invalidateQueries({ queryKey: ['evaluation-forms', params.id] });
      toast.success('Evaluation form updated.');
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to update form.',
        { title: 'Update Failed' },
      );
    },
  });

  const handleSave = () => {
    if (!canManageForms) {
      alert.showWarning('You do not have permission to manage evaluation forms.');
      return;
    }
    if (!draft) return;
    if (!draft.name.trim()) {
      alert.showWarning('Form name is required.');
      return;
    }
    updateMutation.mutate(toDtoForm(draft));
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!hasValidId) {
    return <div className="p-4">Invalid form id.</div>;
  }

  if (isError || !form) {
    return <div className="p-4">Failed to load form.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Evaluation Form</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update form details, sections, and rating scale.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-muted-foreground">
            <Link href="/admin/evaluation-forms" className="hover:underline">
              Evaluation Forms
            </Link>{' '}
            / Edit
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/evaluation-forms/${String(id)}/responses`}>
                Responses
              </Link>
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/evaluation-forms/${String(id)}/print`} target="_blank">
                Open printable page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {draft && (
        <Card>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
            <CardDescription>Edit and preview the current form.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-form-name">Form name</Label>
                  <Input
                    id="edit-form-name"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, name: event.target.value }
                          : current,
                      )
                    }
                    placeholder="e.g., Teaching Performance Evaluation"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select
                    value={draft.audience}
                    onValueChange={(value) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              audience: value as CreateEvaluationFormDto['audience'],
                              evaluatorOptions: normalizeEvaluatorOptions(
                                current.evaluatorOptions,
                                value as CreateEvaluationFormDto['audience'],
                              ),
                            }
                          : current,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teaching">Teaching personnel</SelectItem>
                      <SelectItem value="non-teaching">Non-teaching personnel</SelectItem>
                      <SelectItem value="dean">Dean / Academic Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(draft.audience === 'teaching' || draft.audience === 'dean') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select
                        value={draft.semester || ''}
                        onValueChange={(value) =>
                          setDraft((current) =>
                            current ? { ...current, semester: value } : current,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st Semester</SelectItem>
                          <SelectItem value="2nd">2nd Semester</SelectItem>
                          <SelectItem value="Summer">Summer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-form-school-year">School Year</Label>
                      <Input
                        id="edit-form-school-year"
                        value={draft.schoolYear || ''}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, schoolYear: event.target.value }
                              : current,
                          )
                        }
                        placeholder="e.g., 2024-2025"
                      />
                    </div>
                  </div>
                )}
                {draft.audience === 'non-teaching' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-form-school-year-nt">School Year</Label>
                    <Input
                      id="edit-form-school-year-nt"
                      value={draft.schoolYear || ''}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? { ...current, schoolYear: event.target.value }
                            : current,
                        )
                      }
                      placeholder="e.g., 2024-2025"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-form-end-date">End Date</Label>
                  <Input
                    id="edit-form-end-date"
                    type="date"
                    value={draft.endDate || ''}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, endDate: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-form-description">Description</Label>
                  <Textarea
                    id="edit-form-description"
                    value={draft.description || ''}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, description: event.target.value }
                          : current,
                      )
                    }
                    placeholder="Outline sections, scale, or instructions."
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Evaluators</Label>
                  <div className="space-y-2">
                    {evaluatorOptionsMap[draft.audience].map((option) => {
                      const checked = (draft.evaluatorOptions || []).includes(option);
                      return (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              setDraft((current) => {
                                if (!current) return current;
                                const next = value
                                  ? [...(current.evaluatorOptions || []), option]
                                  : (current.evaluatorOptions || []).filter(
                                      (item) => item !== option,
                                    );
                                return {
                                  ...current,
                                  evaluatorOptions: normalizeEvaluatorOptions(
                                    next,
                                    current.audience,
                                  ),
                                };
                              })
                            }
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Scale</Label>
                  <div className="space-y-2">
                    {(draft.scale || []).map((item, idx) => (
                      <div key={item.value} className="flex gap-2">
                        <Input
                          type="number"
                          value={item.value}
                          onChange={(event) =>
                            setDraft((current) =>
                              current
                                ? updateScale(current, idx, 'value', event.target.value)
                                : current,
                            )
                          }
                          className="w-24"
                        />
                        <Input
                          value={item.label}
                          onChange={(event) =>
                            setDraft((current) =>
                              current
                                ? updateScale(current, idx, 'label', event.target.value)
                                : current,
                            )
                          }
                          placeholder="Label"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setDraft((current) => (current ? addSection(current) : current))
                      }
                    >
                      Add section
                    </Button>
                  </div>
                  {draft.sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No sections yet. Add one to start building the form.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {draft.sections.map((section) => (
                        <div key={section.id} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-center gap-2">
                            {section.key ? (
                              <span className="shrink-0 text-sm font-medium text-muted-foreground w-10">
                                {section.key}
                              </span>
                            ) : null}
                            <Input
                              value={section.title}
                              onChange={(event) =>
                                setDraft((current) =>
                                  current
                                    ? updateSectionTitle(
                                        current,
                                        section.id,
                                        event.target.value,
                                      )
                                    : current,
                                )
                              }
                              placeholder="Section title"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                setDraft((current) =>
                                  current ? removeSection(current, section.id) : current,
                                )
                              }
                              disabled={section.key === 'OTHER'}
                              title={section.key === 'OTHER' ? 'The "Other" section cannot be removed' : ''}
                            >
                              Remove
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {section.items.map((item) => (
                              <div key={item.id} className="flex gap-2">
                                <Input
                                  value={item.text}
                                  onChange={(event) =>
                                    setDraft((current) =>
                                      current
                                        ? updateItem(
                                            current,
                                            section.id,
                                            item.id,
                                            event.target.value,
                                          )
                                        : current,
                                    )
                                  }
                                  placeholder="Item"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() =>
                                    setDraft((current) =>
                                      current
                                        ? removeItem(current, section.id, item.id)
                                        : current,
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                setDraft((current) =>
                                  current ? addItem(current, section.id) : current,
                                )
                              }
                            >
                              Add item
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    Save changes
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/admin/evaluation-forms/${params.id}/print`} target="_blank">
                      Open printable page
                    </Link>
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.print()}>
                    Print preview
                  </Button>
                </div>
                <div className="border rounded-lg p-4 space-y-4 bg-muted/20 print-area">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {draft.name || 'Untitled Evaluation Form'}
                    </h2>
                    {(draft.semester || draft.schoolYear || draft.endDate) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {draft.semester && `${draft.semester} Semester`}
                        {draft.semester && draft.schoolYear && ' · '}
                        {draft.schoolYear && `SY ${draft.schoolYear}`}
                        {(draft.semester || draft.schoolYear) && draft.endDate && ' · '}
                        {draft.endDate && `End Date: ${new Date(draft.endDate).toLocaleDateString()}`}
                      </p>
                    )}
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

                  {(draft.evaluatorOptions || []).length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold mb-2">Evaluators</p>
                      <div className="flex flex-wrap gap-2">
                        {(draft.evaluatorOptions || []).map((option) => (
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

                  {draft.sections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <p className="font-semibold">
                        {section.key ? (
                          <span className="text-muted-foreground mr-2">{section.key}</span>
                        ) : null}
                        {section.title}
                      </p>
                      {section.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No items added yet.
                        </p>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
