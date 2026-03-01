import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * Hook to check if user is either a System Admin or an Admin.
 * Returns true if the user has:
 * - A role with isSystemRole = true (System Admin)
 * - OR a role with name "Admin" or "Administrator"
 */
export function useAdminOrSystemAdmin(): boolean {
  const { user } = useAuth();
  if (!user) {
    return false;
  }

  // Check if the user has a system role OR an admin role
  return user.roles.some(
    (role) =>
      role.isSystemRole ||
      role.name === 'Admin' ||
      role.name === 'Administrator' ||
      role.displayName === 'Admin' ||
      role.displayName === 'Super Admin' ||
      role.displayName === 'Administrator'
  );
}
