'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAvailableEvaluationForms } from '@/lib/api/evaluation-forms.api';
import { getMyEvaluationFormResponses } from '@/lib/api/evaluation-form-responses.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { ClipboardList, AlertCircle, CheckCircle2, User, Mail, Building } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['availableEvaluationForms'],
    queryFn: getAvailableEvaluationForms,
  });

  const { data: myResponses, isLoading: responsesLoading } = useQuery({
    queryKey: ['myEvaluationResponses'],
    queryFn: getMyEvaluationFormResponses,
  });

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
                      <Link href={`/dashboard/evaluations/${form._id}/fill`}>
                        <Button size="sm" className="w-full mt-2">
                          Fill Out Form
                        </Button>
                      </Link>
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
    </div>
  );
}
