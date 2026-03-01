'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/app/components/layouts/Header';
import Sidenav from '@/app/components/layouts/Sidenav';
import Footer from '@/app/components/layouts/Footer';
import { PERMISSIONS } from '@/config/permissions';

const SUPER_ADMIN_ROLES = ['Super Admin', 'super'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHelpGuide = pathname === '/admin/help-guide';
  const isSuperAdmin = SUPER_ADMIN_ROLES.some((r) => hasRole(r));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    // Check if user has at least one admin permission (or Help Guide for Super Admin only)
    if (!isLoading && isAuthenticated) {
      const hasAdminAccess =
        hasPermission(PERMISSIONS.USERS_READ) ||
        hasPermission(PERMISSIONS.USERS_CREATE) ||
        hasPermission(PERMISSIONS.ROLES_READ) ||
        hasPermission(PERMISSIONS.SETTINGS_MANAGE) ||
        hasPermission(PERMISSIONS.SETTINGS_VIEW) ||
        hasPermission(PERMISSIONS.SUBJECTS_READ) ||
        hasPermission(PERMISSIONS.SUBJECTS_CREATE) ||
        hasPermission(PERMISSIONS.EVALUATION_FORMS_READ) ||
        hasPermission(PERMISSIONS.EVALUATION_FORMS_MANAGE) ||
        hasPermission(PERMISSIONS.ANALYTICS_VIEW) ||
        (isHelpGuide && isSuperAdmin);

      if (!hasAdminAccess) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, hasPermission, hasRole, isHelpGuide, isSuperAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidenav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
