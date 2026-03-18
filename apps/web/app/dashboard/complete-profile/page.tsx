'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';
import { usersApi } from '@/lib/api/users.api';
import { getDepartments } from '@/lib/api/departments.api';
import { subjectsApi } from '@/lib/api/subjects.api';
import { coursesApi } from '@/lib/api/courses.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject } from '@/types/subject';
import type { Course } from '@/types/course';

export default function CompleteProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [department, setDepartment] = useState(user?.department?._id ?? '');
  const [studentId, setStudentId] = useState(user?.studentId ?? '');
  const [course, setCourse] = useState((user as any)?.course ?? '');
  const [gradeLevel, setGradeLevel] = useState(user?.gradeLevel ?? '');
  const [semester, setSemester] = useState((user as any)?.semester ?? '1st Sem');
  const [isIrregular, setIsIrregular] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  // Map student semester (1st Sem / 2nd Sem) to subject semester (1st / 2nd)
  const subjectSemester = semester === '1st Sem' ? '1st' : semester === '2nd Sem' ? '2nd' : semester;

  // Fetch subjects — irregular students see all subjects in department
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects', department, course, isIrregular ? 'all' : gradeLevel, isIrregular ? 'all' : subjectSemester],
    queryFn: () => subjectsApi.getAll({
      departmentId: department,
      course: isIrregular ? undefined : (course || undefined),
      gradeLevel: isIrregular ? undefined : (gradeLevel || undefined),
      semester: isIrregular ? undefined : (subjectSemester || undefined),
    }),
    enabled: !!department,
  });

  const activeSubjects = subjects.filter((s) => s.isActive !== false);

  // Pre-select all subjects matching the student's year level and semester
  useEffect(() => {
    if (!isIrregular && activeSubjects.length > 0) {
      setSelectedSubjects(activeSubjects.map((s) => s._id));
    }
  }, [subjects, isIrregular]);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['courses', department],
    queryFn: () => coursesApi.getByDepartment(department),
    enabled: !!department,
  });

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    setCourse('');
    setSelectedSubjects([]);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!department || !studentId || !course || !gradeLevel || !semester) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one enrolled subject.');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      await usersApi.updateMyProfile(user._id, {
        department,
        studentId,
        course,
        gradeLevel,
        semester,
        enrolledSubjects: selectedSubjects,
      });
      await refreshUser();
      toast.success('Profile completed successfully!');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please fill in the following details to continue using the system.
            This is a one-time setup. Any corrections can be made by your admin or dean.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
              {departmentsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading departments...
                </div>
              ) : (
                <Select value={department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID <span className="text-destructive">*</span></Label>
              <Input
                id="studentId"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course / Program <span className="text-destructive">*</span></Label>
              {!department ? (
                <p className="text-sm text-muted-foreground px-3 py-2 rounded-md border border-input bg-muted/50">
                  Select a department first
                </p>
              ) : coursesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading courses...
                </div>
              ) : courses.length === 0 ? (
                <Input
                  id="course"
                  placeholder="e.g., BS Information Technology"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              ) : (
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c._id} value={c.name}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Year Level <span className="text-destructive">*</span></Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
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
                <Label htmlFor="semester">Semester <span className="text-destructive">*</span></Label>
                <Select value={semester} onValueChange={setSemester}>
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

            {department && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={isIrregular}
                    onCheckedChange={(checked) => {
                      setIsIrregular(!!checked);
                      setSelectedSubjects([]);
                    }}
                  />
                  <span className="text-sm font-medium">Irregular Student</span>
                  <span className="text-xs text-muted-foreground">(show all subjects across year levels and semesters)</span>
                </label>

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
                  <div className="max-h-60 overflow-y-auto rounded-md border border-input p-3 space-y-2">
                    {activeSubjects.map((subject) => {
                      const teacherName = subject.teacher && typeof subject.teacher === 'object'
                        ? `${(subject.teacher as any).firstName} ${(subject.teacher as any).lastName}`
                        : null;
                      return (
                        <label
                          key={subject._id}
                          className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-1"
                        >
                          <Checkbox
                            checked={selectedSubjects.includes(subject._id)}
                            onCheckedChange={() => handleSubjectToggle(subject._id)}
                            className="mt-0.5"
                          />
                          <div>
                            <span className="font-medium">{subject.code}</span>
                            <span className="text-muted-foreground"> — {subject.name}</span>
                            {teacherName && (
                              <span className="text-xs text-muted-foreground block">
                                Teacher: {teacherName}
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
