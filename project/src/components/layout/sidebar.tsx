import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileSearch,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/org-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/status-badges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/format';
import { APP_NAME } from '@/lib/constants';
import type { OrgRole } from '@/lib/constants';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: OrgRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/analysis', label: 'Resume Analysis', icon: FileSearch },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/team', label: 'Team & Access', icon: UserCog, roles: ['owner', 'admin'] },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { currentRole } = useOrganization();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return currentRole && item.roles.includes(currentRole);
  });

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-border bg-card transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
          <Briefcase className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight text-foreground truncate">
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="ml-2 text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const location = useLocation();
  const { currentRole } = useOrganization();
  const [open, setOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return currentRole && item.roles.includes(currentRole);
  });

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <ul className="flex items-center justify-around">
          {visibleItems.slice(0, 5).map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label.split(' ')[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

interface TopBarProps {
  title: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export function TopBar({ title, breadcrumbs, actions, onMenuClick }: TopBarProps) {
  const { user, signOut } = useAuth();
  const { currentOrg, currentRole } = useOrganization();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onMenuClick}>
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((bc, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
                  {bc.to ? (
                    <Link to={bc.to} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground truncate">{bc.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : (
            <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {actions}
        {currentOrg && currentRole && (
          <div className="hidden lg:flex items-center gap-2 border-l border-border pl-3">
            <span className="text-xs text-muted-foreground">{currentOrg.name}</span>
            <RoleBadge role={currentRole} />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                  {user?.email ? initials(user.email) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.email}</span>
                {currentRole && <span className="text-xs text-muted-foreground capitalize">{currentRole.replace('_', ' ')}</span>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate('/signin');
              }}
              className="text-destructive focus:text-destructive"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
