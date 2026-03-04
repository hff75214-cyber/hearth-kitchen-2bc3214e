
-- Fix RLS: Drop RESTRICTIVE public policies and recreate as PERMISSIVE
-- Products public view
DROP POLICY IF EXISTS "Public view products" ON public.products;
CREATE POLICY "Public view products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);

-- Categories public view  
DROP POLICY IF EXISTS "Public view categories" ON public.categories;
CREATE POLICY "Public view categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active = true);

-- Offers public view
DROP POLICY IF EXISTS "Public view offers" ON public.offers;
CREATE POLICY "Public view offers" ON public.offers FOR SELECT TO anon, authenticated USING (is_active = true);

-- Restaurant public view (needed for store to get restaurant name)
CREATE POLICY "Public view restaurants" ON public.restaurants FOR SELECT TO anon USING (true);

-- Tables public view (for reservations in store)
CREATE POLICY "Public view tables" ON public.restaurant_tables FOR SELECT TO anon USING (is_active = true);

-- Allow anonymous order placement (online store)
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public insert order items" ON public.order_items FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous notifications (from store orders)
CREATE POLICY "Public insert notifications" ON public.notifications FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous reservations
CREATE POLICY "Public insert reservations" ON public.table_reservations FOR INSERT TO anon WITH CHECK (true);

-- Allow staff members to be managed by restaurant owners (already exists, ensure it works)
-- Staff members need a public view policy for staff login
CREATE POLICY "Staff can view own record" ON public.staff_members FOR SELECT TO authenticated USING (user_id = auth.uid());
