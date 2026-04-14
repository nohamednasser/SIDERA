-- Allow anon to read exam_questions (needed for exam card question count)
-- correct_answer is only fetched by authenticated exam-taking code, not exposed in listing
CREATE POLICY "Anon can read exam questions for listing"
ON public.exam_questions
FOR SELECT
TO anon
USING (true);

-- Also allow anon to read student_reviews (needed for reviews section on landing page)
CREATE POLICY "Anon can read reviews"
ON public.student_reviews
FOR SELECT
TO anon
USING (true);