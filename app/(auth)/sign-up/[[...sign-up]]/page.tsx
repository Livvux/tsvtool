'use client';

import dynamic from 'next/dynamic';
import { PawLoader } from '@/components/layout/PawLoader';

// CACHE COMPONENTS FIX: Clerk SignUp accesses cookies during SSR/prerender
// Dynamic import with ssr: false prevents server-side rendering of this component
const SignUp = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignUp),
  { 
    ssr: false,
    loading: () => <PawLoader text="Laden..." />
  }
);

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-gray-900 dark:to-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#09202C] to-[#5C82A1] bg-clip-text text-transparent tracking-tight">
            TSV Strassenpfoten
          </h1>
          <p className="text-base text-slate-600 mt-3">
            Erstellen Sie ein Konto, um das Tierverwaltungs-Tool zu verwenden
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp routing="hash" />
        </div>
      </div>
    </div>
  );
}

