/*
# Create analyses and favorite_companies tables

## Overview
This migration creates two tables for the ESマッチ app:
1. `analyses` — stores ES analysis results (ES text, feedback, strengths, values, matched companies) as a single JSONB column.
2. `favorite_companies` — stores companies that a user has favorited from analysis results.

Both tables are owner-scoped (user_id = auth.uid()) with full RLS policies.

## New Tables

### analyses
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, not null, default auth.uid(), references auth.users with cascade delete)
- `es_text` (text, not null) — the raw ES text the user submitted
- `result` (jsonb, not null) — the full analysis result: feedback, strengths, values, companies
- `created_at` (timestamptz, default now())

### favorite_companies
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, not null, default auth.uid(), references auth.users with cascade delete)
- `analysis_id` (uuid, references analyses(id) with cascade delete) — which analysis produced this company
- `company_name` (text, not null)
- `industry` (text, not null)
- `reason` (text, not null) — why this company matched
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on both tables.
- `analyses`: 4 policies (SELECT/INSERT/UPDATE/DELETE) scoped to `authenticated` where `auth.uid() = user_id`.
- `favorite_companies`: 4 policies (SELECT/INSERT/UPDATE/DELETE) scoped to `authenticated` where `auth.uid() = user_id`.
- Owner columns default to `auth.uid()` so inserts that omit `user_id` succeed.

## Important Notes
1. The `user_id` column on both tables has `DEFAULT auth.uid()` so the frontend can insert without passing user_id.
2. `favorite_companies.analysis_id` is nullable to allow favorites that may not be tied to a specific analysis in the future.
3. A unique constraint on `favorite_companies(user_id, company_name)` prevents duplicate favorites for the same company.
*/

-- analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  es_text text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- favorite_companies table
CREATE TABLE IF NOT EXISTS favorite_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES analyses(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  industry text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorite_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorite_companies;
CREATE POLICY "select_own_favorites" ON favorite_companies FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorite_companies;
CREATE POLICY "insert_own_favorites" ON favorite_companies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_favorites" ON favorite_companies;
CREATE POLICY "update_own_favorites" ON favorite_companies FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorite_companies;
CREATE POLICY "delete_own_favorites" ON favorite_companies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Prevent duplicate favorites for the same company per user
CREATE UNIQUE INDEX IF NOT EXISTS favorite_companies_user_company_unique
  ON favorite_companies(user_id, company_name);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses(user_id);
CREATE INDEX IF NOT EXISTS favorite_companies_user_id_idx ON favorite_companies(user_id);
