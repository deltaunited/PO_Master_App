-- SQL Script to set up Suppliers and Currencies in Supabase

-- 1. Create the `suppliers` table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add Row Level Security (RLS) policies for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.suppliers FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Enable insert access for all users'
    ) THEN
        CREATE POLICY "Enable insert access for all users" ON public.suppliers FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Enable update access for all users'
    ) THEN
        CREATE POLICY "Enable update access for all users" ON public.suppliers FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Enable delete access for all users'
    ) THEN
        CREATE POLICY "Enable delete access for all users" ON public.suppliers FOR DELETE USING (true);
    END IF;
END $$;


-- 3. Update the `purchase_orders` table to link to the new suppliers table
ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id);


-- 4. Create the `currencies` table
CREATE TABLE IF NOT EXISTS public.currencies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- 5. Add Row Level Security (RLS) policies for currencies
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'currencies' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.currencies FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'currencies' AND policyname = 'Enable insert access for all users'
    ) THEN
        CREATE POLICY "Enable insert access for all users" ON public.currencies FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'currencies' AND policyname = 'Enable update access for all users'
    ) THEN
        CREATE POLICY "Enable update access for all users" ON public.currencies FOR UPDATE USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'currencies' AND policyname = 'Enable delete access for all users'
    ) THEN
        CREATE POLICY "Enable delete access for all users" ON public.currencies FOR DELETE USING (true);
    END IF;
END $$;


-- 6. Insert the default currencies
INSERT INTO public.currencies (code, name)
VALUES 
    ('USD', 'US Dollar'),
    ('EUR', 'Euro'),
    ('GBP', 'British Pound'),
    ('LYD', 'Libyan Dinar'),
    ('VES', 'Venezuelan Bolívar'),
    ('AED', 'UAE Dirham'),
    ('SAR', 'Saudi Riyal')
ON CONFLICT (code) DO NOTHING;
