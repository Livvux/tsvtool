'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { logger } from '@/lib/logger';
import type { Id } from '@/convex/_generated/dataModel';

export default function UsersPage() {
  const users = useQuery(api.users.list);
  const updateRole = useMutation(api.users.updateRole);
  const deleteUser = useMutation(api.users.remove);
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleChange = async (userId: Id<'users'>, newRole: 'admin' | 'input' | 'manager') => {
    setLoading(userId);
    try {
      await updateRole({ userId, role: newRole });
    } catch (error) {
      logger.error('Error updating role', error instanceof Error ? error : new Error(String(error)), { userId, newRole });
      alert('Fehler beim Aktualisieren der Rolle');
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (userId: Id<'users'>) => {
    if (!confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;
    
    setLoading(userId);
    try {
      await deleteUser({ userId });
    } catch (error) {
      logger.error('Error deleting user', error instanceof Error ? error : new Error(String(error)), { userId });
      alert('Fehler beim Löschen des Benutzers');
    } finally {
      setLoading(null);
    }
  };

  if (!users) {
    return <div>Laden...</div>;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'input':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'input':
        return 'Eingabe';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Benutzerverwaltung</h1>
          <p className="text-textPrimary mt-2">
            Verwalten Sie Benutzer und deren Rollen
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{user.name || 'Kein Name'}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Rolle ändern:</label>
                  <Select
                    value={user.role}
                    onValueChange={(value: 'admin' | 'input' | 'manager') =>
                      handleRoleChange(user._id, value)
                    }
                    disabled={loading === user._id}
                  >
                    <SelectTrigger className="w-48 mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="input">Eingabe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user._id)}
                  disabled={loading === user._id}
                >
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-textPrimary">
            Keine Benutzer gefunden
          </CardContent>
        </Card>
      )}
    </div>
  );
}

