'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { Users, Building, Briefcase, FileText } from 'lucide-react';

interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalPersonnel: number;
    totalDepartments: number;
    evaluationsThisMonth: number;
  };
  personnelByDepartment: { name: string; count: number }[];
  userSignups: { date: string; count: number }[];
  recentActivities: {
    _id: string;
    user: { username: string };
    action: string;
    timestamp: string;
  }[];
}

const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const { data } = await axios.get('/analytics');
  return data;
};

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['dashboardAnalytics'],
    queryFn: fetchAnalyticsData,
  });

  if (isLoading) return <div className="p-4">Loading analytics...</div>;
  if (error) return <div className="p-4">Error loading data.</div>;

  const { stats, personnelByDepartment, userSignups, recentActivities } = data || {};

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Application Analytics</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Personnel</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalPersonnel || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Departments</CardTitle><Building className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalDepartments || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Evaluations (Last 30d)</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.evaluationsThisMonth || 0}</div></CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personnel by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={personnelByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Personnel Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>User Sign-ups (Last 30d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userSignups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentActivities?.map(activity => (
              <li key={activity._id} className="text-sm text-muted-foreground">
                <strong>{activity.user?.username || 'System'}</strong>: {activity.action}
                <span className="text-xs ml-2">{new Date(activity.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
