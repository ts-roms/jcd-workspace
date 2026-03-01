'use client';

import { useAuth } from '@/lib/contexts/AuthContext';

export function useRole(role: string): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}

export function useIsAdmin(): boolean {
  return useRole('admin');
}

export function useIsManager(): boolean {
  return useRole('manager');
}

export function useIsUser(): boolean {
  return useRole('user');
}
