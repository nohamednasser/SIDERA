
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '📚',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subjects" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert subjects" ON public.subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can delete subjects" ON public.subjects FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update subjects" ON public.subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.subjects (name, icon, sort_order) VALUES
  ('SAT', '📐', 1),
  ('ACT', '📊', 2),
  ('computer science', '💻', 3),
  ('chemistry', '🧪', 4),
  ('capstone', '🏗️', 5),
  ('biology', '🧬', 6),
  ('arabic', '🇪🇬', 7),
  ('math', '🧮', 8),
  ('Important', '⚠️', 9),
  ('geology', '🌍', 10),
  ('FINAL', '🏁', 11),
  ('Exercise', '🏋️', 12),
  ('quiz', '⏱️', 13),
  ('physics', '⚡', 14),
  ('midterm', '📝', 15),
  ('MEO', '🏢', 16),
  ('mechanics', '⚙️', 17),
  ('social studies', '🗺️', 18),
  ('religion', '🌙', 19);
