'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subjectsApi } from '@/lib/api/subjects.api';
import { Department } from '@/types/department';
import { Personnel } from '@/types/personnel';
import { Subject } from '@/types/subject';
import { Button } from '@/app/components/ui/button';
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

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  useEffect(() => {
    if (isError) {
      alert.showError('Failed to load subjects.', { title: 'Load Failed' });
    }
  }, [isError, alert]);

  const createMutation = useMutation({
    mutationFn: subjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create subject.';
      alert.showError(message, { title: 'Create Failed' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: any }) =>
      subjectsApi.update(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully.');
      setIsDialogOpen(false);
      setSelectedSubject(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update subject.';
      alert.showError(message, { title: 'Update Failed' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete subject.';
      alert.showError(message, { title: 'Delete Failed' });
    },
  });

  const handleCreate = () => {
    setSelectedSubject(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    alert.showConfirm(`Are you sure you want to delete ${subject.name}?`, {
      title: 'Delete Subject',
      confirmText: 'Delete',
      onConfirm: () => deleteMutation.mutate(subject._id),
    });
  };

  const handleSubmit = (values: any) => {
    if (selectedSubject) {
      updateMutation.mutate({ id: selectedSubject._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const paginatedSubjects = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return subjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [subjects, page]);

  const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);

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
