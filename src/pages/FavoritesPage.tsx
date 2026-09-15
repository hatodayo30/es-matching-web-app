import { useState, useEffect } from 'react';
import {
  Heart,
  Building2,
  Sparkles,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import type { NavigateFn } from '@/lib/types';

interface FavoriteRow {
  id: string;
  company_name: string;
  industry: string;
  reason: string;
  created_at: string;
}

interface FavoritesPageProps {
  onNavigate: NavigateFn;
}

export function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('favorite_companies')
      .select('id, company_name, industry, reason, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setError('お気に入りの読み込みに失敗しました。');
    } else {
      setFavorites((data as FavoriteRow[]) ?? []);
    }
    setLoading(false);
  };

  const handleRemove = async (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    await supabase.from('favorite_companies').delete().eq('id', id);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <Heart className="h-3.5 w-3.5 text-primary" />
          お気に入り企業
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          お気に入り企業一覧
        </h1>
        <p className="mt-3 text-muted-foreground">
          ES分析でハートを押した企業がここに保存されます。
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">お気に入り企業がまだありません</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ES分析の結果でハートボタンを押すと、企業をお気に入りに保存できます。
          </p>
          <Button onClick={() => onNavigate('analyze')} className="mt-6">
            <Sparkles className="mr-2 h-4 w-4" />
            ESを分析する
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm text-muted-foreground">
            {favorites.length}社のお気に入り企業
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map((fav) => (
              <Card key={fav.id} className="group p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                      {fav.company_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{fav.company_name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {fav.industry}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(fav.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="お気に入りから削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    マッチ理由
                  </div>
                  <p className="text-sm text-muted-foreground">{fav.reason}</p>
                </div>

                <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  {new Date(fav.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}に保存
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => onNavigate('analyze')} variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              新しいESを分析する
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
