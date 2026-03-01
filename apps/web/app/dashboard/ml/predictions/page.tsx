'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPersonnelWithPredictions, predictPersonnelPerformance } from '@/lib/api/personnel.api';
import { Personnel } from '@/types/personnel';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { PredictionResultDialog } from './PredictionResultDialog';
import { useAlert } from '@/lib/contexts/AlertContext';

interface PredictionData {
  prediction: number;
  trainedAt: Date;
  failedMetrics?: string[];
}

export default function PredictionsPage() {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: personnel = [], isLoading } = useQuery<Personnel[]>({
    queryKey: ['personnelWithPredictions'],
    queryFn: getPersonnelWithPredictions,
  });

  const predictionMutation = useMutation({
    mutationFn: predictPersonnelPerformance,
    onSuccess: (data) => {
      setPredictionData(data);
      queryClient.invalidateQueries({ queryKey: ['personnelWithPredictions'] });
      toast.success(`Prediction complete for ${selectedPersonnel?.firstName}.`);
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to get prediction.',
        { title: 'Prediction Failed' },
      );
      setIsDialogOpen(false); // Close dialog on error
    },
  });

  const handlePredictClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setPredictionData(null); // Clear previous data
    setIsDialogOpen(true);
    predictionMutation.mutate(person._id);
  };

  const paginatedPersonnel = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return personnel.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [personnel, page]);

  const totalPages = Math.ceil(personnel.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return <div>Loading personnel data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Performance Predictions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personnel List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Last Predicted Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPersonnel.map((person) => (
                  <TableRow key={person._id}>
                    <TableCell>{`${person.firstName} ${person.lastName}`}</TableCell>
                    <TableCell>{person.jobTitle}</TableCell>
                    <TableCell>{person.predictedPerformance || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handlePredictClick(person)}
                        disabled={predictionMutation.isPending && selectedPersonnel?._id === person._id}
                        size="sm"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Predict
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
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
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(1);
                        }}
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {page > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {page > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page - 1);
                        }}
                      >
                        {page - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      {page}
                    </PaginationLink>
                  </PaginationItem>

                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(page + 1);
                        }}
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {page < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {page < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages);
                        }}
                      >
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
            </div>
          )}
        </CardContent>
      </Card>

      <PredictionResultDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        personnel={selectedPersonnel}
        predictionData={predictionData}
        isLoading={predictionMutation.isPending}
      />
    </div>
  );
}
