'use client';

import { useEffect, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  classifyAllPersonnel,
  calculateExcellenceForAll,
  syncAllMetrics,
} from '@/lib/api/personnel.api';
import { getDepartments } from '@/lib/api/departments.api';
import { Personnel, CreatePersonnelDto, UpdatePersonnelDto } from '@/types/personnel';
import { Department } from '@/types/department';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'; // Removed DialogTrigger
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { PersonnelForm } from './PersonnelForm';
import { PersonnelTable } from './PersonnelTable';
import { BulkUploadDialog } from './BulkUploadDialog';
import { ExcellenceAnalytics } from './ExcellenceAnalytics';
import { toast } from 'sonner';
import { Upload, UserCheck, Award, RefreshCw } from 'lucide-react';
import { useAlert } from '@/lib/contexts/AlertContext';

export default function PersonnelPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [excellenceFilter, setExcellenceFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const {
    data: personnel = [],
    isLoading: isLoadingPersonnel,
    isError: isPersonnelError,
  } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
    isError: isDepartmentsError,
  } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });
  useEffect(() => {
    if (isPersonnelError) {
      alert.showError('Failed to load personnel.', { title: 'Load Failed' });
    }
  }, [isPersonnelError]);

  useEffect(() => {
    if (isDepartmentsError) {
      alert.showError('Failed to load departments.', { title: 'Load Failed' });
    }
  }, [isDepartmentsError]);

  const createMutation = useMutation({
    mutationFn: createPersonnel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Personnel created successfully.');
      setIsDialogOpen(false);
    },
    onError: () => {
      alert.showError('Failed to create personnel.', { title: 'Create Failed' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdatePersonnelDto }) =>
      updatePersonnel(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Personnel updated successfully.');
      setIsDialogOpen(false);
      setSelectedPersonnel(null);
    },
    onError: () => {
      alert.showError('Failed to update personnel.', { title: 'Update Failed' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePersonnel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Personnel deleted successfully.');
    },
    onError: () => {
      alert.showError('Failed to delete personnel.', { title: 'Delete Failed' });
    },
  });

  const classifyMutation = useMutation({
    mutationFn: classifyAllPersonnel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success(
        `Classification complete! ${data.classified} classified, ${data.skipped} skipped.`
      );
    },
    onError: () => {
      alert.showError('Failed to classify personnel.', {
        title: 'Classification Failed',
      });
    },
  });

  const excellenceMutation = useMutation({
    mutationFn: calculateExcellenceForAll,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success(
        `Excellence calculation complete! ${data.length} personnel evaluated.`
      );
    },
    onError: () => {
      alert.showError('Failed to calculate excellence.', {
        title: 'Calculation Failed',
      });
    },
  });

  const syncMetricsMutation = useMutation({
    mutationFn: syncAllMetrics,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success(
        `Metrics synced! ${data.synced} personnel updated, ${data.failed} failed.`
      );
    },
    onError: () => {
      alert.showError('Failed to sync metrics.', {
        title: 'Sync Failed',
      });
    },
  });

  const filteredPersonnel = useMemo(() => {
    if (excellenceFilter === 'all') return personnel;
    return personnel.filter((p) => p.excellenceStatus === excellenceFilter);
  }, [personnel, excellenceFilter]);

  const paginatedPersonnel = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredPersonnel.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPersonnel, page]);

  const totalPages = Math.ceil(filteredPersonnel.length / ITEMS_PER_PAGE);

  const handleCreate = () => {
    setSelectedPersonnel(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsDialogOpen(true);
  };

  const handleDelete = (person: Personnel) => {
    alert.showConfirm(
      `Are you sure you want to delete ${person.firstName} ${person.lastName}?`,
      {
        title: 'Delete Personnel',
        confirmText: 'Delete',
        onConfirm: () => deleteMutation.mutate(person._id),
      },
    );
  };

  const handleSubmit = (values: CreatePersonnelDto | UpdatePersonnelDto) => {
    if (selectedPersonnel) {
      updateMutation.mutate({ id: selectedPersonnel._id, data: values });
    } else {
      createMutation.mutate(values as CreatePersonnelDto);
    }
  };

  if (isLoadingPersonnel || isLoadingDepartments) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Personnel</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => syncMetricsMutation.mutate()}
            variant="outline"
            disabled={syncMetricsMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {syncMetricsMutation.isPending ? 'Syncing...' : 'Sync Metrics'}
          </Button>
          <Button
            onClick={() => excellenceMutation.mutate({ startYear: 2020, endYear: 2025, threshold: 4.0 })}
            variant="outline"
            disabled={excellenceMutation.isPending}
          >
            <Award className="mr-2 h-4 w-4" />
            {excellenceMutation.isPending ? 'Calculating...' : 'Calculate Excellence'}
          </Button>
          <Button
            onClick={() => classifyMutation.mutate()}
            variant="outline"
            disabled={classifyMutation.isPending}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {classifyMutation.isPending ? 'Classifying...' : 'Classify All'}
          </Button>
          <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleCreate}>Add Personnel</Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Filter by Excellence:</label>
          <Select value={excellenceFilter} onValueChange={setExcellenceFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Average">Average</SelectItem>
              <SelectItem value="Below Average">Below Average</SelectItem>
              <SelectItem value="Not Evaluated">Not Evaluated</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredPersonnel.length} of {personnel.length} personnel
          </span>
        </div>
      </div>

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPersonnel ? 'Edit Personnel' : 'Add Personnel'}</DialogTitle>
          </DialogHeader>
          <PersonnelForm
            onSubmit={handleSubmit}
            defaultValues={selectedPersonnel}
            departments={departments}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <PersonnelTable
        personnel={paginatedPersonnel}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
        }}
      />

      <div className="mt-8">
        <ExcellenceAnalytics />
      </div>
    </div>
  );
}
