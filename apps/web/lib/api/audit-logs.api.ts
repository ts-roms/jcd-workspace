import axiosInstance, { ApiResponse, cleanParams } from './axios';

export interface AuditLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogStatistics {
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByResource: Record<string, number>;
  logsByUser: Record<string, number>;
}

export const auditLogsApi = {
  /**
   * Get all audit logs with pagination and filters
   */
  getAll: async (filters?: AuditLogFilters): Promise<PaginatedAuditLogs> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedAuditLogs>>('/audit-logs', {
      params: cleanParams(filters),
    });
    return response.data as unknown as PaginatedAuditLogs;
  },

  /**
   * Get audit log statistics
   */
  getStatistics: async (startDate?: string, endDate?: string): Promise<{ statistics: AuditLogStatistics }> => {
    const response = await axiosInstance.get<ApiResponse<{ statistics: AuditLogStatistics }>>(
      '/audit-logs/statistics',
      {
        params: cleanParams({ startDate, endDate }),
      }
    );
    return response.data as unknown as { statistics: AuditLogStatistics };
  },
};
