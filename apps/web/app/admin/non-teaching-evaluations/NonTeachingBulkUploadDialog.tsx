'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  bulkUploadNonTeachingEvaluations,
  downloadNonTeachingTemplate,
  BulkUploadResult,
} from '@/lib/api/non-teaching-evaluations.api';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/app/components/ui/alert';
import { useAlert } from '@/lib/contexts/AlertContext';

interface NonTeachingBulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NonTeachingBulkUploadDialog({ open, onOpenChange }: NonTeachingBulkUploadDialogProps) {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: bulkUploadNonTeachingEvaluations,
    onSuccess: (result) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['non-teaching-evaluations'] });

      if (result.errors.length === 0) {
        toast.success(
          `Successfully uploaded ${result.successfulEvaluations} evaluations for ${result.successfulPersonnel} personnel!`
        );
      } else {
        alert.showWarning(
          `Uploaded with ${result.errors.length} errors. Check details below.`
        );
      }
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to upload file.',
        { title: 'Upload Failed' },
      );
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];

      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        alert.showError('Please select a valid Excel file (.xlsx, .xls, or .csv). Other file formats are not supported.', {
          title: 'Invalid File Format',
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];

      if (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        alert.showError('Please select a valid Excel file (.xlsx, .xls, or .csv). Other file formats are not supported.', {
          title: 'Invalid File Format',
        });
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadNonTeachingTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'non-teaching-evaluation-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully!');
    } catch (error) {
      alert.showError('Failed to download template.', {
        title: 'Download Failed',
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Non-Teaching Evaluations
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple non-teaching personnel and their evaluations at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template Section */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download our Excel template with sample data</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload Area */}
          <div>
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 dark:bg-gray-900'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className={`h-12 w-12 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                {selectedFile ? (
                  <>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Excel files (.xlsx, .xls, .csv)</p>
                  </>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Upload Summary</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div>Total Rows: <span className="font-medium">{uploadResult.totalRows}</span></div>
                    <div>Personnel Created/Found: <span className="font-medium">{uploadResult.successfulPersonnel}</span></div>
                    <div>Evaluations Created: <span className="font-medium text-green-600">{uploadResult.successfulEvaluations}</span></div>
                    <div>Skipped Rows: <span className="font-medium text-yellow-600">{uploadResult.skippedRows}</span></div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Errors */}
              {uploadResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Errors ({uploadResult.errors.length})</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                      {uploadResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-xs p-2 bg-red-100 dark:bg-red-950 rounded">
                          <p className="font-medium">Row {error.row}: {error.message}</p>
                          {error.field && <p className="text-muted-foreground">Field: {error.field}</p>}
                        </div>
                      ))}
                      {uploadResult.errors.length > 10 && (
                        <p className="text-xs text-muted-foreground">
                          ... and {uploadResult.errors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>

          {/* Instructions */}
          {!uploadResult && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Instructions</AlertTitle>
              <AlertDescription className="text-xs space-y-1 mt-2">
                <p>• Download the template to see the required format</p>
                <p>• Required columns: Staff Name, JK, WQ, PR, TW, RL, IN</p>
                <p>• Optional columns: Email, Department, Job Title, Semester, Evaluation Date, Feedback, Evaluated By</p>
                <p>• Personnel will be created automatically if they don't exist</p>
                <p>• Existing personnel (matched by email) will be reused</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
