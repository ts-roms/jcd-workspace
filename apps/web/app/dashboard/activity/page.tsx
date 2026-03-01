'use client';

import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { useAlert } from '@/lib/contexts/AlertContext';

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

interface ActivityStats {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Array<{ userId: string; userEmail: string; count: number }>;
}

export default function ActivityPage() {
  const alert = useAlert();
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limitFilter, setLimitFilter] = useState(50);
  const [debouncedResource, setDebouncedResource] = useState('');
  const [debouncedStatus, setDebouncedStatus] = useState('');
  const [debouncedLimit, setDebouncedLimit] = useState(50);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResource(resourceFilter);
      setDebouncedStatus(statusFilter);
      setDebouncedLimit(limitFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [resourceFilter, statusFilter, limitFilter]);

  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await axiosInstance.get('/audit-logs/statistics');

      // After interceptor, response.data is unwrapped to { statistics }
      setStatistics(response.data?.statistics || null);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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
        limit: debouncedLimit.toString(),
        ...(debouncedResource && { resource: debouncedResource }),
        ...(debouncedStatus && { status: debouncedStatus })
      });
      const response = await axiosInstance.get(`/audit-logs?${params}`);

      // After interceptor, response.data is unwrapped to { logs, pagination }
      setRecentActivity(response.data?.logs || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedLimit, debouncedResource, debouncedStatus]);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (action.includes('delete')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (action.includes('login')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (action.includes('logout')) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <PermissionGate permission={PERMISSIONS.USERS_READ}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system activity and audit logs
          </p>
        </div>

        {/* Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {statistics.totalLogs.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Successful
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {statistics.successCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {((statistics.successCount / statistics.totalLogs) * 100).toFixed(1)}% success rate
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {statistics.failureCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {((statistics.failureCount / statistics.totalLogs) * 100).toFixed(1)}% failure rate
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Resources</option>
              <option value="auth">Authentication</option>
              <option value="users">Users</option>
              <option value="roles">Roles</option>
              <option value="projects">Projects</option>
              <option value="settings">Settings</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </select>
            <select
              value={limitFilter}
              onChange={(e) => setLimitFilter(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="25">Last 25</option>
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
            </select>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Loading activity...
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No activity found
              </div>
            ) : (
              recentActivity.map((log) => (
                <div key={log._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                        {log.status === 'failure' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Failed
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {log.userEmail}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {log.resource}
                        {log.resourceId && ` (ID: ${log.resourceId.slice(0, 8)}...)`}
                      </p>
                      {log.ipAddress && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          IP: {log.ipAddress}
                        </p>
                      )}
                      {log.errorMessage && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Error: {log.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
