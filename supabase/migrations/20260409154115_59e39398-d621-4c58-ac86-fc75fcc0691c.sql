
-- Create scanned_documents table
CREATE TABLE public.scanned_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 1,
    file_size BIGINT DEFAULT 0,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scanned_documents ENABLE ROW LEVEL SECURITY;

-- Users can read own scanned documents
CREATE POLICY "Users can read own scanned documents"
ON public.scanned_documents FOR SELECT
TO authenticated
USING (user_email = (auth.jwt() ->> 'email'::text));

-- Users can insert own scanned documents
CREATE POLICY "Users can insert own scanned documents"
ON public.scanned_documents FOR INSERT
TO authenticated
WITH CHECK (user_email = (auth.jwt() ->> 'email'::text));

-- Users can delete own scanned documents
CREATE POLICY "Users can delete own scanned documents"
ON public.scanned_documents FOR DELETE
TO authenticated
USING (user_email = (auth.jwt() ->> 'email'::text));

-- Admins can read all
CREATE POLICY "Admins can read all scanned documents"
ON public.scanned_documents FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('scanned-documents', 'scanned-documents', false);

-- Storage policies: users can manage their own folder
CREATE POLICY "Users can upload own scanned docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'scanned-documents' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Users can view own scanned docs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'scanned-documents' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Users can delete own scanned docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'scanned-documents' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email'::text));
