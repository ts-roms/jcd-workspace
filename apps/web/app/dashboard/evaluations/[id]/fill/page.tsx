'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAvailableEvaluationForm } from '@/lib/api/evaluation-forms.api';
import { submitEvaluationFormResponse } from '@/lib/api/evaluation-form-responses.api';
import { subjectsApi } from '@/lib/api/subjects.api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { EvaluationResponseItem } from '@/types/evaluation-form-response';
import type { Subject } from '@/types/subject';
import type { Personnel } from '@/types/personnel';

export default function FillEvaluationFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const { user } = useAuth();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [evaluator, setEvaluator] = useState('');

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['availableEvaluationForm', formId],
    queryFn: () => getAvailableEvaluationForm(formId),
    enabled: !!formId,
  });

  // Fetch subjects for the student's department and grade level
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects', user?.department, user?.gradeLevel],
    queryFn: () => {
      const departmentId = typeof user?.department === 'object'
        ? (user.department as any)._id
        : user?.department;
      return subjectsApi.getByDepartmentAndGrade(departmentId || '', user?.gradeLevel);
    },
    enabled: !!user?.department,
  });

  // Update evaluator when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find((s) => s._id === selectedSubject);
      if (subject && subject.teacher) {
        const teacher = subject.teacher as Personnel;
        const teacherName = `${teacher.firstName} ${teacher.lastName}`;
        setEvaluator(teacherName);
      } else {
        setEvaluator('');
      }
    } else {
      setEvaluator('');
    }
  }, [selectedSubject, subjects]);

  const submitMutation = useMutation({
    mutationFn: submitEvaluationFormResponse,
    onSuccess: () => {
      toast.success('Evaluation submitted successfully!');
      router.push('/dashboard/evaluations');
    },
    onError: () => {
      toast.error('Failed to submit evaluation. Please try again.');
    },
  });

  const handleScoreSelect = (sectionTitle: string, item: string, score: number) => {
    const key = `${sectionTitle}|||${item}`;
    setAnswers((prev) => ({ ...prev, [key]: score }));
  };

  const handleSubmit = () => {
    if (!form) return;

    // Check if subject is selected
    if (!selectedSubject) {
      toast.error('Please select a subject to evaluate.');
      return;
    }

    // Check if teacher is assigned to subject
    if (!evaluator) {
      toast.error('No teacher assigned to this subject. Please select another subject.');
      return;
    }

    const allItems: { section: string; item: string }[] = [];
    form.sections?.forEach((section) => {
      section.items?.forEach((item) => {
        allItems.push({ section: section.title, item });
      });
    });

    const unanswered = allItems.filter(
      (i) => !answers[`${i.section}|||${i.item}`]
    );

    if (unanswered.length > 0) {
      toast.error(`Please rate all items. ${unanswered.length} item(s) remaining.`);
      return;
    }

    const formattedAnswers: EvaluationResponseItem[] = allItems.map((i) => ({
      section: i.section,
      item: i.item,
      score: answers[`${i.section}|||${i.item}`],
    }));

    const semesterLabel = [
      form.semester && `${form.semester} Semester`,
      form.schoolYear,
    ].filter(Boolean).join(' ') || undefined;

    submitMutation.mutate({
      formId,
      semester: semesterLabel,
      evaluator: evaluator || undefined,
      answers: formattedAnswers,
    });
  };

  if (isLoading) {
    return <div className="p-4">Loading evaluation form...</div>;
  }

  if (error || !form) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <p className="text-destructive">Failed to load evaluation form.</p>
        <Link href="/dashboard/evaluations">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Evaluations
          </Button>
        </Link>
      </div>
    );
  }

  const totalItems = form.sections?.reduce((sum, s) => sum + (s.items?.length ?? 0), 0) ?? 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/evaluations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{form.name}</h1>
          {form.description && (
            <p className="text-muted-foreground text-sm mt-1">{form.description}</p>
          )}
        </div>
      </div>

      {/* Scale Legend */}
      {form.scale && form.scale.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Rating Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {form.scale.map((s) => (
                <div key={s.value} className="flex items-center gap-1.5 text-sm">
                  <Badge variant="outline" className="font-mono w-7 justify-center">
                    {s.value}
                  </Badge>
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Info & Optional Fields */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Evaluation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(form.semester || form.schoolYear) && (
              <div>
                <p className="text-sm font-medium mb-1.5">Semester / School Year</p>
                <p className="text-sm text-muted-foreground px-3 py-2 rounded-md border border-input bg-muted/50">
                  {form.semester && `${form.semester} Semester`}
                  {form.semester && form.schoolYear && ' · '}
                  {form.schoolYear && `SY ${form.schoolYear}`}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Subject <span className="text-destructive">*</span>
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.code} - {subject.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedSubject && evaluator && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Teacher/Personnel</label>
                <div className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm font-medium">
                  {evaluator}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {form.sections?.map((section, sectionIdx) => (
        <Card key={sectionIdx}>
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items?.map((item, itemIdx) => {
              const key = `${section.title}|||${item}`;
              const selectedScore = answers[key];
              const scaleValues = form.scale?.map((s) => s.value) ?? [1, 2, 3, 4, 5];

              return (
                <div key={itemIdx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 border-b last:border-b-0">
                  <span className="text-sm flex-1">{item}</span>
                  <div className="flex gap-1.5 shrink-0">
                    {scaleValues.map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleScoreSelect(section.title, item, score)}
                        className={`w-9 h-9 rounded-md border text-sm font-medium transition-colors ${
                          selectedScore === score
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent border-input'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Progress & Submit */}
      <div className="flex items-center justify-between sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t">
        <span className="text-sm text-muted-foreground">
          {answeredCount} of {totalItems} items rated
        </span>
        <Button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Evaluation
        </Button>
      </div>
    </div>
  );
}
