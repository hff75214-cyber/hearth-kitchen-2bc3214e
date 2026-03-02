import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureToggle {
  id: string;
  restaurant_id: string;
  feature_key: string;
  is_enabled: boolean;
}

// Feature metadata for display
export const featureMetadata: Record<string, { name: string; description: string; icon: string; category: string }> = {
  dashboard: { name: 'لوحة التحكم', description: 'عرض إحصائيات وملخص النظام', icon: '📊', category: 'أساسي' },
  pos: { name: 'نقطة البيع', description: 'شاشة البيع وإنشاء الطلبات', icon: '🛒', category: 'أساسي' },
  products: { name: 'المنتجات', description: 'إدارة المنتجات والأصناف', icon: '📦', category: 'أساسي' },
  inventory: { name: 'المخزون', description: 'تتبع كميات المنتجات', icon: '🏪', category: 'أساسي' },
  customers: { name: 'العملاء', description: 'إدارة بيانات العملاء', icon: '👥', category: 'أساسي' },
  sales: { name: 'المبيعات', description: 'عرض سجل المبيعات', icon: '💰', category: 'أساسي' },
  reports: { name: 'التقارير', description: 'تقارير وتحليلات شاملة', icon: '📈', category: 'أساسي' },
  settings: { name: 'الإعدادات', description: 'إعدادات النظام العامة', icon: '⚙️', category: 'أساسي' },
  about: { name: 'حول النظام', description: 'معلومات عن النظام والمطور', icon: 'ℹ️', category: 'أساسي' },
  
  materials: { name: 'المواد الخام', description: 'إدارة المواد الخام والمكونات', icon: '🧪', category: 'المخزون' },
  materials_report: { name: 'تقرير المواد', description: 'تقارير استهلاك المواد الخام', icon: '📋', category: 'المخزون' },
  suppliers: { name: 'الموردين', description: 'إدارة الموردين وبياناتهم', icon: '🚚', category: 'المخزون' },
  
  tables: { name: 'إدارة الطاولات', description: 'إضافة وتعديل الطاولات', icon: '🪑', category: 'المطعم' },
  tables_view: { name: 'عرض الطاولات', description: 'عرض حالة الطاولات مباشرة', icon: '👁️', category: 'المطعم' },
  reservations: { name: 'الحجوزات', description: 'نظام حجز الطاولات', icon: '📅', category: 'المطعم' },
  kitchen: { name: 'شاشة المطبخ', description: 'عرض الطلبات للمطبخ', icon: '👨‍🍳', category: 'المطعم' },
  kitchen_stats: { name: 'إحصائيات المطبخ', description: 'تحليل أداء المطبخ', icon: '📊', category: 'المطعم' },
  delivery: { name: 'التوصيل', description: 'إدارة طلبات التوصيل', icon: '🛵', category: 'المطعم' },
  
  users: { name: 'المستخدمين', description: 'إدارة الموظفين والصلاحيات', icon: '👤', category: 'الإدارة' },
  activity_log: { name: 'سجل النشاط', description: 'تتبع جميع العمليات', icon: '📝', category: 'الإدارة' },
  shifts: { name: 'ورديات العمل', description: 'إدارة ورديات الموظفين', icon: '⏰', category: 'الإدارة' },
  employee_performance: { name: 'أداء الموظفين', description: 'تقييم أداء الموظفين', icon: '📊', category: 'الإدارة' },
  branches: { name: 'الفروع', description: 'إدارة فروع المطعم', icon: '🏢', category: 'الإدارة' },
  
  loyalty: { name: 'برنامج الولاء', description: 'نقاط ومكافآت العملاء', icon: '🎁', category: 'التسويق' },
  offers: { name: 'العروض', description: 'إدارة العروض والخصومات', icon: '🏷️', category: 'التسويق' },
  offers_report: { name: 'تقرير العروض', description: 'تحليل أداء العروض', icon: '📊', category: 'التسويق' },
  sales_goals: { name: 'أهداف المبيعات', description: 'تحديد وتتبع أهداف البيع', icon: '🎯', category: 'التسويق' },
  
  expenses: { name: 'المصروفات', description: 'تسجيل وتتبع المصروفات', icon: '💸', category: 'المالية' },
  taxes: { name: 'الضرائب', description: 'إعدادات الضرائب والقيمة المضافة', icon: '🧾', category: 'المالية' },
  
  online_store: { name: 'المتجر الإلكتروني', description: 'قائمة عامة وطلب أونلاين', icon: '🌐', category: 'متقدم' },
};

export function useFeatureToggles(restaurantId: string | null) {
  const [toggles, setToggles] = useState<FeatureToggle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToggles = useCallback(async () => {
    if (!restaurantId) {
      setToggles([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('feature_toggles')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (!error && data) {
      setToggles(data);
    }
    setIsLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    fetchToggles();
  }, [fetchToggles]);

  const isFeatureEnabled = useCallback((featureKey: string): boolean => {
    const toggle = toggles.find(t => t.feature_key === featureKey);
    return toggle?.is_enabled ?? false;
  }, [toggles]);

  const updateToggle = useCallback(async (featureKey: string, isEnabled: boolean) => {
    if (!restaurantId) return;

    const { error } = await supabase
      .from('feature_toggles')
      .update({ is_enabled: isEnabled })
      .eq('restaurant_id', restaurantId)
      .eq('feature_key', featureKey);

    if (!error) {
      setToggles(prev => prev.map(t => 
        t.feature_key === featureKey ? { ...t, is_enabled: isEnabled } : t
      ));
    }
    return { error };
  }, [restaurantId]);

  return {
    toggles,
    isLoading,
    isFeatureEnabled,
    updateToggle,
    refetch: fetchToggles,
  };
}

// Map feature keys to route paths
export const featureToRoute: Record<string, string> = {
  dashboard: '/',
  pos: '/pos',
  products: '/products',
  inventory: '/inventory',
  materials: '/materials',
  materials_report: '/materials-report',
  tables: '/tables',
  tables_view: '/tables-view',
  kitchen: '/kitchen',
  kitchen_stats: '/kitchen-stats',
  delivery: '/delivery',
  customers: '/customers',
  sales: '/sales',
  reports: '/reports',
  settings: '/settings',
  users: '/users',
  activity_log: '/activity-log',
  shifts: '/shifts',
  loyalty: '/loyalty',
  reservations: '/reservations',
  expenses: '/expenses',
  offers: '/offers',
  offers_report: '/offers-report',
  employee_performance: '/employee-performance',
  sales_goals: '/sales-goals',
  branches: '/branches',
  suppliers: '/suppliers',
  taxes: '/taxes',
  online_store: '/online-store',
  about: '/about',
};

// Reverse: route to feature key
export const routeToFeature: Record<string, string> = Object.fromEntries(
  Object.entries(featureToRoute).map(([k, v]) => [v, k])
);
