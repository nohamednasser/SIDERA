
-- 1. Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table
CREATE POLICY "Admins can read admins" ON public.admins
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

-- 2. Create is_admin security definer function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admins WHERE user_id = _user_id
    )
$$;

-- 3. Drop old permissive policies on stem_drive_files
DROP POLICY IF EXISTS "Authenticated users can insert stem drive files" ON public.stem_drive_files;
DROP POLICY IF EXISTS "Authenticated users can delete stem drive files" ON public.stem_drive_files;

-- Create admin-only policies on stem_drive_files
CREATE POLICY "Admins can insert stem drive files"
    ON public.stem_drive_files FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete stem drive files"
    ON public.stem_drive_files FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update stem drive files"
    ON public.stem_drive_files FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- 4. Drop old permissive policies on subjects
DROP POLICY IF EXISTS "Authenticated users can insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Authenticated users can delete subjects" ON public.subjects;

-- Create admin-only policies on subjects
CREATE POLICY "Admins can insert subjects"
    ON public.subjects FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update subjects"
    ON public.subjects FOR UPDATE TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete subjects"
    ON public.subjects FOR DELETE TO authenticated
    USING (public.is_admin(auth.uid()));

-- 5. Drop old permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload stem drive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete stem drive files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update stem drive files" ON storage.objects;

-- Create admin-only storage policies
CREATE POLICY "Admins can upload stem drive files"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'stem-drive-files' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete stem drive files"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'stem-drive-files' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update stem drive files"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'stem-drive-files' AND public.is_admin(auth.uid()))
    WITH CHECK (bucket_id = 'stem-drive-files' AND public.is_admin(auth.uid()));
