DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Anyone can read submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Anyone can insert answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Anyone can read answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Authenticated users insert own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Users can read own submissions" ON public.exam_submissions;
DROP POLICY IF EXISTS "Authenticated users insert own answers" ON public.exam_answers;
DROP POLICY IF EXISTS "Users can read own answers" ON public.exam_answers;

CREATE POLICY "Students can submit own exam submissions"
ON public.exam_submissions
FOR INSERT
TO authenticated
WITH CHECK (student_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Students and admins can view exam submissions"
ON public.exam_submissions
FOR SELECT
TO authenticated
USING (student_email = (auth.jwt() ->> 'email') OR public.is_admin(auth.uid()));

CREATE POLICY "Students can submit own exam answers"
ON public.exam_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.exam_submissions s
    WHERE s.id = exam_answers.submission_id
      AND s.student_email = (auth.jwt() ->> 'email')
  )
);

CREATE POLICY "Students and admins can view exam answers"
ON public.exam_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.exam_submissions s
    WHERE s.id = exam_answers.submission_id
      AND (s.student_email = (auth.jwt() ->> 'email') OR public.is_admin(auth.uid()))
  )
);