import { useEffect, useState, useCallback } from 'react';
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
  Calendar,
  BarChart3,
} from 'lucide-react';
import LiveOrdersPanel from '@/components/LiveOrdersPanel';
import { db, Order, Product } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayProfit: number;
  pendingOrders: number;
  lowStockItems: number;
  occupiedTables: number;
  yesterdaySales: number;
  yesterdayOrders: number;
}

interface MonthlyData {
  name: string;
  sales: number;
  orders: number;
  profit: number;
}

interface HourlyData {
  hour: string;
  sales: number;
  orders: number;
}

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(280, 65%, 60%)'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayOrders: 0,
    todayProfit: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    occupiedTables: 0,
    yesterdaySales: 0,
    yesterdayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; value: number; profit: number }[]>([]);
  const [orderTypesData, setOrderTypesData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Yesterday's data for comparison
    const yesterday = subDays(today, 1);
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Today's orders
    const todayOrders = await db.orders
      .where('createdAt')
      .between(startOfDay, endOfDay)
      .toArray();

    // Yesterday's orders
    const yesterdayOrders = await db.orders
      .where('createdAt')
      .between(yesterdayStart, yesterdayEnd)
      .toArray();

    const completedOrders = todayOrders.filter(o => o.status === 'completed');
    const yesterdayCompleted = yesterdayOrders.filter(o => o.status === 'completed');

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
      yesterdaySales: yesterdayCompleted.reduce((sum, o) => sum + o.total, 0),
      yesterdayOrders: yesterdayCompleted.length,
    });

    // Recent orders
    const recent = await db.orders.orderBy('createdAt').reverse().limit(5).toArray();
    setRecentOrders(recent);

    // Sales data for last 7 days
    const last7Days: { name: string; value: number; profit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = await db.orders
        .where('createdAt')
        .between(dayStart, dayEnd)
        .and(o => o.status === 'completed')
        .toArray();
      
      last7Days.push({
        name: format(dayStart, 'EEE', { locale: ar }),
        value: dayOrders.reduce((sum, o) => sum + o.total, 0),
        profit: dayOrders.reduce((sum, o) => sum + o.profit, 0),
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

    // Monthly data for last 6 months
    const monthlyStats: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthOrders = await db.orders
        .where('createdAt')
        .between(monthStart, monthEnd)
        .and(o => o.status === 'completed')
        .toArray();
      
      monthlyStats.push({
        name: format(monthDate, 'MMM', { locale: ar }),
        sales: monthOrders.reduce((sum, o) => sum + o.total, 0),
        orders: monthOrders.length,
        profit: monthOrders.reduce((sum, o) => sum + o.profit, 0),
      });
    }
    setMonthlyData(monthlyStats);

    // Hourly sales distribution (today)
    const hourlyStats: HourlyData[] = [];
    for (let hour = 8; hour <= 23; hour++) {
      const hourStart = new Date(startOfDay);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(startOfDay);
      hourEnd.setHours(hour, 59, 59, 999);
      
      const hourOrders = todayOrders.filter(o => {
        const orderTime = new Date(o.createdAt);
        return orderTime >= hourStart && orderTime <= hourEnd && o.status === 'completed';
      });
      
      hourlyStats.push({
        hour: `${hour}:00`,
        sales: hourOrders.reduce((sum, o) => sum + o.total, 0),
        orders: hourOrders.length,
      });
    }
    setHourlyData(hourlyStats);

    // Top selling products
    const productSales = new Map<string, { count: number; revenue: number }>();
    const allOrders = await db.orders.toArray();
    allOrders.forEach(order => {
      if (order.status === 'completed') {
        order.items.forEach(item => {
          const existing = productSales.get(item.productName) || { count: 0, revenue: 0 };
          productSales.set(item.productName, {
            count: existing.count + item.quantity,
            revenue: existing.revenue + item.total,
          });
        });
      }
    });
    
    const topSelling = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    setTopProducts(topSelling);
  };

  const formatCurrency = (value: number) => `${value.toFixed(2)} ج.م`;

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  const salesTrend = calculateTrend(stats.todaySales, stats.yesterdaySales);
  const ordersTrend = calculateTrend(stats.todayOrders, stats.yesterdayOrders);
  const isSalesTrendUp = stats.todaySales >= stats.yesterdaySales;
  const isOrdersTrendUp = stats.todayOrders >= stats.yesterdayOrders;

  const statCards = [
    {
      title: 'مبيعات اليوم',
      value: formatCurrency(stats.todaySales),
      icon: DollarSign,
      trend: salesTrend,
      trendUp: isSalesTrendUp,
      color: 'primary',
    },
    {
      title: 'الطلبات',
      value: stats.todayOrders,
      icon: ShoppingCart,
      trend: ordersTrend,
      trendUp: isOrdersTrendUp,
      color: 'success',
    },
    {
      title: 'الأرباح',
      value: formatCurrency(stats.todayProfit),
      icon: TrendingUp,
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            مرحباً بك في نظام كاشير محمد أيمن
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('daily')}
              className={viewMode === 'daily' ? 'gradient-primary text-primary-foreground' : ''}
            >
              يومي
            </Button>
            <Button
              variant={viewMode === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('monthly')}
              className={viewMode === 'monthly' ? 'gradient-primary text-primary-foreground' : ''}
            >
              شهري
            </Button>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-xs md:text-sm text-muted-foreground">التاريخ</p>
            <p className="text-sm md:text-base font-semibold text-foreground">
              {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass shadow-card hover:shadow-glow transition-shadow duration-300">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 text-foreground truncate">{stat.value}</p>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 mt-1 md:mt-2 text-xs md:text-sm ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                        {stat.trendUp ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
                        <span className="hidden sm:inline">{stat.trend} من أمس</span>
                        <span className="sm:hidden">{stat.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-2 md:p-3 rounded-xl flex-shrink-0 ${stat.color === 'primary' ? 'bg-primary/20' : stat.color === 'success' ? 'bg-success/20' : stat.color === 'info' ? 'bg-info/20' : 'bg-warning/20'}`}>
                    <stat.icon className={`w-4 h-4 md:w-6 md:h-6 ${stat.color === 'primary' ? 'text-primary' : stat.color === 'success' ? 'text-success' : stat.color === 'info' ? 'text-info' : 'text-warning'}`} />
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

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass shadow-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 md:p-6">
              <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {viewMode === 'daily' ? 'المبيعات - آخر 7 أيام' : 'المبيعات الشهرية'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <div className="h-[200px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'daily' ? (
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
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
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(2)} ج.م`,
                          name === 'value' ? 'المبيعات' : 'الأرباح'
                        ]}
                      />
                      <Legend formatter={(value) => value === 'value' ? 'المبيعات' : 'الأرباح'} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(35, 95%, 55%)"
                        strokeWidth={2}
                        fill="url(#salesGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="hsl(142, 76%, 36%)"
                        strokeWidth={2}
                        fill="url(#profitGradient)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                      <XAxis dataKey="name" stroke="hsl(220, 10%, 60%)" />
                      <YAxis stroke="hsl(220, 10%, 60%)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(220, 18%, 13%)',
                          border: '1px solid hsl(220, 15%, 22%)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'orders' ? value : `${value.toFixed(2)} ج.م`,
                          name === 'sales' ? 'المبيعات' : name === 'profit' ? 'الأرباح' : 'الطلبات'
                        ]}
                      />
                      <Legend formatter={(value) => value === 'sales' ? 'المبيعات' : value === 'profit' ? 'الأرباح' : 'الطلبات'} />
                      <Bar dataKey="sales" fill="hsl(35, 95%, 55%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
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
              <CardTitle className="text-foreground">توزيع الطلبات اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
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
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {orderTypesData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-info" />
                المبيعات حسب الساعة - اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                    <XAxis dataKey="hour" stroke="hsl(220, 10%, 60%)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="hsl(220, 10%, 60%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 13%)',
                        border: '1px solid hsl(220, 15%, 22%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'sales' ? `${value.toFixed(2)} ج.م` : value,
                        name === 'sales' ? 'المبيعات' : 'الطلبات'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(199, 89%, 48%)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(199, 89%, 48%)', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-success" />
                أفضل المنتجات مبيعاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد بيانات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          index === 1 ? 'bg-slate-400/20 text-slate-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.count} وحدة</p>
                        </div>
                      </div>
                      <p className="font-bold text-success">{product.revenue.toFixed(2)} ج.م</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Live Orders Panel + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Orders Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <LiveOrdersPanel />
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass shadow-card h-full">
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
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
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
                        <Badge className={`text-xs ${
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
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}