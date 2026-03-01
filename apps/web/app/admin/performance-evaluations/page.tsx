'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPerformanceEvaluations,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
} from '@/lib/api/performance-evaluations.api';
import { CreatePerformanceEvaluationDto, PerformanceEvaluation, UpdatePerformanceEvaluationDto } from '@/types/performance-evaluation';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { PerformanceEvaluationForm } from './PerformanceEvaluationForm';
import { PerformanceEvaluationsTable } from './PerformanceEvaluationsTable';
import { BulkUploadDialog } from './BulkUploadDialog';
import { Upload, Plus } from 'lucide-react';
import { useAlert } from '@/lib/contexts/AlertContext';

export default function PerformanceEvaluationsPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceEvaluation | undefined>(undefined);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const {
    data: evaluations = [],
    isLoading,
    isError,
  } = useQuery<PerformanceEvaluation[]>({
    queryKey: ['performance-evaluations'],
    queryFn: getPerformanceEvaluations,
  });
  useEffect(() => {
    if (isError) {
      alert.showError('Failed to load performance evaluations.', {
        title: 'Load Failed',
      });
    }
  }, [isError]);

  const createMutation = useMutation({
    mutationFn: createPerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      toast.success('Performance evaluation created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to create performance evaluation.',
        { title: 'Create Failed' },
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdatePerformanceEvaluationDto }) =>
      updatePerformanceEvaluation(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      toast.success('Performance evaluation updated successfully.');
      setIsDialogOpen(false);
      setSelectedEvaluation(undefined);
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to update performance evaluation.',
        { title: 'Update Failed' },
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      toast.success('Performance evaluation deleted successfully.');
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to delete performance evaluation.',
        { title: 'Delete Failed' },
      );
    },
  });

  const handleCreate = () => {
    setSelectedEvaluation(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (evaluation: PerformanceEvaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDialogOpen(true);
  };

  const handleDelete = (evaluation: PerformanceEvaluation) => {
    alert.showConfirm('Are you sure you want to delete this evaluation?', {
      title: 'Delete Evaluation',
      confirmText: 'Delete',
      onConfirm: () => deleteMutation.mutate(evaluation._id),
    });
  };

  const handleSubmit = (values: CreatePerformanceEvaluationDto) => {
    if (selectedEvaluation) {
      updateMutation.mutate({ id: selectedEvaluation._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const paginatedEvaluations = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return evaluations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [evaluations, page]);

  const totalPages = Math.ceil(evaluations.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Performance Evaluations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee performance evaluations and bulk import data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleCreate} className="gap-2 hidden">
            <Plus className="h-4 w-4" />
            Add Evaluation
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvaluation ? 'Edit Evaluation' : 'Add Evaluation'}</DialogTitle>
          </DialogHeader>
          <PerformanceEvaluationForm
            onSubmit={handleSubmit}
            defaultValues={selectedEvaluation}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <BulkUploadDialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} />

      <PerformanceEvaluationsTable
        evaluations={paginatedEvaluations}
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
