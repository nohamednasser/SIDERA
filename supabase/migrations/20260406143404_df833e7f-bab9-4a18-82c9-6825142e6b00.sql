
CREATE TABLE public.user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email text NOT NULL UNIQUE,
    theme text DEFAULT 'light',
    selected_grade text DEFAULT 'All',
    selected_subject text DEFAULT 'All',
    selected_semester text DEFAULT 'All',
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_preferences_email ON public.user_preferences(user_email);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read own preferences"
ON public.user_preferences FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert preferences"
ON public.user_preferences FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update own preferences"
ON public.user_preferences FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
