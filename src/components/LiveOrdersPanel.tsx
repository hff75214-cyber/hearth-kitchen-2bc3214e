import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Check,
  ChefHat,
  Truck,
  RefreshCw,
  Bell,
  Package,
  User,
  MapPin,
  Phone,
} from 'lucide-react';
import { db, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface LiveOrdersPanelProps {
  onOrderClick?: (order: Order) => void;
}

export default function LiveOrdersPanel({ onOrderClick }: LiveOrdersPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await db.orders
      .where('createdAt')
      .aboveOrEqual(startOfDay)
      .reverse()
      .toArray();

    // Filter to show pending, preparing, ready orders
    const activeOrders = todayOrders.filter(o => 
      ['pending', 'preparing', 'ready'].includes(o.status)
    );

    setOrders(activeOrders);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    await db.orders.update(orderId, { status: newStatus });
    loadOrders();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'preparing':
        return 'bg-info/20 text-info border-info/30';
      case 'ready':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'preparing':
        return 'قيد التحضير';
      case 'ready':
        return 'جاهز';
      case 'delivered':
        return 'تم التسليم';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getOrderTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'dine-in':
        return <ChefHat className="w-4 h-4" />;
      case 'delivery':
        return <Truck className="w-4 h-4" />;
      case 'takeaway':
        return <Package className="w-4 h-4" />;
    }
  };

  const getOrderTypeLabel = (type: Order['type']) => {
    switch (type) {
      case 'dine-in':
        return 'طاولة';
      case 'delivery':
        return 'توصيل';
      case 'takeaway':
        return 'استلام';
    }
  };

  const getTimeSince = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000 / 60);
    if (diff < 1) return 'الآن';
    if (diff < 60) return `${diff} دقيقة`;
    return `${Math.floor(diff / 60)} ساعة`;
  };

  return (
    <Card className="glass shadow-card h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary animate-pulse" />
          الطلبات المباشرة
          {orders.length > 0 && (
            <Badge className="bg-primary text-primary-foreground">
              {orders.length}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            آخر تحديث: {format(lastUpdate, 'HH:mm:ss', { locale: ar })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-4 pb-4">
          <AnimatePresence mode="popLayout">
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Clock className="w-12 h-12 mb-3 opacity-30" />
                <p>لا توجد طلبات نشطة حالياً</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <div
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${getStatusColor(order.status)}`}
                      onClick={() => onOrderClick?.(order)}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">#{order.orderNumber}</span>
                          <Badge variant="outline" className="gap-1">
                            {getOrderTypeIcon(order.type)}
                            {getOrderTypeLabel(order.type)}
                            {order.tableName && ` - ${order.tableName}`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {getTimeSince(order.createdAt)}
                        </div>
                      </div>

                      {/* Customer Info */}
                      {(order.customerName || order.customerPhone) && (
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          {order.customerName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {order.customerName}
                            </span>
                          )}
                          {order.customerPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {order.customerPhone}
                            </span>
                          )}
                        </div>
                      )}

                      {order.customerAddress && (
                        <div className="flex items-center gap-1 mb-3 text-sm">
                          <MapPin className="w-3 h-3" />
                          {order.customerAddress}
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.productName} × {item.quantity}</span>
                            <span>{item.total.toFixed(2)} ج.م</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs opacity-70">
                            + {order.items.length - 3} أصناف أخرى
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-current/20">
                        <span className="font-bold">{order.total.toFixed(2)} ج.م</span>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-info text-info hover:bg-info/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, 'preparing');
                              }}
                            >
                              <ChefHat className="w-3 h-3" />
                              بدء التحضير
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-success text-success hover:bg-success/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, 'ready');
                              }}
                            >
                              <Check className="w-3 h-3" />
                              جاهز
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-primary text-primary hover:bg-primary/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id!, 'completed');
                              }}
                            >
                              <Check className="w-3 h-3" />
                              تم التسليم
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
