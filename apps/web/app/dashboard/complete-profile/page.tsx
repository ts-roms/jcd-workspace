'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/AuthContext';
import { usersApi } from '@/lib/api/users.api';
import { getDepartments } from '@/lib/api/departments.api';
import { getPersonnelByDepartment } from '@/lib/api/personnel.api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CompleteProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [department, setDepartment] = useState(user?.department?._id ?? '');
  const [studentId, setStudentId] = useState(user?.studentId ?? '');
  const [gradeLevel, setGradeLevel] = useState(user?.gradeLevel ?? '');
  const [adviser, setAdviser] = useState(user?.adviser ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: personnel, isLoading: personnelLoading } = useQuery({
    queryKey: ['personnelByDepartment', department],
    queryFn: () => getPersonnelByDepartment(department),
    enabled: !!department,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!department || !studentId || !gradeLevel || !adviser) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      await usersApi.updateMyProfile(user._id, {
        department,
        studentId,
        gradeLevel,
        adviser,
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              {departmentsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading departments...
                </div>
              ) : (
                <Select value={department} onValueChange={(val) => { setDepartment(val); setAdviser(''); }}>
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
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input
                id="gradeLevel"
                placeholder="Enter your grade level"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Adviser</Label>
              {!department ? (
                <p className="text-sm text-muted-foreground px-3 py-2 rounded-md border border-input bg-muted/50">
                  Select a department first
                </p>
              ) : personnelLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading personnel...
                </div>
              ) : (
                <Select value={adviser} onValueChange={setAdviser}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your adviser" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel?.map((p) => (
                      <SelectItem key={p._id} value={`${p.firstName} ${p.lastName}`}>
                        {p.firstName} {p.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

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
