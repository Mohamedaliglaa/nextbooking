// src/lib/nav/driver-nav.ts
import {
  LayoutDashboard,
  Wallet,
  User as UserIcon,
  ClipboardList,
  UserPlus,
} from 'lucide-react';

export const driverNav = [
  { label: 'Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
  { label: 'Earnings', href: '/driver/dashboard/earnings', icon: Wallet },
  { label: 'Profile', href: '/driver/dashboard/profile', icon: UserIcon },

  // extras (outside dashboard subtree)
  { label: 'Pending', href: '/driver/pending', icon: ClipboardList },
  { label: 'Registration', href: '/driver/registration', icon: UserPlus },
];
