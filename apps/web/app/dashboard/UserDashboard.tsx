'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAvailableEvaluationForms } from '@/lib/api/evaluation-forms.api';
import { getMyEvaluationFormResponses } from '@/lib/api/evaluation-form-responses.api';
import { subjectsApi } from '@/lib/api/subjects.api';
import { usersApi } from '@/lib/api/users.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { ClipboardList, AlertCircle, CheckCircle2, User, Mail, Building, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Subject } from '@/types/subject';
import type { Personnel } from '@/types/personnel';

export default function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [pendingFormId, setPendingFormId] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['availableEvaluationForms'],
    queryFn: getAvailableEvaluationForms,
  });

  const { data: myResponses, isLoading: responsesLoading } = useQuery({
    queryKey: ['myEvaluationResponses'],
    queryFn: getMyEvaluationFormResponses,
  });

  const departmentId = typeof user?.department === 'object'
    ? (user.department as any)?._id
    : user?.department;

  const { data: departmentSubjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects', departmentId],
    queryFn: () => subjectsApi.getAll({ departmentId: departmentId || '' }),
    enabled: !!departmentId && enrollDialogOpen,
  });

  const activeSubjects = departmentSubjects.filter((s) => s.isActive !== false);

  const enrollMutation = useMutation({
    mutationFn: async (subjectIds: string[]) => {
      if (!user) throw new Error('No user');
      await usersApi.updateMyProfile(user._id, { enrolledSubjects: subjectIds });
    },
    onSuccess: async () => {
      await refreshUser();
      toast.success('Subjects enrolled successfully!');
      setEnrollDialogOpen(false);
      setSelectedSubjects([]);
      if (pendingFormId) {
        router.push(`/dashboard/evaluations/${pendingFormId}/fill`);
        setPendingFormId(null);
      }
    },
    onError: () => {
      toast.error('Failed to enroll subjects.');
    },
  });

  const handleFillForm = (formId: string) => {
    const enrolled = (user as any)?.enrolledSubjects ?? [];
    const hasEnrolled = Array.isArray(enrolled) && enrolled.length > 0;

    if (hasEnrolled) {
      router.push(`/dashboard/evaluations/${formId}/fill`);
    } else {
      setPendingFormId(formId);
      setSelectedSubjects([]);
      setEnrollDialogOpen(true);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const handleEnrollSubmit = () => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject.');
      return;
    }
    enrollMutation.mutate(selectedSubjects);
  };

  const isLoading = formsLoading || responsesLoading;

  const completedFormIds = new Set(
    myResponses?.map((r) => r.form) ?? []
  );

  const pendingForms = forms?.filter((f) => !completedFormIds.has(f._id)) ?? [];
  const completedForms = forms?.filter((f) => completedFormIds.has(f._id)) ?? [];

  if (isLoading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'User'}!</h1>
        <p className="text-muted-foreground">Here&apos;s your evaluation overview.</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{user?.fullName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          {user?.department && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{user.department.name}</span>
            </div>
          )}
          {user?.roles && user.roles.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Role:</span>
              {user.roles.map((role) => (
                <Badge key={role._id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Evaluations Alert */}
      {pendingForms.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Evaluations</AlertTitle>
          <AlertDescription>
            You have {pendingForms.length} evaluation form{pendingForms.length !== 1 ? 's' : ''} that need{pendingForms.length === 1 ? 's' : ''} to be completed.
          </AlertDescription>
        </Alert>
      )}

      {pendingForms.length === 0 && forms && forms.length > 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>All Done!</AlertTitle>
          <AlertDescription>
            You have completed all available evaluation forms.
          </AlertDescription>
        </Alert>
      )}

      {/* Evaluation Forms List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Evaluation Forms</h2>
        {(!forms || forms.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No evaluation forms are available at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {forms.map((form) => {
              const isCompleted = completedFormIds.has(form._id);
              const totalItems = form.sections?.reduce((sum, s) => sum + (s.items?.length ?? 0), 0) ?? 0;

              return (
                <Card key={form._id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0" />
                        <CardTitle className="text-base">{form.name}</CardTitle>
                      </div>
                      <Badge
                        variant={isCompleted ? 'default' : 'secondary'}
                        className={isCompleted ? 'bg-green-600 hover:bg-green-600' : 'bg-yellow-500 text-white hover:bg-yellow-500'}
                      >
                        {isCompleted ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {form.description && (
                      <p className="text-sm text-muted-foreground">{form.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      {(form.semester || form.schoolYear) && (
                        <span className="font-medium">
                          {form.semester && `${form.semester} Semester`}
                          {form.semester && form.schoolYear && ' · '}
                          {form.schoolYear && `SY ${form.schoolYear}`}
                        </span>
                      )}
                      <span>Audience: <span className="capitalize font-medium">{form.audience}</span></span>
                      <span>{form.sections?.length ?? 0} section{(form.sections?.length ?? 0) !== 1 ? 's' : ''}</span>
                      <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                    </div>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleFillForm(form._id)}
                      >
                        Fill Out Form
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Summary */}
      {completedForms.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          You have completed {completedForms.length} of {forms?.length ?? 0} evaluation form{(forms?.length ?? 0) !== 1 ? 's' : ''}.
        </div>
      )}

      {/* Enroll Subjects Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enroll in Subjects</DialogTitle>
            <DialogDescription>
              You need to select your enrolled subjects before filling out an evaluation form.
            </DialogDescription>
          </DialogHeader>
          {subjectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No subjects available for your department.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="max-h-72 overflow-y-auto rounded-md border p-3 space-y-2">
                {activeSubjects.map((subject) => {
                  const teacher = subject.teacher && typeof subject.teacher === 'object'
                    ? subject.teacher as Personnel
                    : null;
                  return (
                    <label
                      key={subject._id}
                      className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-1.5"
                    >
                      <Checkbox
                        checked={selectedSubjects.includes(subject._id)}
                        onCheckedChange={() => handleSubjectToggle(subject._id)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-medium">{subject.code}</span>
                        <span className="text-muted-foreground"> — {subject.name}</span>
                        {teacher && (
                          <span className="text-xs text-muted-foreground block">
                            Teacher: {teacher.firstName} {teacher.lastName}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              {selectedSubjects.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
                </p>
              )}
              <Button
                className="w-full"
                onClick={handleEnrollSubmit}
                disabled={enrollMutation.isPending || selectedSubjects.length === 0}
              >
                {enrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {enrollMutation.isPending ? 'Saving...' : 'Enroll & Continue'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
