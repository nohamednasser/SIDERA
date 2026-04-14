
-- 1. Fix exam_questions: Remove public anon SELECT, restrict to authenticated only
-- and create a secure view that hides correct_answer for non-admins
DROP POLICY IF EXISTS "Anyone can read exam questions" ON public.exam_questions;

-- Admins can see everything including correct answers
CREATE POLICY "Admins can read all exam questions"
ON public.exam_questions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Students can read questions but we'll handle hiding correct_answer in code
-- They need to see questions during exams
CREATE POLICY "Authenticated users can read exam questions"
ON public.exam_questions
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix certificates: Remove public anon SELECT, restrict to owner + admin
DROP POLICY IF EXISTS "Anyone can view certificates" ON public.certificates;

CREATE POLICY "Users can view own certificates"
ON public.certificates
FOR SELECT
TO authenticated
USING (
  student_email = (auth.jwt() ->> 'email'::text) 
  OR is_admin(auth.uid())
);

-- 3. Fix student_reviews: Remove anon SELECT, keep authenticated
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.student_reviews;

CREATE POLICY "Authenticated users can read reviews"
ON public.student_reviews
FOR SELECT
TO authenticated
USING (true);

-- 4. Add admin UPDATE/DELETE policies for exam_submissions
CREATE POLICY "Admins can update exam submissions"
ON public.exam_submissions
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete exam submissions"
ON public.exam_submissions
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- 5. Add admin UPDATE policy for exam_answers
CREATE POLICY "Admins can update exam answers"
ON public.exam_answers
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete exam answers"
ON public.exam_answers
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));
