'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api/courses.api';
import { Department } from '@/types/department';
import { Course } from '@/types/course';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';
import { MoreHorizontal } from 'lucide-react';
import { CourseForm } from './CourseForm';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';
import { getDepartments } from '@/lib/api/departments.api';

const NONE_VALUE = '__all__';

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState(NONE_VALUE);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<Course[]>({
    queryKey: ['courses', departmentFilter],
    queryFn: () =>
      coursesApi.getAll(
        departmentFilter !== NONE_VALUE ? { departmentId: departmentFilter } : undefined,
      ),
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  useEffect(() => {
    if (isError) {
      alert.showError('Failed to load courses.', { title: 'Load Failed' });
    }
  }, [isError, alert]);

  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create course.';
      alert.showError(message, { title: 'Create Failed' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: any }) =>
      coursesApi.update(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully.');
      setIsDialogOpen(false);
      setSelectedCourse(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update course.';
      alert.showError(message, { title: 'Update Failed' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete course.';
      alert.showError(message, { title: 'Delete Failed' });
    },
  });

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleDelete = (course: Course) => {
    alert.showConfirm(`Are you sure you want to delete ${course.name}?`, {
      title: 'Delete Course',
      confirmText: 'Delete',
      onConfirm: () => deleteMutation.mutate(course._id),
    });
  };

  const handleSubmit = (values: any) => {
    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setPage(1);
  };

  const paginatedCourses = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return courses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [courses, page]);

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button onClick={handleCreate}>Add Course</Button>
      </div>

      <div className="mb-4">
        <Select value={departmentFilter} onValueChange={handleDepartmentFilterChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept._id} value={dept._id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
          </DialogHeader>
          <CourseForm
            onSubmit={handleSubmit}
            defaultValues={selectedCourse ?? undefined}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            departments={departments}
          />
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((course) => {
                  const department = typeof course.department === 'string'
                    ? course.department
                    : course.department?.name || 'N/A';

                  return (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{department}</TableCell>
                      <TableCell>{course.description || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={course.isActive ? 'default' : 'secondary'}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(course)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(course)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {page > 2 && (
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>1</PaginationLink>
                </PaginationItem>
              )}
              {page > 3 && (
                <PaginationItem><PaginationEllipsis /></PaginationItem>
              )}
              {page > 1 && (
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(page - 1); }}>
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink href="#" isActive>{page}</PaginationLink>
              </PaginationItem>
              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(page + 1); }}>
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              {page < totalPages - 2 && (
                <PaginationItem><PaginationEllipsis /></PaginationItem>
              )}
              {page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
