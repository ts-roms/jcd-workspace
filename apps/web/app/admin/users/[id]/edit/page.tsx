'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { useAlert } from '@/lib/contexts/AlertContext';
import { usePermission } from '@/lib/hooks/usePermission';

interface Role {
  _id: string;
  name: string;
  displayName: string;
  hierarchy: number;
}

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: Array<{ _id: string; name: string; displayName: string }>;
}

interface UpdateUserData {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  password?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const alert = useAlert();
  const canUpdateUser = usePermission(PERMISSIONS.USERS_UPDATE);

  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roles: [] as string[],
    isActive: true,
    password: '' // Optional - only if user wants to change password
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchUserAndRoles = useCallback(async () => {
    try {
      setFetchLoading(true);
      const [userResponse, rolesResponse] = await Promise.all([
        axiosInstance.get(`/users/${userId}`),
        axiosInstance.get('/roles')
      ]);

      // After interceptor, response.data is unwrapped
      const userData = userResponse.data.user;
      setUser(userData);
      setFormData({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roles.map((r: { _id: string }) => r._id),
        isActive: userData.isActive,
        password: ''
      });

      setRoles(rolesResponse.data.roles);
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      const message =
        axiosError.response?.data?.error?.message || 'Failed to load user data';
      setError(message);
      alert.showError(message, { title: 'Load Failed' });
    } finally {
      setFetchLoading(false);
    }
  }, [userId, alert]);

  useEffect(() => {
    fetchUserAndRoles();
  }, [fetchUserAndRoles]);

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
    setError('');
    setLoading(true);

    try {
      if (!canUpdateUser) {
        alert.showWarning('You do not have permission to update users.');
        return;
      }
      // Prepare update data - only include password if it's been set
      const updateData: UpdateUserData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: formData.roles,
        isActive: formData.isActive
      };

      if (formData.password) {
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
        updateData.password = formData.password;
      }

      await axiosInstance.patch(`/users/${userId}`, updateData);
      router.push('/admin/users');
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axiosError.response?.data?.error?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <PermissionGate permission={PERMISSIONS.USERS_UPDATE}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Loading user data...</div>
        </div>
      </PermissionGate>
    );
  }

  if (!user) {
    return (
      <PermissionGate permission={PERMISSIONS.USERS_UPDATE}>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">User not found</div>
        </div>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate permission={PERMISSIONS.USERS_UPDATE}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit User
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update user information and permissions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Assign Roles
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label key={role._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role._id)}
                      onChange={() => handleRoleToggle(role._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {role.displayName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Active
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Inactive users cannot log in to the system
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
