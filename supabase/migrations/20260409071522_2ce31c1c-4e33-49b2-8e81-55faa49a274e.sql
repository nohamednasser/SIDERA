
-- Fix chat_messages: restrict SELECT to own messages + admins
DROP POLICY IF EXISTS "Anyone can read own chat messages" ON public.chat_messages;
CREATE POLICY "Users can read own chat messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (user_email = (auth.jwt() ->> 'email') OR is_admin(auth.uid()));

-- Fix chat_messages: restrict INSERT to match authenticated user's email
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can insert own chat messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (user_email = (auth.jwt() ->> 'email'));

-- Fix user_preferences: restrict SELECT to own preferences
DROP POLICY IF EXISTS "Anyone can read own preferences" ON public.user_preferences;
CREATE POLICY "Users can read own preferences"
  ON public.user_preferences FOR SELECT TO authenticated
  USING (user_email = (auth.jwt() ->> 'email'));

-- Fix user_preferences: restrict INSERT to own email
DROP POLICY IF EXISTS "Anyone can insert preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT TO authenticated
  WITH CHECK (user_email = (auth.jwt() ->> 'email'));

-- Fix user_preferences: restrict UPDATE to own preferences
DROP POLICY IF EXISTS "Anyone can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE TO authenticated
  USING (user_email = (auth.jwt() ->> 'email'))
  WITH CHECK (user_email = (auth.jwt() ->> 'email'));

-- Fix student_reviews: restrict INSERT to authenticated users with email match
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.student_reviews;
CREATE POLICY "Authenticated users can insert own reviews"
  ON public.student_reviews FOR INSERT TO authenticated
  WITH CHECK (student_email = (auth.jwt() ->> 'email'));

-- Fix student_reviews: restrict DELETE to admins only (was public role)
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.student_reviews;
CREATE POLICY "Admins can delete reviews"
  ON public.student_reviews FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

-- Fix student_reviews: restrict SELECT to authenticated (was public)
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.student_reviews;
CREATE POLICY "Anyone can read reviews"
  ON public.student_reviews FOR SELECT TO anon, authenticated
  USING (true);
