'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PawLoader } from '@/components/layout/PawLoader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/convex/_generated/api';
import { useAdminGuard } from '@/lib/hooks/useAdminGuard';
import { useQuery } from 'convex/react';
import { useState } from 'react';

type AuditAction =
  | 'ANIMAL_CREATE'
  | 'ANIMAL_UPDATE'
  | 'ANIMAL_DELETE'
  | 'ANIMAL_STATUS_CHANGE'
  | 'USER_CREATE'
  | 'USER_UPDATE_ROLE'
  | 'USER_DELETE'
  | 'USER_INVITE'
  | 'VALIDATION_SUCCESS'
  | 'VALIDATION_FAILURE'
  | 'TRANSLATION_SUCCESS'
  | 'TRANSLATION_FAILURE'
  | 'DISTRIBUTION_SUCCESS'
  | 'DISTRIBUTION_FAILURE'
  | 'MATCHPFOTE_SYNC_SUCCESS'
  | 'MATCHPFOTE_SYNC_FAILURE'
  | 'ACCESS_DENIED'
  | 'RATE_LIMIT_EXCEEDED';

type TargetType = 'animal' | 'user' | 'invitation' | 'system';

const ACTION_LABELS: Record<AuditAction, string> = {
  ANIMAL_CREATE: 'Tier erstellt',
  ANIMAL_UPDATE: 'Tier aktualisiert',
  ANIMAL_DELETE: 'Tier gelöscht',
  ANIMAL_STATUS_CHANGE: 'Status geändert',
  USER_CREATE: 'Benutzer erstellt',
  USER_UPDATE_ROLE: 'Rolle geändert',
  USER_DELETE: 'Benutzer gelöscht',
  USER_INVITE: 'Einladung gesendet',
  VALIDATION_SUCCESS: 'Validierung erfolgreich',
  VALIDATION_FAILURE: 'Validierung fehlgeschlagen',
  TRANSLATION_SUCCESS: 'Übersetzung erfolgreich',
  TRANSLATION_FAILURE: 'Übersetzung fehlgeschlagen',
  DISTRIBUTION_SUCCESS: 'Verteilung erfolgreich',
  DISTRIBUTION_FAILURE: 'Verteilung fehlgeschlagen',
  MATCHPFOTE_SYNC_SUCCESS: 'matchpfote Sync erfolgreich',
  MATCHPFOTE_SYNC_FAILURE: 'matchpfote Sync fehlgeschlagen',
  ACCESS_DENIED: '🔒 Zugriff verweigert',
  RATE_LIMIT_EXCEEDED: '⏱️ Rate Limit überschritten',
};

const TARGET_LABELS: Record<TargetType, string> = {
  animal: 'Tier',
  user: 'Benutzer',
  invitation: 'Einladung',
  system: 'System',
};

function getActionBadgeColor(action: AuditAction): string {
  if (action.includes('FAILURE')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  if (action.includes('SUCCESS')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  if (action.includes('DELETE')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  }
  if (action.includes('CREATE') || action.includes('INVITE')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
}

export default function AuditLogsPage() {
  // Admin guard - redirects non-admins to dashboard
  const { isLoading: isGuardLoading, isAdmin } = useAdminGuard();
  
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [targetFilter, setTargetFilter] = useState<TargetType | 'all'>('all');
  const [cursor, setCursor] = useState<number | undefined>(undefined);

  const logsResult = useQuery(
    api.auditLog.list,
    isAdmin
      ? {
          action: actionFilter === 'all' ? undefined : actionFilter,
          targetType: targetFilter === 'all' ? undefined : targetFilter,
          limit: 50,
          cursor,
        }
      : 'skip'
  );

  const stats = useQuery(
    api.auditLog.getStats,
    isAdmin ? { days: 7 } : 'skip'
  );

  // Show loading while checking admin status
  if (isGuardLoading) {
    return <PawLoader text="Berechtigungen werden geprüft..." />;
  }

  // If not admin, the hook will redirect - show nothing while redirecting
  if (!isAdmin) {
    return <PawLoader text="Weiterleitung..." />;
  }

  if (!logsResult) {
    return <PawLoader text="Audit Logs werden geladen..." />;
  }

  const { logs, nextCursor } = logsResult;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Audit Logs</h1>
        <p className="text-textPrimary mt-2">
          Protokoll aller Systemaktionen und Änderungen
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Letzte 7 Tage</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Aktionen gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Erfolgreich</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.successCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Erfolgreiche Aktionen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Fehler</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.errorCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Fehlgeschlagene Aktionen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tiere</CardDescription>
              <CardTitle className="text-2xl">{stats.targetCounts.animal || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tier-bezogene Aktionen</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-64">
              <label className="text-sm font-medium mb-2 block">Aktion</label>
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  setActionFilter(value as AuditAction | 'all');
                  setCursor(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Aktionen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktionen</SelectItem>
                  {Object.entries(ACTION_LABELS).map(([value, label]: [string, string]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Zieltyp</label>
              <Select
                value={targetFilter}
                onValueChange={(value) => {
                  setTargetFilter(value as TargetType | 'all');
                  setCursor(undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Typen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  {Object.entries(TARGET_LABELS).map(([value, label]: [string, string]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(actionFilter !== 'all' || targetFilter !== 'all') && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionFilter('all');
                    setTargetFilter('all');
                    setCursor(undefined);
                  }}
                >
                  Filter zurücksetzen
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Keine Audit-Logs gefunden
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={getActionBadgeColor(log.action as AuditAction)}>
                        {ACTION_LABELS[log.action as AuditAction] || log.action}
                      </Badge>
                      <Badge variant="outline">
                        {TARGET_LABELS[log.targetType as TargetType] || log.targetType}
                      </Badge>
                      {log.targetName && (
                        <span className="text-sm font-medium text-foreground">
                          {log.targetName}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {log.userName || log.userEmail ? (
                        <p>
                          von{' '}
                          <span className="font-medium text-foreground">
                            {log.userName || log.userEmail}
                          </span>
                        </p>
                      ) : (
                        <p className="italic">System-Aktion</p>
                      )}
                      {(log.previousValue || log.newValue) && (
                        <p>
                          {log.previousValue && (
                            <span className="text-red-600 line-through mr-2">
                              {log.previousValue}
                            </span>
                          )}
                          {log.newValue && (
                            <span className="text-green-600">→ {log.newValue}</span>
                          )}
                        </p>
                      )}
                      {log.details && <LogDetails details={log.details} />}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{formatRelativeTime(log.timestamp)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setCursor(nextCursor)}>
            Mehr laden
          </Button>
        </div>
      )}
    </div>
  );
}

function LogDetails({ details }: { details: string }) {
  try {
    const parsed = JSON.parse(details) as Record<string, unknown>;
    const entries = Object.entries(parsed);
    
    if (entries.length === 0) return null;

    return (
      <div className="mt-2 p-2 bg-muted rounded-md text-xs">
        {entries.map(([key, value]: [string, unknown]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium text-muted-foreground">{key}:</span>
            <span className="text-foreground">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  } catch {
    return <p className="text-xs text-muted-foreground">{details}</p>;
  }
}

