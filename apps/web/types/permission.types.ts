export interface Permission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  isSystemPermission: boolean;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'view' | 'manage' | 'execute';

export interface PermissionCheck {
  permission: string;
  fallback?: React.ReactNode;
}
