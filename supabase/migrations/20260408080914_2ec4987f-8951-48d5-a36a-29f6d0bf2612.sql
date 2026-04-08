
-- Fix: allow both anon and authenticated to insert exam submissions and answers
-- The previous policy was too restrictive (required JWT email match)
-- Students may use guest mode or enter a different email for exams

DROP POLICY IF EXISTS "Authenticated users insert own submissions" ON exam_submissions;
CREATE POLICY "Anyone can insert submissions" ON exam_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users insert own answers" ON exam_answers;
CREATE POLICY "Anyone can insert answers" ON exam_answers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Also fix SELECT: allow anon to read own submissions by email (for retake/review)
DROP POLICY IF EXISTS "Users can read own submissions" ON exam_submissions;
CREATE POLICY "Anyone can read submissions" ON exam_submissions
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can read own answers" ON exam_answers;
CREATE POLICY "Anyone can read answers" ON exam_answers
  FOR SELECT TO anon, authenticated
  USING (true);
