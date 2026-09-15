import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AnalysisResultView } from '@/components/AnalysisResultView';
import type { AnalysisResult, NavigateFn } from '@/lib/types';

interface AnalysisDetailPageProps {
  analysisId: string;
  onNavigate: NavigateFn;
}

interface AnalysisRow {
  id: string;
  es_text: string;
  result: AnalysisResult;
  created_at: string;
}

export function AnalysisDetailPage({ analysisId, onNavigate }: AnalysisDetailPageProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('analyses')
      .select('id, es_text, result, created_at')
      .eq('id', analysisId)
      .single();

    if (error || !data) {
      setError('分析結果の読み込みに失敗しました。');
      setLoading(false);
      return;
    }

    const row = data as AnalysisRow;
    const parsed = row.result as unknown as AnalysisResult;
    const esTitle = row.es_text.split('\n\n')[0] || '無題';
    const esContent = row.es_text.split('\n\n').slice(1).join('\n\n') || '';

    setResult({
      ...parsed,
      id: row.id,
      createdAt: new Date(row.created_at).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      esTitle,
      esContent,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Button variant="outline" onClick={() => onNavigate('history')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          履歴に戻る
        </Button>
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive/50" />
          <p className="text-lg font-medium text-muted-foreground">
            {error ?? '分析結果が見つかりませんでした。'}
          </p>
          <Button onClick={() => onNavigate('history')} className="mt-6">
            分析履歴に戻る
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => onNavigate('history')} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          履歴に戻る
        </Button>
      </div>
      <AnalysisResultView
        result={result}
        onNavigate={onNavigate}
        showResetButton={false}
      />
    </div>
  );
}
