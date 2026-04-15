
CREATE TABLE public.shared_kg_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    lo_id TEXT NOT NULL,
    lo_title TEXT NOT NULL DEFAULT '',
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_kg_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read shared notes"
ON public.shared_kg_notes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Students can insert own shared notes"
ON public.shared_kg_notes FOR INSERT
TO authenticated
WITH CHECK (student_email = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Students can delete own shared notes"
ON public.shared_kg_notes FOR DELETE
TO authenticated
USING (student_email = (auth.jwt() ->> 'email'::text));
