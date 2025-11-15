'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  UserCog,
  Route as RouteIcon,
  LifeBuoy,
  LogOut,
} from 'lucide-react';

// ---- Types
type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badgeKey?: 'availableRides' | 'notifications';
};

// ---- Links
export const DriverSidebarLinks: NavItem[] = [
  { href: '/driver/dashboard', label: 'Aperçu', icon: LayoutDashboard },
  { href: '/driver/dashboard/rides', label: 'Courses', icon: RouteIcon, badgeKey: 'availableRides' },
  { href: '/driver/dashboard/earnings', label: 'Gains', icon: Wallet },
  { href: '/driver/dashboard/profile', label: 'Profil', icon: UserCog },
];

// ---- Small utility (no external deps)
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

// Optionnel : passez via props des compteurs de badges
export function DriverSidebar(props: { counts?: { availableRides?: number; notifications?: number } }) {
  const pathname = usePathname();
  const counts = props.counts ?? {};

  // Actif si on est exactement sur la racine OU dans un sous-chemin
  const isActive = (href: string) => {
    if (href === '/driver/dashboard') {
      // actif sur /driver/dashboard exactement
      return pathname === href;
    }
    // actif sur les sous-sections ex: /driver/dashboard/rides/123
    return pathname?.startsWith(href);
  };

  return (
    <aside className="rounded-xl border bg-white p-3">
      <nav aria-label="Navigation chauffeur">
        <ul className="flex flex-col gap-1">
          {DriverSidebarLinks.map((l) => {
            const active = isActive(l.href);
            const Icon = l.icon;
            const badge =
              l.badgeKey && counts[l.badgeKey] ? (
                <span className="ml-auto inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {counts[l.badgeKey]}
                </span>
              ) : null;

            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cx(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                    active ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cx('h-4 w-4', active ? 'text-blue-600' : 'text-gray-500')} />
                  <span>{l.label}</span>
                  {badge}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Astuce */}
      <div className="mt-3 rounded-lg border bg-gradient-to-br from-blue-50 to-white p-3">
        <p className="text-xs font-medium text-blue-800">Astuce</p>
        <p className="mt-1 text-xs text-blue-700">
          Passez votre statut sur <b>En ligne</b> dans la barre du haut pour commencer à recevoir des demandes de course.
        </p>
      </div>

      {/* Bas de sidebar (facultatif) */}
      <div className="mt-3 space-y-1">
        <Link
          href="/support"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
        >
          <LifeBuoy className="h-4 w-4 text-gray-500" />
          Aide & Support
        </Link>
        <button
          type="button"
          onClick={() => {
            // vous pouvez brancher ici useAuthStore().logout()
            window.dispatchEvent(new CustomEvent('driver:logout:click'));
          }}
          className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 text-gray-500" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
