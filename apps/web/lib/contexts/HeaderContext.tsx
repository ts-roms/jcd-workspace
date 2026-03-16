'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/lib/contexts/SettingsContext';

interface HeaderContextType {
  title: string;
  setTitle: (title: string) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/activity': 'Activity',
  '/dashboard/evaluations': 'My Evaluations',
  '/dashboard/complete-profile': 'Complete Profile',
  '/dashboard/ml/analytics': 'Performance Analytics',
  '/dashboard/ml/predictions': 'Predictions',
  '/dashboard/ml/training': 'ML Training',
  '/dashboard/ml/algorithm': 'Algorithm',
  '/dashboard/ml/manual-prediction': 'Manual Prediction',
  '/dashboard/my-account': 'My Account',
  '/dashboard/settings': 'Settings',
  '/dashboard/projects': 'Projects',
  '/admin/settings': 'General Settings',
  '/admin/system': 'System Settings',
  '/admin/users': 'Users',
  '/admin/users/create': 'Create User',
  '/admin/roles': 'Roles',
  '/admin/permissions': 'Permissions',
  '/admin/personnel': 'Personnel',
  '/admin/students': 'Students',
  '/admin/subjects': 'Subjects',
  '/admin/departments': 'Departments',
  '/admin/evaluation-forms': 'Evaluation Forms',
  '/admin/performance-evaluations': 'Performance Evaluations',
  '/admin/non-teaching-evaluations': 'Non-Teaching Evaluations',
  '/admin/help-guide': 'Help Guide',
};

function getTitleFromPath(pathname: string): string {
  // Exact match first
  if (routeTitles[pathname]) return routeTitles[pathname];

  // Try partial matches for dynamic routes
  if (pathname.includes('/evaluation-forms/') && pathname.includes('/edit')) return 'Edit Evaluation Form';
  if (pathname.includes('/evaluation-forms/') && pathname.includes('/responses')) return 'Evaluation Responses';
  if (pathname.includes('/evaluation-forms/') && pathname.includes('/print')) return 'Print Evaluation Form';
  if (pathname.includes('/evaluations/') && pathname.includes('/fill')) return 'Fill Evaluation';
  if (pathname.includes('/users/') && pathname.includes('/edit')) return 'Edit User';

  return 'Dashboard';
}

export function HeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [title, setTitleState] = useState('Dashboard');
  const { settings } = useSettings();
  const siteName = settings?.siteName || 'RBAC App';

  // Auto-set title from route
  useEffect(() => {
    const routeTitle = getTitleFromPath(pathname);
    setTitleState(routeTitle);
    document.title = `${routeTitle} | ${siteName}`;
  }, [pathname, siteName]);

  const setTitle = useCallback((newTitle: string) => {
    setTitleState(newTitle);
    document.title = `${newTitle} | ${siteName}`;
  }, [siteName]);

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}
