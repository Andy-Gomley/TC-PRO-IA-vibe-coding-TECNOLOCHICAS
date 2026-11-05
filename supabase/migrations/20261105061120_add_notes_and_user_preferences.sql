/*
# Add private notes and notification preferences

1. New Tables
- `study_notes`: private notes written by each learner during lessons, with a title, body, lesson name, and update timestamp.
- `user_preferences`: one private settings row per learner, storing lesson reminder time, reminder status, cookie consent, and privacy/terms acceptance timestamps.
2. Security
- Enable row-level security on both tables.
- Grant CRUD only to authenticated users.
- Every policy restricts rows to the signed-in owner through `auth.uid()`.
3. Notes
- The frontend uses the notes table for saved study notes and the preferences table for reminder and consent settings.
*/

CREATE TABLE IF NOT EXISTS public.study_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nota sin título',
  body text NOT NULL DEFAULT '',
  lesson text NOT NULL DEFAULT 'Fundamentos de SQL',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reminders_enabled boolean NOT NULL DEFAULT true,
  reminder_time time NOT NULL DEFAULT '18:00',
  cookie_consent boolean NOT NULL DEFAULT true,
  accepted_terms_at timestamptz,
  accepted_privacy_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;

DROP POLICY IF EXISTS "Users can read own study notes" ON public.study_notes;
CREATE POLICY "Users can read own study notes" ON public.study_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own study notes" ON public.study_notes;
CREATE POLICY "Users can create own study notes" ON public.study_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own study notes" ON public.study_notes;
CREATE POLICY "Users can update own study notes" ON public.study_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own study notes" ON public.study_notes;
CREATE POLICY "Users can delete own study notes" ON public.study_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own preferences" ON public.user_preferences;
CREATE POLICY "Users can read own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own preferences" ON public.user_preferences;
CREATE POLICY "Users can create own preferences" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences" ON public.user_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);