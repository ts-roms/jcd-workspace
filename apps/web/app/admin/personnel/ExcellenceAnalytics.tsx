'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExcellenceAnalytics } from '@/lib/api/personnel.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export function ExcellenceAnalytics() {
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2025);
  const [enableQuery, setEnableQuery] = useState(false);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['excellence-analytics', startYear, endYear],
    queryFn: () => getExcellenceAnalytics({ startYear, endYear }),
    enabled: enableQuery,
  });

  const handleGenerate = () => {
    setEnableQuery(true);
    refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Excellence Analytics</CardTitle>
          <CardDescription>
            View analytics and statistics for excellence evaluations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="startYear" className="mb-2">Start Year</Label>
              <Input
                id="startYear"
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
            <div>
              <Label htmlFor="endYear" className="mb-2">End Year</Label>
              <Input
                id="endYear"
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {analytics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Personnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{analytics.totalPersonnel}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {analytics.averageScore?.toFixed(2) || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Excellence Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Excellent</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.overallDistribution?.Excellent || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Good</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.overallDistribution?.Good || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Average</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {analytics.overallDistribution?.Average || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Below Average</p>
                      <p className="text-2xl font-bold text-red-600">
                        {analytics.overallDistribution?.['Below Average'] || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Not Evaluated</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {analytics.overallDistribution?.['Not Evaluated'] || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Personnel Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Teaching Staff</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Excellent:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.Teaching?.Excellent || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Good:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.Teaching?.Good || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.Teaching?.Average || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Below Average:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.Teaching?.['Below Average'] || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Non-Teaching Staff</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Excellent:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.['Non-Teaching']?.Excellent || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Good:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.['Non-Teaching']?.Good || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.['Non-Teaching']?.Average || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Below Average:</span>
                          <span className="font-medium">
                            {analytics.byPersonnelType?.['Non-Teaching']?.['Below Average'] || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
