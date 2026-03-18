'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { User, Mail, Building, GraduationCap, BookOpen, Calendar, IdCard } from 'lucide-react';
import type { Personnel } from '@/types/personnel';

export default function MyAccountPage() {
  const { user } = useAuth();

  const enrolledSubjects = user?.enrolledSubjects ?? [];
  const departmentName = user?.department?.name ?? null;
  const course = user?.course;
  const semester = user?.semester;
  const isStudent = user?.roles?.some((r) => r.name?.toLowerCase() === 'student');

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">My Account</h1>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold shrink-0">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{user?.fullName}</p>
              <div className="flex flex-wrap gap-2">
                {user?.roles?.map((role) => (
                  <Badge key={role._id} variant="secondary">{role.displayName || role.name}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            {departmentName && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{departmentName}</p>
                </div>
              </div>
            )}

            {isStudent && user?.studentId && (
              <div className="flex items-center gap-3">
                <IdCard className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Student ID</p>
                  <p className="text-sm font-medium">{user.studentId}</p>
                </div>
              </div>
            )}

            {course && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Course / Program</p>
                  <p className="text-sm font-medium">{course}</p>
                </div>
              </div>
            )}

            {user?.gradeLevel && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Year Level</p>
                  <p className="text-sm font-medium">{user.gradeLevel}</p>
                </div>
              </div>
            )}

            {semester && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Semester</p>
                  <p className="text-sm font-medium">{semester}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Subjects (for students) */}
      {isStudent && enrolledSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Enrolled Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrolledSubjects.map((subject) => {
                const teacher = subject.teacher && typeof subject.teacher === 'object'
                  ? subject.teacher as Personnel
                  : null;
                return (
                  <div
                    key={subject._id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {subject.code} — {subject.name}
                      </p>
                      {teacher && (
                        <p className="text-xs text-muted-foreground">
                          Teacher: {teacher.firstName} {teacher.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={user?.isActive ? 'default' : 'secondary'}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {user?.lastLoginAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Last login: {new Date(user.lastLoginAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
