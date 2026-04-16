CREATE TABLE public.shared_kg_note_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES public.shared_kg_notes(id) ON DELETE CASCADE,
    student_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(note_id, student_email)
);

ALTER TABLE public.shared_kg_note_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read likes"
ON public.shared_kg_note_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Students can like notes"
ON public.shared_kg_note_likes FOR INSERT
TO authenticated
WITH CHECK (student_email = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Students can unlike own likes"
ON public.shared_kg_note_likes FOR DELETE
TO authenticated
USING (student_email = (auth.jwt() ->> 'email'::text));

CREATE INDEX idx_shared_kg_note_likes_note_id ON public.shared_kg_note_likes(note_id);