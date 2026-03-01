'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileSpreadsheet, Users } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/app/components/ui/alert';
import { useAlert } from '@/lib/contexts/AlertContext';
import axiosInstance from '@/lib/api/axios';

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BulkUploadResult {
  success: boolean;
  created: number;
  skipped: number;
  failed: number;
  total: number;
  skippedRecords: SkippedPersonnelRecord[];
  failedRecords: FailedPersonnelRecord[];
}

interface SkippedPersonnelRecord {
  row: number;
  email: string;
  firstName: string;
  lastName: string;
  reason: string;
}

interface FailedPersonnelRecord {
  row: number;
  data: any;
  error: string;
}

export function BulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
  const queryClient = useQueryClient();
  const alert = useAlert();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/personnel/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    },
    onSuccess: (result: BulkUploadResult) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['personnel'] });

      if (result.skipped > 0) {
        alert.showWarning(
          `Upload complete! ${result.created} created, ${result.skipped} skipped (duplicates).`,
        );
      } else if (result.created > 0) {
        toast.success(`Successfully uploaded ${result.created} personnel record(s)!`);
      }

      if (result.failed > 0) {
        alert.showError(`${result.failed} record(s) failed to upload.`, {
          title: 'Upload Failed',
        });
      }
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      alert.showError(
        error.response?.data?.message || 'Failed to upload file. Please check the file format and try again.',
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

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get('/personnel/download-template');
      const { data, filename } = response.data;

      const blob = new Blob([Buffer.from(data, 'base64')], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded successfully!');
    } catch (error) {
      alert.showError('Failed to download template. Please try again.', {
        title: 'Download Failed',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Upload Personnel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with personnel data. Duplicate personnel (by email) will be automatically skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload Area */}
          {!uploadResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your Excel file here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  browse files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && !uploadResult && (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Remove
              </Button>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !uploadResult && (
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Personnel Data
                </>
              )}
            </Button>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Processing file...
              </p>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Upload Complete</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm">
                      <strong>Total Records:</strong> {uploadResult.total}
                    </div>
                    <div className="text-sm text-green-600">
                      <strong>Created:</strong> {uploadResult.created}
                    </div>
                    <div className="text-sm text-yellow-600">
                      <strong>Skipped (Duplicates):</strong> {uploadResult.skipped}
                    </div>
                    <div className="text-sm text-red-600">
                      <strong>Failed:</strong> {uploadResult.failed}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Skipped Records */}
              {uploadResult.skippedRecords.length > 0 && (
                <Alert variant="default" className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-300">
                    Skipped Personnel ({uploadResult.skippedRecords.length})
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {uploadResult.skippedRecords.map((record, index) => (
                        <div key={index} className="text-xs p-2 bg-white dark:bg-gray-800 rounded border border-yellow-200 dark:border-yellow-800">
                          <strong>Row {record.row}:</strong> {record.firstName} {record.lastName} ({record.email})
                          <br />
                          <span className="text-yellow-700 dark:text-yellow-400">{record.reason}</span>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Failed Records */}
              {uploadResult.failedRecords.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Failed Records ({uploadResult.failedRecords.length})</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                      {uploadResult.failedRecords.map((record, index) => (
                        <div key={index} className="text-xs p-2 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800">
                          <strong>Row {record.row}:</strong> {record.error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleReset} variant="outline" className="w-full">
                Upload Another File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
