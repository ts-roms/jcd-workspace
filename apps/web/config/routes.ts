import { PERMISSIONS } from './permissions';

export const ROUTE_PERMISSIONS: Record<string, string | null> = {
  '/dashboard': null, // All authenticated users
  '/dashboard/analytics': PERMISSIONS.ANALYTICS_VIEW,
  '/dashboard/projects': PERMISSIONS.PROJECTS_READ,
  '/dashboard/settings': PERMISSIONS.SETTINGS_VIEW,
  '/api/users': PERMISSIONS.USERS_READ,
  '/api/users/create': PERMISSIONS.USERS_CREATE,
  '/api/roles': PERMISSIONS.ROLES_READ
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password'
] as const;

export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password'
] as const;
