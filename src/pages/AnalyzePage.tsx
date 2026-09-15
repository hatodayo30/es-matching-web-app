import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Target,
  Building2,
  ArrowRight,
  MessageSquareText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { AnalysisResultView } from '@/components/AnalysisResultView';
import type { AnalysisResult, NavigateFn } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AnalyzePageProps {
  onNavigate: NavigateFn;
}

type Phase = 'input' | 'analyzing' | 'result';

export function AnalyzePage({ onNavigate }: AnalyzePageProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [esTitle, setEsTitle] = useState('');
  const [esContent, setEsContent] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const charCount = esContent.length;
  const minChars = 100;
  const canAnalyze = esContent.length >= minChars && esTitle.trim().length > 0;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setPhase('analyzing');
    setAnalyzingStep(0);
    setSaveError(null);

    const steps = [
      'ESの構文を解析しています...',
      '強み・価値観を抽出しています...',
      'ESの改善点を特定しています...',
      'マッチする企業を検索しています...',
    ];

    steps.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setAnalyzingStep(i), i * 800));
    });

    timersRef.current.push(setTimeout(async () => {
      const fullText = `${esTitle.trim()}\n\n${esContent}`;

      const { data: respData, error: fnError } = await supabase.functions.invoke(
        'analyze-es',
        { body: { esText: fullText } }
      );

      if (fnError || !respData) {
        setSaveError('AI分析に失敗しました。しばらくしてから再度お試しください。');
        setPhase('input');
        timersRef.current = [];
        return;
      }

      const analysisResult: AnalysisResult = {
        id: `a-${Date.now()}`,
        createdAt: new Date().toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        esTitle: esTitle.trim(),
        esContent: esContent,
        corrections: respData.corrections ?? [],
        strengths: respData.strengths ?? [],
        values: respData.values ?? [],
        tendency: respData.tendency ?? '',
        companies: respData.companies ?? [],
      };

      const { data, error } = await supabase
        .from('analyses')
        .insert({
          es_text: fullText,
          result: analysisResult as unknown as Record<string, never>,
        })
        .select('id')
        .single();

      if (error) {
        setSaveError('分析結果の保存に失敗しました。再度お試しください。');
      } else if (data) {
        analysisResult.id = data.id;
      }

      setResult(analysisResult);
      setPhase('result');
      timersRef.current = [];
    }, 3400));
  };

  const handleReset = () => {
    setPhase('input');
    setEsTitle('');
    setEsContent('');
    setResult(null);
    setSaveError(null);
  };

  if (phase === 'analyzing') {
    return <AnalyzingView step={analyzingStep} />;
  }

  if (phase === 'result' && result) {
    return (
      <AnalysisResultView
        result={result}
        onReset={handleReset}
        onNavigate={onNavigate}
        saveError={saveError}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          ES分析
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ESを貼り付けて分析
        </h1>
        <p className="mt-3 text-muted-foreground">
          書いたESや自己PRを貼り付けるだけで、AIが添削と企業マッチングを同時に行います。
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="es-title" className="text-sm font-medium">
              ESの設問・タイトル <span className="text-destructive">*</span>
            </Label>
            <Input
              id="es-title"
              placeholder="例：学生時代に頑張ったこと"
              value={esTitle}
              onChange={(e) => setEsTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="es-content" className="text-sm font-medium">
                ES本文 <span className="text-destructive">*</span>
              </Label>
              <span className={cn('text-xs', charCount < minChars ? 'text-muted-foreground' : 'text-success')}>
                {charCount}文字 / 最低{minChars}文字
              </span>
            </div>
            <Textarea
              id="es-content"
              placeholder="ここにES本文を貼り付けてください。&#10;&#10;例：大学3年次に、留学生向けの日本語学習コミュニティを立ち上げました。当初参加者は5名でしたが..."
              value={esContent}
              onChange={(e) => setEsContent(e.target.value)}
              className="min-h-[240px] resize-y"
            />
            {charCount > 0 && charCount < minChars && (
              <p className="text-xs text-muted-foreground">
                あと{minChars - charCount}文字入力してください。
              </p>
            )}
          </div>

          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">分析について</p>
                <p className="mt-1 text-muted-foreground">
                  AI（Claude）がESから強み・価値観・志向性を抽出し、添削フィードバックと実在する日本企業のマッチング結果を提供します。分析結果はSupabaseに保存され、後で「分析履歴」から確認できます。
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            size="lg"
            className="w-full"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            AIに分析してもらう
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AnalyzingView({ step }: { step: number }) {
  const steps = [
    { icon: FileText, label: 'ESの構文を解析しています...' },
    { icon: Target, label: '強み・価値観を抽出しています...' },
    { icon: MessageSquareText, label: 'ESの改善点を特定しています...' },
    { icon: Building2, label: 'マッチする企業を検索しています...' },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 animate-pulse text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight">AIが分析中...</h2>
      <p className="mt-2 text-muted-foreground">少々お待ちください</p>

      <div className="mt-10 w-full space-y-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 transition-all',
                done && 'border-success/30 bg-success/5',
                active && 'border-primary/30 bg-primary/5',
                !done && !active && 'border-border bg-muted/20 opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  done && 'bg-success/15 text-success',
                  active && 'bg-primary/15 text-primary',
                  !done && !active && 'bg-muted text-muted-foreground'
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : active ? (
                  <Icon className="h-5 w-5 animate-pulse" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  done && 'text-success',
                  active && 'text-primary',
                  !done && !active && 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
