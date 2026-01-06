import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  UtensilsCrossed,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Eye,
  Users,
  Truck,
  ChefHat,
  Boxes,
  UserCog,
  Activity,
  Clock,
  Gift,
  CalendarDays,
  Wallet,
  Tag,
  TrendingUp,
  Target,
  PieChart,
  Building2,
  Package2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PagePermission } from '@/lib/database';

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  permission: PagePermission;
}

const allMenuItems: MenuItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم', permission: 'dashboard' },
  { path: '/pos', icon: ShoppingCart, label: 'نقطة البيع', permission: 'pos' },
  { path: '/products', icon: Package, label: 'المنتجات', permission: 'products' },
  { path: '/inventory', icon: Warehouse, label: 'المخزون', permission: 'inventory' },
  { path: '/materials', icon: Boxes, label: 'المواد الخام', permission: 'materials' },
  { path: '/materials-report', icon: BarChart3, label: 'تقرير المواد', permission: 'materials-report' },
  { path: '/tables', icon: UtensilsCrossed, label: 'إدارة الطاولات', permission: 'tables' },
  { path: '/tables-view', icon: Eye, label: 'عرض الطاولات', permission: 'tables-view' },
  { path: '/reservations', icon: CalendarDays, label: 'الحجوزات', permission: 'reservations' },
  { path: '/kitchen', icon: ChefHat, label: 'شاشة المطبخ', permission: 'kitchen' },
  { path: '/kitchen-stats', icon: PieChart, label: 'إحصائيات المطبخ', permission: 'kitchen-stats' },
  { path: '/delivery', icon: Truck, label: 'التوصيل', permission: 'delivery' },
  { path: '/customers', icon: Users, label: 'العملاء', permission: 'customers' },
  { path: '/loyalty', icon: Gift, label: 'برنامج الولاء', permission: 'loyalty' },
  { path: '/offers', icon: Tag, label: 'العروض', permission: 'offers' },
  { path: '/offers-report', icon: PieChart, label: 'تقرير العروض', permission: 'offers-report' },
  { path: '/sales', icon: FileText, label: 'المبيعات', permission: 'sales' },
  { path: '/expenses', icon: Wallet, label: 'المصروفات', permission: 'expenses' },
  { path: '/reports', icon: BarChart3, label: 'التقارير', permission: 'reports' },
  { path: '/employee-performance', icon: TrendingUp, label: 'أداء الموظفين', permission: 'employee-performance' },
  { path: '/sales-goals', icon: Target, label: 'أهداف المبيعات', permission: 'sales-goals' },
  { path: '/branches', icon: Building2, label: 'الفروع', permission: 'branches' },
  { path: '/suppliers', icon: Package2, label: 'الموردين', permission: 'suppliers' },
  { path: '/users', icon: UserCog, label: 'المستخدمين', permission: 'users' },
  { path: '/activity-log', icon: Activity, label: 'سجل النشاط', permission: 'activity-log' },
  { path: '/shifts', icon: Clock, label: 'ورديات العمل', permission: 'shifts' },
  { path: '/settings', icon: Settings, label: 'الإعدادات', permission: 'settings' },
];

interface SidebarProps {
  onWidthChange?: (width: number) => void;
  userPermissions?: PagePermission[];
}

export function Sidebar({ onWidthChange, userPermissions = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => 
    userPermissions.includes(item.permission)
  );

  useEffect(() => {
    onWidthChange?.(collapsed ? 80 : 260);
  }, [collapsed, onWidthChange]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed right-0 top-0 h-screen bg-sidebar border-l border-sidebar-border z-50 flex flex-col shadow-card"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">كاشير المطعم</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
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
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                    'hover:bg-sidebar-accent group relative',
                    isActive && 'bg-primary/10 text-primary shadow-glow'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full"
                    />
                  )}
                  <item.icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )} />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className={cn(
                          'font-medium whitespace-nowrap overflow-hidden',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
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
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground">يعمل بدون إنترنت</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs text-success">متصل محلياً</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
