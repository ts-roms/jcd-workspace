'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { getPersonnel } from '@/lib/api/personnel.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { AccuracyTrendChart } from '@/app/components/ml/AccuracyTrendChart';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Personnel } from '@/types/personnel';

const ALL_VALUE = '__all__';

interface AnalyticsData {
  overallAverages: {
    _id: null;
    PAA: number;
    KSM: number;
    TS: number;
    CM: number;
    AL: number;
    GO: number;
    totalEvaluations: number;
  };
  semesterTrends: {
    _id: string;
    avgScore: number;
  }[];
}

const metricLabels: Record<string, string> = {
  PAA: 'Professional Attitude',
  KSM: 'Knowledge of Subject',
  TS: 'Teaching Skills',
  CM: 'Classroom Management',
  AL: 'Assessment of Learning',
  GO: 'Goals & Overall',
};

const fetchAnalyticsData = async (personnelId?: string): Promise<AnalyticsData> => {
  const params = personnelId ? { personnelId } : {};
  const { data } = await axios.get('/ml/analytics', { params });
  return data;
};

const fetchAccuracyTrends = async (): Promise<Array<{ date: string; accuracy: number; count?: number }>> => {
  const { data } = await axios.get('/ml/accuracy-trends');
  return data;
};

export default function AnalyticsPage() {
  const { user, hasRole } = useAuth();
  const isDean = hasRole('dean');
  const departmentName = user?.department?.name;
  const [selectedPersonnel, setSelectedPersonnel] = useState('');

  const { data: personnel = [] } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const teachingPersonnel = personnel.filter(
    (p) => p.personnelType === 'Teaching' && p.isActive !== false,
  );

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['mlAnalytics', selectedPersonnel],
    queryFn: () => fetchAnalyticsData(selectedPersonnel || undefined),
  });

  const { data: accuracyData, isLoading: isLoadingAccuracy } = useQuery({
    queryKey: ['accuracyTrends'],
    queryFn: fetchAccuracyTrends,
  });

  if (isLoading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4">Error loading data.</div>;

  const { overallAverages, semesterTrends } = data || {};

  const averagesData = overallAverages
    ? Object.entries(overallAverages)
        .filter(([key]) => key !== '_id' && key !== 'totalEvaluations')
        .map(([name, value]) => ({
          name,
          fullName: metricLabels[name] || name,
          value: Number((value as number)?.toFixed(2) || 0),
        }))
    : [];

  const trendData =
    semesterTrends?.map((trend) => ({
      semester: trend._id,
      'Average Score': Number(trend.avgScore.toFixed(2)),
    })) || [];

  const selectedPerson = teachingPersonnel.find((p) => p._id === selectedPersonnel);
  const titlePrefix = selectedPerson
    ? `${selectedPerson.firstName} ${selectedPerson.lastName}`
    : isDean && departmentName
      ? departmentName
      : '';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {titlePrefix
              ? `${titlePrefix} — Performance Analytics`
              : 'Performance Analytics'}
          </h1>
          {isDean && departmentName && !selectedPersonnel && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing analytics for your department. Select a personnel to view individual performance.
            </p>
          )}
        </div>
        <Select
          value={selectedPersonnel || ALL_VALUE}
          onValueChange={(v) => setSelectedPersonnel(v === ALL_VALUE ? '' : v)}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="All Personnel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>
              {isDean ? 'All Department Personnel' : 'All Personnel'}
            </SelectItem>
            {teachingPersonnel.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.firstName} {p.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedPerson ? 'Evaluations' : isDean ? 'Department Evaluations' : 'Total Evaluations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverages?.totalEvaluations || 0}</div>
          </CardContent>
        </Card>
        {selectedPerson && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Performance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={selectedPerson.performanceStatus === 'Performing' ? 'default' : 'secondary'}>
                  {selectedPerson.performanceStatus || 'Not Evaluated'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Excellence Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">
                  {selectedPerson.excellenceStatus || 'Not Evaluated'}
                  {selectedPerson.sixYearAverage ? ` (${selectedPerson.sixYearAverage.toFixed(2)})` : ''}
                </Badge>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Model Accuracy Trend Chart */}
      {!selectedPersonnel && !isLoadingAccuracy && accuracyData && accuracyData.length > 0 && (
        <AccuracyTrendChart data={accuracyData} />
      )}

      {/* Radar Chart for individual personnel */}
      {selectedPersonnel && averagesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={averagesData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Tooltip formatter={(value: number) => [value.toFixed(2), 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Metric Averages Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedPerson
              ? 'Metric Scores'
              : isDean
                ? 'Department Metric Averages'
                : 'Overall Metric Averages'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averagesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), 'Score']}
                labelFormatter={(label) => metricLabels[label] || label}
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Average Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPerson
                ? 'Performance Trend'
                : isDean
                  ? 'Department Performance Trend'
                  : 'Performance Trend Across Semesters'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value: number) => [value.toFixed(2), 'Avg Score']} />
                <Legend />
                <Line type="monotone" dataKey="Average Score" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
