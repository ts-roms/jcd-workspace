'use client';

import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataTable
} from '@/app/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useHeader } from '@/lib/contexts/HeaderContext';
import { useAlert } from '@/lib/contexts/AlertContext';
import { usePermission } from '@/lib/hooks/usePermission';
import { rolesApi, type Role } from '@/lib/api/roles.api';

interface User extends Record<string, unknown> {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  roles: Array<{ _id: string; name: string; displayName: string }>;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const { setTitle } = useHeader();
  const alert = useAlert();
  const canDeleteUser = usePermission(PERMISSIONS.USERS_DELETE);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTitle('User Management');
  }, [setTitle]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesApi.getAll();
        setRoles(response.roles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await axiosInstance.get(`/users?${params}`);
      // After interceptor, response.data is unwrapped
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert.showError('Failed to load users.', { title: 'Load Failed' });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    if (!canDeleteUser) {
      alert.showWarning('You do not have permission to delete users.');
      return;
    }
    alert.showConfirm('Are you sure you want to delete this user?', {
      title: 'Delete User',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/users/${userId}`);
          toast.success('User deleted successfully');
          fetchUsers();
        } catch (error) {
          const axiosError = error as {
            response?: { data?: { error?: { message?: string } } };
          };
          alert.showError(
            axiosError.response?.data?.error?.message || 'Failed to delete user',
            { title: 'Delete Failed' },
          );
        }
      },
    });
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: unknown, user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Role',
      render: (_: unknown, user: User) => (
        <Badge variant="secondary">
          {user.roles[0]?.displayName || 'No Role'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (_: unknown, user: User) => (
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (_: unknown, user: User) => (
        <span className="text-sm text-muted-foreground">
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString()
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, user: User) => (
        <div className="flex justify-end gap-2">
          <PermissionGate permission={PERMISSIONS.USERS_UPDATE}>
            <Link href={`/admin/users/${user._id}/edit`}>
              <Button variant="ghost" size="sm">
                <Pencil1Icon className="h-4 w-4" />
              </Button>
            </Link>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.USERS_DELETE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(user._id)}
            >
              <TrashIcon className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGate>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <PermissionGate permission={PERMISSIONS.USERS_READ}>
      <div className="space-y-6">
        <div className="flex justify-end">
            <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
              <Link href="/admin/users/create">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </Link>
            </PermissionGate>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={roleFilter || 'all'} onValueChange={(value) => setRoleFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role.name}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              loading={loading}
              emptyMessage="No users found"
              pagination={{
                currentPage: page,
                totalPages: totalPages,
                onPageChange: setPage,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
