import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingCart, DollarSign, Users, Package, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock, BarChart3, ExternalLink, Store,
} from 'lucide-react';
import LiveOrdersPanel from '@/components/LiveOrdersPanel';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(280, 65%, 60%)'];

export default function Dashboard() {
  const { restaurantId } = useRestaurant();
  const [stats, setStats] = useState({ todaySales: 0, todayOrders: 0, todayProfit: 0, pendingOrders: 0, lowStockItems: 0, yesterdaySales: 0, yesterdayOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [orderTypesData, setOrderTypesData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => { if (restaurantId) loadDashboardData(); }, [restaurantId]);

  const loadDashboardData = async () => {
    if (!restaurantId) return;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = subDays(new Date(), 1).toISOString().split('T')[0];

    // Today's orders
    const { data: todayOrders } = await supabase.from('orders').select('*').eq('restaurant_id', restaurantId).gte('created_at', today);
    const { data: yesterdayOrders } = await supabase.from('orders').select('*').eq('restaurant_id', restaurantId).gte('created_at', yesterday).lt('created_at', today);

    const completed = (todayOrders || []).filter(o => o.status === 'completed');
    const yCompleted = (yesterdayOrders || []).filter(o => o.status === 'completed');
    const pending = (todayOrders || []).filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

    // Low stock
    const { data: products } = await supabase.from('products').select('*').eq('restaurant_id', restaurantId).eq('type', 'stored');
    const lowStock = (products || []).filter(p => p.quantity <= p.min_quantity_alert);

    setStats({
      todaySales: completed.reduce((s, o) => s + o.total, 0),
      todayOrders: completed.length,
      todayProfit: completed.reduce((s, o) => s + o.profit, 0),
      pendingOrders: pending.length,
      lowStockItems: lowStock.length,
      yesterdaySales: yCompleted.reduce((s, o) => s + o.total, 0),
      yesterdayOrders: yCompleted.length,
    });

    // Recent orders
    const { data: recent } = await supabase.from('orders').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false }).limit(5);
    setRecentOrders(recent || []);

    // Sales data for last 7 days
    const last7: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const ds = d.toISOString().split('T')[0];
      const de = subDays(new Date(), i - 1).toISOString().split('T')[0];
      const { data: dayOrders } = await supabase.from('orders').select('total, profit').eq('restaurant_id', restaurantId).eq('status', 'completed').gte('created_at', ds).lt('created_at', de);
      last7.push({
        name: format(d, 'EEE', { locale: ar }),
        value: (dayOrders || []).reduce((s, o) => s + o.total, 0),
        profit: (dayOrders || []).reduce((s, o) => s + o.profit, 0),
      });
    }
    setSalesData(last7);

    // Order types
    const dineIn = (todayOrders || []).filter(o => o.type === 'dine-in').length;
    const delivery = (todayOrders || []).filter(o => o.type === 'delivery').length;
    const takeaway = (todayOrders || []).filter(o => o.type === 'takeaway').length;
    setOrderTypesData([{ name: 'طاولات', value: dineIn }, { name: 'توصيل', value: delivery }, { name: 'استلام', value: takeaway }]);

    // Monthly data
    const monthlyStats: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const md = subMonths(new Date(), i);
      const ms = startOfMonth(md).toISOString();
      const me = endOfMonth(md).toISOString();
      const { data: mo } = await supabase.from('orders').select('total, profit').eq('restaurant_id', restaurantId).eq('status', 'completed').gte('created_at', ms).lte('created_at', me);
      monthlyStats.push({ name: format(md, 'MMM', { locale: ar }), sales: (mo || []).reduce((s, o) => s + o.total, 0), orders: (mo || []).length, profit: (mo || []).reduce((s, o) => s + o.profit, 0) });
    }
    setMonthlyData(monthlyStats);

    // Top products from order items
    const { data: orderItems } = await supabase.from('order_items').select('product_name, quantity, total, order_id').limit(500);
    if (orderItems) {
      const map = new Map<string, { count: number; revenue: number }>();
      orderItems.forEach(item => {
        const e = map.get(item.product_name) || { count: 0, revenue: 0 };
        map.set(item.product_name, { count: e.count + item.quantity, revenue: e.revenue + item.total });
      });
      setTopProducts(Array.from(map.entries()).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
    }
  };

  const formatCurrency = (v: number) => `${v.toFixed(2)} ج.م`;
  const calcTrend = (c: number, p: number) => { if (p === 0) return c > 0 ? '+100%' : '0%'; const ch = ((c - p) / p) * 100; return `${ch >= 0 ? '+' : ''}${ch.toFixed(0)}%`; };
  const salesTrend = calcTrend(stats.todaySales, stats.yesterdaySales);
  const ordersTrend = calcTrend(stats.todayOrders, stats.yesterdayOrders);

  const statCards = [
    { title: 'مبيعات اليوم', value: formatCurrency(stats.todaySales), icon: DollarSign, trend: salesTrend, trendUp: stats.todaySales >= stats.yesterdaySales, color: 'primary' },
    { title: 'الطلبات', value: stats.todayOrders, icon: ShoppingCart, trend: ordersTrend, trendUp: stats.todayOrders >= stats.yesterdayOrders, color: 'success' },
    { title: 'الأرباح', value: formatCurrency(stats.todayProfit), icon: TrendingUp, color: 'info' },
    { title: 'طلبات معلقة', value: stats.pendingOrders, icon: Clock, color: 'warning' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">مرحباً بك في نظام إدارة مطعمك</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
          <div className="flex bg-secondary rounded-lg p-1">
            <Button variant={viewMode === 'daily' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('daily')} className={viewMode === 'daily' ? 'gradient-primary text-primary-foreground' : ''}>يومي</Button>
            <Button variant={viewMode === 'monthly' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('monthly')} className={viewMode === 'monthly' ? 'gradient-primary text-primary-foreground' : ''}>شهري</Button>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-xs md:text-sm text-muted-foreground">التاريخ</p>
            <p className="text-sm md:text-base font-semibold text-foreground">{format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass shadow-card hover:shadow-glow transition-shadow duration-300">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 text-foreground truncate">{stat.value}</p>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 mt-1 md:mt-2 text-xs md:text-sm ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                        {stat.trendUp ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
                        <span>{stat.trend}</span>
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

      {/* Store Link */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20"><Store className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="font-semibold text-foreground">المتجر الإلكتروني</p>
                <p className="text-xs text-muted-foreground">شارك رابط المتجر مع عملائك</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground hidden md:block" dir="ltr">{window.location.origin}/store/{restaurantId || '...'}</code>
              <Link to={`/store/${restaurantId}`} target="_blank">
                <Button size="sm" variant="outline" className="border-primary/50 text-primary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/store/${restaurantId}`)}>
                  <ExternalLink className="w-4 h-4 ml-1" /> فتح المتجر
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {stats.lowStockItems > 0 && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-warning" />
            <div><p className="font-semibold text-warning">تنبيه المخزون</p><p className="text-sm text-muted-foreground">يوجد {stats.lowStockItems} منتج قارب على النفاذ</p></div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="glass shadow-card">
            <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />{viewMode === 'daily' ? 'المبيعات - آخر 7 أيام' : 'المبيعات الشهرية'}</CardTitle></CardHeader>
            <CardContent className="p-2 md:p-6">
              <div className="h-[200px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'daily' ? (
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(35, 95%, 55%)" stopOpacity={0} /></linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                      <XAxis dataKey="name" stroke="hsl(220, 10%, 60%)" />
                      <YAxis stroke="hsl(220, 10%, 60%)" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px' }} formatter={(v: number, n: string) => [`${v.toFixed(2)} ج.م`, n === 'value' ? 'المبيعات' : 'الأرباح']} />
                      <Legend formatter={(v) => v === 'value' ? 'المبيعات' : 'الأرباح'} />
                      <Area type="monotone" dataKey="value" stroke="hsl(35, 95%, 55%)" strokeWidth={2} fill="url(#salesGradient)" />
                      <Area type="monotone" dataKey="profit" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fill="url(#profitGradient)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                      <XAxis dataKey="name" stroke="hsl(220, 10%, 60%)" />
                      <YAxis stroke="hsl(220, 10%, 60%)" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px' }} formatter={(v: number, n: string) => [n === 'orders' ? v : `${v.toFixed(2)} ج.م`, n === 'sales' ? 'المبيعات' : n === 'profit' ? 'الأرباح' : 'الطلبات']} />
                      <Legend formatter={(v) => v === 'sales' ? 'المبيعات' : v === 'profit' ? 'الأرباح' : 'الطلبات'} />
                      <Bar dataKey="sales" fill="hsl(35, 95%, 55%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass shadow-card">
            <CardHeader><CardTitle className="text-foreground">توزيع الطلبات اليوم</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={orderTypesData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {orderTypesData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {orderTypesData.map((item, i) => <div key={item.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} /><span className="text-sm text-muted-foreground">{item.name} ({item.value})</span></div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass shadow-card">
            <CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-success" /> أفضل المنتجات مبيعاً</CardTitle></CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>لا توجد بيانات</p></div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-slate-400/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                        <div><p className="font-medium text-foreground line-clamp-1">{p.name}</p><p className="text-xs text-muted-foreground">{p.count} وحدة</p></div>
                      </div>
                      <p className="font-bold text-success">{p.revenue.toFixed(2)} ج.م</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="glass shadow-card h-full">
            <CardHeader><CardTitle className="text-foreground">آخر الطلبات</CardTitle></CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>لا توجد طلبات حتى الآن</p></div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${order.type === 'dine-in' ? 'bg-primary/20 text-primary' : order.type === 'delivery' ? 'bg-info/20 text-info' : 'bg-success/20 text-success'}`}><ShoppingCart className="w-4 h-4" /></div>
                        <div>
                          <p className="font-semibold text-foreground">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{order.type === 'dine-in' ? `طاولة ${order.table_name || ''}` : order.type === 'delivery' ? 'توصيل' : 'استلام'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{order.total.toFixed(2)} ج.م</p>
                        <Badge className={`text-xs ${order.status === 'completed' ? 'bg-success/20 text-success' : order.status === 'pending' ? 'bg-warning/20 text-warning' : order.status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-info/20 text-info'}`}>
                          {order.status === 'completed' ? 'مكتمل' : order.status === 'pending' ? 'في الانتظار' : order.status === 'preparing' ? 'قيد التحضير' : order.status === 'ready' ? 'جاهز' : 'ملغي'}
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
