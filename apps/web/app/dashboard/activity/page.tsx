'use client';

import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { useAlert } from '@/lib/contexts/AlertContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface AuditLog {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  timestamp: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ActivityStats {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Array<{ userId: string; userEmail: string; count: number }>;
}

const ALL_VALUE = '__all__';

export default function ActivityPage() {
  const alert = useAlert();
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statistics, setStatistics] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await axiosInstance.get('/audit-logs/statistics');
      setStatistics((response.data as any)?.statistics || null);
    } catch {
      setStatistics(null);
      alert.showError('Failed to load activity statistics.', { title: 'Load Error' });
    } finally {
      setStatsLoading(false);
    }
  }, [alert]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(resourceFilter && { resource: resourceFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const response = await axiosInstance.get(`/audit-logs?${params}`);
      const data = response.data as any;
      setRecentActivity(data?.logs || []);
      setPagination(data?.pagination || null);
    } catch {
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, resourceFilter, statusFilter]);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [resourceFilter, statusFilter]);

  const getActionVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (action.includes('delete')) return 'destructive';
    if (action.includes('create')) return 'default';
    return 'secondary';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <PermissionGate permission={PERMISSIONS.USERS_READ}>
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system activity and audit logs
          </p>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics.totalLogs.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statistics.successCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.totalLogs > 0
                    ? `${((statistics.successCount / statistics.totalLogs) * 100).toFixed(1)}% success rate`
                    : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{statistics.failureCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics.totalLogs > 0
                    ? `${((statistics.failureCount / statistics.totalLogs) * 100).toFixed(1)}% failure rate`
                    : '—'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters & Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Audit Logs</CardTitle>
              <div className="flex gap-2">
                <Select
                  value={resourceFilter || ALL_VALUE}
                  onValueChange={(v) => setResourceFilter(v === ALL_VALUE ? '' : v)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Resources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Resources</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="roles">Roles</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter || ALL_VALUE}
                  onValueChange={(v) => setStatusFilter(v === ALL_VALUE ? '' : v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_VALUE}>All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Loading activity...
                      </TableCell>
                    </TableRow>
                  ) : recentActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No activity found
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentActivity.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>
                          <div className="text-sm font-medium">{log.userEmail}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.resource}</span>
                          {log.resourceId && (
                            <span className="text-xs text-muted-foreground block">
                              {log.resourceId.slice(0, 12)}...
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                          {log.errorMessage && (
                            <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.ipAddress || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} logs
                </p>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
