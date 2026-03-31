
-- 1. Fix stem_drive_files table policies
DROP POLICY IF EXISTS "Anyone can insert stem drive files metadata" ON public.stem_drive_files;
DROP POLICY IF EXISTS "Anyone can delete stem drive files metadata" ON public.stem_drive_files;

CREATE POLICY "Authenticated users can insert stem drive files"
  ON public.stem_drive_files FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stem drive files"
  ON public.stem_drive_files FOR DELETE TO authenticated
  USING (true);

-- 2. Fix subjects table policies
DROP POLICY IF EXISTS "Anyone can insert subjects" ON public.subjects;
DROP POLICY IF EXISTS "Anyone can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "Anyone can delete subjects" ON public.subjects;

CREATE POLICY "Authenticated users can insert subjects"
  ON public.subjects FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update subjects"
  ON public.subjects FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subjects"
  ON public.subjects FOR DELETE TO authenticated
  USING (true);

-- 3. Fix storage policies
DROP POLICY IF EXISTS "Anyone can upload stem drive files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete stem drive files" ON storage.objects;

CREATE POLICY "Authenticated users can upload stem drive files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'stem-drive-files');

CREATE POLICY "Authenticated users can delete stem drive files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'stem-drive-files');

CREATE POLICY "Authenticated users can update stem drive files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'stem-drive-files')
  WITH CHECK (bucket_id = 'stem-drive-files');
