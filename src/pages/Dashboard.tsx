import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { db, Order, Product } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayProfit: number;
  pendingOrders: number;
  lowStockItems: number;
  occupiedTables: number;
}

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayOrders: 0,
    todayProfit: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    occupiedTables: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; value: number }[]>([]);
  const [orderTypesData, setOrderTypesData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Today's orders
    const todayOrders = await db.orders
      .where('createdAt')
      .between(startOfDay, endOfDay)
      .toArray();

    const completedOrders = todayOrders.filter(o => o.status === 'completed');

    // Low stock items
    const products = await db.products.toArray();
    const lowStock = products.filter(p => p.type === 'stored' && p.quantity <= p.minQuantityAlert);

    // Occupied tables
    const tables = await db.restaurantTables.where('status').equals('occupied').count();

    // Pending orders
    const pending = todayOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    setStats({
      todaySales: completedOrders.reduce((sum, o) => sum + o.total, 0),
      todayOrders: completedOrders.length,
      todayProfit: completedOrders.reduce((sum, o) => sum + o.profit, 0),
      pendingOrders: pending.length,
      lowStockItems: lowStock.length,
      occupiedTables: tables,
    });

    // Recent orders
    const recent = await db.orders.orderBy('createdAt').reverse().limit(5).toArray();
    setRecentOrders(recent);

    // Sales data for last 7 days
    const last7Days: { name: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = await db.orders
        .where('createdAt')
        .between(dayStart, dayEnd)
        .and(o => o.status === 'completed')
        .toArray();
      
      last7Days.push({
        name: new Date(dayStart).toLocaleDateString('ar-EG', { weekday: 'short' }),
        value: dayOrders.reduce((sum, o) => sum + o.total, 0),
      });
    }
    setSalesData(last7Days);

    // Order types distribution
    const dineIn = todayOrders.filter(o => o.type === 'dine-in').length;
    const delivery = todayOrders.filter(o => o.type === 'delivery').length;
    const takeaway = todayOrders.filter(o => o.type === 'takeaway').length;
    setOrderTypesData([
      { name: 'طاولات', value: dineIn },
      { name: 'توصيل', value: delivery },
      { name: 'استلام', value: takeaway },
    ]);
  };

  const formatCurrency = (value: number) => `${value.toFixed(2)} ج.م`;

  const statCards = [
    {
      title: 'مبيعات اليوم',
      value: formatCurrency(stats.todaySales),
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'primary',
    },
    {
      title: 'الطلبات',
      value: stats.todayOrders,
      icon: ShoppingCart,
      trend: '+5%',
      trendUp: true,
      color: 'success',
    },
    {
      title: 'الأرباح',
      value: formatCurrency(stats.todayProfit),
      icon: TrendingUp,
      trend: '+8%',
      trendUp: true,
      color: 'info',
    },
    {
      title: 'طلبات معلقة',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            مرحباً بك في نظام كاشير المطعم
          </p>
        </div>
        <div className="text-left">
          <p className="text-sm text-muted-foreground">التاريخ</p>
          <p className="font-semibold text-foreground">
            {new Date().toLocaleDateString('ar-EG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass shadow-card hover:shadow-glow transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                        {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{stat.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color === 'primary' ? 'bg-primary/20' : stat.color === 'success' ? 'bg-success/20' : stat.color === 'info' ? 'bg-info/20' : 'bg-warning/20'}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color === 'primary' ? 'text-primary' : stat.color === 'success' ? 'text-success' : stat.color === 'info' ? 'text-info' : 'text-warning'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {stats.lowStockItems > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-warning/50 bg-warning/10">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <div>
                <p className="font-semibold text-warning">تنبيه المخزون</p>
                <p className="text-sm text-muted-foreground">
                  يوجد {stats.lowStockItems} منتج قارب على النفاذ
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">المبيعات - آخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                    <XAxis dataKey="name" stroke="hsl(220, 10%, 60%)" />
                    <YAxis stroke="hsl(220, 10%, 60%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 13%)',
                        border: '1px solid hsl(220, 15%, 22%)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(40, 20%, 95%)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(35, 95%, 55%)"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Types Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">توزيع الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderTypesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 13%)',
                        border: '1px solid hsl(220, 15%, 22%)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {orderTypesData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد طلبات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        order.type === 'dine-in' ? 'bg-primary/20 text-primary' :
                        order.type === 'delivery' ? 'bg-info/20 text-info' :
                        'bg-success/20 text-success'
                      }`}>
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.type === 'dine-in' ? `طاولة ${order.tableName || ''}` :
                           order.type === 'delivery' ? 'توصيل' : 'استلام'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{order.total.toFixed(2)} ج.م</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed' ? 'bg-success/20 text-success' :
                        order.status === 'pending' ? 'bg-warning/20 text-warning' :
                        order.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                        'bg-info/20 text-info'
                      }`}>
                        {order.status === 'completed' ? 'مكتمل' :
                         order.status === 'pending' ? 'في الانتظار' :
                         order.status === 'preparing' ? 'قيد التحضير' :
                         order.status === 'ready' ? 'جاهز' :
                         order.status === 'delivered' ? 'تم التوصيل' :
                         'ملغي'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}