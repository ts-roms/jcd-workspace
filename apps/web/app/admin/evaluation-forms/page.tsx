'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import {
  createEvaluationForm,
  deleteEvaluationForm,
  getEvaluationForms,
} from '@/lib/api/evaluation-forms.api';
import { useAlert } from '@/lib/contexts/AlertContext';
import { PERMISSIONS } from '@/config/permissions';
import { usePermission } from '@/lib/hooks/usePermission';
import type {
  CreateEvaluationFormDto,
  EvaluationForm,
  EvaluationScaleItem,
} from '@/types/evaluation-form';

const defaultScale: EvaluationScaleItem[] = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Satisfactory' },
  { value: 3, label: 'Satisfactory' },
  { value: 2, label: 'Fair' },
  { value: 1, label: 'Poor' },
];

const emptyForm: CreateEvaluationFormDto = {
  name: '',
  audience: 'teaching',
  description: '',
  evaluatorOptions: ['Student'],
  scale: defaultScale,
  sections: [],
  semester: '',
  schoolYear: '',
  endDate: '',
};

const CREATE_FORM_STORAGE_KEY = 'evaluation-forms:create-draft';

/** Default teaching sections: PAA, KSM, TS, CM, AL, GO (section key and full name). */
const teachingTemplate: CreateEvaluationFormDto = {
  name: 'Teaching Performance Evaluation',
  audience: 'teaching',
  description:
    'Teacher Evaluation on Teaching Performance (New Normal). Scale: 5 Excellent, 4 Very Satisfactory, 3 Satisfactory, 2 Fair, 1 Poor.',
  evaluatorOptions: ['Student'],
  scale: defaultScale,
  sections: [
    {
      key: 'PAA',
      title: 'Professional Attitude & Appearance',
      items: [
        'Shows marked extraordinary enthusiasm about his/her teaching',
        "Endeavors to implement the school's objective",
        'Intellectually humble and tolerant',
        'Always clean and orderly in person, dress, and habits',
        'Well-modulated voice',
        'Capable of adjusting to changing conditions and situations',
        'Consistently alert and emotionally mature',
        'Punctual in class attendance/meetings and other school activities',
        'Follows school rules and regulations',
        'Performs other duties assigned outside of classroom work',
      ],
    },
    {
      key: 'KSM',
      title: 'Effectiveness of Teaching (Knowledge of Subject Matter)',
      items: [
        'Prepares lesson well',
        'Has ample understanding/grasp of subject',
        'Shows interest in subject matter',
        'Welcomes questions/requests/clarification',
        'Organizes subject matter well',
        'Selects relevant material effectively',
        'Ability to relate subject matter to other fields',
      ],
    },
    {
      key: 'TS',
      title: 'Teaching Skills',
      items: [
        'Speaks clearly and distinctly',
        'Speaks English-Filipino correctly',
        'Makes lesson interesting',
        'Explains subject matter clearly',
        'Makes subject matter relevant to the course objectives',
        'Makes subject matter relevant/practical to current needs',
        'Uses techniques for students participation',
        'Encourages critical thinking',
        'Provides appropriate drills/seatwork/assignments',
      ],
    },
    {
      key: 'CM',
      title: 'Classroom Management',
      items: [
        "Commands students' respect",
        'Handles individual/group discipline tactfully',
        'Fair in dealing with students',
        'Adopts a system in routine work',
      ],
    },
    {
      key: 'AL',
      title: 'Assessment of Learning',
      items: [
        'Assigns assessment that is related to subject/course material',
        'Allows enough time to complete the assigned assessment',
        'Give examinations that reflected the material covered in the delivery of instructions',
        'Provides constructive and timely feedbacks on graded material',
        'Grades the assigned assessment fairly by using rubrics',
        'Creative in developing activities and other formative assessments',
      ],
    },
    {
      key: 'GO',
      title: 'Goals & Overall Performance',
      items: [
        'Rapport between teachers and students',
        'Class participation',
        'Overall teacher impact',
        'General classroom condition',
      ],
    },
  ],
};

