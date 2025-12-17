import { useEffect, useState, useCallback } from 'react';
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
  Timer,
  Flame,
  Bell,
  Play,
  Pause,
} from 'lucide-react';
import { db, Order, addNotification } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface OrderWithTimer extends Order {
  elapsedTime?: number;
  maxPrepTime?: number;
}

export default function Kitchen() {
  const [orders, setOrders] = useState<OrderWithTimer[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    loadOrders();
    const ordersInterval = setInterval(loadOrders, 10000);
    const timerInterval = setInterval(() => {
      setCurrentTime(Date.now());
      checkAutoComplete();
    }, 1000);
    return () => {
      clearInterval(ordersInterval);
      clearInterval(timerInterval);
    };
  }, []);

  // Auto-complete orders when prep time is done
  const checkAutoComplete = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allOrders = await db.orders
      .where('createdAt')
      .above(today)
      .toArray();
    
    const preparingOrders = allOrders.filter(o => o.status === 'preparing');
    
    for (const order of preparingOrders) {
      const maxPrepTime = Math.max(...order.items.map(item => item.preparationTime || 0));
      if (maxPrepTime > 0) {
        const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
        const maxSeconds = maxPrepTime * 60;
        
        // Auto-mark as ready when time is up (or exceeded by 10 seconds grace)
        if (elapsed >= maxSeconds) {
          await db.orders.update(order.id!, { status: 'ready' });
          await addNotification({
            type: 'order_ready',
            title: 'طلب جاهز',
            message: `الطلب #${order.orderNumber} جاهز للتسليم`,
            relatedId: order.id,
          });
        }
      }
    }
  };

  const loadOrders = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allOrders = await db.orders
      .where('createdAt')
      .above(today)
      .reverse()
      .toArray();
    
    // Filter only orders with prepared items that are not completed
    const activeOrders = allOrders.filter(o => {
      const hasPreparedItems = o.items.some(item => item.preparationTime && item.preparationTime > 0);
      return hasPreparedItems && o.status !== 'completed' && o.status !== 'cancelled';
    });
    
    // Calculate max prep time for each order
    const ordersWithTimers = activeOrders.map(order => {
      const maxPrepTime = Math.max(...order.items.map(item => item.preparationTime || 0));
      return { ...order, maxPrepTime };
    });
    
    setOrders(ordersWithTimers);
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    await db.orders.update(orderId, { 
      status,
      ...(status === 'completed' ? { completedAt: new Date() } : {})
    });
    
    const statusLabels: Record<string, string> = {
      preparing: 'قيد التحضير',
      ready: 'جاهز للتسليم',
      delivered: 'تم التسليم',
      completed: 'مكتمل',
    };
    
    if (status === 'ready') {
      await addNotification({
        type: 'order_ready',
        title: 'طلب جاهز للتسليم',
        message: `الطلب جاهز للتسليم`,
        relatedId: orderId,
      });
    }
    
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

  const getElapsedTime = (order: OrderWithTimer) => {
    if (order.status !== 'preparing') return null;
    const startTime = new Date(order.createdAt).getTime();
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    return elapsed;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (order: OrderWithTimer) => {
    if (!order.maxPrepTime || order.status !== 'preparing') return 0;
    const elapsed = getElapsedTime(order);
    if (elapsed === null) return 0;
    const maxSeconds = order.maxPrepTime * 60;
    return Math.min((elapsed / maxSeconds) * 100, 100);
  };

  const isOvertime = (order: OrderWithTimer) => {
    if (!order.maxPrepTime || order.status !== 'preparing') return false;
    const elapsed = getElapsedTime(order);
    if (elapsed === null) return false;
    return elapsed > order.maxPrepTime * 60;
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            شاشة المطبخ
          </h1>
          <p className="text-muted-foreground mt-1">
            متابعة وإدارة الطلبات الواردة في الوقت الفعلي
          </p>
        </div>
        <Button onClick={loadOrders} variant="outline" className="border-border gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`glass shadow-card overflow-hidden ${pendingCount > 0 ? 'ring-2 ring-warning/50' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
              {pendingCount > 0 && (
                <div className="absolute top-2 left-2">
                  <Bell className="w-4 h-4 text-warning animate-bounce" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد التحضير</p>
                <p className="text-2xl font-bold text-info">{preparingCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                <CheckCircle className="w-6 h-6 text-white" />
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
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'الكل', icon: ChefHat },
          { key: 'pending', label: 'قيد الانتظار', icon: AlertCircle },
          { key: 'preparing', label: 'قيد التحضير', icon: Flame },
          { key: 'ready', label: 'جاهز', icon: CheckCircle },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            onClick={() => setFilter(key as typeof filter)}
            className={filter === key ? 'gradient-primary text-primary-foreground' : 'border-border'}
          >
            <Icon className="w-4 h-4 ml-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredOrders.map((order, index) => {
            const elapsed = getElapsedTime(order);
            const progress = getProgressPercentage(order);
            const overtime = isOvertime(order);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`glass shadow-card overflow-hidden relative ${
                  order.status === 'pending' ? 'ring-2 ring-warning/50' : ''
                } ${overtime ? 'ring-2 ring-destructive/50' : ''}`}>
                  
                  {/* Timer Header for Preparing Orders */}
                  {order.status === 'preparing' && order.maxPrepTime && (
                    <div className={`p-3 ${overtime ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20' : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${overtime ? 'bg-destructive/20' : 'bg-info/20'}`}>
                            <Timer className={`w-4 h-4 ${overtime ? 'text-destructive' : 'text-info'}`} />
                          </div>
                          <span className="text-sm font-medium text-foreground">وقت التحضير</span>
                        </div>
                        <div className={`font-mono text-xl font-bold ${overtime ? 'text-destructive animate-pulse' : 'text-info'}`}>
                          {elapsed !== null ? formatTime(elapsed) : '0:00'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress 
                          value={progress} 
                          className={`h-2 ${overtime ? '[&>div]:bg-destructive' : '[&>div]:bg-info'}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0:00</span>
                          <span>{formatTime(order.maxPrepTime * 60)}</span>
                        </div>
                      </div>
                      {overtime && (
                        <div className="mt-2 flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>تجاوز الوقت المحدد!</span>
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getOrderTypeIcon(order.type)}
                        <span className="text-primary font-mono">#{order.orderNumber.split('-').pop()}</span>
                      </CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status === 'pending' && 'انتظار'}
                        {order.status === 'preparing' && 'تحضير'}
                        {order.status === 'ready' && 'جاهز'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      {order.tableName && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="font-medium text-foreground">طاولة {order.tableName}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{item.productName}</span>
                              {item.preparationTime && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                  <Timer className="w-3 h-3" />
                                  <span>{item.preparationTime} دقيقة</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 mb-4">
                        <p className="text-sm text-warning flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                          onClick={() => updateOrderStatus(order.id!, 'preparing')}
                        >
                          <Play className="w-4 h-4 ml-2" />
                          بدء التحضير
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg"
                          onClick={() => updateOrderStatus(order.id!, 'ready')}
                        >
                          <CheckCircle className="w-4 h-4 ml-2" />
                          جاهز للتسليم
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          className="flex-1 gradient-primary text-primary-foreground shadow-lg"
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
            );
          })}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium text-muted-foreground">لا توجد طلبات حالياً</p>
          <p className="text-sm text-muted-foreground/70 mt-2">ستظهر الطلبات الجديدة هنا تلقائياً</p>
        </motion.div>
      )}
    </div>
  );
}
