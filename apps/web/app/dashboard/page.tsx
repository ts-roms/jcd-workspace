'use client';

import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { PERMISSIONS } from '@/config/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Building, Briefcase, FileText, PlusCircle, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import UserDashboard from './UserDashboard';

interface DashboardAnalytics {
  stats: {
    totalUsers: number;
    totalPersonnel: number;
    totalDepartments: number;
    evaluationsThisMonth: number;
  };
  personnelByDepartment: { name: string; count: number }[];
}

const fetchDashboardData = async (): Promise<DashboardAnalytics> => {
  const { data } = await axios.get('/analytics');
  return {
    stats: data.stats,
    personnelByDepartment: data.personnelByDepartment,
  };
};

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();

  const isAdmin =
    hasPermission(PERMISSIONS.USERS_READ) ||
    hasPermission(PERMISSIONS.ROLES_READ) ||
    hasPermission(PERMISSIONS.SETTINGS_MANAGE);

  if (!isAdmin) {
    return <UserDashboard />;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery<DashboardAnalytics>({
    queryKey: ['dashboardAnalytics'],
    queryFn: fetchDashboardData,
  });

  if (isLoading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4">Error loading dashboard data.</div>;

  const { stats, personnelByDepartment } = data || {};

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="text-muted-foreground">Here&apos;s a snapshot of your application.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Personnel</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalPersonnel || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Departments</CardTitle><Building className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalDepartments || 0}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Evaluations (Last 30d)</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.evaluationsThisMonth || 0}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Personnel by Department Chart */}
        <Card>
          <CardHeader><CardTitle>Personnel by Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={personnelByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link href="/admin/personnel" passHref>
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Personnel
              </Button>
            </Link>
            <Link href="/dashboard/ml/predictions" passHref>
              <Button variant="outline" className="w-full justify-start">
                <BarChart2 className="mr-2 h-4 w-4" />
                View Predictions
              </Button>
            </Link>
             <Link href="/dashboard/analytics" passHref>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View Full Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
