import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target,
  Building2,
  RotateCcw,
  Lightbulb,
  MessageSquareText,
  Hash,
  Heart,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import type { AnalysisResult, NavigateFn } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onReset?: () => void;
  onNavigate: NavigateFn;
  saveError?: string | null;
  showResetButton?: boolean;
}

export function AnalysisResultView({
  result,
  onReset,
  onNavigate,
  saveError,
  showResetButton = true,
}: AnalysisResultViewProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            分析完了
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            分析結果
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.esTitle} · {result.createdAt}
          </p>
        </div>
        {showResetButton && onReset && (
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            もう一度分析する
          </Button>
        )}
      </div>

      {saveError && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="corrections" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="corrections" className="gap-1.5">
            <MessageSquareText className="h-4 w-4" />
            <span className="hidden sm:inline">添削フィードバック</span>
            <span className="sm:hidden">添削</span>
          </TabsTrigger>
          <TabsTrigger value="strengths" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">強み・価値観</span>
            <span className="sm:hidden">強み</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">企業マッチング</span>
            <span className="sm:hidden">企業</span>
          </TabsTrigger>
          <TabsTrigger value="es" className="gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">ES本文</span>
            <span className="sm:hidden">本文</span>
          </TabsTrigger>
        </TabsList>

        {/* Corrections Tab */}
        <TabsContent value="corrections" className="mt-6">
          <div className="grid gap-4">
            {result.corrections.map((c, i) => (
              <Card key={i} className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-sm font-bold text-warning">
                    {i + 1}
                  </div>
                  <h3 className="text-base font-bold">{c.point}</h3>
                </div>
                <div className="space-y-3 pl-12">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-muted-foreground">問題点: </span>
                      <span>{c.detail}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <span className="font-medium text-primary">改善案: </span>
                      <span>{c.suggestion}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Strengths Tab */}
        <TabsContent value="strengths" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <TrendingUp className="h-5 w-5 text-primary" />
                強み
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.strengths.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Target className="h-5 w-5 text-primary" />
                価値観
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.values.map((v, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {result.tendency && (
            <Card className="mt-6 p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">志向性</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.tendency}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              あなたの強み・価値観にマッチする企業を{result.companies.length}社提案します。ハートボタンで企業をお気に入りに保存できます。
            </p>
          </div>
          <div className="grid gap-4">
            {result.companies.map((company, i) => (
              <CompanyCard
                key={`${company.name}-${i}`}
                company={company}
                rank={i + 1}
                analysisId={result.id}
              />
            ))}
          </div>
        </TabsContent>

        {/* ES Content Tab */}
        <TabsContent value="es" className="mt-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {result.esTitle}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {result.esContent.length}文字
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {result.esContent}
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {showResetButton && onReset && (
          <Button onClick={onReset} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            新しいESを分析する
          </Button>
        )}
        <Button onClick={() => onNavigate('history')} size="lg">
          <FileText className="mr-2 h-4 w-4" />
          分析履歴を見る
        </Button>
      </div>
    </div>
  );
}

function CompanyCard({
  company,
  rank,
  analysisId,
}: {
  company: AnalysisResult['companies'][0];
  rank: number;
  analysisId: string;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavorite = useCallback(async () => {
    const { data } = await supabase
      .from('favorite_companies')
      .select('id')
      .eq('company_name', company.name)
      .maybeSingle();
    setIsFavorite(!!data);
  }, [company.name]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const toggleFavorite = async () => {
    setLoading(true);
    if (isFavorite) {
      await supabase
        .from('favorite_companies')
        .delete()
        .eq('company_name', company.name);
      setIsFavorite(false);
    } else {
      await supabase.from('favorite_companies').insert({
        analysis_id: analysisId,
        company_name: company.name,
        industry: company.industry,
        reason: company.reason,
      });
      setIsFavorite(true);
    }
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {/* Rank / Logo */}
        <div className="flex items-center justify-center gap-3 bg-primary/5 p-6 sm:w-48 sm:flex-col sm:justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
            {company.name.charAt(0)}
          </div>
          <span className="text-xs font-medium text-muted-foreground">第{rank}位</span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold">{company.name}</h3>
              <Badge variant="outline" className="mt-1 text-xs">
                {company.industry}
              </Badge>
            </div>
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110 disabled:opacity-50',
                isFavorite
                  ? 'border-destructive/30 bg-destructive/10'
                  : 'border-border bg-background'
              )}
              aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors',
                  isFavorite ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                )}
              />
            </button>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{company.reason}</p>
        </div>
      </div>
    </Card>
  );
}
