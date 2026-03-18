'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAvailableEvaluationForms } from '@/lib/api/evaluation-forms.api';
import { getMyEvaluationFormResponses } from '@/lib/api/evaluation-form-responses.api';
import { subjectsApi } from '@/lib/api/subjects.api';
import { coursesApi } from '@/lib/api/courses.api';
import { usersApi } from '@/lib/api/users.api';
import { getDepartments } from '@/lib/api/departments.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
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
import type { Course } from '@/types/course';
import type { Personnel } from '@/types/personnel';
import type { Department } from '@/types/department';

export default function UserDashboard() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [pendingFormId, setPendingFormId] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [enrollDepartment, setEnrollDepartment] = useState('');
  const [enrollCourse, setEnrollCourse] = useState('');
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollGradeLevel, setEnrollGradeLevel] = useState('');
  const [enrollSemester, setEnrollSemester] = useState('1st Sem');

  const { data: forms, isLoading: formsLoading } = useQuery({
    queryKey: ['availableEvaluationForms'],
    queryFn: getAvailableEvaluationForms,
  });

  const { data: myResponses, isLoading: responsesLoading } = useQuery({
    queryKey: ['myEvaluationResponses'],
    queryFn: getMyEvaluationFormResponses,
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
    enabled: enrollDialogOpen,
  });

  const { data: enrollCourses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['courses', enrollDepartment],
    queryFn: () => coursesApi.getByDepartment(enrollDepartment),
    enabled: !!enrollDepartment && enrollDialogOpen,
  });

  const { data: departmentSubjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects', enrollDepartment, enrollCourse, enrollGradeLevel, enrollSemester],
    queryFn: () => {
      const semMap: Record<string, string> = { '1st Sem': '1st', '2nd Sem': '2nd' };
      return subjectsApi.getAll({
        departmentId: enrollDepartment,
        course: enrollCourse || undefined,
        gradeLevel: enrollGradeLevel || undefined,
        semester: semMap[enrollSemester] || enrollSemester || undefined,
      });
    },
    enabled: !!enrollDepartment && enrollDialogOpen,
  });

  const activeSubjects = departmentSubjects.filter((s) => s.isActive !== false);

  const enrollMutation = useMutation({
    mutationFn: async (data: {
      department: string;
      studentId: string;
      course: string;
      gradeLevel: string;
      semester: string;
      enrolledSubjects: string[];
    }) => {
      if (!user) throw new Error('No user');
      await usersApi.updateMyProfile(user._id, data);
    },
    onSuccess: async () => {
      await refreshUser();
      toast.success('Profile completed successfully!');
      setEnrollDialogOpen(false);
      setSelectedSubjects([]);
      if (pendingFormId) {
        router.push(`/dashboard/evaluations/${pendingFormId}/fill`);
        setPendingFormId(null);
      }
    },
    onError: () => {
      toast.error('Failed to save profile.');
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
      // Pre-fill from existing user data
      const deptId = typeof user?.department === 'object'
        ? (user.department as any)?._id
        : user?.department || '';
      setEnrollDepartment(deptId);
      setEnrollStudentId(user?.studentId || '');
      setEnrollCourse((user as any)?.course || '');
      setEnrollGradeLevel(user?.gradeLevel || '');
      setEnrollSemester((user as any)?.semester || '1st Sem');
      setEnrollDialogOpen(true);
    }
  };

  const handleEnrollDepartmentChange = (val: string) => {
    setEnrollDepartment(val);
    setEnrollCourse('');
    setSelectedSubjects([]);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const handleEnrollSubmit = () => {
    if (!enrollDepartment || !enrollStudentId || !enrollCourse || !enrollGradeLevel) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject.');
      return;
    }
    enrollMutation.mutate({
      department: enrollDepartment,
      studentId: enrollStudentId,
      course: enrollCourse,
      gradeLevel: enrollGradeLevel,
      semester: enrollSemester,
      enrolledSubjects: selectedSubjects,
    });
  };

  const isLoading = formsLoading || responsesLoading;

  const completedFormIds = new Set(
    myResponses?.map((r) => typeof r.form === 'object' ? (r.form as any)._id : r.form) ?? []
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

      {/* Complete Profile / Enroll Dialog */}
      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please fill in the following details to continue using the system.
              This is a one-time setup. Any corrections can be made by your admin or dean.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department <span className="text-destructive">*</span></Label>
              <Select value={enrollDepartment} onValueChange={handleEnrollDepartmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Student ID <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Enter your student ID"
                value={enrollStudentId}
                onChange={(e) => setEnrollStudentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Course / Program <span className="text-destructive">*</span></Label>
              {!enrollDepartment ? (
                <p className="text-sm text-muted-foreground px-3 py-2 rounded-md border border-input bg-muted/50">
                  Select a department first
                </p>
              ) : coursesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading courses...
                </div>
              ) : enrollCourses.length === 0 ? (
                <Input
                  placeholder="e.g., BS Information Technology"
                  value={enrollCourse}
                  onChange={(e) => setEnrollCourse(e.target.value)}
                />
              ) : (
                <Select value={enrollCourse} onValueChange={setEnrollCourse}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your course" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollCourses.map((c) => (
                      <SelectItem key={c._id} value={c.name}>{c.code} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year Level <span className="text-destructive">*</span></Label>
                <Select value={enrollGradeLevel} onValueChange={setEnrollGradeLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester <span className="text-destructive">*</span></Label>
                <Select value={enrollSemester} onValueChange={setEnrollSemester}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Sem">1st Semester</SelectItem>
                    <SelectItem value="2nd Sem">2nd Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {enrollDepartment && (
              <div className="space-y-2">
                <Label>Enrolled Subjects <span className="text-destructive">*</span></Label>
                {subjectsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading subjects...
                  </div>
                ) : activeSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-3 py-2 rounded-md border border-input bg-muted/50">
                    No subjects available for this department.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded-md border p-3 space-y-2">
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
                )}
                {selectedSubjects.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleEnrollSubmit}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {enrollMutation.isPending ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
