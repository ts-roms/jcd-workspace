"use client";

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { PlusIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useHeader } from '@/lib/contexts/HeaderContext';
import { useSystemAdmin } from '@/lib/hooks/useSystemAdmin';
import { useAdminOrSystemAdmin } from '@/lib/hooks/useAdminOrSystemAdmin';
import { useAlert } from '@/lib/contexts/AlertContext';
import { usePermission } from '@/lib/hooks/usePermission';

// Type Definitions
interface Permission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: Permission[];
  isSystemRole: boolean;
  userCount?: number;
}

interface CreateRoleFormData {
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: string[];
}

// Child Component for rendering a category of permissions
const PermissionCategory = ({ category, perms, roleId, checkedPermissions, onPermissionChange, disabled }: {
  category: string;
  perms: Permission[];
  roleId: string;
  checkedPermissions: string[];
  onPermissionChange: (roleId: string, permissionId: string, checked: boolean) => void;
  disabled: boolean;
}) => (
  <div key={category}>
    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {category}
    </h5>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {perms.map((perm) => (
        <div key={perm._id} className="flex items-center gap-2">
          <Checkbox
            id={`perm-${roleId}-${perm._id}`}
            checked={checkedPermissions.includes(perm._id)}
            onCheckedChange={(checked) => onPermissionChange(roleId, perm._id, !!checked)}
            disabled={disabled}
          />
          <label
            htmlFor={`perm-${roleId}-${perm._id}`}
            className={`text-sm font-medium ${disabled ? 'text-gray-900' : 'text-gray-800 dark:text-gray-900 cursor-pointer'}`}
          >
            {perm.displayName}
          </label>
        </div>
      ))}
    </div>
  </div>
);