/** Default non-teaching sections based on actual evaluation metrics. */
const nonTeachingTemplate: CreateEvaluationFormDto = {
  name: 'Non-Teaching Staff Evaluation',
  audience: 'non-teaching',
  description:
    'Non-Teaching Staff Performance Evaluation. Scale: 5 Excellent, 4 Very Satisfactory, 3 Satisfactory, 2 Fair, 1 Poor.',
  evaluatorOptions: ['Administrator/Head', 'Peer', 'Self'],
  scale: defaultScale,
  sections: [
    {
      key: 'QW',
      title: 'Quality of Work',
      items: [
        'Thoroughness',
        'Accuracy',
        'Neatness and Economy',
      ],
    },
    {
      key: 'QTW',
      title: 'Quantity of Work',
      items: [
        'Individual Productivity',
        'Speed in performing the assigned work',
      ],
    },
    {
      key: 'KW',
      title: 'Knowledge of Work',
      items: [
        'Has a complete and thorough knowledge of all the phases of the assigned task',
        'Has a good judgment',
        'Has a great mental power, rarely needs instruction and assistance, Fast thinker',
      ],
    },
    {
      key: 'RL',
      title: 'Reliability',
      items: [
        'Dependability - can be depended upon to perform work well with little supervision',
        'Honesty and Trustworthiness, is discreet in keeping inviolate all confidential information, does not indulge in gossip',
        'Conscientiousness - is dedicated to work; has a sense of responsibility/loyalty to the institution',
      ],
    },
    {
      key: 'CO',
      title: 'Cooperation',
      items: [
        'Gets along with another employee not within the Department',
        'Shows willingness to learn up; Is tactful, cheerful, and courteous, not moody',
        'Shows willingness to listen to the opinion of others; has harmonious relation with the staff',
        'Is not rumor-monger causing intrigue among fellow workers',
      ],
    },
    {
      key: 'IN',
      title: 'Initiative',
      items: [
        'Creative and Resourceful. Is able to plan and think. Seeks to improve work',
        'Punctuality - Rarely comes late. Never loiters during office hours; not a time conscious worker',
      ],
    },
    {
      key: 'CR',
      title: 'Comments and Recommendations',
      items: [
        'Comments and recommendations for improvement',
      ],
    },
  ],
};

const evaluatorOptionsMap: Record<CreateEvaluationFormDto['audience'], string[]> =
  {
    teaching: ['Student', 'Other'],
    'non-teaching': ['Administrator/Head', 'Peer', 'Self', 'Other'],
  };

const normalizeEvaluatorOptions = (
  options: string[] | undefined,
  audience: CreateEvaluationFormDto['audience'],
) => {
  const allowed = evaluatorOptionsMap[audience];
  const filtered = (options || []).filter((option) => allowed.includes(option));
  return filtered.length > 0 ? filtered : allowed;
};

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

const hydrateDraftForm = (raw: unknown): DraftForm | null => {
  if (!raw || typeof raw !== 'object') return null;
  const base = toDraftForm(emptyForm);
  const data = raw as Partial<DraftForm>;
  return {
    ...base,
    name: typeof data.name === 'string' ? data.name : base.name,
    audience:
      data.audience === 'teaching' || data.audience === 'non-teaching'
        ? data.audience
        : base.audience,
    description: typeof data.description === 'string' ? data.description : base.description,
    scale:
      Array.isArray(data.scale) && data.scale.length > 0
        ? data.scale.map((item) => ({
            value:
              typeof item.value === 'number'
                ? item.value
                : Number(item.value) || 0,
            label: typeof item.label === 'string' ? item.label : '',
          }))
        : base.scale,
    sections: Array.isArray(data.sections)
      ? data.sections.map((section) => ({
          id: typeof section.id === 'string' ? section.id : createId(),
          key: typeof section.key === 'string' ? section.key : undefined,
          title: typeof section.title === 'string' ? section.title : '',
          items: Array.isArray(section.items)
            ? section.items.map((item) => ({
                id: typeof item.id === 'string' ? item.id : createId(),
                text: typeof item.text === 'string' ? item.text : '',
              }))
            : [],
        }))
      : base.sections,
    semester: typeof data.semester === 'string' ? data.semester : base.semester,
    schoolYear: typeof data.schoolYear === 'string' ? data.schoolYear : base.schoolYear,
    endDate: typeof data.endDate === 'string' ? data.endDate : base.endDate,
  };
};

