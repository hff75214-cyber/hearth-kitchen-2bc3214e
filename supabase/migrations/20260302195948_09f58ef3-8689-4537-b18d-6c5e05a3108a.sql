
-- =============================================
-- Phase 1: Core Restaurant POS Database Schema
-- =============================================

-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Restaurants
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'مطعمي',
  name_en TEXT DEFAULT 'My Restaurant',
  phone TEXT, address TEXT, logo_url TEXT, receipt_footer TEXT,
  settings_password TEXT DEFAULT '123456789',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage restaurants" ON public.restaurants FOR ALL USING (auth.uid() = owner_id);

-- 3. Staff members (BEFORE helper functions that reference it)
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, username TEXT NOT NULL, password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin','cashier','kitchen','waiter','delivery')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant owners manage staff" ON public.staff_members FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Helper functions (now staff_members exists)
CREATE OR REPLACE FUNCTION public.get_user_restaurant_id(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.restaurants WHERE owner_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_restaurant(_user_id UUID, _restaurant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.restaurants WHERE id = _restaurant_id AND owner_id = _user_id)
  OR EXISTS (SELECT 1 FROM public.staff_members WHERE restaurant_id = _restaurant_id AND user_id = _user_id AND is_active = true);
$$;

-- 4. Feature toggles
CREATE TABLE public.feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL, is_enabled BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(restaurant_id, feature_key)
);
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage toggles" ON public.feature_toggles FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 5. Tax settings
CREATE TABLE public.tax_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('vat','table_tax')),
  name TEXT NOT NULL, rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  min_price_threshold NUMERIC(10,2) DEFAULT 0,
  applicable_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, tax_type)
);
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage taxes" ON public.tax_settings FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 6. Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, name_en TEXT,
  type TEXT NOT NULL DEFAULT 'food' CHECK (type IN ('food','drinks','other')),
  icon TEXT, color TEXT, sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage categories" ON public.categories FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));
CREATE POLICY "Public view categories" ON public.categories FOR SELECT USING (is_active = true);

-- 7. Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, name_en TEXT, category TEXT NOT NULL DEFAULT '', subcategory TEXT,
  type TEXT NOT NULL DEFAULT 'prepared' CHECK (type IN ('prepared','stored')),
  preparation_time INT, cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0, unit TEXT NOT NULL DEFAULT 'قطعة',
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0, min_quantity_alert NUMERIC(10,2) NOT NULL DEFAULT 5,
  sku TEXT, barcode TEXT, description TEXT, image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true, is_taxable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage products" ON public.products FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));
CREATE POLICY "Public view products" ON public.products FOR SELECT USING (is_active = true);

-- 8. Restaurant tables
CREATE TABLE public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, number INT NOT NULL, chairs INT NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','reserved')),
  current_order_id UUID, position_x NUMERIC NOT NULL DEFAULT 0, position_y NUMERIC NOT NULL DEFAULT 0,
  shape TEXT NOT NULL DEFAULT 'square' CHECK (shape IN ('square','round','rectangle')),
  is_active BOOLEAN NOT NULL DEFAULT true, occupied_at TIMESTAMPTZ
);
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage tables" ON public.restaurant_tables FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 9. Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'dine-in' CHECK (type IN ('dine-in','delivery','takeaway','online')),
  table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  table_name TEXT, subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0, tax_details JSONB DEFAULT '{}',
  total NUMERIC(10,2) NOT NULL DEFAULT 0, total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  profit NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','card','wallet','online')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','preparing','ready','delivered','completed','cancelled')),
  customer_name TEXT, customer_phone TEXT, customer_address TEXT, customer_id UUID,
  delivery_time TIMESTAMPTZ, notes TEXT, staff_id UUID, staff_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage orders" ON public.orders FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 10. Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0, cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0, tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0, notes TEXT, preparation_time INT, is_prepared BOOLEAN DEFAULT false
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items access" ON public.order_items FOR ALL USING (order_id IN (SELECT id FROM public.orders WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

-- 11. Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage customers" ON public.customers FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 12. Raw materials
CREATE TABLE public.raw_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, unit TEXT NOT NULL DEFAULT 'كيلو',
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0, min_quantity_alert NUMERIC(10,2) NOT NULL DEFAULT 5,
  cost_per_unit NUMERIC(10,2) NOT NULL DEFAULT 0, description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage materials" ON public.raw_materials FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 13. Product ingredients
CREATE TABLE public.product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  quantity_used NUMERIC(10,3) NOT NULL DEFAULT 0
);
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ingredients access" ON public.product_ingredients FOR ALL USING (product_id IN (SELECT id FROM public.products WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

-- 14. Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  staff_id UUID, staff_name TEXT NOT NULL, staff_role TEXT NOT NULL DEFAULT 'admin',
  type TEXT NOT NULL, description TEXT NOT NULL, details JSONB,
  amount NUMERIC(10,2), order_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view logs" ON public.activity_logs FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 15. Work shifts
