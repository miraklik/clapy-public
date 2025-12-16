'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/user/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (res.ok) {
          setIsAuthorized(true);
          setIsLoading(false);
        } else {
          const loginUrl = `/login?from=${encodeURIComponent(pathname)}`;
          router.replace(loginUrl);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        const loginUrl = `/login?from=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-500 opacity-50" />
          </div>
        </div>
        <p className="mt-4 text-slate-500 font-mono text-sm animate-pulse">
          Verifying access...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}