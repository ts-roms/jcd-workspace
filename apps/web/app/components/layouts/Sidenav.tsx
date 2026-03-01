'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { PERMISSIONS } from '@/config/permissions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';

/** Role names that count as Super Admin (display name or internal name). */
const SUPER_ADMIN_ROLES = ['Super Admin', 'super'];

interface NavItem {
  name: string;
  href?: string;
  icon: string;
  /** Single permission required, or any of these permissions (e.g. so Dean with users.read can see Settings) */
  permission?: string | string[];
  /** If set, item is visible only when user has one of these roles (e.g. Help Guide for Super Admin only). */
  roles?: string[];
  children?: {
    name: string;
    href: string;
    permission?: string;
  }[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    // No permission - everyone can see dashboard
  },
  {
    name: 'My Evaluations',
    href: '/dashboard/evaluations',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    // No permission - all users can fill evaluations
  },
  {
    name: 'Activity',
    href: '/dashboard/activity',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    permission: [PERMISSIONS.USERS_READ, PERMISSIONS.EVALUATION_FORMS_READ]
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    permission: PERMISSIONS.ANALYTICS_VIEW
  },
  {
    name: 'Management',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    children: [
      {
        name: 'Personnel',
        href: '/admin/personnel',
        permission: PERMISSIONS.EVALUATION_FORMS_READ
      },
      {
        name: 'Students',
        href: '/admin/students',
        permission: PERMISSIONS.USERS_READ
      },
      {
        name: 'Subjects',
        href: '/admin/subjects',
        permission: PERMISSIONS.SUBJECTS_READ
      },
      {
        name: 'Departments',
        href: '/admin/departments',
        permission: PERMISSIONS.EVALUATION_FORMS_READ
      },
      {
        name: 'Performance',
        href: '/admin/performance-evaluations',
        permission: PERMISSIONS.EVALUATION_FORMS_READ
      },
      {
        name: 'Evaluation Forms',
        href: '/admin/evaluation-forms',
        permission: PERMISSIONS.EVALUATION_FORMS_READ,
      },
      {
        name: 'Non-Teaching Eval',
        href: '/admin/non-teaching-evaluations',
        permission: PERMISSIONS.EVALUATION_FORMS_READ
      },
    ],
    permission: [
      PERMISSIONS.EVALUATION_FORMS_READ,
      PERMISSIONS.EVALUATION_FORMS_MANAGE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.SUBJECTS_READ,
    ],
  },
  {
    name: 'ML Performance',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    children: [
      {
        name: 'Algorithm Details',
        href: '/dashboard/ml/algorithm',
        permission: PERMISSIONS.EVALUATION_FORMS_MANAGE
      },
      {
        name: 'Predictions',
        href: '/dashboard/ml/predictions',
        permission: PERMISSIONS.EVALUATION_FORMS_MANAGE
      },
      {
        name: 'Manual Prediction',
        href: '/dashboard/ml/manual-prediction',
        permission: PERMISSIONS.EVALUATION_FORMS_MANAGE
      },
      {
        name: 'Analytics',
        href: '/dashboard/ml/analytics',
        permission: PERMISSIONS.ANALYTICS_VIEW
      },
      {
        name: 'Training',
        href: '/dashboard/ml/training',
        permission: PERMISSIONS.EVALUATION_FORMS_MANAGE
      },
    ],
    permission: [PERMISSIONS.EVALUATION_FORMS_MANAGE, PERMISSIONS.ANALYTICS_VIEW],
  },
  {
    name: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    permission: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE, PERMISSIONS.USERS_READ, PERMISSIONS.ROLES_READ, PERMISSIONS.PERMISSIONS_MANAGE],
    children: [
      {
        name: 'General',
        href: '/admin/settings',
        permission: PERMISSIONS.SETTINGS_MANAGE
      },
      {
        name: 'System',
        href: '/admin/system',
        permission: PERMISSIONS.SETTINGS_MANAGE
      },
      {
        name: 'Users',
        href: '/admin/users',
        permission: PERMISSIONS.USERS_READ
      },
      {
        name: 'Roles',
        href: '/admin/roles',
        permission: PERMISSIONS.ROLES_READ
      },
      {
        name: 'Permissions',
        href: '/admin/permissions',
        permission: PERMISSIONS.PERMISSIONS_MANAGE
      },
    ],
  },
  {
    name: 'Help Guide',
    href: '/admin/help-guide',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    roles: SUPER_ADMIN_ROLES,
  },
];

export default function Sidenav() {
  const pathname = usePathname();
  const { hasPermission, hasRole } = useAuth();
  const { settings } = useSettings();

  const hasAnyPermission = (permission: string | string[] | undefined) => {
    if (!permission) return true;
    const list = Array.isArray(permission) ? permission : [permission];
    return list.some((p) => hasPermission(p));
  };

  const hasAnyRole = (roles: string[] | undefined) => {
    if (!roles?.length) return true;
    return roles.some((r) => hasRole(r));
  };

  const visibleNavItems = navigation.filter((item) => {
    if (item.roles !== undefined && !hasAnyRole(item.roles)) return false;
    return hasAnyPermission(item.permission);
  });

  return (
    <aside className="w-64 bg-gray-800 dark:bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <h2 className="text-2xl font-bold">{settings?.siteName || 'RBAC App'}</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Accordion type="multiple" className="w-full">
          {visibleNavItems.map((item) => {
            if (item.children) {
              const visibleChildren = item.children.filter(child => !child.permission || hasPermission(child.permission));
              if (visibleChildren.length === 0) return null;

              return (
                <AccordionItem value={item.name} key={item.name} className="border-none">
                  <AccordionTrigger className="flex w-full items-center px-4 py-3 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:text-white">
                    <span className="flex flex-1 items-center gap-3 min-w-0">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="truncate">{item.name}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 pt-2">
                    {visibleChildren.map(child => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`block py-2 px-4 rounded-lg text-sm ${
                            isActive
                              ? 'bg-gray-900 dark:bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-900 dark:bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </Accordion>
      </nav>
    </aside>
  );
}
