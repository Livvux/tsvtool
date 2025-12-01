'use client';

import { inviteUser, type InviteUserResult } from '@/app/actions/invite-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { logger } from '@/lib/logger';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

export default function UsersPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const users = useQuery(
    api.users.list,
    isAuthenticated ? undefined : 'skip'
  );
  const updateRole = useMutation(api.users.updateRole);
  const deleteUser = useMutation(api.users.remove);
  const [loading, setLoading] = useState<string | null>(null);
  
  // Invitation form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'input' | 'manager'>('input');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);
    setInviteLoading(true);

    try {
      const result: InviteUserResult = await inviteUser(inviteEmail, inviteRole);
      
      if (result.success) {
        setInviteSuccess(true);
        setInviteEmail('');
        setInviteRole('input');
        // Hide form after 2 seconds
        setTimeout(() => {
          setShowInviteForm(false);
          setInviteSuccess(false);
        }, 2000);
      } else {
        setInviteError(result.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      logger.error('Error inviting user', error instanceof Error ? error : new Error(String(error)), {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteError('Fehler beim Einladen des Benutzers');
    } finally {
      setInviteLoading(false);
    }
  };

  if (isLoading || users === undefined) {
    return <div>Laden...</div>;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-gray-800 dark:text-gray-300';
      case 'input':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
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
        <Button
          onClick={() => {
            setShowInviteForm(!showInviteForm);
            setInviteError(null);
            setInviteSuccess(false);
          }}
          variant={showInviteForm ? 'outline' : 'default'}
        >
          {showInviteForm ? 'Abbrechen' : 'Benutzer einladen'}
        </Button>
      </div>

      {/* Invitation Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Neuen Benutzer einladen</CardTitle>
            <CardDescription>
              Laden Sie einen neuen Benutzer per E-Mail ein. Die Einladung wird automatisch per E-Mail versendet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="benutzer@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={inviteLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rolle</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(value: 'admin' | 'input' | 'manager') => setInviteRole(value)}
                  disabled={inviteLoading}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="input">Eingabe</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inviteError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md">
                  Einladung erfolgreich versendet! Der Benutzer erhält eine E-Mail mit Anmeldeinformationen.
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={inviteLoading}>
                  {inviteLoading ? 'Wird gesendet...' : 'Einladung senden'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteError(null);
                    setInviteSuccess(false);
                    setInviteEmail('');
                    setInviteRole('input');
                  }}
                  disabled={inviteLoading}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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

