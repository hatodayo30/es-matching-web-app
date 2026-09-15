/*
# Fix NULL columns in auth.users for test user

## Problem
The test user (test@test.com) was created via direct SQL INSERT into auth.users.
The Supabase Auth service (GoTrue) expects specific string columns to contain
empty strings ('') rather than NULL. When it encounters NULL values during
login, it returns "500: Database error querying schema".

## Fix
Update the affected columns to their expected non-NULL defaults:
- recovery_token: NULL → '' (empty string)
- email_change_token_new: NULL → '' (empty string)
- email_change: NULL → '' (empty string)
- is_super_admin: NULL → false

This is the fix documented in Supabase's official troubleshooting guide:
https://supabase.com/docs/guides/troubleshooting/auth-error-500-database-error-querying-schema-eb6b44

## Scope
Only affects rows where these columns are NULL, so existing properly-created
users are untouched. Safe to re-run (idempotent).
*/

UPDATE auth.users
SET
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  is_super_admin = COALESCE(is_super_admin, false)
WHERE
  recovery_token IS NULL
  OR email_change_token_new IS NULL
  OR email_change IS NULL
  OR is_super_admin IS NULL;
