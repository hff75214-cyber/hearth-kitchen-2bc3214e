import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from './useRestaurant';

export interface CloudProduct {
  id: string;
  name: string;
  name_en: string | null;
  category: string;
  category_id: string | null;
  subcategory: string | null;
  type: string;
  preparation_time: number | null;
  cost_price: number;
  sale_price: number;
  unit: string;
  quantity: number;
  min_quantity_alert: number;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  is_taxable: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CloudCategory {
  id: string;
  name: string;
  name_en: string | null;
  type: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  restaurant_id: string;
}

export interface CloudOrder {
  id: string;
  order_number: string;
  type: string;
  table_id: string | null;
  table_name: string | null;
  subtotal: number;
  discount: number;
  discount_type: string;
  tax_amount: number;
  tax_details: any;
  total: number;
  total_cost: number;
  profit: number;
  payment_method: string;
  status: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  staff_id: string | null;
  staff_name: string | null;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  delivery_time: string | null;
  restaurant_id: string;
}

export interface CloudTable {
  id: string;
  name: string;
  number: number;
  chairs: number;
  status: string;
  current_order_id: string | null;
  position_x: number;
  position_y: number;
  shape: string;
  is_active: boolean;
  restaurant_id: string;
  occupied_at: string | null;
}

export interface CloudCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  restaurant_id: string;
}

export interface CloudTaxSetting {
  id: string;
  tax_type: string;
  name: string;
  rate: number;
  is_enabled: boolean;
  min_price_threshold: number | null;
  applicable_categories: string[] | null;
  restaurant_id: string;
}

export function useCloudProducts() {
  const { restaurantId } = useRestaurant();
  const [products, setProducts] = useState<CloudProduct[]>([]);
  const [categories, setCategories] = useState<CloudCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('restaurant_id', restaurantId),
        supabase.from('categories').select('*').eq('restaurant_id', restaurantId).order('sort_order'),
      ]);
      setProducts(prods || []);
      setCategories((cats || []).filter(c => c.is_active));
    } catch (e) {
      console.error('Error loading cloud data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { loadData(); }, [loadData]);

  return { products, categories, isLoading, reload: loadData, restaurantId };
}

export function useCloudTables() {
  const { restaurantId } = useRestaurant();
  const [tables, setTables] = useState<CloudTable[]>([]);

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    const { data } = await supabase.from('restaurant_tables').select('*').eq('restaurant_id', restaurantId);
    setTables((data || []).filter(t => t.is_active));
  }, [restaurantId]);

  useEffect(() => { loadTables(); }, [loadTables]);
  return { tables, reload: loadTables };
}

export function useCloudCustomers() {
  const { restaurantId } = useRestaurant();
  const [customers, setCustomers] = useState<CloudCustomer[]>([]);

  const loadCustomers = useCallback(async () => {
    if (!restaurantId) return;
    const { data } = await supabase.from('customers').select('*').eq('restaurant_id', restaurantId);
    setCustomers(data || []);
  }, [restaurantId]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);
  return { customers, reload: loadCustomers };
}

export function useCloudTaxSettings() {
  const { restaurantId } = useRestaurant();
  const [taxSettings, setTaxSettings] = useState<CloudTaxSetting[]>([]);

  const loadTaxSettings = useCallback(async () => {
    if (!restaurantId) return;
    const { data } = await supabase.from('tax_settings').select('*').eq('restaurant_id', restaurantId);
    setTaxSettings(data || []);
  }, [restaurantId]);

  useEffect(() => { loadTaxSettings(); }, [loadTaxSettings]);
  return { taxSettings, reload: loadTaxSettings };
}

export function useCloudOrders() {
  const { restaurantId } = useRestaurant();
  const [orders, setOrders] = useState<CloudOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setIsLoading(false);
  }, [restaurantId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  return { orders, isLoading, reload: loadOrders, restaurantId };
}

// Helper: generate order number
export async function generateCloudOrderNumber(restaurantId: string): Promise<string> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
    .gte('created_at', today.toISOString().split('T')[0]);
  
  const seq = (count || 0) + 1;
  return `${dateStr}-${String(seq).padStart(4, '0')}`;
}

// Helper: calculate tax
export function calculateTax(
  subtotal: number,
  taxSettings: CloudTaxSetting[],
  product?: { is_taxable: boolean; sale_price: number; category?: string }
): { taxAmount: number; taxDetails: any } {
  let totalTax = 0;
  const details: any[] = [];

  for (const tax of taxSettings) {
    if (!tax.is_enabled) continue;
    
    if (product && !product.is_taxable) continue;
    if (tax.min_price_threshold && subtotal < tax.min_price_threshold) continue;
    
    const taxAmount = subtotal * (tax.rate / 100);
    totalTax += taxAmount;
    details.push({
      name: tax.name,
      type: tax.tax_type,
      rate: tax.rate,
      amount: taxAmount,
    });
  }

  return { taxAmount: totalTax, taxDetails: details };
}
