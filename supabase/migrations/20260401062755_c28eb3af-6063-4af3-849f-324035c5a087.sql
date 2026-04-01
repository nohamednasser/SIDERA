
-- Capstone Gallery Projects
CREATE TABLE public.capstone_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    grade TEXT NOT NULL DEFAULT 'G12',
    year TEXT DEFAULT '2025',
    team_members TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    storage_path TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.capstone_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read capstone projects" ON public.capstone_projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert capstone projects" ON public.capstone_projects FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update capstone projects" ON public.capstone_projects FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete capstone projects" ON public.capstone_projects FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Learning Paths
CREATE TABLE public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    grade TEXT DEFAULT 'All',
    icon TEXT DEFAULT '🛤️',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read learning paths" ON public.learning_paths FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert learning paths" ON public.learning_paths FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update learning paths" ON public.learning_paths FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete learning paths" ON public.learning_paths FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Learning Path Items (steps inside a path)
CREATE TABLE public.learning_path_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    url TEXT DEFAULT '',
    file_id UUID DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_path_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read learning path items" ON public.learning_path_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert learning path items" ON public.learning_path_items FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update learning path items" ON public.learning_path_items FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete learning path items" ON public.learning_path_items FOR DELETE TO authenticated USING (is_admin(auth.uid()));
