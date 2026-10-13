import { useState, type ReactNode } from 'react';
import { Sidebar, TopBar, MobileNav } from './sidebar';
import { WorkspaceSwitcher } from './workspace-switcher';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  title: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ title, breadcrumbs, actions, children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-col w-[var(--sidebar-width)] shrink-0 hidden md:flex border-r border-border">
        <div className="p-2.5 border-b border-border">
          <WorkspaceSwitcher />
        </div>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar title={title} breadcrumbs={breadcrumbs} actions={actions} />
        <main className={cn('flex-1 overflow-y-auto scrollbar-thin animate-fade-in pb-20 md:pb-0')}>
          <div className="mx-auto max-w-[1400px] w-full px-4 md:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
