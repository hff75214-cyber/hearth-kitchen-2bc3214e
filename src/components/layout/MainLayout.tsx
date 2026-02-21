import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationSystem, requestNotificationPermission } from '../NotificationSystem';
import { initializeDefaultData, PagePermission, UserRole, roleNames } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { POSLogo } from '../POSLogo';

interface MainLayoutProps {
  children: ReactNode;
  userName?: string;
  userRole?: UserRole;
  userPermissions?: PagePermission[];
  onLogout?: () => void;
}

export function MainLayout({ children, userName, userRole, userPermissions = [], onLogout }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    initializeDefaultData();
    requestNotificationPermission();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`${isMobile ? (mobileMenuOpen ? 'block' : 'hidden') : 'block'}`}>
        <Sidebar 
          onWidthChange={setSidebarWidth} 
          userPermissions={userPermissions}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </div>
      
      {/* Top Notification Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-2 md:px-4 z-30"
        style={isMobile ? {} : { right: sidebarWidth }}
      >
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
          <POSLogo size="small" className="hidden sm:block" />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <NotificationSystem />
          {userName && (
            <div className="flex items-center gap-2 md:gap-3 border-r border-border pr-2 md:pr-3">
              <div className="flex items-center gap-1 md:gap-2">
                <User className="w-4 h-4 text-primary hidden sm:block" />
                <span className="text-xs md:text-sm text-foreground font-medium truncate max-w-[80px] md:max-w-none">{userName}</span>
                {userRole && !isMobile && (
                  <Badge variant="outline" className="text-xs hidden md:flex">
                    <Shield className="w-3 h-3 ml-1" />
                    {roleNames[userRole]}
                  </Badge>
                )}
              </div>
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <main 
        className={`flex-1 min-h-screen p-3 md:p-6 pt-16 md:pt-20 transition-all duration-300 ${isMobile ? '' : ''}`}
        style={isMobile ? {} : { marginRight: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
