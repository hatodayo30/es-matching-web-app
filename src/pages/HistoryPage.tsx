import { useState, useEffect } from 'react';
import {
  History,
  Sparkles,
  TrendingUp,
  Building2,
  ChevronRight,
  Calendar,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockHistory } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';
import type { AnalysisResult, AnalysisHistoryItem, NavigateFn } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HistoryPageProps {
  onNavigate: NavigateFn;
}

interface AnalysisRow {
  id: string;
  es_text: string;
  result: AnalysisResult;
  created_at: string;
}

export function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('analyses')
      .select('id, es_text, result, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setError('履歴の読み込みに失敗しました。');
      setHistory(mockHistory);
    } else if (data && data.length > 0) {
      const items: AnalysisHistoryItem[] = (data as AnalysisRow[]).map((row) => {
        const result = row.result as unknown as AnalysisResult;
        const esTitle = row.es_text.split('\n\n')[0] || '無題';
        const topCompany = result.companies?.[0];
        return {
          id: row.id,
          createdAt: new Date(row.created_at).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          esTitle,
          topCompany: topCompany?.name ?? '—',
          strengthsCount: result.strengths?.length ?? 0,
        };
      });
      setHistory(items);
    } else {
      setHistory([]);
    }
    setLoading(false);
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
          <History className="h-3.5 w-3.5 text-primary" />
          分析履歴
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          過去の分析履歴
        </h1>
        <p className="mt-3 text-muted-foreground">
          これまでに分析したESとマッチング結果を振り返ることができます。
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { icon: Sparkles, label: '分析数', value: history.length, color: 'text-primary' },
          { icon: Building2, label: '提案企業数', value: history.length * 5, color: 'text-warning' },
          { icon: TrendingUp, label: '抽出強み数', value: history.reduce((a, h) => a + h.strengthsCount, 0), color: 'text-success' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">まだ分析履歴がありません</p>
          <p className="mt-1 text-sm text-muted-foreground">ESを分析すると、ここに履歴が表示されます。</p>
          <Button onClick={() => onNavigate('analyze')} className="mt-6">
            <Sparkles className="mr-2 h-4 w-4" />
            ESを分析する
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, i) => (
            <Card
              key={item.id}
              className="group cursor-pointer p-5 transition-all hover:shadow-md sm:p-6"
              onClick={() => onNavigate('detail', item.id)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-lg font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold sm:text-lg">{item.esTitle}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        強み{item.strengthsCount}個抽出
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden text-right sm:block">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">トップマッチ</span>
                    </div>
                    <div className="max-w-[160px] truncate text-sm font-bold">
                      {item.topCompany}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Mobile: top company */}
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 sm:hidden">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="truncate text-sm font-medium">{item.topCompany}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CTA */}
      {history.length > 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            新しいESを分析して、マッチする企業を見つけましょう。
          </p>
          <Button onClick={() => onNavigate('analyze')} className="mt-4">
            <Sparkles className="mr-2 h-4 w-4" />
            ESを分析する
          </Button>
        </div>
      )}
    </div>
  );
}
