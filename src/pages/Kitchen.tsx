import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { db, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function Kitchen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allOrders = await db.orders
      .where('createdAt')
      .above(today)
      .reverse()
      .toArray();
    
    // Filter out completed and cancelled orders
    setOrders(allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled'));
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    await db.orders.update(orderId, { status });
    
    const statusLabels: Record<string, string> = {
      preparing: 'قيد التحضير',
      ready: 'جاهز للتسليم',
      delivered: 'تم التسليم',
      completed: 'مكتمل',
    };
    
    toast({ title: 'تم التحديث', description: `حالة الطلب: ${statusLabels[status]}` });
    loadOrders();
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getOrderTypeIcon = (type: Order['type']) => {
    switch (type) {
      case 'dine-in':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'delivery':
        return <Truck className="w-4 h-4" />;
      case 'takeaway':
        return <ShoppingBag className="w-4 h-4" />;
    }
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

  const getTimeSinceOrder = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `${minutes} دقيقة`;
    return `${Math.floor(minutes / 60)} ساعة`;
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-primary" />
            شاشة المطبخ
          </h1>
          <p className="text-muted-foreground mt-1">
            متابعة وإدارة الطلبات الواردة
          </p>
        </div>
        <Button onClick={loadOrders} variant="outline" className="border-border">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted">
                <ChefHat className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`glass shadow-card ${pendingCount > 0 ? 'border-warning/50' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/20">
                <Clock className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد التحضير</p>
                <p className="text-2xl font-bold text-info">{preparingCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">جاهز للتسليم</p>
                <p className="text-2xl font-bold text-success">{readyCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'قيد الانتظار' },
          { key: 'preparing', label: 'قيد التحضير' },
          { key: 'ready', label: 'جاهز' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key as typeof filter)}
            className={filter === key ? 'gradient-primary text-primary-foreground' : 'border-border'}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`glass shadow-card overflow-hidden ${
                order.status === 'pending' ? 'border-warning/50 animate-pulse' : ''
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getOrderTypeIcon(order.type)}
                      <span className="text-primary">#{order.orderNumber}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status === 'pending' && 'انتظار'}
                      {order.status === 'preparing' && 'تحضير'}
                      {order.status === 'ready' && 'جاهز'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>منذ {getTimeSinceOrder(order.createdAt)}</span>
                    {order.tableName && (
                      <>
                        <span>•</span>
                        <span>طاولة {order.tableName}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <span className="font-medium text-foreground">{item.productName}</span>
                        <Badge variant="outline" className="border-border">
                          x{item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-2 rounded-lg bg-warning/10 border border-warning/30 mb-4">
                      <p className="text-sm text-warning">ملاحظات: {order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button
                        className="flex-1 bg-info text-info-foreground hover:bg-info/90"
                        onClick={() => updateOrderStatus(order.id!, 'preparing')}
                      >
                        <Clock className="w-4 h-4 ml-2" />
                        بدء التحضير
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                        onClick={() => updateOrderStatus(order.id!, 'ready')}
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        جاهز للتسليم
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        className="flex-1 gradient-primary text-primary-foreground"
                        onClick={() => updateOrderStatus(order.id!, 'completed')}
                      >
                        <CheckCircle className="w-4 h-4 ml-2" />
                        تم التسليم
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
        </div>
      )}
    </div>
  );
}
