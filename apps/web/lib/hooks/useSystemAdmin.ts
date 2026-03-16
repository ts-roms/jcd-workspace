import { useAuth } from '@/lib/contexts/AuthContext';

const SUPER_ADMIN_ROLES = ['super', 'superadmin', 'super admin'];

export function useSystemAdmin(): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  return user.roles.some(
    (role) => role.isSystemRole || SUPER_ADMIN_ROLES.includes(role.name?.toLowerCase()),
  );
}
