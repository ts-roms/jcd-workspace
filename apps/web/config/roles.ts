import { PERMISSIONS } from './permissions';

export const DEFAULT_ROLES = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    hierarchy: 1,
    permissions: Object.values(PERMISSIONS)
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Manage users and projects within their scope',
    hierarchy: 2,
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.PROJECTS_CREATE,
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.PROJECTS_UPDATE,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.SETTINGS_VIEW
    ]
  },
  {
    name: 'user',
    displayName: 'User',
    description: 'Basic user access with limited permissions',
    hierarchy: 3,
    permissions: [
      PERMISSIONS.PROJECTS_READ,
      PERMISSIONS.SETTINGS_VIEW
    ]
  }
];

export const ROLE_HIERARCHY = {
  ADMIN: 1,
  MANAGER: 2,
  USER: 3
} as const;
