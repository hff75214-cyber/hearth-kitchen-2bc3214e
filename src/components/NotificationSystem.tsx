import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Clock,
  ShoppingCart,
  CheckCircle,
  Settings,
  X,
  Trash2,
  Check,
} from 'lucide-react';
import { db, Notification, checkTableTimes, checkLowStock } from '@/lib/database';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const allNotifications = await db.notifications
      .orderBy('createdAt')
      .reverse()
      .limit(50)
      .toArray();
    setNotifications(allNotifications);
    setUnreadCount(allNotifications.filter(n => !n.isRead).length);
  }, []);

  useEffect(() => {
    loadNotifications();

    // Check for notifications every 30 seconds
    const interval = setInterval(async () => {
      await checkTableTimes();
      await checkLowStock();
      await loadNotifications();
    }, 30000);

    // Initial check
    checkTableTimes();
    checkLowStock();

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (id: number) => {
    await db.notifications.update(id, { isRead: true });
    loadNotifications();
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      await db.notifications.update(n.id!, { isRead: true });
    }
    loadNotifications();
    toast({ title: 'تم', description: 'تم تحديد جميع الإشعارات كمقروءة' });
  };

  const deleteNotification = async (id: number) => {
    await db.notifications.delete(id);
    loadNotifications();
  };

  const clearAllNotifications = async () => {
    await db.notifications.clear();
    loadNotifications();
    toast({ title: 'تم', description: 'تم حذف جميع الإشعارات' });
  };

  const handleTableAction = async (notification: Notification, action: 'free' | 'extend') => {
    if (notification.relatedId) {
      if (action === 'free') {
        await db.restaurantTables.update(notification.relatedId, {
          status: 'available',
          occupiedAt: undefined,
        });
        toast({ title: 'تم', description: 'تم تحرير الطاولة' });
      } else {
        await db.restaurantTables.update(notification.relatedId, {
          occupiedAt: new Date(),
        });
        toast({ title: 'تم', description: 'تم تمديد فترة الطاولة' });
      }
      await markAsRead(notification.id!);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'table_time':
        return <Clock className="w-5 h-5 text-info" />;
      case 'new_order':
        return <ShoppingCart className="w-5 h-5 text-primary" />;
      case 'order_ready':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'system':
        return <Settings className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-secondary"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-destructive text-destructive-foreground"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-96 p-0 bg-card border-border shadow-card"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-foreground">الإشعارات</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <Check className="w-3 h-3 ml-1" />
                قراءة الكل
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 ml-1" />
                حذف الكل
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 hover:bg-secondary/50 transition-colors ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => deleteNotification(notification.id!)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {getTimeAgo(notification.createdAt)}
                      </p>

                      {/* Action buttons for table_time notifications */}
                      {notification.type === 'table_time' && !notification.isRead && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-success text-success hover:bg-success/10"
                            onClick={() => handleTableAction(notification, 'free')}
                          >
                            تحرير الطاولة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-info text-info hover:bg-info/10"
                            onClick={() => handleTableAction(notification, 'extend')}
                          >
                            تمديد الفترة
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
