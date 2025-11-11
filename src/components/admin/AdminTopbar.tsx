// components/admin/AdminTopbar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useState, useMemo } from 'react';

function titleFromPath(pathname: string) {
  if (pathname === '/admin') return 'Dashboard';
  const segment = pathname.split('/')[2] || '';
  return segment
    ? segment.charAt(0).toUpperCase() + segment.slice(1)
    : 'Dashboard';
}

export function AdminTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = useMemo(() => titleFromPath(pathname), [pathname]);

  return (
    <div className="h-16 border-b bg-white/70 backdrop-blur flex items-center">
      <div className="w-full px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Mobile menu */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Center: Title */}
        <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>

        {/* Right: quick actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Voir le site</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
