import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationSystem } from '../NotificationSystem';
import { initializeDefaultData } from '@/lib/database';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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
        <NotificationSystem />
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