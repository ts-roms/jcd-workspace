import { useAuth } from '@/lib/contexts/AuthContext';

export function useSystemAdmin(): boolean {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  // Check if the user has a role with the 'isSystemRole' flag
  return user.roles.some(role => role.isSystemRole);
}
