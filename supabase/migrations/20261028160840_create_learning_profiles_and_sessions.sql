/*
# Create learning profiles and study sessions

1. New Tables
- `learning_profiles`: one private learning dashboard per signed-in user, storing display name, target role, target industry, selected visual theme, and current progress.
- `study_sessions`: private daily study time entries used by the dashboard chart.
2. Security
- Enable row-level security on both tables.
- Grant only the CRUD actions needed to authenticated users.
- Policies restrict every row to its owner through `auth.uid()`.
3. Notes
- Both tables use a user-owned foreign key to Supabase Auth.
- The profile row is created by the application after sign-up, while study sessions can be added as the learner studies.
*/

CREATE TABLE IF NOT EXISTS public.learning_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Estudiante',
  target_role text NOT NULL DEFAULT 'Analista de datos junior',
  target_industry text NOT NULL DEFAULT 'Tecnología',
  theme text NOT NULL DEFAULT 'sage',
  progress integer NOT NULL DEFAULT 68 CHECK (progress >= 0 AND progress <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  studied_on date NOT NULL DEFAULT CURRENT_DATE,
  minutes integer NOT NULL DEFAULT 0 CHECK (minutes >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;

DROP POLICY IF EXISTS "Users can read own learning profile" ON public.learning_profiles;
CREATE POLICY "Users can read own learning profile" ON public.learning_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own learning profile" ON public.learning_profiles;
CREATE POLICY "Users can create own learning profile" ON public.learning_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own learning profile" ON public.learning_profiles;
CREATE POLICY "Users can update own learning profile" ON public.learning_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own learning profile" ON public.learning_profiles;
CREATE POLICY "Users can delete own learning profile" ON public.learning_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own study sessions" ON public.study_sessions;
CREATE POLICY "Users can read own study sessions" ON public.study_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own study sessions" ON public.study_sessions;
CREATE POLICY "Users can create own study sessions" ON public.study_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own study sessions" ON public.study_sessions;
CREATE POLICY "Users can update own study sessions" ON public.study_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own study sessions" ON public.study_sessions;
CREATE POLICY "Users can delete own study sessions" ON public.study_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);