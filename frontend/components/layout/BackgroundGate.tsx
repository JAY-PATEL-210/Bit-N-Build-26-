'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import GatewayFlow from '@/components/ui/gateway-flow';

// Routes to exclude from rendering the GatewayFlow background
// - The root entry point /
// - The login hero / launch page (/login)
// - The registration page (/signup)
const EXCLUDED_ROUTES = ['/', '/login', '/signup'];

interface BackgroundGateProps {
  children: React.ReactNode;
}

export function BackgroundGate({ children }: BackgroundGateProps) {
  const pathname = usePathname();

  // Check if current route is in excluded list (or sub-path if needed)
  const isExcluded = EXCLUDED_ROUTES.includes(pathname);

  return (
    <>
      {!isExcluded && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 h-full w-full pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          <GatewayFlow
            className="h-full w-full"
            opacity={0.75}
            speed={1}
            density={0.9}
          />
        </div>
      )}
      {children}
    </>
  );
}

export default BackgroundGate;
