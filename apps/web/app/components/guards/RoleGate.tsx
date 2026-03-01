'use client';

import { useRole } from '@/lib/hooks/useRole';

interface RoleGateProps {
  role: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGate({
  role,
  children,
  fallback = null
}: Readonly<RoleGateProps>) {
  const hasRole = useRole(role);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
