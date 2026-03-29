-- Create public storage bucket for stem drive files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('stem-drive-files', 'stem-drive-files', true, 5368709120);

-- Allow anyone to read files (public bucket)
CREATE POLICY "Anyone can read stem drive files"
ON storage.objects FOR SELECT
USING (bucket_id = 'stem-drive-files');

-- Allow anyone to upload files (no auth required for this app)
CREATE POLICY "Anyone can upload stem drive files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'stem-drive-files');

-- Allow anyone to delete files
CREATE POLICY "Anyone can delete stem drive files"
ON storage.objects FOR DELETE
USING (bucket_id = 'stem-drive-files');

-- Create metadata table for file entries
CREATE TABLE public.stem_drive_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'Local File',
    file_name TEXT DEFAULT '',
    file_size BIGINT DEFAULT 0,
    file_type TEXT DEFAULT '',
    storage_path TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stem_drive_files ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can read stem drive files metadata"
ON public.stem_drive_files FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to insert
CREATE POLICY "Anyone can insert stem drive files metadata"
ON public.stem_drive_files FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to delete
CREATE POLICY "Anyone can delete stem drive files metadata"
ON public.stem_drive_files FOR DELETE
TO anon, authenticated
USING (true);