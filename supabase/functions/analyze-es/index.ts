import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeRequest {
  esText: string;
}

interface Correction {
  point: string;
  detail: string;
  suggestion: string;
}

interface CompanyResult {
  name: string;
  industry: string;
  reason: string;
}

interface AnalysisResponse {
  corrections: Correction[];
  strengths: string[];
  values: string[];
  tendency: string;
  companies: CompanyResult[];
}

const SYSTEM_PROMPT = `あなたは就職活動中の学生のES（エントリーシート）を添削し、企業マッチングを行うプロのキャリアアドバイザーです。

以下の分析を行い、結果をJSON形式で返してください。

1. corrections: ESの改善ポイントを3〜5個挙げてください。各項目には以下を含めてください：
   - point: 改善ポイントの概要（簡潔に）
   - detail: 現状の問題点
   - suggestion: 具体的な改善案

2. strengths: ESから読み取れる学生の強みを3〜5個挙げてください（短いフレーズで）。

3. values: ESから読み取れる価値観を3〜5個挙げてください（短いフレーズで）。

4. tendency: 志向性の説明を1〜2文で記述してください。

5. companies: この学生の強み・価値観にマッチする実在する日本の有名企業・上場企業を5社提案してください。各企業には以下を含めてください：
   - name: 実在する日本の有名企業・上場企業の正式名称（必ず実在する企業を使うこと。架空の企業名は絶対に使わないこと）
   - industry: 業界カテゴリ
   - reason: その学生にマッチする理由（1〜2文で）

重要事項：
- マッチ企業は必ず実在する日本の有名企業・上場企業を使用すること。架空の企業名は絶対に使わないこと。
- 必ずJSONのみを返すこと。マークダウンのコードブロックや説明文は一切不要です。
- 返すJSONの形式は以下の通りです：

{
  "corrections": [
    { "point": "改善ポイント", "detail": "問題点", "suggestion": "改善案" }
  ],
  "strengths": ["強み1", "強み2", "強み3"],
  "values": ["価値観1", "価値観2", "価値観3"],
  "tendency": "志向性の説明",
  "companies": [
    { "name": "実在する日本企業名", "industry": "業界", "reason": "マッチする理由" }
  ]
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { esText } = (await req.json()) as AnalyzeRequest;

    if (!esText || esText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "ES本文が短すぎます。10文字以上入力してください。" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "APIキーが設定されていません。" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `以下のESを分析してください。\n\n${esText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI分析に失敗しました。しばらくしてから再度お試しください。" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    let parsed: AnalysisResponse;
    try {
      parsed = JSON.parse(text) as AnalysisResponse;
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]) as AnalysisResponse;
      } else {
        throw new Error("AIレスポンスのJSON解析に失敗しました");
      }
    }

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "サーバーエラーが発生しました。" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
