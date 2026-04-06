
-- Exams table
CREATE TABLE public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    grade TEXT NOT NULL DEFAULT 'G10',
    subject TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    time_limit_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam questions
CREATE TABLE public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'mcq',
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer TEXT DEFAULT '',
    points INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam submissions (student results)
CREATE TABLE public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Exam answers
CREATE TABLE public.exam_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.exam_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.exam_questions(id) ON DELETE CASCADE,
    answer_text TEXT DEFAULT '',
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0
);

-- RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_answers ENABLE ROW LEVEL SECURITY;

-- Exams: anyone can read published, admins can CRUD
CREATE POLICY "Anyone can read published exams" ON public.exams FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can read all exams" ON public.exams FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert exams" ON public.exams FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update exams" ON public.exams FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete exams" ON public.exams FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Questions: anyone can read (for published exams), admins CRUD
CREATE POLICY "Anyone can read exam questions" ON public.exam_questions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert exam questions" ON public.exam_questions FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update exam questions" ON public.exam_questions FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete exam questions" ON public.exam_questions FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Submissions: anyone can insert (students submit), admins can read all
CREATE POLICY "Anyone can insert submissions" ON public.exam_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read own submissions" ON public.exam_submissions FOR SELECT TO anon, authenticated USING (true);

-- Answers: anyone can insert, anyone can read
CREATE POLICY "Anyone can insert answers" ON public.exam_answers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read answers" ON public.exam_answers FOR SELECT TO anon, authenticated USING (true);
