import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationSystem } from '../NotificationSystem';
import { initializeDefaultData } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  userName?: string;
  onLogout?: () => void;
}

export function MainLayout({ children, userName, onLogout }: MainLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  useEffect(() => {
    initializeDefaultData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar onWidthChange={setSidebarWidth} />
      
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
            <div className="flex items-center gap-2 border-r border-border pr-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>{userName}</span>
              </div>
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="h-8 px-2 text-muted-foreground hover:text-destructive"
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