import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string;
          es_text: string;
          result: JsonValue;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          es_text: string;
          result: JsonValue;
          created_at?: string;
        };
        Update: {
          es_text?: string;
          result?: JsonValue;
        };
      };
      favorite_companies: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string | null;
          company_name: string;
          industry: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          analysis_id?: string | null;
          company_name: string;
          industry: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          company_name?: string;
          industry?: string;
          reason?: string;
        };
      };
    };
  };
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
