'use client';

import { useState, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ApiStatus = 'configured' | 'not_configured' | 'error' | 'checking';

interface ApiCheckResult {
  name: string;
  status: ApiStatus;
  configured: boolean;
  message: string;
  lastChecked?: number;
}

// Status badge styling
function getStatusBadge(status: ApiStatus) {
  switch (status) {
    case 'configured':
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">✓ Verbunden</Badge>;
    case 'not_configured':
      return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">⚠ Nicht konfiguriert</Badge>;
    case 'error':
      return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">✗ Fehler</Badge>;
    case 'checking':
      return <Badge className="bg-gray-500/20 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-500/30 dark:border-gray-700">⏳ Prüfe...</Badge>;
    default:
      return <Badge variant="outline">Unbekannt</Badge>;
  }
}

// API icon based on name
function getApiIcon(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('übersetzung') || lowerName.includes('translate')) {
    return '🌐';
  }
  switch (lowerName) {
    case 'wordpress':
      return '📝';
    case 'facebook':
      return '📘';
    case 'instagram':
      return '📸';
    case 'x (twitter)':
      return '🐦';
    case 'matchpfote':
      return '🐾';
    case 'cloudflare r2':
      return '☁️';
    case 'convex':
      return '⚡';
    default:
      return '🔌';
  }
}

export default function SettingsPage() {
  const [apiStatuses, setApiStatuses] = useState<ApiCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastFullCheck, setLastFullCheck] = useState<Date | null>(null);
  
  const checkAllApiStatus = useAction(api.apiStatus.checkAllApiStatus);

  // Initial load - show placeholder states
  useEffect(() => {
    setApiStatuses([
      { name: 'Übersetzung', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'WordPress', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'Facebook', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'Instagram', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'X (Twitter)', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'matchpfote', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'Cloudflare R2', status: 'checking', configured: false, message: 'Wird geprüft...' },
      { name: 'Convex', status: 'checking', configured: false, message: 'Wird geprüft...' },
    ]);
    
    // Auto-check on mount
    handleCheckAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckAll = async () => {
    setIsChecking(true);
    
    // Set all to checking state
    setApiStatuses(prev => prev.map(api => ({ ...api, status: 'checking' as ApiStatus, message: 'Wird geprüft...' })));
    
    try {
      const results = await checkAllApiStatus({});
      setApiStatuses(results);
      setLastFullCheck(new Date());
    } catch (error) {
      console.error('Failed to check API status:', error);
      setApiStatuses(prev => prev.map(api => ({ 
        ...api, 
        status: 'error' as ApiStatus, 
        message: 'Prüfung fehlgeschlagen' 
      })));
    } finally {
      setIsChecking(false);
    }
  };

  // Count statuses
  const configuredCount = apiStatuses.filter(api => api.status === 'configured').length;
  const errorCount = apiStatuses.filter(api => api.status === 'error').length;
  const notConfiguredCount = apiStatuses.filter(api => api.status === 'not_configured').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-accent">Einstellungen</h1>
          <p className="text-textPrimary mt-2">
            System-Konfiguration und API-Status
          </p>
        </div>
        <Button 
          onClick={handleCheckAll} 
          disabled={isChecking}
          className="bg-primary hover:bg-primary/90"
        >
          {isChecking ? '⏳ Prüfe...' : '🔄 Alle prüfen'}
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-green-600">{configuredCount}</div>
              <div className="text-sm text-green-700">Verbunden</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-yellow-600">{notConfiguredCount}</div>
              <div className="text-sm text-yellow-700">Nicht konfiguriert</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Fehler</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Status Cards */}
      <Card>
        <CardHeader>
          <CardTitle>API-Konfiguration</CardTitle>
          <CardDescription>
            Status aller externen API-Integrationen
            {lastFullCheck && (
              <span className="ml-2 text-xs text-muted-foreground">
                (Letzte Prüfung: {lastFullCheck.toLocaleTimeString('de-DE')})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiStatuses.map((api) => (
              <div 
                key={api.name}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getApiIcon(api.name)}</span>
                  <div>
                    <div className="font-medium text-accent">{api.name}</div>
                    <div className="text-sm text-muted-foreground">{api.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(api.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Konfiguration</CardTitle>
          <CardDescription>
            Anleitung zur Einrichtung der APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-lg bg-muted dark:bg-gray-800/50 border border-border">
              <h4 className="font-semibold text-foreground dark:text-gray-300 mb-2">📋 Umgebungsvariablen</h4>
              <p className="text-textPrimary dark:text-gray-400">
                API-Schlüssel werden über Convex-Umgebungsvariablen konfiguriert. 
                Verwenden Sie <code className="bg-background dark:bg-gray-800 px-1.5 py-0.5 rounded border border-border text-foreground dark:text-gray-300">npx convex env set VARIABLE_NAME value</code> um Werte zu setzen.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">Übersetzung</h5>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div><code>TRANSLATION_SERVICE</code> = google | microsoft</div>
                  <div className="text-green-600">Google: <code>GOOGLE_TRANSLATE_API_KEY</code></div>
                  <div className="text-blue-600">Microsoft: <code>AZURE_TRANSLATOR_KEY</code>, <code>AZURE_TRANSLATOR_REGION</code></div>
                </div>
              </div>
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">WordPress</h5>
                <code className="text-xs text-muted-foreground">WORDPRESS_URL, WORDPRESS_APP_USERNAME, WORDPRESS_APP_PASSWORD</code>
              </div>
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">Facebook</h5>
                <code className="text-xs text-muted-foreground">FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN</code>
              </div>
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">Instagram</h5>
                <code className="text-xs text-muted-foreground">INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN</code>
              </div>
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">X (Twitter)</h5>
                <code className="text-xs text-muted-foreground">TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET</code>
              </div>
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">matchpfote</h5>
                <code className="text-xs text-muted-foreground">MATCHPFOTE_API_KEY, MATCHPFOTE_API_URL</code>
              </div>
              <div className="p-3 rounded border">
                <h5 className="font-medium mb-1">Cloudflare R2</h5>
                <code className="text-xs text-muted-foreground">R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System-Informationen</CardTitle>
          <CardDescription>
            Informationen über das System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded border">
              <div className="text-muted-foreground">Version</div>
              <div className="font-medium">1.0.0</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-muted-foreground">Framework</div>
              <div className="font-medium">Next.js 16</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-muted-foreground">Backend</div>
              <div className="font-medium">Convex</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-muted-foreground">Auth</div>
              <div className="font-medium">Clerk</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
