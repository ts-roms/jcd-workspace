'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormField,
  Checkbox,
  Label,
  PageHeader,
} from '@/app/components/ui';
import { toast } from 'sonner';
import { useAlert } from '@/lib/contexts/AlertContext';
import { usePermission } from '@/lib/hooks/usePermission';

interface Role {
  _id: string;
  name: string;
  displayName: string;
  hierarchy: number;
}

export default function CreateUserPage() {
  const router = useRouter();
  const alert = useAlert();
  const canCreateUser = usePermission(PERMISSIONS.USERS_CREATE);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/roles');
      // After interceptor, response.data is unwrapped
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert.showError('Failed to load roles.', { title: 'Load Failed' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!canCreateUser) {
        alert.showWarning('You do not have permission to create users.');
        return;
      }
      if (formData.password.length < 8) {
        alert.showWarning('Password must be at least 8 characters long.');
        return;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(formData.password)) {
        alert.showWarning(
          'Password must include uppercase, lowercase, number, and special character.',
        );
        return;
      }
      await axiosInstance.post('/users', formData);
      toast.success('User created successfully');
      router.push('/admin/users');
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      const errorMessage = axiosError.response?.data?.error?.message || 'Failed to create user';
      alert.showError(errorMessage, { title: 'Create Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
      <div className="space-y-6">
        <PageHeader
          title="Create New User"
          description="Add a new user to the system"
        />

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill in the details below to create a new user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  label="First Name"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />

                <FormField
                  label="Last Name"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <FormField
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              />

              <div className="space-y-3">
                <Label>Assign Roles</Label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role._id} className="flex items-center space-x-2">
                      <Checkbox
                        id={role._id}
                        checked={formData.roles.includes(role._id)}
                        onCheckedChange={() => handleRoleToggle(role._id)}
                      />
                      <Label
                        htmlFor={role._id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {role.displayName}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
