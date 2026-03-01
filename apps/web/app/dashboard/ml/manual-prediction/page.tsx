'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from '@/lib/api/axios';
import { AxiosError, isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getPersonnel, getPersonnelById } from '@/lib/api/personnel.api';
import { Personnel } from '@/types/personnel';
import { Combobox } from '@/app/components/ui/ComboBox';
import { Button } from '@/app/components/ui/button';
import { Award, AlertCircle } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { useAlert } from '@/lib/contexts/AlertContext';
import { mlApi } from '@/lib/api/ml.api';

const PERFORMANCE_THRESHOLD = 3.5;

const trainingSuggestions: Record<string, string> = {
  PAA: 'Professionalism & Attitude Workshop',
  KSM: 'Knowledge & Skills Mastery Seminar',
  TS: 'Teamwork & Collaboration Training',
  CM: 'Communication Mastery Course',
  AL: 'Adaptive Leadership Program',
  GO: 'Goal-Oriented Execution Workshop',
};

export default function ManualPredictPerformancePage() {
  const alert = useAlert();
  const [personnelId, setPersonnelId] = useState('');
  const [semester, setSemester] = useState('');
  const [metrics, setMetrics] = useState({
    PAA: '', KSM: '', TS: '', CM: '', AL: '', GO: '',
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [failedMetrics, setFailedMetrics] = useState<string[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState<any>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const router = useRouter();
  const checkRequestId = useRef(0);

  const { data: personnelList = [], isLoading: isLoadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const isInterventionNeeded = failedMetrics.length > 0;

  // Auto-populate metrics when personnel is selected
  useEffect(() => {
    const loadPersonnelMetrics = async () => {
      if (personnelId) {
        try {
          const personnel = await getPersonnelById(personnelId);

          // Check if personnel has synced metrics
          if (personnel.personnelType === 'Teaching' && personnel.avgPAA !== undefined) {
            // Auto-populate with synced averages
            setMetrics({
              PAA: personnel.avgPAA?.toString() || '',
              KSM: personnel.avgKSM?.toString() || '',
              TS: personnel.avgTS?.toString() || '',
              CM: personnel.avgCM?.toString() || '',
              AL: personnel.avgAL?.toString() || '',
              GO: personnel.avgGO?.toString() || '',
            });

            if (personnel.lastMetricSync) {
              toast.success('Metrics auto-populated from synced averages');
            }
          } else {
            // Clear metrics if no synced data or non-teaching personnel
            setMetrics({
              PAA: '', KSM: '', TS: '', CM: '', AL: '', GO: '',
            });
          }
        } catch (error) {
          console.error('Error loading personnel metrics:', error);
        }
      }
    };

    loadPersonnelMetrics();
  }, [personnelId]);

  // Check for existing prediction when personnel or semester changes
  useEffect(() => {
    const requestId = ++checkRequestId.current;
    const timer = setTimeout(async () => {
      if (personnelId && semester && semester.trim()) {
        setIsCheckingExisting(true);
        try {
          const result = await mlApi.checkExistingPrediction(personnelId, semester);
          if (checkRequestId.current !== requestId) return;
          setExistingPrediction(result.exists ? result.evaluation : null);
        } catch (error) {
          if (checkRequestId.current !== requestId) return;
          console.error('Error checking existing prediction:', error);
          setExistingPrediction(null);
        } finally {
          if (checkRequestId.current === requestId) {
            setIsCheckingExisting(false);
          }
        }
      } else {
        setExistingPrediction(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [personnelId, semester]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    // Validate required fields
    if (!personnelId || !personnelId.trim()) {
      alert.showWarning('Please select a personnel from the dropdown to continue.', {
        title: 'Personnel Required',
      });
      return;
    }

    if (!semester || !semester.trim()) {
      alert.showWarning('Please enter a semester (e.g., "1st Sem 2024") to continue.', {
        title: 'Semester Required',
      });
      return;
    }

    const numericMetrics = Object.fromEntries(
      Object.entries(metrics).map(([key, value]) => [key, Number.parseFloat(value)])
    );

    if (Object.values(numericMetrics).some(Number.isNaN)) {
      alert.showWarning('All metric fields must contain valid numbers between 0 and 5.', {
        title: 'Invalid Metrics',
      });
      return;
    }

    setIsPredicting(true);
    setPrediction(null);
    setFailedMetrics([]);

    try {
      const payload = { metrics: numericMetrics, personnelId, semester };
      const response = await axios.post('/ml/predict-manual', payload);
      
      const data = response.data;
      const predictedScore = Number.parseFloat(data.prediction.toFixed(2));
      
      setPrediction(predictedScore);
      setFailedMetrics(data.failedMetrics || []);

      if (data.failedMetrics && data.failedMetrics.length > 0) {
        alert.showWarning('Predicted performance indicates need for improvement.');
      } else {
        toast.success('Prediction successful!');
      }
    } catch (error: unknown) {
      console.error('Prediction error:', error);
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        alert.showError(
          axiosError.response?.data?.message || 'Failed to get prediction. Please try again or contact support.',
          { title: 'Prediction Error' },
        );
      } else {
        alert.showError('An unexpected error occurred. Please try again.', {
          title: 'Error',
        });
      }
    } finally {
      setIsPredicting(false);
    }
  };

  // Filter to only show Teaching and Non-Teaching personnel
  const filteredPersonnelList = personnelList.filter(
    p => p.personnelType === 'Teaching' || p.personnelType === 'Non-Teaching'
  );

  const personnelOptions = filteredPersonnelList.map(p => ({
    value: p._id,
    label: `${p.firstName} ${p.lastName} (${p.personnelType})`,
  }));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Input Form */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Predict Personnel Performance (Manual)
          </h1>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Personnel <span className="text-red-500">*</span>
              </label>
              <Combobox
                options={personnelOptions}
                value={personnelId}
                onChange={setPersonnelId}
                placeholder="Select a person..."
                emptyText={isLoadingPersonnel ? 'Loading...' : 'No personnel found.'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., 1st Sem 2024"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Warning for existing prediction */}
          {existingPrediction && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                  Prediction Already Exists
                </h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  This personnel already has a prediction for {existingPrediction.semester}.
                  You cannot create duplicate predictions for the same semester.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {Object.keys(metrics).map((key) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {key}
                </label>
                <Input
                  type="number"
                  id={key}
                  name={key}
                  value={metrics[key as keyof typeof metrics]}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="5"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full transition"
            >
              Back
            </button>
            <button
              onClick={handlePredict}
              disabled={isPredicting || !!existingPrediction || isCheckingExisting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={existingPrediction ? 'Prediction already exists for this semester' : ''}
            >
              {isPredicting ? 'Predicting...' : isCheckingExisting ? 'Checking...' : existingPrediction ? 'Already Predicted' : 'Get Prediction'}
            </button>
          </div>
        </div>

        {/* Prediction Result & Intervention */}
        <div className="md:w-1/2 flex flex-col justify-center items-center p-6 bg-blue-50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-gray-700 text-center">
          {prediction === null && !isPredicting && (
            <div className="text-gray-500 dark:text-gray-400">
              <p className="mb-4">Enter metrics and click &quot;Get Prediction&quot; to see results.</p>
            </div>
          )}

          {isPredicting && (
            <div className="text-blue-600 dark:text-blue-400 text-xl font-semibold animate-pulse">Calculating...</div>
          )}

          {prediction !== null && (
            <>
              <p className="text-6xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-4">{prediction}</p>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Predicted Performance (GEN AVG)</p>

              {isInterventionNeeded ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md w-full text-left">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Recommended Actions:</h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                    {failedMetrics.map(metric => (
                      <li key={metric}>
                        <strong>Enroll in Training for {metric}:</strong> {trainingSuggestions[metric] || 'Further review needed.'}
                      </li>
                    ))}
                    <li>
                      <strong>Develop a Performance Improvement Plan (PIP).</strong>
                    </li>
                    <li>
                      <strong>Seek mentorship from a senior colleague.</strong>
                    </li>
                  </ul>
                </div>
              ) : (
                 <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 p-4 rounded-md w-full mb-4 text-center">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                    Excellent Performance!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This individual is a candidate for recognition.
                  </p>
                  <Button
                    onClick={() => toast.success(`Certificate of Achievement awarded (simulation).`)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Award Certificate
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