export default function EvaluationFormsPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const canManageForms = usePermission(PERMISSIONS.EVALUATION_FORMS_MANAGE);
  const [createForm, setCreateForm] = useState<DraftForm>(() =>
    toDraftForm(emptyForm),
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const { data: forms = [], isLoading } = useQuery<EvaluationForm[]>({
    queryKey: ['evaluation-forms'],
    queryFn: getEvaluationForms,
  });

  useEffect(() => {
    const saved = localStorage.getItem(CREATE_FORM_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const hydrated = hydrateDraftForm(parsed);
      if (hydrated) {
        setCreateForm(hydrated);
        setLastSavedAt(new Date());
      }
    } catch (error) {
      console.warn('Failed to restore evaluation form draft', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(CREATE_FORM_STORAGE_KEY, JSON.stringify(createForm));
      setLastSavedAt(new Date());
    }, 300);
    return () => clearTimeout(timer);
  }, [createForm]);

  const createMutation = useMutation({
    mutationFn: createEvaluationForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-forms'] });
      toast.success('Evaluation form created.');
      setCreateForm(toDraftForm(emptyForm));
      localStorage.removeItem(CREATE_FORM_STORAGE_KEY);
      setLastSavedAt(null);
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to create form.',
        { title: 'Create Failed' },
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvaluationForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-forms'] });
      toast.success('Evaluation form deleted.');
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to delete form.',
        { title: 'Delete Failed' },
      );
    },
  });

  const sortedForms = useMemo(
    () =>
      [...forms].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [forms],
  );

  const handleSaveCreate = () => {
    if (!canManageForms) {
      alert.showWarning('You do not have permission to manage evaluation forms.');
      return;
    }
    if (!createForm.name.trim()) {
      alert.showWarning('Form name is required.');
      return;
    }
    createMutation.mutate(toDtoForm(createForm));
  };

  const handleResetCreate = () => {
    alert.showConfirm('Reset the draft? This will clear your current inputs.', {
      title: 'Reset Draft',
      confirmText: 'Reset',
      onConfirm: () => {
        setCreateForm(toDraftForm(emptyForm));
        localStorage.removeItem(CREATE_FORM_STORAGE_KEY);
        setLastSavedAt(null);
      },
    });
  };

  const handleUseTeachingTemplate = (form: DraftForm) =>
    toDraftForm({ ...teachingTemplate, scale: teachingTemplate.scale || defaultScale });

  const handleUseNonTeachingTemplate = (form: DraftForm) =>
    toDraftForm({ ...nonTeachingTemplate, scale: nonTeachingTemplate.scale || defaultScale });

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

  const handleDelete = (form: EvaluationForm) => {
    if (!canManageForms) {
      alert.showWarning('You do not have permission to manage evaluation forms.');
      return;
    }
    alert.showConfirm(`Delete "${form.name}"? This cannot be undone.`, {
      title: 'Delete Form',
      confirmText: 'Delete',
      onConfirm: () => deleteMutation.mutate(form._id),
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Evaluation Form Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, view, and edit evaluation forms for teaching personnel.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Evaluation Form</CardTitle>
          <CardDescription>
            Build a new evaluation form with sections, items, and rating scale.
          </CardDescription>
          {lastSavedAt && (
            <p className="text-xs text-muted-foreground">
              Draft saved {lastSavedAt.toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-form-name">Form name</Label>
                <Input
                  id="create-form-name"
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g., Teaching Performance Evaluation"
                />
              </div>

              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={createForm.audience}
                  onValueChange={(value) => {
                    const audience = value as CreateEvaluationFormDto['audience'];
                    const template = audience === 'teaching' ? teachingTemplate : nonTeachingTemplate;
                    setCreateForm(toDraftForm({
                      ...template,
                      name: createForm.name || template.name,
                      description: createForm.description || template.description,
                      scale: template.scale || defaultScale,
                      evaluatorOptions: normalizeEvaluatorOptions(
                        template.evaluatorOptions,
                        audience,
                      ),
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teaching">Teaching personnel</SelectItem>
                    <SelectItem value="non-teaching">Non-teaching personnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createForm.audience === 'teaching' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={createForm.semester || ''}
                      onValueChange={(value) =>
                        setCreateForm((current) => ({
                          ...current,
                          semester: value,
                        }))
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
                    <Label htmlFor="create-form-school-year">School Year</Label>
                    <Input
                      id="create-form-school-year"
                      value={createForm.schoolYear || ''}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          schoolYear: event.target.value,
                        }))
                      }
                      placeholder="e.g., 2024-2025"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="create-form-end-date">End Date</Label>
                <Input
                  id="create-form-end-date"
                  type="date"
                  value={createForm.endDate || ''}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-form-description">Description</Label>
                <Textarea
                  id="create-form-description"
                  value={createForm.description || ''}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Outline sections, scale, or instructions."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Evaluators</Label>
                <div className="space-y-2">
                  {evaluatorOptionsMap[createForm.audience].map((option) => {
                    const checked = (createForm.evaluatorOptions || []).includes(option);
                    return (
                      <label key={option} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            setCreateForm((current) => {
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
                  {(createForm.scale || []).map((item, idx) => (
                    <div key={item.value} className="flex gap-2">
                      <Input
                        type="number"
                        value={item.value}
                        onChange={(event) =>
                          setCreateForm((current) =>
                            updateScale(current, idx, 'value', event.target.value),
                          )
                        }
                        className="w-24"
                      />
                      <Input
                        value={item.label}
                        onChange={(event) =>
                          setCreateForm((current) =>
                            updateScale(current, idx, 'label', event.target.value),
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
                  <Button type="button" variant="outline" onClick={() => setCreateForm(addSection)}>
                    Add section
                  </Button>
                </div>
                {createForm.sections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sections yet. Add one to start building the form.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {createForm.sections.map((section) => (
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
                              setCreateForm((current) =>
                                updateSectionTitle(current, section.id, event.target.value),
                              )
                            }
                            placeholder="Section title"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() =>
                              setCreateForm((current) => removeSection(current, section.id))
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
                                  setCreateForm((current) =>
                                    updateItem(
                                      current,
                                      section.id,
                                      item.id,
                                      event.target.value,
                                    ),
                                  )
                                }
                                placeholder="Item"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600"
                                onClick={() =>
                                  setCreateForm((current) =>
                                    removeItem(current, section.id, item.id),
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
                              setCreateForm((current) => addItem(current, section.id))
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
                <Button type="button" variant="ghost" onClick={handleResetCreate}>
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateForm(handleUseTeachingTemplate)}
                >
                  Teaching template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateForm(handleUseNonTeachingTemplate)}
                >
                  Non-teaching template
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveCreate}
                  disabled={createMutation.isPending}
                >
                  Create form
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/evaluation-forms/preview">
                    Open preview page
                  </Link>
                </Button>
                <Button type="button" variant="outline" onClick={() => window.print()}>
                  Print preview
                </Button>
              </div>
              <div className="border rounded-lg p-4 space-y-4 bg-muted/20 print-area">
                <div>
                  <h2 className="text-xl font-semibold">
                    {createForm.name || 'Untitled Evaluation Form'}
                  </h2>
                  {(createForm.semester || createForm.schoolYear || createForm.endDate) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {createForm.semester && `${createForm.semester} Semester`}
                      {createForm.semester && createForm.schoolYear && ' · '}
                      {createForm.schoolYear && `SY ${createForm.schoolYear}`}
                      {(createForm.semester || createForm.schoolYear) && createForm.endDate && ' · '}
                      {createForm.endDate && `End Date: ${new Date(createForm.endDate).toLocaleDateString()}`}
                    </p>
                  )}
                  {createForm.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {createForm.description}
                    </p>
                  )}
                </div>

                {(createForm.scale || []).length > 0 && (
                  <div className="text-sm">
                    <p className="font-semibold mb-2">Rating Scale</p>
                    <div className="flex flex-wrap gap-2">
                      {(createForm.scale || []).map((item) => (
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

                {(createForm.evaluatorOptions || []).length > 0 && (
                  <div className="text-sm">
                    <p className="font-semibold mb-2">Evaluators</p>
                    <div className="flex flex-wrap gap-2">
                      {(createForm.evaluatorOptions || []).map((option) => (
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

                {createForm.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="space-y-2">
                    <p className="font-semibold">{section.title}</p>
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
                              {(createForm.scale || []).map((scaleItem) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Saved Forms</CardTitle>
          <CardDescription>
            {sortedForms.length === 0
              ? 'No forms created yet.'
              : `Total forms: ${sortedForms.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedForms.map((form) => (
              <div key={form._id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{form.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {form.audience === 'teaching'
                        ? 'Teaching personnel'
                        : 'Non-teaching personnel'}{' '}
                      · {form.sections?.length || 0} sections
                      {form.semester && ` · ${form.semester} Semester`}
                      {form.schoolYear && ` · SY ${form.schoolYear}`}
                      {form.endDate && ` · End Date: ${new Date(form.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {form._id && form._id !== 'undefined' && form._id !== 'null' ? (
                      <Button asChild type="button" variant="outline">
                        <Link href={`/admin/evaluation-forms/${form._id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" disabled title="Missing form id">
                        Edit
                      </Button>
                    )}
                    {form._id && form._id !== 'undefined' && form._id !== 'null' ? (
                      <Button asChild type="button" variant="outline">
                        <Link href={`/admin/evaluation-forms/${form._id}/responses`}>
                          Responses
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" disabled title="Missing form id">
                        Responses
                      </Button>
                    )}
                    {form._id && form._id !== 'undefined' && form._id !== 'null' ? (
                      <Button asChild type="button" variant="outline">
                        <Link href={`/admin/evaluation-forms/${form._id}/print`} target="_blank">
                          Print
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" disabled title="Missing form id">
                        Print
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(form)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {form.description && (
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {form.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
