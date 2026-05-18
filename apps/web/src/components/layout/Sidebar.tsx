'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sv } from '@/i18n/sv';

const navItems = [
  { href: '/dashboard', label: sv.nav.dashboard },
  { href: '/kupong', label: sv.nav.kupong },
  { href: '/sannolikheter', label: sv.nav.sannolikheter },
  { href: '/folket-och-varde', label: sv.nav.folketOchVarde },
  { href: '/systembyggare', label: sv.nav.systembyggare },
  { href: '/simulering', label: sv.nav.simulering },
  { href: '/backtest', label: sv.nav.backtest },
  { href: '/datakallor', label: sv.nav.datakallor },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-56 shrink-0 bg-gray-900 min-h-screen p-4 flex flex-col gap-1">
      <div className="text-white font-bold text-lg mb-6 px-2">Stryktips</div>
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-3 py-2 rounded text-sm transition-colors ${
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
