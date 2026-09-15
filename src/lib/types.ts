export type Page = 'home' | 'analyze' | 'history' | 'favorites' | 'detail' | 'login' | 'signup';

export type NavigateFn = (page: Page, analysisId?: string) => void;

export interface Correction {
  point: string;
  detail: string;
  suggestion: string;
}

export interface CompanyResult {
  name: string;
  industry: string;
  reason: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  esTitle: string;
  esContent: string;
  corrections: Correction[];
  strengths: string[];
  values: string[];
  tendency: string;
  companies: CompanyResult[];
}

export interface AnalysisHistoryItem {
  id: string;
  createdAt: string;
  esTitle: string;
  topCompany: string;
  strengthsCount: number;
}
