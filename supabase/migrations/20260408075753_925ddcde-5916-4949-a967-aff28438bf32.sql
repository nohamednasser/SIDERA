
-- Fix exam_submissions: require auth and match email to JWT
DROP POLICY IF EXISTS "Anyone can insert submissions" ON exam_submissions;
CREATE POLICY "Authenticated users insert own submissions" ON exam_submissions
  FOR INSERT TO authenticated
  WITH CHECK (student_email = auth.jwt() ->> 'email');

-- Fix exam_answers: require auth and scope to own submissions
DROP POLICY IF EXISTS "Anyone can insert answers" ON exam_answers;
CREATE POLICY "Authenticated users insert own answers" ON exam_answers
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM exam_submissions s
    WHERE s.id = exam_answers.submission_id
    AND s.student_email = auth.jwt() ->> 'email'
  ));

-- Restrict exam_submissions read to own + admin
DROP POLICY IF EXISTS "Anyone can read own submissions" ON exam_submissions;
CREATE POLICY "Users can read own submissions" ON exam_submissions
  FOR SELECT TO authenticated
  USING (student_email = auth.jwt() ->> 'email' OR is_admin(auth.uid()));

-- Restrict exam_answers read to own + admin
DROP POLICY IF EXISTS "Anyone can read answers" ON exam_answers;
CREATE POLICY "Users can read own answers" ON exam_answers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM exam_submissions s
    WHERE s.id = exam_answers.submission_id
    AND (s.student_email = auth.jwt() ->> 'email' OR is_admin(auth.uid()))
  ));
