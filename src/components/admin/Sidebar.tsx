'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutList, FilePlus2, Settings, LogOut, Receipt, Users, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/xcexm2r4oq4tfzm7rf5222', label: 'Cobranças', icon: LayoutList, exact: true },
  { href: '/xcexm2r4oq4tfzm7rf5222/nova', label: 'Nova cobrança', icon: FilePlus2, exact: false },
  { href: '/xcexm2r4oq4tfzm7rf5222/mei', label: 'Base MEI', icon: Users, exact: false },
  { href: '/xcexm2r4oq4tfzm7rf5222/email-config', label: 'Modelo de email', icon: Mail, exact: false },
  { href: '/xcexm2r4oq4tfzm7rf5222/configuracoes', label: 'Configurações', icon: Settings, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/xcexm2r4oq4tfzm7rf5222/login');
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light">
          <Receipt className="h-4 w-4 text-brand" />
        </span>
        <span className="text-sm font-semibold text-gray-900">Gestão Financeira</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-light text-brand'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
