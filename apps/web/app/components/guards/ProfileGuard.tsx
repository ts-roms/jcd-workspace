'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ProfileGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || !user) return;

    // Only students must complete profile (department, studentId, gradeLevel, adviser)
    const isStudent = user.roles?.some((r) => String(r).toLowerCase() === 'student');
    if (!isStudent) return;

    // Already on the complete-profile page
    if (pathname === '/dashboard/complete-profile') return;

    const isProfileIncomplete =
      !user.department || !user.studentId || !user.gradeLevel || !user.adviser;

    if (isProfileIncomplete) {
      router.push('/dashboard/complete-profile');
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
