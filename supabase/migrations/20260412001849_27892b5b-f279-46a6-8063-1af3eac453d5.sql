
-- Learning Outcomes table
CREATE TABLE public.learning_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  lo_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(grade, subject, lo_code)
);

ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read learning outcomes"
ON public.learning_outcomes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert learning outcomes"
ON public.learning_outcomes FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update learning outcomes"
ON public.learning_outcomes FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete learning outcomes"
ON public.learning_outcomes FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Link materials to LOs
ALTER TABLE public.stem_drive_files ADD COLUMN lo_id UUID REFERENCES public.learning_outcomes(id) ON DELETE SET NULL;

-- Capstone Grand Challenges support
ALTER TABLE public.capstone_projects ADD COLUMN grand_challenge TEXT DEFAULT '';
ALTER TABLE public.capstone_projects ADD COLUMN material_type TEXT DEFAULT 'project';
