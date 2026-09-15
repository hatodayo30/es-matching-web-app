import { useState } from 'react';
import { FileText, Menu, X, History, Sparkles, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import type { Page, NavigateFn } from '@/lib/types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: NavigateFn;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
  };

  const navItems: { page: Page; label: string; icon: typeof Sparkles }[] = [
    { page: 'analyze', label: 'ES分析', icon: Sparkles },
    { page: 'history', label: '分析履歴', icon: History },
    { page: 'favorites', label: 'お気に入り', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">ESマッチ</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  currentPage === item.page
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button onClick={handleSignOut} size="sm" variant="outline">
            <LogOut className="mr-1.5 h-4 w-4" />
            ログアウト
          </Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-foreground md:hidden"
          aria-label="メニュー"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    currentPage === item.page
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">{user?.email}</span>
              <Button onClick={handleSignOut} size="sm" variant="outline">
                <LogOut className="mr-1.5 h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
