'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Upload, Brain, Info, TrendingUp, Layers, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/lib/contexts/AlertContext';

export default function TrainingPage() {
  const [file, setFile] = useState<File | null>(null);
  const alert = useAlert();

  const trainMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return axios.post('/ml/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (response) => {
      toast.success(`Model trained successfully with ${response.data.records} records.`);
    },
    onError: (error: any) => {
      alert.showError(
        error.response?.data?.message || 'Failed to train model.',
        { title: 'Training Failed' },
      );
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    // If no file, backend will use default employee_history_sample.csv
    trainMutation.mutate(formData);
  };

  const handleTrainWithDefault = () => {
    const formData = new FormData();
    // Don't append file, backend will use default
    trainMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Train Prediction Model
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload training data to build or update the performance prediction model
        </p>
      </div>

      {/* Algorithm Information Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Algorithm Information
          </CardTitle>
          <CardDescription>
            Understanding the machine learning model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Neural Network</div>
                <div className="text-sm text-muted-foreground">4-layer architecture (32-16-8-1)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Training Config</div>
                <div className="text-sm text-muted-foreground">100 epochs, Adam optimizer</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Target Metrics</div>
                <div className="text-sm text-muted-foreground">MAE &lt; 0.5, MSE &lt; 0.3</div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Learn more about the deep neural network algorithm used for predictions
            </div>
            <Link href="/dashboard/ml/algorithm">
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Default Training File Notice */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-400">Default Training File Available</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <p>A default training dataset (<code className="bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">employee_history_sample.csv</code>) is available for quick model training.</p>
          <p className="mt-2">You can either use the default file or upload your own custom dataset.</p>
        </AlertDescription>
      </Alert>

      {/* Training Requirements Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Training Requirements</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>To train the model successfully, ensure your data meets these requirements:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>File format: Excel (.xlsx, .xls) or CSV (.csv)</li>
            <li>Minimum rows: 20 (recommended: 100+ for better accuracy)</li>
            <li>Required columns: <Badge variant="secondary">PAA</Badge>, <Badge variant="secondary">KSM</Badge>, <Badge variant="secondary">TS</Badge>, <Badge variant="secondary">CM</Badge>, <Badge variant="secondary">AL</Badge>, <Badge variant="secondary">GO</Badge>, <Badge variant="secondary">GEN AVG</Badge></li>
            <li>All values must be numeric (typically in range 1.0 - 5.0)</li>
            <li>No missing values in required columns</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Training Data</CardTitle>
          <CardDescription>
            Upload historical performance data to train the neural network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select File</label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              {file && (
                <Badge variant="outline" className="px-3 py-1">
                  {file.name}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Accepted formats: .xlsx, .xls, .csv
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              {trainMutation.isPending ? 'Training in progress...' : 'Ready to train'}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTrainWithDefault}
                disabled={trainMutation.isPending}
                variant="outline"
              >
                <Brain className="mr-2 h-4 w-4" />
                {trainMutation.isPending ? 'Training...' : 'Use Default Dataset'}
              </Button>
              <Button onClick={handleSubmit} disabled={trainMutation.isPending || !file}>
                <Upload className="mr-2 h-4 w-4" />
                {trainMutation.isPending ? 'Training...' : 'Train with Custom File'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Process Info */}
      <Card>
        <CardHeader>
          <CardTitle>Training Process</CardTitle>
          <CardDescription>
            What happens when you train the model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium">Data Validation</h4>
                <p className="text-sm text-muted-foreground">
                  System validates file format and checks for required columns
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium">Data Preprocessing</h4>
                <p className="text-sm text-muted-foreground">
                  Features are extracted and normalized using min-max scaling (0-1 range)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium">Neural Network Training</h4>
                <p className="text-sm text-muted-foreground">
                  Model trains for 100 epochs using backpropagation and Adam optimizer
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-medium">Model Evaluation</h4>
                <p className="text-sm text-muted-foreground">
                  Performance metrics (MAE, MSE) calculated on test set (20% holdout)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                5
              </div>
              <div>
                <h4 className="font-medium">Model Persistence</h4>
                <p className="text-sm text-muted-foreground">
                  Trained model, normalizer, and metadata saved to disk for future predictions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
