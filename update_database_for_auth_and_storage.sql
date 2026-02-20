-- 1. Add columns for file URLs
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS signed_po_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- 2. Set up Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies
-- Enable RLS on storage.objects is handled natively by Supabase, omitting alter table...

-- Allow public access to read
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
    END IF;

    -- Allow authenticated users to upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Auth Upload'
    ) THEN
        CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
    END IF;

    -- Allow authenticated users to update
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Auth Update'
    ) THEN
        CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents');
    END IF;

    -- Allow authenticated users to delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Auth Delete'
    ) THEN
        CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
    END IF;
END $$;
