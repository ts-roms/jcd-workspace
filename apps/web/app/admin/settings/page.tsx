'use client';

import React, { useState, useEffect } from 'react';
import { settingsApi, UpdateSettingsDto } from '@/lib/api/settings.api';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { PERMISSIONS } from '@/config/permissions';
import { useHeader } from '@/lib/contexts/HeaderContext';
import { useSettings } from '@/lib/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';

const SettingsPage = () => {
  const { setTitle } = useHeader();
  const { settings, loading, refetch } = useSettings();
  const alert = useAlert();
  const [formData, setFormData] = useState<Partial<UpdateSettingsDto>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle('Application Settings');
  }, [setTitle]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleCheckboxChange = (name: keyof UpdateSettingsDto) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.update(formData);
      toast.success('Settings updated successfully!');
      refetch(); // Refetch settings to update context
    } catch (error) {
      console.error('Failed to update settings', error);
      alert.showError('Failed to update settings.', { title: 'Update Failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading settings...</div>;
  }

  return (
    <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
      <div className="container mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium mb-1">Site Name</label>
                <Input
                  type="text"
                  name="siteName"
                  id="siteName"
                  value={formData.siteName || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium mb-1">Site Description</label>
                <Input
                  type="text"
                  name="siteDescription"
                  id="siteDescription"
                  value={formData.siteDescription || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenanceMode"
                  checked={formData.maintenanceMode || false}
                  onCheckedChange={handleCheckboxChange('maintenanceMode')}
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium leading-none">Maintenance Mode</label>
              </div>
            </CardContent>
          </Card>

          {/* Registration Settings */}
          <Card>
            <CardHeader><CardTitle>Registration Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowRegistration"
                  checked={formData.allowRegistration || false}
                  onCheckedChange={handleCheckboxChange('allowRegistration')}
                />
                <label htmlFor="allowRegistration" className="text-sm font-medium leading-none">Allow New User Registration</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailVerificationRequired"
                  checked={formData.emailVerificationRequired || false}
                  onCheckedChange={handleCheckboxChange('emailVerificationRequired')}
                />
                <label htmlFor="emailVerificationRequired" className="text-sm font-medium leading-none">Require Email Verification</label>
              </div>
              <div>
                <label htmlFor="defaultUserRole" className="block text-sm font-medium mb-1">Default User Role ID</label>
                <Input
                  type="text"
                  name="defaultUserRole"
                  id="defaultUserRole"
                  value={formData.defaultUserRole || ''}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium mb-1">
                  Idle Timeout (minutes)
                </label>
                <Input
                  type="number"
                  name="sessionTimeout"
                  id="sessionTimeout"
                  value={formData.sessionTimeout || ''}
                  onChange={handleChange}
                  min="1"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users will be logged out after this many minutes of inactivity
                </p>
              </div>
              <div>
                <label htmlFor="maxLoginAttempts" className="block text-sm font-medium mb-1">Max Login Attempts</label>
                <Input
                  type="number"
                  name="maxLoginAttempts"
                  id="maxLoginAttempts"
                  value={formData.maxLoginAttempts || ''}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password Requirements */}
          <Card>
            <CardHeader><CardTitle>Password Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="passwordMinLength" className="block text-sm font-medium mb-1">Minimum Password Length</label>
                <Input
                  type="number"
                  name="passwordMinLength"
                  id="passwordMinLength"
                  value={formData.passwordMinLength || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="passwordRequireUppercase" checked={formData.passwordRequireUppercase || false} onCheckedChange={handleCheckboxChange('passwordRequireUppercase')} />
                <label htmlFor="passwordRequireUppercase" className="text-sm font-medium leading-none">Require Uppercase</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="passwordRequireLowercase" checked={formData.passwordRequireLowercase || false} onCheckedChange={handleCheckboxChange('passwordRequireLowercase')} />
                <label htmlFor="passwordRequireLowercase" className="text-sm font-medium leading-none">Require Lowercase</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="passwordRequireNumbers" checked={formData.passwordRequireNumbers || false} onCheckedChange={handleCheckboxChange('passwordRequireNumbers')} />
                <label htmlFor="passwordRequireNumbers" className="text-sm font-medium leading-none">Require Numbers</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="passwordRequireSpecialChars" checked={formData.passwordRequireSpecialChars || false} onCheckedChange={handleCheckboxChange('passwordRequireSpecialChars')} />
                <label htmlFor="passwordRequireSpecialChars" className="text-sm font-medium leading-none">Require Special Characters</label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </div>
    </PermissionGate>
  );
};

export default SettingsPage;
