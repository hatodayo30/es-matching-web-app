import { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Target,
  Zap,
  ArrowRight,
  Check,
  Brain,
  TrendingUp,
  Users,
  Lightbulb,
  ClipboardCheck,
  History,
  Building2,
  ChevronRight,
  Calendar,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import type { AnalysisResult, AnalysisHistoryItem, NavigateFn } from '@/lib/types';

interface LandingPageProps {
  onNavigate: NavigateFn;
}

interface AnalysisRow {
  id: string;
  es_text: string;
  result: AnalysisResult;
  created_at: string;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('analyses')
      .select('id, es_text, result, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (data && data.length > 0) {
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
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="absolute left-1/2 top-0 -z-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in gap-1.5 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AIがESを分析して企業をマッチング
            </Badge>
            <h1 className="animate-fade-in-up text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              ESを貼るだけで、
              <br className="hidden sm:block" />
              <span className="text-primary">添削</span>と<span className="text-primary">企業マッチング</span>を同時に
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              自分に合う企業がわからない。ESを書いても通らない。
              その2つの課題を、ESを貼るというワンアクションで解決します。
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => onNavigate('analyze')} className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-5 w-5" />
                ESを分析する
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('history')} className="w-full sm:w-auto">
                <ClipboardCheck className="mr-2 h-5 w-5" />
                分析履歴を見る
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent History */}
      {history.length > 0 && (
        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <History className="h-6 w-6 text-primary" />
                  過去の分析履歴
                </h2>
                <p className="mt-2 text-muted-foreground">
                  最近分析したESの結果です。
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('history')} className="hidden sm:flex">
                すべて見る
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4">
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
                            <Building2 className="h-3 w-3" />
                            {item.topCompany}
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
                </Card>
              ))}
            </div>

            <div className="mt-6 flex justify-center sm:hidden">
              <Button variant="outline" size="sm" onClick={() => onNavigate('history')}>
                すべての履歴を見る
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Problem & Solution */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            就活生の2つの課題を解決
          </h2>
          <p className="mt-4 text-muted-foreground">
            どちらも一人で解決するには時間がかかる。だからこそ、AIで即時に。
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Problem 1 */}
          <Card className="relative overflow-hidden p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-sm font-medium text-destructive">課題 1</span>
            </div>
            <h3 className="text-xl font-bold">自分に合う企業がわからない</h3>
            <p className="mt-3 text-muted-foreground">
              就活サイトの検索軸は業種・規模・年収が中心。自分の価値観や強みとマッチする企業を見つけるのは難しい。
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Zap className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm font-medium text-primary">
                ESマッチは「価値観・強み」軸で企業を提案します
              </p>
            </div>
          </Card>

          {/* Problem 2 */}
          <Card className="relative overflow-hidden p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <FileText className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-sm font-medium text-destructive">課題 2</span>
            </div>
            <h3 className="text-xl font-bold">ESを書いても通過率が低い</h3>
            <p className="mt-3 text-muted-foreground">
              何が悪いかわからない。添削はエージェントや友人に頼るしかなく、フィードバックを得るのに時間がかかる。
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
              <Zap className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm font-medium text-primary">
                AIが即時に添削フィードバックを返します
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              3ステップで分析完了
            </h2>
            <p className="mt-4 text-muted-foreground">
              ワンアクションで添削とマッチングを同時に。
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: FileText,
                step: '01',
                title: 'ESを貼る',
                desc: '書いたESや自己PRをテキストエリアに貼り付けるだけ。フォーマットの指定はありません。',
              },
              {
                icon: Brain,
                step: '02',
                title: 'AIが分析',
                desc: '強み・価値観・志向性を抽出し、ESの改善点を即時にフィードバック。',
              },
              {
                icon: Target,
                step: '03',
                title: '企業を提案',
                desc: 'あなたの価値観・強みにマッチする企業をスコア付きで提案。',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 0.15}s` }}>
                  <Card className="h-full p-8 transition-shadow hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <span className="text-4xl font-bold text-muted/50">{item.step}</span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                    <p className="mt-3 text-muted-foreground">{item.desc}</p>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ESマッチの強み
          </h2>
          <p className="mt-4 text-muted-foreground">
            既存の就活サイトとは差別化された3つの特徴。
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              title: 'ワンアクションで同時に解決',
              desc: 'ESを貼るだけで添削と企業マッチングを同時に行える。2つの課題に別々に取り組む必要がありません。',
            },
            {
              icon: Lightbulb,
              title: 'AIによる即時フィードバック',
              desc: 'エージェントや友人に頼む必要なし。AIが即時にESの改善点を具体的に指摘します。',
            },
            {
              icon: Heart,
              title: 'お気に入り企業の保存',
              desc: 'マッチした企業をハートボタンでお気に入りに保存。気になる企業を後からまとめて確認できます。',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} className="p-6 transition-shadow hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border bg-muted/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            あなたのESが、あなたに合う企業を見つめる
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            まずはESを貼るだけ。AIが分析して、あなたに合う企業を提案します。
          </p>
          <Button size="lg" onClick={() => onNavigate('analyze')} className="mt-8 w-full sm:w-auto">
            <Sparkles className="mr-2 h-5 w-5" />
            今すぐESを分析する
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              無料で利用可能
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              即時分析
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-success" />
              履歴保存対応
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
