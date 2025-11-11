// components/auth/RoleGuard.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { routeForRole } from '@/lib/role-routing';

export function RoleGuard({
  allow,
  children,
}: {
  allow: string[];
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, refreshUser, isLoading } = useAuth();
  const router = useRouter();

  // Track if we've attempted a bootstrap refresh after mount
  const triedBootstrap = useRef(false);
  const [mounted, setMounted] = useState(false);

  // simple client-only token check (avoids redirect while store rehydrates)
  const hasStoredToken = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }, [mounted]); // recompute after mount

  useEffect(() => setMounted(true), []);

  // Bootstrap: if there is a token but no user yet, fetch once
  useEffect(() => {
    if (!mounted) return;
    if (triedBootstrap.current) return;

    if (hasStoredToken && !user) {
      triedBootstrap.current = true;
      // fire and forget; RoleGuard will re-evaluate when store updates
      refreshUser().catch(() => {
        /* ignore; redirect logic will handle later */
      });
    }
  }, [mounted, hasStoredToken, user, refreshUser]);

  // Redirect only when we’re sure:
  // - no token AND not authenticated AND not loading -> login
  useEffect(() => {
    if (!mounted) return;

    // still loading or we have a token but haven’t fetched user yet → wait
    if (isLoading) return;
    if (hasStoredToken && !user) return;

    if (!isAuthenticated && !hasStoredToken) {
      router.replace('/auth/login');
      return;
    }

    if (user && !allow.includes(user.role)) {
      router.replace(routeForRole(user.role));
    }
  }, [mounted, isLoading, isAuthenticated, hasStoredToken, user, allow, router]);

  // Guarded content: show nothing (or a skeleton) until we know
  const ready =
    mounted &&
    ((isAuthenticated && user && allow.includes(user.role)) ||
      // allow interim render while token exists & we’re fetching user
      (hasStoredToken && !user));

  if (!ready) {
    // optional: return a small skeleton to avoid blank screen
    return <div className="h-[40vh] grid place-items-center text-muted-foreground">Chargement…</div>;
  }

  return <>{children}</>;
}
