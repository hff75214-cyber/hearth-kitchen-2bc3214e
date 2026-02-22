import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  Search,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  action?: () => void;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'الرئيسية', path: '/menu' },
  { icon: Search, label: 'بحث', path: '/menu#search' },
  { icon: SlidersHorizontal, label: 'فلترة', path: '/menu#filter' },
  { icon: RefreshCw, label: 'تحديث', path: '/menu#refresh' },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // إخفاء/إظهار شريط التنقل عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 50) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-orange-100 dark:border-orange-900/20 shadow-lg md:hidden z-40"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => navigate(item.path)}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
