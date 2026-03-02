import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationSystem, requestNotificationPermission } from '../NotificationSystem';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { POSLogo } from '../POSLogo';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useFeatureToggles } from '@/hooks/useFeatureToggles';

interface MainLayoutProps {
  children: ReactNode;
  restaurantName?: string;
}

export function MainLayout({ children, restaurantName }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { restaurantId } = useRestaurant();
  const { isFeatureEnabled } = useFeatureToggles(restaurantId);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const userName = user?.user_metadata?.full_name || user?.email || '';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? (mobileMenuOpen ? 'block' : 'hidden') : 'block'}`}>
        <Sidebar 
          onWidthChange={setSidebarWidth}
          isFeatureEnabled={isFeatureEnabled}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </div>
      
      {/* Top Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-2 md:px-4 z-30"
        style={isMobile ? {} : { right: sidebarWidth }}
      >
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
          <span className="text-sm font-medium text-foreground truncate max-w-[150px] md:max-w-none">
            {restaurantName || 'مطعمي'}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <NotificationSystem />
          {userName && (
            <div className="flex items-center gap-2 md:gap-3 border-r border-border pr-2 md:pr-3">
              <div className="flex items-center gap-1 md:gap-2">
                <User className="w-4 h-4 text-primary hidden sm:block" />
                <span className="text-xs md:text-sm text-foreground font-medium truncate max-w-[80px] md:max-w-none">{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <main 
        className={`flex-1 min-h-screen p-3 md:p-6 pt-16 md:pt-20 transition-all duration-300`}
        style={isMobile ? {} : { marginRight: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
