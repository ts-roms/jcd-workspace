'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '@/lib/api/subjects.api';
import { Department } from '@/types/department';
import { Personnel } from '@/types/personnel';
import { Subject, CreateSubjectDto } from '@/types/subject';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { SubjectForm } from './SubjectForm';
import { SubjectsTable } from './SubjectsTable';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';
import { getDepartments } from '@/lib/api/departments.api';
import { getPersonnel } from '@/lib/api/personnel.api';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter state
  const ALL_VALUE = '__all__';
  const [nameSearch, setNameSearch] = useState('');
  const [debouncedNameSearch, setDebouncedNameSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [debouncedTeacherSearch, setDebouncedTeacherSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(ALL_VALUE);
  const [yearLevelFilter, setYearLevelFilter] = useState(ALL_VALUE);

  // Check if user is Dean (role name is 'dean' from API)
  const isDean = user?.roles?.some((role: unknown) =>
    typeof role === 'string' ? role.toLowerCase() === 'dean' : (role as { name?: string })?.name?.toLowerCase() === 'dean'
  );

  const {
    data: subjects = [],
    isLoading,
    isError,
  } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const { data: personnel = [], refetch: refetchPersonnel } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  useEffect(() => {
    if (isError) {
      alert.showError('Failed to load subjects.', { title: 'Load Failed' });
    }
  }, [isError, alert]);

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameSearch(nameSearch);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [nameSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTeacherSearch(teacherSearch);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [teacherSearch]);

  // Derive unique year levels from subjects for the dropdown
  const yearLevelOptions = useMemo(() => {
    const levels = new Set<string>();
    subjects.forEach((s) => {
      if (s.gradeLevel) levels.add(s.gradeLevel);
    });
    return Array.from(levels).sort();
  }, [subjects]);

  // Apply filters
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      // Name search
      if (debouncedNameSearch) {
        const search = debouncedNameSearch.toLowerCase();
        const matchesName = subject.name.toLowerCase().includes(search);
        const matchesCode = subject.code.toLowerCase().includes(search);
        if (!matchesName && !matchesCode) return false;
      }

      // Teacher search
      if (debouncedTeacherSearch) {
        const search = debouncedTeacherSearch.toLowerCase();
        const teacherObj = typeof subject.teacher === 'object' ? subject.teacher : null;
        if (!teacherObj) return false;
        const fullName = `${teacherObj.firstName} ${teacherObj.lastName}`.toLowerCase();
        if (!fullName.includes(search)) return false;
      }

      // Department filter
      if (departmentFilter !== ALL_VALUE) {
        const deptId = typeof subject.department === 'string'
          ? subject.department
          : subject.department?._id;
        if (deptId !== departmentFilter) return false;
      }

      // Year Level filter
      if (yearLevelFilter !== ALL_VALUE) {
        if (subject.gradeLevel !== yearLevelFilter) return false;
      }

      return true;
    });
  }, [subjects, debouncedNameSearch, debouncedTeacherSearch, departmentFilter, yearLevelFilter]);

  const createMutation = useMutation({
    mutationFn: subjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create subject.';
      alert.showError(message, { title: 'Create Failed' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: Partial<CreateSubjectDto> }) =>
      subjectsApi.update(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully.');
      setIsDialogOpen(false);
      setSelectedSubject(null);
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update subject.';
      alert.showError(message, { title: 'Update Failed' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully.');
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to delete subject.';
      alert.showError(message, { title: 'Delete Failed' });
    },
  });

  const handleCreate = () => {
    setSelectedSubject(null);
    refetchPersonnel();
    setIsDialogOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    refetchPersonnel();
    setIsDialogOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    alert.showConfirm(`Are you sure you want to delete ${subject.name}?`, {
      title: 'Delete Subject',
      confirmText: 'Delete',
      onConfirm: () => deleteMutation.mutate(subject._id),
    });
  };

  const handleSubmit = (values: CreateSubjectDto) => {
    // Remove empty optional fields so backend validation doesn't reject them
    const cleaned = { ...values };
    if (!cleaned.teacher) delete cleaned.teacher;
    if (!cleaned.course) delete cleaned.course;
    if (!cleaned.gradeLevel) delete cleaned.gradeLevel;
    if (!cleaned.semester) delete cleaned.semester;
    if (!cleaned.description) delete cleaned.description;

    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject._id, data: cleaned });
    } else {
      createMutation.mutate(cleaned);
    }
  };

  const paginatedSubjects = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredSubjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSubjects, page]);

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          {isDean && (
            <p className="text-sm text-muted-foreground mt-1">
              You can manage subjects in your department
            </p>
          )}
        </div>
        <Button onClick={handleCreate}>Add Subject</Button>
      </div>

      <div className="flex justify-between gap-4 mb-4">
        <Input
          placeholder="Search by name or code..."
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
        />
        <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept._id} value={dept._id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by teacher name..."
          value={teacherSearch}
          onChange={(e) => setTeacherSearch(e.target.value)}
        />
        <Select value={yearLevelFilter} onValueChange={(v) => { setYearLevelFilter(v); setPage(1); }}>
          <SelectTrigger>
            <SelectValue placeholder="All Year Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Year Levels</SelectItem>
            {yearLevelOptions.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSubject ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          </DialogHeader>
          <SubjectForm
            onSubmit={handleSubmit}
            defaultValues={selectedSubject ?? undefined}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            departments={departments}
            personnel={personnel}
            userDepartment={isDean ? user?.department : undefined}
          />
        </DialogContent>
      </Dialog>

      <SubjectsTable
        subjects={paginatedSubjects}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
