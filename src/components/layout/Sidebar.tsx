import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, UtensilsCrossed, FileText, Settings,
  ChevronRight, ChevronLeft, BarChart3, Eye, Users, Truck, ChefHat, Boxes, UserCog,
  Activity, Clock, Gift, CalendarDays, Wallet, Tag, TrendingUp, Target, PieChart,
  Building2, Package2, Info, Settings2, Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { POSLogo } from '../POSLogo';
import { featureToRoute } from '@/hooks/useFeatureToggles';

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  featureKey: string;
}

const allMenuItems: MenuItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم', featureKey: 'dashboard' },
  { path: '/pos', icon: ShoppingCart, label: 'نقطة البيع', featureKey: 'pos' },
  { path: '/products', icon: Package, label: 'المنتجات', featureKey: 'products' },
  { path: '/inventory', icon: Warehouse, label: 'المخزون', featureKey: 'inventory' },
  { path: '/materials', icon: Boxes, label: 'المواد الخام', featureKey: 'materials' },
  { path: '/materials-report', icon: BarChart3, label: 'تقرير المواد', featureKey: 'materials_report' },
  { path: '/tables', icon: UtensilsCrossed, label: 'إدارة الطاولات', featureKey: 'tables' },
  { path: '/tables-view', icon: Eye, label: 'عرض الطاولات', featureKey: 'tables_view' },
  { path: '/reservations', icon: CalendarDays, label: 'الحجوزات', featureKey: 'reservations' },
  { path: '/kitchen', icon: ChefHat, label: 'شاشة المطبخ', featureKey: 'kitchen' },
  { path: '/kitchen-stats', icon: PieChart, label: 'إحصائيات المطبخ', featureKey: 'kitchen_stats' },
  { path: '/delivery', icon: Truck, label: 'التوصيل', featureKey: 'delivery' },
  { path: '/customers', icon: Users, label: 'العملاء', featureKey: 'customers' },
  { path: '/loyalty', icon: Gift, label: 'برنامج الولاء', featureKey: 'loyalty' },
  { path: '/offers', icon: Tag, label: 'العروض', featureKey: 'offers' },
  { path: '/offers-report', icon: PieChart, label: 'تقرير العروض', featureKey: 'offers_report' },
  { path: '/sales', icon: FileText, label: 'المبيعات', featureKey: 'sales' },
  { path: '/expenses', icon: Wallet, label: 'المصروفات', featureKey: 'expenses' },
  { path: '/taxes', icon: Receipt, label: 'الضرائب', featureKey: 'taxes' },
  { path: '/reports', icon: BarChart3, label: 'التقارير', featureKey: 'reports' },
  { path: '/employee-performance', icon: TrendingUp, label: 'أداء الموظفين', featureKey: 'employee_performance' },
  { path: '/sales-goals', icon: Target, label: 'أهداف المبيعات', featureKey: 'sales_goals' },
  { path: '/branches', icon: Building2, label: 'الفروع', featureKey: 'branches' },
  { path: '/suppliers', icon: Package2, label: 'الموردين', featureKey: 'suppliers' },
  { path: '/users', icon: UserCog, label: 'المستخدمين', featureKey: 'users' },
  { path: '/activity-log', icon: Activity, label: 'سجل النشاط', featureKey: 'activity_log' },
  { path: '/shifts', icon: Clock, label: 'ورديات العمل', featureKey: 'shifts' },
  { path: '/settings', icon: Settings, label: 'الإعدادات', featureKey: 'settings' },
  { path: '/feature-settings', icon: Settings2, label: 'تفعيل الوظائف', featureKey: '_always' },
  { path: '/about', icon: Info, label: 'حول النظام', featureKey: 'about' },
];

interface SidebarProps {
  onWidthChange?: (width: number) => void;
  isFeatureEnabled: (key: string) => boolean;
  onNavigate?: () => void;
}

export function Sidebar({ onWidthChange, isFeatureEnabled, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Filter menu items based on feature toggles
  const menuItems = allMenuItems.filter(item => 
    item.featureKey === '_always' || isFeatureEnabled(item.featureKey)
  );

  useEffect(() => {
    if (isMobile) {
      onWidthChange?.(280);
    } else {
      onWidthChange?.(collapsed ? 80 : 260);
    }
  }, [collapsed, onWidthChange, isMobile]);

  const handleLinkClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isMobile ? 280 : (collapsed ? 80 : 260) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "fixed right-0 top-0 h-screen bg-sidebar border-l border-sidebar-border z-50 flex flex-col shadow-card",
        isMobile && "shadow-2xl"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <POSLogo size="small" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground">
            {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                    'hover:bg-sidebar-accent group relative',
                    isActive && 'bg-primary/10 text-primary shadow-glow'
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="activeIndicator" className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                  )}
                  <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  <AnimatePresence mode="wait">
                    {(!collapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className={cn('font-medium whitespace-nowrap overflow-hidden text-sm md:text-base', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <p className="text-xs text-muted-foreground">نظام إدارة المطاعم</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success">متصل</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
