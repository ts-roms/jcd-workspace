'use client';

import { usePermission } from '@/lib/hooks/usePermission';
import { PermissionCheck } from '@/types/permission.types';

interface PermissionGateProps extends PermissionCheck {
  children: React.ReactNode;
}

export default function PermissionGate({
  permission,
  children,
  fallback = null
}: Readonly<PermissionGateProps>) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
