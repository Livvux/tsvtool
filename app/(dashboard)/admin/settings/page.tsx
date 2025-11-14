'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Einstellungen</h1>
        <p className="text-textPrimary mt-2">
          System-Konfiguration und Einstellungen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API-Konfiguration</CardTitle>
          <CardDescription>
            Verwalten Sie API-Schlüssel und externe Integrationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-textPrimary">
            <p>• Google Translate API</p>
            <p>• WordPress (Avada Portfolio)</p>
            <p>• Facebook Graph API</p>
            <p>• Instagram Graph API</p>
            <p>• X (Twitter) API</p>
            <p>• matchpfote API</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System-Informationen</CardTitle>
          <CardDescription>
            Informationen über das System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-textPrimary">
            <p>Version: 1.0.0</p>
            <p>Stack: Next.js 16 + Convex</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

