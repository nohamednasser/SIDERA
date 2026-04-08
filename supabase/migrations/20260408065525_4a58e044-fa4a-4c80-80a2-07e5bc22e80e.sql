
CREATE TABLE public.student_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.student_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.student_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can delete reviews" ON public.student_reviews FOR DELETE USING (public.is_admin(auth.uid()));
