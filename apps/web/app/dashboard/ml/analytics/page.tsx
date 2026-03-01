'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
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
} from 'recharts';
import { AccuracyTrendChart } from '@/app/components/ml/AccuracyTrendChart';

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

const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const { data } = await axios.get('/ml/analytics');
  return data;
};

const fetchAccuracyTrends = async (): Promise<Array<{ date: string; accuracy: number; count?: number }>> => {
  const { data } = await axios.get('/ml/accuracy-trends');
  return data;
};

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['mlAnalytics'],
    queryFn: fetchAnalyticsData,
  });

  const { data: accuracyData, isLoading: isLoadingAccuracy } = useQuery({
    queryKey: ['accuracyTrends'],
    queryFn: fetchAccuracyTrends,
  });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading data.</div>;

  const { overallAverages, semesterTrends } = data || {};

  const averagesData = overallAverages ? Object.entries(overallAverages)
    .filter(([key]) => key !== '_id' && key !== 'totalEvaluations')
    .map(([name, value]) => ({ name, value: Number(value!.toFixed(2)) })) : [];

  const trendData = semesterTrends?.map(trend => ({
    semester: trend._id,
    'Average Score': Number(trend.avgScore.toFixed(2)),
  })) || [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Performance Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverages?.totalEvaluations || 0}</div>
          </CardContent>
        </Card>
        {/* Add more stat cards if needed */}
      </div>

      {/* Model Accuracy Trend Chart */}
      {!isLoadingAccuracy && accuracyData && accuracyData.length > 0 && (
        <AccuracyTrendChart data={accuracyData} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Overall Metric Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averagesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend Across Semesters</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semester" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Average Score" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