CREATE TABLE public.work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  staff_id UUID, staff_name TEXT NOT NULL, staff_role TEXT NOT NULL DEFAULT 'cashier',
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(), end_time TIMESTAMPTZ,
  total_hours NUMERIC(6,2), total_sales NUMERIC(10,2) DEFAULT 0,
  total_orders INT DEFAULT 0, notes TEXT, is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage shifts" ON public.work_shifts FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 16. Loyalty programs
CREATE TABLE public.loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL, customer_phone TEXT,
  points INT NOT NULL DEFAULT 0, total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','platinum')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage loyalty" ON public.loyalty_programs FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 17. Loyalty transactions
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('earn','redeem')),
  points INT NOT NULL DEFAULT 0, description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Loyalty tx access" ON public.loyalty_transactions FOR ALL USING (customer_id IN (SELECT id FROM public.customers WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())));

-- 18. Loyalty rewards
CREATE TABLE public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT, points_cost INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage rewards" ON public.loyalty_rewards FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 19. Table reservations
CREATE TABLE public.table_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL,
  guest_count INT NOT NULL DEFAULT 2, reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL, duration INT NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage reservations" ON public.table_reservations FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 20. Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('rent','salaries','utilities','supplies','maintenance','marketing','other')),
  description TEXT NOT NULL, amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage expenses" ON public.expenses FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 21. Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2), max_discount NUMERIC(10,2),
  applicable_products UUID[] DEFAULT '{}', apply_to_all BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days',
  is_active BOOLEAN NOT NULL DEFAULT true, usage_limit INT, usage_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage offers" ON public.offers FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));
CREATE POLICY "Public view offers" ON public.offers FOR SELECT USING (is_active = true);

-- 22. Sales goals
CREATE TABLE public.sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  staff_id UUID, target_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'daily' CHECK (period IN ('daily','weekly','monthly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE, bonus NUMERIC(10,2), description TEXT,
  is_achieved BOOLEAN NOT NULL DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage goals" ON public.sales_goals FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 23. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
  related_id UUID, is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage notifications" ON public.notifications FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 24. Daily summaries
CREATE TABLE public.daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL, total_sales NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0, total_profit NUMERIC(10,2) NOT NULL DEFAULT 0,
  orders_count INT NOT NULL DEFAULT 0, dine_in_count INT NOT NULL DEFAULT 0,
  delivery_count INT NOT NULL DEFAULT 0, takeaway_count INT NOT NULL DEFAULT 0,
  cash_payments NUMERIC(10,2) NOT NULL DEFAULT 0, card_payments NUMERIC(10,2) NOT NULL DEFAULT 0,
  wallet_payments NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE(restaurant_id, date)
);
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view summaries" ON public.daily_summaries FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 25. Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, phone TEXT, email TEXT, address TEXT, notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage suppliers" ON public.suppliers FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- 26. Branches
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, address TEXT, phone TEXT, manager_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage branches" ON public.branches FOR ALL USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid()));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON public.raw_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.table_reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create restaurant + defaults on signup
CREATE OR REPLACE FUNCTION public.handle_new_restaurant()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rid UUID;
BEGIN
  INSERT INTO public.restaurants (owner_id, name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'مطعمي')) RETURNING id INTO rid;
  
  INSERT INTO public.feature_toggles (restaurant_id, feature_key, is_enabled) VALUES
    (rid,'dashboard',true),(rid,'pos',true),(rid,'products',true),(rid,'inventory',true),
    (rid,'materials',false),(rid,'materials_report',false),(rid,'tables',false),(rid,'tables_view',false),
    (rid,'kitchen',false),(rid,'kitchen_stats',false),(rid,'delivery',false),(rid,'customers',true),
    (rid,'sales',true),(rid,'reports',true),(rid,'settings',true),(rid,'users',false),
    (rid,'activity_log',false),(rid,'shifts',false),(rid,'loyalty',false),(rid,'reservations',false),
    (rid,'expenses',false),(rid,'offers',false),(rid,'offers_report',false),
    (rid,'employee_performance',false),(rid,'sales_goals',false),(rid,'branches',false),
    (rid,'suppliers',false),(rid,'taxes',false),(rid,'online_store',false),(rid,'about',true);
  
  INSERT INTO public.tax_settings (restaurant_id, tax_type, name, rate, is_enabled, min_price_threshold) VALUES
    (rid,'vat','ضريبة القيمة المضافة',14.00,false,0),
    (rid,'table_tax','ضريبة الجدول',0,false,0);
  
  INSERT INTO public.categories (restaurant_id, name, name_en, type, sort_order) VALUES
    (rid,'مشروبات ساخنة','Hot Drinks','drinks',1),(rid,'مشروبات باردة','Cold Drinks','drinks',2),
    (rid,'عصائر طازجة','Fresh Juices','drinks',3),(rid,'وجبات رئيسية','Main Dishes','food',4),
    (rid,'وجبات سريعة','Fast Food','food',5),(rid,'مقبلات','Appetizers','food',6),
    (rid,'حلويات','Desserts','food',7),(rid,'سناكس','Snacks','other',8);
  
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_restaurant AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
