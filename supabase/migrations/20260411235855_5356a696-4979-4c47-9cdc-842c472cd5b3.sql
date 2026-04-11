CREATE TABLE public.code_snippets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_email text NOT NULL,
    student_name text NOT NULL,
    title text NOT NULL DEFAULT 'Untitled',
    language text NOT NULL DEFAULT 'python',
    code text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own snippets" ON public.code_snippets
    FOR SELECT TO authenticated
    USING (student_email = (auth.jwt() ->> 'email') OR is_admin(auth.uid()));

CREATE POLICY "Students can insert own snippets" ON public.code_snippets
    FOR INSERT TO authenticated
    WITH CHECK (student_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Students can update own snippets" ON public.code_snippets
    FOR UPDATE TO authenticated
    USING (student_email = (auth.jwt() ->> 'email'))
    WITH CHECK (student_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Students can delete own snippets" ON public.code_snippets
    FOR DELETE TO authenticated
    USING (student_email = (auth.jwt() ->> 'email'));