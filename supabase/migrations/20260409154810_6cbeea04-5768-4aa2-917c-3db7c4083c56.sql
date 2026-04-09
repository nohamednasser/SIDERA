
-- Create certificates table
CREATE TABLE public.certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    certificate_type TEXT NOT NULL DEFAULT 'exam',
    reference_id UUID,
    reference_title TEXT NOT NULL,
    score INTEGER,
    certificate_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can view certificates (for verification/sharing)
CREATE POLICY "Anyone can view certificates"
ON public.certificates FOR SELECT
TO anon, authenticated
USING (true);

-- Students can earn certificates
CREATE POLICY "Students can earn certificates"
ON public.certificates FOR INSERT
TO authenticated
WITH CHECK (student_email = (auth.jwt() ->> 'email'::text));

-- Admins can delete certificates
CREATE POLICY "Admins can delete certificates"
ON public.certificates FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));
