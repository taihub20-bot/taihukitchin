-- SUPABASE SETUP SQL FOR TAI HUB
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    inventory INTEGER DEFAULT 100,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    location JSONB,
    "paymentMethod" TEXT DEFAULT 'whatsapp',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- In a real app, use Supabase Auth. This is for simple demo login.
    name TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admins;

-- 5. Set RLS (Row Level Security) - For demo we allow all, but you should restrict this in production
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow admin read access" ON public.admins FOR SELECT USING (true);

CREATE POLICY "Allow all for demo" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all for demo" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all for demo" ON public.admins FOR ALL USING (true);

-- 6. Insert Sample Menu Items
INSERT INTO public.products (name, description, price, image, category, inventory)
VALUES 
('Chicken Momo', 'Steamed dumplings filled with juicy minced chicken and Himalayan spices.', 120, 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&q=80', 'Main Course', 50),
('Paneer Tikka', 'Cottage cheese marinated in yogurt and spices, grilled in tandoor.', 220, 'https://images.unsplash.com/photo-1599487488170-d11ec9c17536?auto=format&fit=crop&q=80', 'Starters', 30),
('Masala Chai', 'Authentic Indian spiced tea with ginger and cardamom.', 30, 'https://images.unsplash.com/photo-1594631252845-29fc4586c567?auto=format&fit=crop&q=80', 'Beverages', 100),
('Gulab Jamun', 'Deep fried milk dumplings soaked in sugar syrup.', 60, 'https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&q=80', 'Desserts', 40);

-- 7. Insert Default Admin (Password: admin123)
-- In a real app, users should sign up or be added via dashboard
INSERT INTO public.admins (email, password, name)
VALUES ('admin@taihub.com', 'admin123', 'Tai Admin');
