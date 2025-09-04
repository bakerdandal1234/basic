import React, { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "../components/ui/dialog";

interface Permission {
  id: string;
  name: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

const allPossiblePermissions = ['read', 'write', 'update', 'delete', 'manage_users', 'manage_roles']; // Define all possible permissions

const RoleManagementPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/roles');
      setRoles(response.data.roles);
    } catch (err: unknown) {
      console.error("Error fetching roles:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/roles', { name: newRoleName, permissions: newRolePermissions });
      setNewRoleName('');
      setNewRolePermissions([]);
      fetchRoles();
    } catch (err: unknown) {
      console.error("Error creating role:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await axios.put(`/roles/${editingRole._id}`, { name: editingRole.name, permissions: editingRole.permissions });
      setEditingRole(null);
      fetchRoles();
    } catch (err: unknown) {
      console.error("Error updating role:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`/roles/${roleId}`);
        fetchRoles();
      } catch (err: unknown) {
        console.error("Error deleting role:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    }
  };

  const handleNewRolePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setNewRolePermissions(prev =>
      checked ? [...prev, value] : prev.filter(p => p !== value)
    );
  };

  const handleEditingRolePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setEditingRole(prev => {
      if (!prev) return null;
      const newPermissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value);
      return { ...prev, permissions: newPermissions };
    });
  };

  if (loading) return <div className="text-center py-8">Loading roles...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full px-4 py-8 dark:bg-gray-900 dark:text-white min-h-screen">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold dark:text-white">Role Management</CardTitle>
          <div className="flex justify-center mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create New Role</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRole} className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role Name</label>
                    <Input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Permissions</label>
                    <div className="mt-1 space-y-2">
                      {allPossiblePermissions.map(permission => (
                        <label key={permission} className="inline-flex items-center mr-4">
                          <input
                            type="checkbox"
                            value={permission}
                            checked={newRolePermissions.includes(permission)}
                            onChange={handleNewRolePermissionChange}
                            className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                          />
                          <span className="ml-2 dark:text-gray-200">{permission.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Role</Button>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Role Name</th>
                  <th className="py-3 px-6 text-left">Permissions</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                {roles.map(role => (
                  <tr key={role._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{role.name}</td>
                    <td className="py-3 px-6 text-left">{role.permissions.join(', ')}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <Dialog open={editingRole?._id === role._id} onOpenChange={(open) => !open && setEditingRole(null)}>
                          <DialogTrigger asChild>
                            <Button onClick={() => setEditingRole({ ...role })} className="mr-2" variant="default">Edit</Button>
                          </DialogTrigger>
                          {editingRole && editingRole._id === role._id && (
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Edit Role: {editingRole.name}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleUpdateRole} className="space-y-4 py-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role Name</label>
                                  <Input
                                    type="text"
                                    value={editingRole.name}
                                    onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Permissions</label>
                                  <div className="mt-1 space-y-2">
                                    {allPossiblePermissions.map(permission => (
                                      <label key={permission} className="inline-flex items-center mr-4">
                                        <input
                                          type="checkbox"
                                          value={permission}
                                          checked={editingRole.permissions.includes(permission)}
                                          onChange={handleEditingRolePermissionChange}
                                          className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                                        />
                                        <span className="ml-2 dark:text-gray-200">{permission.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit">Save Changes</Button>
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          )}
                        </Dialog>
                        <Button onClick={() => handleDeleteRole(role._id)} variant="destructive">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagementPage;
