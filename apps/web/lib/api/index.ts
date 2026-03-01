// Export all API clients
export { authApi } from './auth.api';
export { usersApi } from './users.api';
export { rolesApi } from './roles.api';
export { permissionsApi } from './permissions.api';
export { settingsApi } from './settings.api';
export { auditLogsApi } from './audit-logs.api';
export { default as axiosInstance } from './axios';
export type { ApiResponse } from './axios';

// Re-export commonly used types
export type { LoginDto, RegisterDto, User } from './auth.api';
export type { User as UserDetailed, CreateUserDto, UpdateUserDto, UserFilters, PaginatedUsers } from './users.api';
export type { Role, CreateRoleDto, UpdateRoleDto } from './roles.api';
export type { Permission } from './permissions.api';
export type { Settings, UpdateSettingsDto } from './settings.api';
export type { AuditLog, AuditLogFilters, PaginatedAuditLogs, AuditLogStatistics } from './audit-logs.api';
