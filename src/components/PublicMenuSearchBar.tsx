import { motion } from 'framer-motion';
import { Search, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PublicMenuSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PublicMenuSearchBar({ searchQuery, onSearchChange }: PublicMenuSearchBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  // Only show on PublicMenu page
  if (!location.pathname.includes('/menu') || location.pathname.includes('/product/')) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-orange-100 dark:border-orange-900/20 py-3 md:py-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/menu')}
            className="flex-shrink-0"
            title="الرئيسية"
          >
            <Home className="w-5 h-5" />
          </Button>

          {/* Search Input - Takes remaining space */}
          <div className="flex-1 relative">
            <div className="relative flex items-center">
              <Search className="absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={isMobile ? "ابحث..." : "ابحث عن منتجات..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-10 pl-4 bg-secondary border-border text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
