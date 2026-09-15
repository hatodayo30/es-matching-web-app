import { FileText, Twitter, Linkedin } from 'lucide-react';
import type { NavigateFn } from '@/lib/types';

interface FooterProps {
  onNavigate: NavigateFn;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold">ESマッチ</span>
            </button>
            <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">
              ESを貼るだけで、AIが添削と企業マッチングを同時に。あなたに合う企業がわからない、ESが通らない — その2つの課題を解決します。
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => onNavigate('analyze')} className="transition-colors hover:text-foreground">
                ES分析
              </button>
              <button onClick={() => onNavigate('history')} className="transition-colors hover:text-foreground">
                分析履歴
              </button>
              <button onClick={() => onNavigate('favorites')} className="transition-colors hover:text-foreground">
                お気に入り
              </button>
              <button onClick={() => onNavigate('home')} className="transition-colors hover:text-foreground">
                サービス紹介
              </button>
            </nav>
            <div className="flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 ESマッチ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
