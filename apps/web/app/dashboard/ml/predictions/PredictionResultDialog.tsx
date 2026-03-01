'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Personnel } from '@/types/personnel';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Award } from 'lucide-react';

interface PredictionResultDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  personnel: Personnel | null;
  predictionData: { prediction: number; failedMetrics?: string[]; trainedAt?: Date } | null;
  isLoading: boolean;
}

const trainingSuggestions: Record<string, string> = {
  PAA: 'Professionalism & Attitude Workshop',
  KSM: 'Knowledge & Skills Mastery Seminar',
  TS: 'Teamwork & Collaboration Training',
  CM: 'Communication Mastery Course',
  AL: 'Adaptive Leadership Program',
  GO: 'Goal-Oriented Execution Workshop',
};

export function PredictionResultDialog({
  isOpen,
  onOpenChange,
  personnel,
  predictionData,
  isLoading,
}: PredictionResultDialogProps) {
  if (!personnel) return null;

  const isInterventionNeeded = (predictionData?.failedMetrics?.length ?? 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prediction for {personnel.firstName} {personnel.lastName}</DialogTitle>
          <DialogDescription>
            Based on the latest available data and the trained model.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-6">
          {isLoading && <div className="animate-pulse">Calculating...</div>}
          {predictionData && !isLoading && (
            <>
              <p className="text-6xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-4">
                {predictionData.prediction}
              </p>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Predicted Performance (GEN AVG)
              </p>
              {isInterventionNeeded ? (
                <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
                  <span aria-hidden="true">⚠️</span> Needs Improvement!
                </div>
              ) : (
                <div className="text-green-600 dark:text-green-400 text-lg font-semibold mb-4">
                  <span aria-hidden="true">✅</span> Meets Expectations!
                </div>
              )}
              {isInterventionNeeded ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md w-full mb-4 text-left">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Recommended Actions:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                    {predictionData.failedMetrics?.map(metric => (
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
                    onClick={() => toast.success(`Certificate of Achievement awarded to ${personnel.firstName} (simulation).`)}
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
      </DialogContent>
    </Dialog>
  );
}
