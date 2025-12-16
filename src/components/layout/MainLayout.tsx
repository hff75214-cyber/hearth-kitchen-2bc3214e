import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
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
      <main 
        className="flex-1 min-h-screen p-6 transition-all duration-300"
        style={{ marginRight: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}