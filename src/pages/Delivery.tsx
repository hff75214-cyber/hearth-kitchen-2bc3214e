import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Package,
  Navigation,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { db, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export default function Delivery() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivered'>('all');

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
    
    // Filter only delivery orders that are not completed or cancelled
    setOrders(allOrders.filter(o => o.type === 'delivery' && o.status !== 'completed' && o.status !== 'cancelled'));
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    await db.orders.update(orderId, { 
      status,
      ...(status === 'completed' ? { completedAt: new Date() } : {})
    });
    
    const statusLabels: Record<string, string> = {
      preparing: 'قيد التحضير',
      ready: 'جاهز للتوصيل',
      delivered: 'في الطريق',
      completed: 'تم التسليم',
    };
    
    toast({ title: 'تم التحديث', description: `حالة الطلب: ${statusLabels[status]}` });
    loadOrders();
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'preparing':
        return 'bg-info/20 text-info border-info/30';
      case 'ready':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'delivered':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'preparing': return 'قيد التحضير';
      case 'ready': return 'جاهز للتوصيل';
      case 'delivered': return 'في الطريق';
      default: return status;
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
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" />
            إدارة التوصيل
          </h1>
          <p className="text-muted-foreground mt-1">
            متابعة وإدارة طلبات التوصيل
          </p>
        </div>
        <Button onClick={loadOrders} variant="outline" className="border-border">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">جاهز للتوصيل</p>
                <p className="text-2xl font-bold text-primary">{readyCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <Navigation className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">في الطريق</p>
                <p className="text-2xl font-bold text-success">{deliveredCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'قيد الانتظار' },
          { key: 'preparing', label: 'قيد التحضير' },
          { key: 'ready', label: 'جاهز للتوصيل' },
          { key: 'delivered', label: 'في الطريق' },
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

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`glass shadow-card overflow-hidden ${
                order.status === 'pending' ? 'border-warning/50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-bold text-primary">#{order.orderNumber}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          منذ {getTimeSinceOrder(order.createdAt)}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{order.customerName || 'غير معروف'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{order.customerPhone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground truncate">{order.customerAddress || '-'}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="border-border">
                            {item.productName} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Total & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">الإجمالي</p>
                        <p className="text-2xl font-bold text-primary">{order.total.toFixed(2)} ج.م</p>
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button
                            className="bg-info text-info-foreground hover:bg-info/90"
                            onClick={() => updateOrderStatus(order.id!, 'preparing')}
                          >
                            <Clock className="w-4 h-4 ml-2" />
                            بدء التحضير
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => updateOrderStatus(order.id!, 'ready')}
                          >
                            <Package className="w-4 h-4 ml-2" />
                            جاهز للتوصيل
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            className="bg-success text-success-foreground hover:bg-success/90"
                            onClick={() => updateOrderStatus(order.id!, 'delivered')}
                          >
                            <Navigation className="w-4 h-4 ml-2" />
                            بدء التوصيل
                          </Button>
                        )}
                        {order.status === 'delivered' && (
                          <Button
                            className="gradient-primary text-primary-foreground"
                            onClick={() => updateOrderStatus(order.id!, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4 ml-2" />
                            تم التسليم
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16">
          <Truck className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد طلبات توصيل حالياً</p>
        </div>
      )}
    </div>
  );
}
