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
    const isStudent = user.roles?.some((r: any) =>
      (typeof r === 'string' ? r : r?.name)?.toLowerCase() === 'student'
    );
    if (!isStudent) return;

    // Already on the complete-profile page
    if (pathname === '/dashboard/complete-profile') return;

    const enrolledSubjects = (user as any).enrolledSubjects;
    const hasEnrolledSubjects = Array.isArray(enrolledSubjects) && enrolledSubjects.length > 0;
    const isProfileIncomplete =
      !user.department || !user.studentId || !user.gradeLevel || !(user as any).course || !hasEnrolledSubjects;

    if (isProfileIncomplete) {
      router.push('/dashboard/complete-profile');
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
