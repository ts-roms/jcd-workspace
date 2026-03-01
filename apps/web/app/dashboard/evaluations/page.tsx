'use client';

import { useQuery } from '@tanstack/react-query';
import { getAvailableEvaluationForms } from '@/lib/api/evaluation-forms.api';
import { getMyEvaluationFormResponses } from '@/lib/api/evaluation-form-responses.api';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function MyEvaluationsPage() {
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
    return <div className="p-4">Loading evaluations...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">My Evaluations</h1>
        <p className="text-muted-foreground">View and fill out your evaluation forms.</p>
      </div>

      {(!forms || forms.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No evaluation forms are available at this time.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Section */}
          {pendingForms.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">Pending ({pendingForms.length})</h2>
              </div>
              <div className="space-y-3">
                {pendingForms.map((form) => {
                  const totalItems = form.sections?.reduce((sum, s) => sum + (s.items?.length ?? 0), 0) ?? 0;
                  return (
                    <Card key={form._id}>
                      <CardContent className="flex items-center justify-between py-4 px-6">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="font-medium">{form.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              {(form.semester || form.schoolYear) && (
                                <span className="font-medium">
                                  {form.semester && `${form.semester} Sem`}
                                  {form.semester && form.schoolYear && ' · '}
                                  {form.schoolYear && `SY ${form.schoolYear}`}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">{form.audience}</Badge>
                              <span>{form.sections?.length ?? 0} sections</span>
                              <span>{totalItems} items</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/dashboard/evaluations/${form._id}/fill`}>
                          <Button size="sm">Fill Out</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completedForms.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold">Completed ({completedForms.length})</h2>
              </div>
              <div className="space-y-3">
                {completedForms.map((form) => {
                  const response = myResponses?.find((r) => r.form === form._id);
                  return (
                    <Card key={form._id} className="opacity-75">
                      <CardContent className="flex items-center justify-between py-4 px-6">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="font-medium">{form.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              {(form.semester || form.schoolYear) && (
                                <span className="font-medium">
                                  {form.semester && `${form.semester} Sem`}
                                  {form.semester && form.schoolYear && ' · '}
                                  {form.schoolYear && `SY ${form.schoolYear}`}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">{form.audience}</Badge>
                              {response && (
                                <span>Submitted {new Date(response.createdAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="text-sm text-muted-foreground text-center pt-4">
            {completedForms.length} of {forms.length} evaluation{forms.length !== 1 ? 's' : ''} completed
          </div>
        </>
      )}
    </div>
  );
}
