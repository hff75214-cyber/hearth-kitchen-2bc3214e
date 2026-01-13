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
  Volume2,
  VolumeX,
  BellRing,
  Package,
  ChefHat,
  Calendar,
} from 'lucide-react';
import { db, Notification as DbNotification, checkTableTimes, checkLowStock, checkRawMaterialsStock, addNotification } from '@/lib/database';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// طلب إذن الإشعارات
export async function requestNotificationPermission() {
  if ('Notification' in window && window.Notification.permission === 'default') {
    const permission = await window.Notification.requestPermission();
    return permission === 'granted';
  }
  return 'Notification' in window && window.Notification.permission === 'granted';
}

// إرسال إشعار Push
export async function sendPushNotification(
  title: string, 
  message: string, 
  type: DbNotification['type'] = 'system',
  relatedId?: number
) {
  // إضافة للقاعدة
  await addNotification({
    type,
    title,
    message,
    relatedId,
  });

  // إرسال إشعار Push إذا كان متاحاً
  if ('Notification' in window && window.Notification.permission === 'granted') {
    try {
      new window.Notification(title, {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: type,
      });
    } catch (error) {
      console.log('Could not send push notification');
    }
  }
}

// إشعار طلب جديد
export async function notifyNewOrder(orderNumber: string, total: number) {
  await sendPushNotification(
    'طلب جديد! 🛒',
    `تم استلام طلب جديد رقم ${orderNumber} بقيمة ${total} ج.م`,
    'new_order'
  );
}

// إشعار طلب جاهز
export async function notifyOrderReady(orderNumber: string, tableName?: string) {
  await sendPushNotification(
    'طلب جاهز! ✅',
    tableName 
      ? `الطلب رقم ${orderNumber} جاهز للتقديم - ${tableName}`
      : `الطلب رقم ${orderNumber} جاهز للاستلام`,
    'order_ready'
  );
}

// إشعار حجز قادم
export async function notifyUpcomingReservation(customerName: string, tableName: string, time: string) {
  await sendPushNotification(
    'حجز قادم! 📅',
    `حجز ${customerName} على ${tableName} الساعة ${time}`,
    'system'
  );
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCount, setLastCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const allNotifications = await db.notifications
      .orderBy('createdAt')
      .reverse()
      .limit(50)
      .toArray();
    setNotifications(allNotifications);
    const newUnreadCount = allNotifications.filter(n => !n.isRead).length;
    
    // تشغيل صوت عند وصول إشعار جديد
    if (newUnreadCount > unreadCount && lastCount !== 0 && soundEnabled) {
      playNotificationSound();
    }
    
    setUnreadCount(newUnreadCount);
    setLastCount(newUnreadCount);
  }, [unreadCount, lastCount, soundEnabled]);

  // تشغيل صوت الإشعار
  const playNotificationSound = useCallback(() => {
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log('Could not play notification sound');
      }
    }
  }, []);

  useEffect(() => {
    // طلب إذن الإشعارات
    requestNotificationPermission();
    
    loadNotifications();

    // Check for notifications every 30 seconds
    const interval = setInterval(async () => {
      await checkTableTimes();
      await checkLowStock();
      await checkRawMaterialsStock();
      await loadNotifications();
    }, 30000);

    // Initial check
    checkTableTimes();
    checkLowStock();
    checkRawMaterialsStock();

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

  const handleTableAction = async (notification: DbNotification, action: 'free' | 'extend') => {
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

  const getIcon = (type: DbNotification['type']) => {
    switch (type) {
      case 'low_stock':
        return <Package className="w-5 h-5 text-warning" />;
      case 'raw_material_low':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'table_time':
        return <Clock className="w-5 h-5 text-info" />;
      case 'new_order':
        return <ShoppingCart className="w-5 h-5 text-success" />;
      case 'order_ready':
        return <ChefHat className="w-5 h-5 text-primary" />;
      case 'system':
        return <Settings className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getIconBg = (type: DbNotification['type']) => {
    switch (type) {
      case 'low_stock':
        return 'bg-warning/10 border-warning/30';
      case 'raw_material_low':
        return 'bg-destructive/10 border-destructive/30';
      case 'table_time':
        return 'bg-info/10 border-info/30';
      case 'new_order':
        return 'bg-success/10 border-success/30';
      case 'order_ready':
        return 'bg-primary/10 border-primary/30';
      default:
        return 'bg-secondary border-border';
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
        className="w-96 p-0 bg-card border-border shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground h-7"
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
              className="text-xs text-destructive hover:text-destructive h-7 mr-auto"
            >
              <Trash2 className="w-3 h-3 ml-1" />
              حذف الكل
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
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
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${getIconBg(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id!)}
                              className="text-muted-foreground hover:text-success p-1"
                              title="تعليم كمقروء"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id!)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="حذف"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
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
