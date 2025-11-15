'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Car, LogOut } from 'lucide-react';
import { AvailabilityToggle } from './AvailabilityToggle';
import { useAuthStore } from '@/lib/store/auth-store';
import { DriverSidebarLinks } from './DriverSidebar';

// utilitaire local
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function DriverTopbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [ouvert, setOuvert] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl h-[56px] px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Marque + menu mobile */}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50"
              onClick={() => setOuvert((s) => !s)}
              aria-label="Ouvrir/fermer le menu"
            >
              {ouvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/driver/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Car className="h-4 w-4" />
              </span>
              <span className="font-semibold tracking-tight">Console Chauffeur</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Bascule de disponibilité (met à jour /driver/availability) */}
            <AvailabilityToggle />

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation mobile */}
      {ouvert && (
        <div className="lg:hidden border-b bg-white">
          <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2">
            <ul className="flex flex-col gap-1">
              {DriverSidebarLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    onClick={() => setOuvert(false)}
                    href={l.href}
                    className={cx(
                      'block rounded-lg px-3 py-2 text-sm hover:bg-gray-50',
                      pathname?.startsWith(l.href) ? 'bg-gray-100 font-medium' : 'text-gray-700'
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <l.icon className="h-4 w-4" />
                      {l.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
