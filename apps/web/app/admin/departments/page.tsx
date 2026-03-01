'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/api/departments.api';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/types/department';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'; // Removed DialogTrigger
import { DepartmentForm } from './DepartmentForm';
import { DepartmentsTable } from './DepartmentsTable';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });
  useEffect(() => {
    if (isError) {
      alert.showError('Failed to load departments.', { title: 'Load Failed' });
    }
  }, [isError]);

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully.');
      setIsDialogOpen(false);
    },
    onError: () => {
      alert.showError('Failed to create department.', { title: 'Create Failed' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdateDepartmentDto }) =>
      updateDepartment(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully.');
      setIsDialogOpen(false);
      setSelectedDepartment(null);
    },
    onError: () => {
      alert.showError('Failed to update department.', { title: 'Update Failed' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully.');
    },
    onError: () => {
      alert.showError('Failed to delete department.', { title: 'Delete Failed' });
    },
  });

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    alert.showConfirm(`Are you sure you want to delete ${department.name}?`, {
      title: 'Delete Department',
      confirmText: 'Delete',
      onConfirm: () => deleteMutation.mutate(department._id),
    });
  };

  const handleSubmit = (values: CreateDepartmentDto | UpdateDepartmentDto) => {
    if (selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment._id, data: values });
    } else {
      createMutation.mutate(values as CreateDepartmentDto);
    }
  };

  const paginatedDepartments = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return departments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [departments, page]);

  const totalPages = Math.ceil(departments.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={handleCreate}>Add Department</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onSubmit={handleSubmit}
            defaultValues={selectedDepartment ?? undefined}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DepartmentsTable
        departments={paginatedDepartments}
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
