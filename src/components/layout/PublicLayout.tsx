import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function PublicLayout({ children, title, description }: PublicLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header with branding */}
      <motion.header 
        className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-orange-100 dark:border-orange-900/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                رقميات
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">قائمة المنتجات</p>
            </motion.div>

            {/* Optional: Add language toggle here */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-right">
                {title && (
                  <p className="text-sm font-medium text-foreground">{title}</p>
                )}
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <motion.footer 
        className="bg-slate-50 dark:bg-slate-900 border-t border-border mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-orange-600">رقميات</h3>
              <p className="text-sm text-muted-foreground mt-2">
                تطبيق متكامل لإدارة المطاعم والمقاهي
              </p>
            </div>
            <div className="text-sm text-muted-foreground text-right md:text-left">
              <p>جميع الحقوق محفوظة © 2024</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
