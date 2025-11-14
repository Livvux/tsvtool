'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { Authenticated, Unauthenticated, useConvexAuth } from 'convex/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect nach erfolgreicher Authentifizierung
  // Der Proxy wird automatisch weiterleiten, aber wir können auch client-seitig redirecten
  useEffect(() => {
    if (isAuthenticated) {
      // Kurze Verzögerung, damit der Auth-State vollständig synchronisiert ist
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('flow', flow);
      if (flow === 'signUp' && name) {
        formData.append('name', name);
      }

      // signIn authentifiziert den Benutzer
      await signIn('password', formData);
      
      // Der useEffect übernimmt den Redirect, sobald isAuthenticated true ist
      // setLoading wird nicht zurückgesetzt, da die Komponente unmountet wird
    } catch (err) {
      logger.error('Login error', err instanceof Error ? err : new Error(String(err)), { flow, email });
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorString = String(err);
      
      if (flow === 'signIn') {
        if (errorMessage.includes('Invalid password') || errorMessage.includes('Invalid credential') || errorString.includes('Invalid password') || errorString.includes('Invalid credential')) {
          setError('Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.');
        } else if (errorMessage.includes('InvalidAccountId') || errorString.includes('InvalidAccountId')) {
          setError('Kein Konto mit dieser E-Mail-Adresse gefunden. Bitte registrieren Sie sich zuerst.');
        } else {
          setError(`Login fehlgeschlagen: ${errorMessage || errorString}`);
        }
      } else {
        if (errorMessage.includes('Invalid password') || errorString.includes('Invalid password')) {
          setError('Das Passwort erfüllt nicht die Anforderungen. Es muss mindestens 8 Zeichen lang sein und Groß- und Kleinbuchstaben sowie Zahlen enthalten.');
        } else if (errorMessage.includes('email') || errorMessage.includes('Email') || errorString.includes('email') || errorString.includes('Email')) {
          setError('Registrierung fehlgeschlagen. Die E-Mail-Adresse ist möglicherweise bereits registriert.');
        } else {
          setError(`Registrierung fehlgeschlagen: ${errorMessage || errorString}`);
        }
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Authenticated>
        {/* Wenn bereits authentifiziert, wird der Proxy automatisch weiterleiten */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-textPrimary">Sie werden weitergeleitet...</p>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md">
        <CardHeader className="space-y-3 pb-8 pt-10 px-8">
          <div className="text-center space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-[#09202C] to-[#5C82A1] bg-clip-text text-transparent tracking-tight">
              TSV Strassenpfoten
            </CardTitle>
            <CardDescription className="text-base text-slate-600 mt-3">
              {flow === 'signIn'
                ? 'Melden Sie sich an, um das Tierverwaltungs-Tool zu verwenden'
                : 'Erstellen Sie ein neues Konto'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {flow === 'signUp' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ihr Name"
                  required
                  className="h-12 border-slate-300 focus:border-[#5C82A1] focus:ring-2 focus:ring-[#5C82A1]/20 transition-all shadow-sm"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">
                E-Mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="h-12 border-slate-300 focus:border-[#5C82A1] focus:ring-2 focus:ring-[#5C82A1]/20 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">
                Passwort
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 border-slate-300 focus:border-[#5C82A1] focus:ring-2 focus:ring-[#5C82A1]/20 transition-all shadow-sm"
              />
            </div>
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-[#5C82A1] hover:bg-[#4a6d8a] text-white shadow-lg hover:shadow-xl transition-all duration-200 mt-6"
              disabled={loading}
            >
              {loading
                ? flow === 'signIn'
                  ? 'Anmeldung läuft...'
                  : 'Registrierung läuft...'
                : flow === 'signIn'
                  ? 'Anmelden'
                  : 'Registrieren'}
            </Button>
            <div className="text-center pt-4">
              {flow === 'signIn' ? (
                <button
                  type="button"
                  onClick={() => {
                    setFlow('signUp');
                    setError('');
                  }}
                  className="text-sm text-[#5C82A1] hover:text-[#09202C] font-medium transition-colors hover:underline"
                >
                  Noch kein Konto? Registrieren
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFlow('signIn');
                    setError('');
                  }}
                  className="text-sm text-[#5C82A1] hover:text-[#09202C] font-medium transition-colors hover:underline"
                >
                  Bereits ein Konto? Anmelden
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </Unauthenticated>
    </>
  );
}

