'use client';

import { useEffect, useState } from 'react';

export function PawLoader({ text }: { text?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="relative w-64 h-24 flex items-center justify-center gap-8">
        {/* Paw 1 */}
        <PawPrint 
          className={`transform transition-opacity duration-300 ${
            step >= 1 ? 'opacity-100' : 'opacity-0'
          }`} 
        />
        
        {/* Paw 2 */}
        <PawPrint 
          className={`transform transition-opacity duration-300 ${
            step >= 2 ? 'opacity-100' : 'opacity-0'
          } mt-[-20px]`} 
        />
        
        {/* Paw 3 */}
        <PawPrint 
          className={`transform transition-opacity duration-300 ${
            step >= 3 ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      </div>
      {text && (
        <p className="mt-8 text-textPrimary text-lg font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

function PawPrint({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      className={`${className} text-primary fill-current`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Pad */}
      <path d="M50 55 C 35 55 25 65 25 75 C 25 85 35 95 50 95 C 65 95 75 85 75 75 C 75 65 65 55 50 55 Z" />
      
      {/* Toes */}
      <ellipse cx="20" cy="45" rx="12" ry="15" transform="rotate(-20 20 45)" />
      <ellipse cx="40" cy="35" rx="12" ry="15" transform="rotate(-10 40 35)" />
      <ellipse cx="60" cy="35" rx="12" ry="15" transform="rotate(10 60 35)" />
      <ellipse cx="80" cy="45" rx="12" ry="15" transform="rotate(20 80 45)" />
    </svg>
  );
}