// Child Component for a single role's accordion item
const RoleAccordionItem = ({ role, groupedPermissions, editingPermissions, onPermissionChange, onSaveChanges, onDelete, isSystemAdmin }: {
  role: Role;
  groupedPermissions: Record<string, Permission[]>;
  editingPermissions: string[];
  onPermissionChange: (roleId: string, permissionId: string, checked: boolean) => void;
  onSaveChanges: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  isSystemAdmin: boolean;
}) => {
  const isModificationDisabled = role.isSystemRole && !isSystemAdmin;
  const canManageRole = !role.isSystemRole || isSystemAdmin;

  return (
    <AccordionItem value={role._id} key={role._id}>
      <AccordionTrigger>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {role.displayName}
            </h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Hierarchy: {role.hierarchy}
            </span>
            {role.isSystemRole && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                System Role
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {role.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {editingPermissions.length} permissions
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-750">
          {isModificationDisabled && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ This is a system role. Only System Administrators can modify it.
              </p>
            </div>
          )}
          {canManageRole && (
            <>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Edit Permissions
              </h4>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <PermissionCategory
                    key={category}
                    category={category}
                    perms={perms}
                    roleId={role._id}
                    checkedPermissions={editingPermissions}
                    onPermissionChange={onPermissionChange}
                    disabled={isModificationDisabled}
                  />
                ))}
              </div>
            </>
          )}
          <div className="mt-6 flex justify-between">
            {canManageRole && (
              <PermissionGate permission={PERMISSIONS.ROLES_DELETE}>
                <Button
                  variant="destructive"
                  onClick={() => onDelete(role._id)}
                >
                  Delete Role
                </Button>
              </PermissionGate>
            )}
            {canManageRole && (
              <PermissionGate permission={PERMISSIONS.ROLES_UPDATE}>
                <Button onClick={() => onSaveChanges(role._id)}>
                  Save Changes
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Main Page Component
export default function RolesPage() {
  const { setTitle } = useHeader();
  const isSystemAdmin = useSystemAdmin();
  const alert = useAlert();
  const canDeleteRole = usePermission(PERMISSIONS.ROLES_DELETE);
  const canUpdateRole = usePermission(PERMISSIONS.ROLES_UPDATE);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>();
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateRoleFormData>({
    name: '',
    displayName: '',
    description: '',
    hierarchy: 1,
    permissions: [],
  });

  useEffect(() => {
    setTitle('Role Management');
  }, [setTitle]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        axiosInstance.get('/roles'),
        axiosInstance.get('/permissions'),
      ]);

      const fetchedRoles = rolesRes.data.roles;
      setRoles(fetchedRoles);
      const initialEditingState: Record<string, string[]> = {};
      fetchedRoles.forEach((role: Role) => {
        initialEditingState[role._id] = role.permissions.map(p => p._id);
      });
      setEditingPermissions(initialEditingState);

      setAllPermissions(permissionsRes.data.permissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert.showError('Failed to load roles and permissions.', {
        title: 'Load Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setEditingPermissions(prev => {
      const currentPermissions = prev[roleId] || [];
      if (checked) {
        return { ...prev, [roleId]: [...currentPermissions, permissionId] };
      } else {
        return { ...prev, [roleId]: currentPermissions.filter(id => id !== permissionId) };
      }
    });
  };

  const handleSaveChanges = async (roleId: string) => {
    if (!canUpdateRole) {
      alert.showWarning('You do not have permission to update roles.');
      return;
    }
    const role = roles.find(r => r._id === roleId);
    if (role?.isSystemRole && !isSystemAdmin) {
      alert.showWarning('Only System Administrators can update system roles.');
      return;
    }

    try {
      const permissionsToSave = editingPermissions[roleId] || [];
      const payload = { permissions: permissionsToSave };
      await axiosInstance.put(`/roles/${roleId}`, payload);
      toast.success('Role updated successfully');
      await fetchData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      alert.showError(errorMessage, { title: 'Update Failed' });
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!canDeleteRole) {
      alert.showWarning('You do not have permission to delete roles.');
      return;
    }
    const role = roles.find(r => r._id === roleId);
    if (role?.isSystemRole && !isSystemAdmin) {
      alert.showWarning('Only System Administrators can delete system roles.');
      return;
    }
    alert.showConfirm('Are you sure you want to delete this role? This action cannot be undone.', {
      title: 'Delete Role',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/roles/${roleId}`);
          toast.success('Role deleted successfully');
          await fetchData();
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Failed to delete role';
          alert.showError(errorMessage, { title: 'Delete Failed' });
        }
      },
    });
  };

  const handleCreateRole = async () => {
    if (!createFormData.name || !createFormData.displayName) {
      alert.showWarning('Name and Display Name are required');
      return;
    }
    if (createFormData.hierarchy < 1) {
      alert.showWarning('Hierarchy must be at least 1');
      return;
    }

    try {
      await axiosInstance.post('/roles', createFormData);
      toast.success('Role created successfully');
      setIsCreateDialogOpen(false);
      resetCreateForm();
      await fetchData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create role';
      alert.showError(errorMessage, { title: 'Create Failed' });
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      displayName: '',
      description: '',
      hierarchy: 1,
      permissions: [],
    });
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: name === 'hierarchy' ? parseInt(value) || 1 : value,
    }));
  };

  const handleCreatePermissionToggle = (permissionId: string) => {
    setCreateFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const groupedAllPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center">Loading...</div>;
    }
    return (
      <Accordion type="single" collapsible className="w-full" value={openAccordionItem} onValueChange={setOpenAccordionItem}>
        {roles.map((role) => (
          <RoleAccordionItem
            key={role._id}
            role={role}
            groupedPermissions={groupedAllPermissions}
            editingPermissions={editingPermissions[role._id] || []}
            onPermissionChange={handlePermissionChange}
            onSaveChanges={handleSaveChanges}
            onDelete={handleDelete}
            isSystemAdmin={isSystemAdmin}
          />
        ))}
      </Accordion>
    );
  };

  return (
    <PermissionGate permission={PERMISSIONS.ROLES_READ}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <PermissionGate permission={PERMISSIONS.ROLES_CREATE}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </PermissionGate>
        </div>
        {renderContent()}
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetCreateForm();
        }}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Create a new role with specific permissions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name (Internal) *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateFormChange}
                  placeholder="e.g., content_manager"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name *
                </label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={createFormData.displayName}
                  onChange={handleCreateFormChange}
                  placeholder="e.g., Content Manager"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  value={createFormData.description}
                  onChange={handleCreateFormChange}
                  placeholder="Role description"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="hierarchy" className="text-sm font-medium">
                  Hierarchy Level *
                </label>
                <Input
                  id="hierarchy"
                  name="hierarchy"
                  type="number"
                  min="1"
                  value={createFormData.hierarchy}
                  onChange={handleCreateFormChange}
                  placeholder="1"
                />
                <p className="text-xs text-gray-500">
                  Higher hierarchy can manage lower hierarchy roles
                </p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Permissions</label>
                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  {Object.entries(groupedAllPermissions).map(([category, perms]) => (
                    <div key={category} className="mb-4 last:mb-0">
                      <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        {category}
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {perms.map((perm) => (
                          <div key={perm._id} className="flex items-center gap-2">
                            <Checkbox
                              id={`create-perm-${perm._id}`}
                              checked={createFormData.permissions.includes(perm._id)}
                              onCheckedChange={() => handleCreatePermissionToggle(perm._id)}
                            />
                            <label
                              htmlFor={`create-perm-${perm._id}`}
                              className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
                            >
                              {perm.displayName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateRole}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
}
