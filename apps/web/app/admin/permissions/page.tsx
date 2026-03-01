'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Badge,
  DataTable,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useHeader } from '@/lib/contexts/HeaderContext';
import { useSystemAdmin } from '@/lib/hooks/useSystemAdmin';
import { useAdminOrSystemAdmin } from '@/lib/hooks/useAdminOrSystemAdmin';
import { useAlert } from '@/lib/contexts/AlertContext';

interface Permission extends Record<string, unknown> {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
  isSystemPermission: boolean;
  createdAt: string;
}

interface PermissionFormData {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

export default function PermissionsPage() {
  const { setTitle } = useHeader();
  const isSystemAdmin = useSystemAdmin();
  const isAdminOrSystemAdmin = useAdminOrSystemAdmin();
  const alert = useAlert();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    category: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTitle('Permissions Management');
  }, [setTitle]);

  useEffect(() => {
    fetchPermissions();
  }, [page]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      const response = await axiosInstance.get(`/permissions?${params}`);
      setPermissions(response.data.permissions);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      alert.showError('Failed to load permissions. Please try again or contact support.', {
        title: 'Load Error',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = async () => {
    if (!isAdminOrSystemAdmin) {
      alert.showError(
        'Only System Administrators and Administrators can create permissions. Please contact your administrator if you need this permission.',
        { title: 'Permission Denied' },
      );
      return;
    }
    try {
      await axiosInstance.post('/permissions', formData);
      toast.success('Permission created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPermissions();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      alert.showError(
        axiosError.response?.data?.error?.message || 'Failed to create permission. Please try again.',
        { title: 'Creation Failed' },
      );
    }
  };

  const handleUpdate = async () => {
    if (!editingPermission) return;
    if (editingPermission.isSystemPermission && !isSystemAdmin) {
      alert.showError(
        'Only System Administrators can update system permissions. Please contact your administrator.',
        { title: 'Permission Denied' },
      );
      return;
    }

    try {
      await axiosInstance.put(`/permissions/${editingPermission._id}`, formData);
      toast.success('Permission updated successfully');
      setIsEditDialogOpen(false);
      setEditingPermission(null);
      resetForm();
      fetchPermissions();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      alert.showError(
        axiosError.response?.data?.error?.message || 'Failed to update permission. Please try again.',
        { title: 'Update Failed' },
      );
    }
  };

  const handleDelete = async (permissionId: string) => {
    const permission = permissions.find(p => p._id === permissionId);
    if (permission?.isSystemPermission && !isSystemAdmin) {
      alert.showError(
        'Only System Administrators can delete system permissions. Please contact your administrator.',
        { title: 'Permission Denied' },
      );
      return;
    }

    alert.showConfirm('Are you sure you want to delete this permission? This action cannot be undone.', {
      title: 'Confirm Deletion',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/permissions/${permissionId}`);
          toast.success('Permission deleted successfully');
          fetchPermissions();
        } catch (error) {
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
          alert.showError(
            axiosError.response?.data?.error?.message || 'Failed to delete permission. Please try again.',
            { title: 'Deletion Failed' },
          );
        }
      },
    });
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      displayName: permission.displayName,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      category: permission.category,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      resource: '',
      action: '',
      category: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const columns = [
    {
      key: 'displayName',
      label: 'Permission',
      render: (_: unknown, permission: Permission) => (
        <div>
          <div className="font-medium">{permission.displayName}</div>
          <div className="text-sm text-muted-foreground">{permission.name}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (_: unknown, permission: Permission) => (
        <Badge variant="secondary">{permission.category}</Badge>
      ),
    },
    {
      key: 'resource',
      label: 'Resource',
      render: (_: unknown, permission: Permission) => (
        <span className="text-sm">{permission.resource}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (_: unknown, permission: Permission) => (
        <Badge variant="outline">{permission.action}</Badge>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (_: unknown, permission: Permission) => (
        <Badge variant={permission.isSystemPermission ? 'default' : 'secondary'}>
          {permission.isSystemPermission ? 'System' : 'Custom'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (_: unknown, permission: Permission) => (
        <div className="flex justify-end gap-2">
          <PermissionGate permission={PERMISSIONS.PERMISSIONS_MANAGE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditDialog(permission)}
              disabled={permission.isSystemPermission && !isSystemAdmin}
            >
              <Pencil1Icon className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.PERMISSIONS_MANAGE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(permission._id)}
              disabled={permission.isSystemPermission && !isSystemAdmin}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <PermissionGate permission={PERMISSIONS.PERMISSIONS_MANAGE}>
      <div className="space-y-6">
        <div className="flex justify-end">
            <PermissionGate permission={PERMISSIONS.PERMISSIONS_MANAGE}>
              <Button onClick={() => setIsCreateDialogOpen(true)} disabled={!isAdminOrSystemAdmin}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Permission
              </Button>
            </PermissionGate>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">All Permissions</h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            ) : (
              <DataTable
                data={permissions}
                columns={columns}
                pagination={{
                  currentPage: page,
                  totalPages: totalPages,
                  onPageChange: setPage,
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Create Permission Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>
                Add a new permission to the system. Only System Administrators and Administrators can create new permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Permission Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., users:read"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="displayName" className="text-sm font-medium">
                    Display Name *
                  </label>
                  <Input
                    id="displayName"
                    name="displayName"
                    placeholder="e.g., Read Users"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description *
                </label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Brief description of this permission"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="resource" className="text-sm font-medium">
                    Resource *
                  </label>
                  <Input
                    id="resource"
                    name="resource"
                    placeholder="e.g., users"
                    value={formData.resource}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="action" className="text-sm font-medium">
                    Action *
                  </label>
                  <Input
                    id="action"
                    name="action"
                    placeholder="e.g., read"
                    value={formData.action}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="e.g., User Management"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Permission</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Permission Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
              <DialogDescription>
                Update permission details. System permissions can only be modified by System Administrators.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name" className="text-sm font-medium">
                    Permission Name *
                  </label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-displayName" className="text-sm font-medium">
                    Display Name *
                  </label>
                  <Input
                    id="edit-displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description *
                </label>
                <Input
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-resource" className="text-sm font-medium">
                    Resource *
                  </label>
                  <Input
                    id="edit-resource"
                    name="resource"
                    value={formData.resource}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-action" className="text-sm font-medium">
                    Action *
                  </label>
                  <Input
                    id="edit-action"
                    name="action"
                    value={formData.action}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Input
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingPermission(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Permission</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
}
