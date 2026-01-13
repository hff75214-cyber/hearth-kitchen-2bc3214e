import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationSystem, requestNotificationPermission } from '../NotificationSystem';
import { initializeDefaultData, PagePermission, UserRole, roleNames } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MainLayoutProps {
  children: ReactNode;
  userName?: string;
  userRole?: UserRole;
  userPermissions?: PagePermission[];
  onLogout?: () => void;
}

export function MainLayout({ children, userName, userRole, userPermissions = [], onLogout }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  useEffect(() => {
    initializeDefaultData();
    // طلب إذن الإشعارات عند تحميل التطبيق
    requestNotificationPermission();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar onWidthChange={setSidebarWidth} userPermissions={userPermissions} />
      
      {/* Top Notification Bar */}
      <div 
        className="fixed top-0 left-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-40"
        style={{ right: sidebarWidth }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">نظام كاشير المطعم</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationSystem />
          {userName && (
            <div className="flex items-center gap-3 border-r border-border pr-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground font-medium">{userName}</span>
                {userRole && (
                  <Badge variant="outline" className="text-xs">
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
        className="flex-1 min-h-screen p-6 pt-20 transition-all duration-300"
        style={{ marginRight: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
