'use client';

import { useEffect } from 'react';
import { useHeader } from '@/lib/contexts/HeaderContext';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { PERMISSIONS } from '@/config/permissions';

export default function SystemSettingsPage() {
  const { setTitle } = useHeader();

  useEffect(() => {
    setTitle('System Settings');
  }, [setTitle]);

  return (
    <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
      <div className="container mx-auto p-4">
        <p>System settings content goes here.</p>
      </div>
    </PermissionGate>
  );
}
