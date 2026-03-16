'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type User } from '@/lib/api/users.api';
import { getDepartments } from '@/lib/api/departments.api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useAlert } from '@/lib/contexts/AlertContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';
import type { Department } from '@/types/department';

const ALL_DEPT_VALUE = '__all__';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Search } from 'lucide-react';

export default function StudentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Check if user is Dean (role name is 'dean' from API)
  const isDean = user?.roles?.some((role: unknown) =>
    typeof role === 'string' ? role.toLowerCase() === 'dean' : (role as { name?: string })?.name?.toLowerCase() === 'dean'
  );
  const departmentName = user?.department?.name;

  const promoteAllMutation = useMutation({
    mutationFn: usersApi.promoteStudents,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(
        `Promoted ${data.promoted} student(s). ${data.graduated} graduated.`,
      );
    },
    onError: () => {
      toast.error('Failed to promote students.');
    },
  });

  const promoteSingleMutation = useMutation({
    mutationFn: usersApi.promoteStudent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(
        data.status === 'graduated'
          ? 'Student has graduated.'
          : `Promoted to ${data.gradeLevel} - ${data.semester}.`,
      );
    },
    onError: () => {
      toast.error('Failed to promote student.');
    },
  });

  const handlePromoteAll = () => {
    alert.showConfirm(
      'This will advance all active students to the next semester/year level. Students in 4th Year 2nd Sem will be marked as graduated. Their enrolled subjects will be cleared so they can re-enroll. Continue?',
      {
        title: 'Promote All Students',
        confirmText: 'Promote All',
        onConfirm: () => promoteAllMutation.mutate(),
      },
    );
  };

  const handlePromoteSingle = (student: User) => {
    const yearOrder = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const currentYear = student.gradeLevel || '1st Year';
    const currentSem = student.semester || '1st Sem';
    const yearIndex = yearOrder.indexOf(currentYear);

    let nextLabel: string;
    if (currentSem === '1st Sem') {
      nextLabel = `${currentYear} - 2nd Sem`;
    } else if (yearIndex >= 0 && yearIndex < yearOrder.length - 1) {
      nextLabel = `${yearOrder[yearIndex + 1]} - 1st Sem`;
    } else {
      nextLabel = 'Graduated';
    }

    alert.showConfirm(
      `Promote ${student.firstName} ${student.lastName} to ${nextLabel}? Their enrolled subjects will be cleared.`,
      {
        title: 'Promote Student',
        confirmText: 'Promote',
        onConfirm: () => promoteSingleMutation.mutate(student._id),
      },
    );
  };

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
    enabled: !isDean,
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', currentPage, departmentFilter],
    queryFn: () =>
      usersApi.getAll({
        role: 'Student',
        page: currentPage,
        limit: itemsPerPage,
        ...(departmentFilter && { department: departmentFilter }),
      }),
    enabled: !!user,
  });

  const students = studentsData?.users ?? [];
  const pagination = studentsData?.pagination;

  // Filter students by search term (client-side filtering for current page)
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;

    const lowerSearch = searchTerm.toLowerCase();
    return students.filter((student: User) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email.toLowerCase();
      const studentId = student.studentId?.toLowerCase() || '';

      return (
        fullName.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        studentId.includes(lowerSearch)
      );
    });
  }, [students, searchTerm]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>
              {isDean && departmentName
                ? `${departmentName} - Students`
                : 'Students'}
            </CardTitle>
            <CardDescription>
              {isDean && departmentName
                ? `Showing students under your department: ${departmentName}`
                : 'View all students in the system'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {!isDean && (
              <Select
                value={departmentFilter || ALL_DEPT_VALUE}
                onValueChange={(v) => {
                  setDepartmentFilter(v === ALL_DEPT_VALUE ? '' : v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DEPT_VALUE}>All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Students Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Year Level</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {searchTerm ? 'No students found matching your search' : 'No students found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student: User) => {
                    const department = typeof student.department === 'string'
                      ? 'N/A'
                      : student.department?.name || 'N/A';

                    return (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">
                          {student.studentId || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.gradeLevel || 'N/A'}</TableCell>
                        <TableCell>{student.semester || 'N/A'}</TableCell>
                        <TableCell>{department}</TableCell>
                        <TableCell>
                          <Badge variant={student.isActive ? 'default' : 'secondary'}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {student.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePromoteSingle(student)}
                              disabled={promoteSingleMutation.isPending}
                            >
                              <GraduationCap className="mr-1 h-3.5 w-3.5" />
                              Promote
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
