'use client';

// Owner: Member B (Systems & Security)
// AuthGuard: Enforces mandatory login before accessing application routes
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const isPublic = pathname === '/login' || pathname === '/signup';
    const currentUser = authService.getCurrentUser();

    if (!isPublic && !currentUser) {
      setIsAuthenticated(false);
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  const isPublic = pathname === '/login' || pathname === '/signup';

  if (!isPublic && isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs font-mono space-y-2">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Authentication required. Redirecting to login...</span>
      </div>
    );
  }

  return <>{children}</>;
};
