'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import { MLPrediction } from '@/types/ml.types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

interface PredictionCardProps {
  prediction: MLPrediction;
  onViewDetails?: () => void;
  showPersonnelInfo?: boolean;
}

export function PredictionCard({
  prediction,
  onViewDetails,
  showPersonnelInfo = true,
}: PredictionCardProps) {
  const { personnel, prediction: pred, riskFactors = [], createdAt } = prediction;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Excellent':
        return 'bg-green-500 text-white border-green-600';
      case 'Good':
        return 'bg-blue-500 text-white border-blue-600';
      case 'Average':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'Below Average':
        return 'bg-orange-500 text-white border-orange-600';
      case 'Poor':
        return 'bg-red-500 text-white border-red-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showPersonnelInfo && (
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">
                    {personnel.firstName} {personnel.lastName}
                  </CardTitle>
                  {personnel.jobTitle && (
                    <p className="text-sm text-muted-foreground">
                      {personnel.jobTitle}
                      {personnel.department && ` • ${personnel.department.name}`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Badge className={getCategoryColor(pred.performanceCategory)}>
            {pred.performanceCategory}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance Score */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Performance Score</span>
            <span className="font-semibold text-lg">
              {pred.performanceScore.toFixed(2)} / 5.0
            </span>
          </div>
          <Progress value={(pred.performanceScore / 5) * 100} />
        </div>

        {/* Confidence Level */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Confidence Level</span>
            <span className={`font-semibold ${getConfidenceColor(pred.confidence)}`}>
              {(pred.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={pred.confidence * 100}
            className="h-1.5"
          />
        </div>

        {/* Risk Factors */}
        {riskFactors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h4 className="text-sm font-semibold">Risk Factors</h4>
            </div>
            <ul className="space-y-1 ml-6">
              {riskFactors.slice(0, 3).map((risk, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {risk.factor}
                  {risk.impact > 0.7 && (
                    <span className="ml-1 text-red-500">(High Impact)</span>
                  )}
                </li>
              ))}
            </ul>
            {riskFactors.length > 3 && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                +{riskFactors.length - 3} more
              </p>
            )}
          </div>
        )}

        {/* Prediction Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3" />
          <span>Predicted on {formatDate(createdAt)}</span>
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="w-full mt-2"
            size="sm"
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
