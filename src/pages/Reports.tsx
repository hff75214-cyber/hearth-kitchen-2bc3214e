import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  BarChart3,
} from 'lucide-react';
import { db, Order, Product, DailySummary } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ReportData {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: { name: string; count: number; revenue: number }[];
  salesByType: { name: string; value: number }[];
  salesByPayment: { name: string; value: number }[];
  dailySales: { date: string; sales: number; profit: number }[];
}

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(0, 72%, 51%)'];

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const orders = await db.orders
      .where('createdAt')
      .aboveOrEqual(startDate)
      .and(o => o.status === 'completed')
      .toArray();

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Top products
    const productCounts = new Map<string, { count: number; revenue: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const current = productCounts.get(item.productName) || { count: 0, revenue: 0 };
        productCounts.set(item.productName, {
          count: current.count + item.quantity,
          revenue: current.revenue + item.total,
        });
      });
    });
    const topProducts = Array.from(productCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by type
    const dineIn = orders.filter(o => o.type === 'dine-in').reduce((sum, o) => sum + o.total, 0);
    const delivery = orders.filter(o => o.type === 'delivery').reduce((sum, o) => sum + o.total, 0);
    const takeaway = orders.filter(o => o.type === 'takeaway').reduce((sum, o) => sum + o.total, 0);
    const salesByType = [
      { name: 'طاولات', value: dineIn },
      { name: 'توصيل', value: delivery },
      { name: 'استلام', value: takeaway },
    ].filter(item => item.value > 0);

    // Sales by payment method
    const cash = orders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);
    const card = orders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.total, 0);
    const wallet = orders.filter(o => o.paymentMethod === 'wallet').reduce((sum, o) => sum + o.total, 0);
    const salesByPayment = [
      { name: 'نقدي', value: cash },
      { name: 'بطاقة', value: card },
      { name: 'محفظة', value: wallet },
    ].filter(item => item.value > 0);

    // Daily sales
    const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365;
    const dailySales: { date: string; sales: number; profit: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      dailySales.push({
        date: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
        profit: dayOrders.reduce((sum, o) => sum + o.profit, 0),
      });
    }

    setReportData({
      totalSales,
      totalProfit,
      totalOrders,
      avgOrderValue,
      topProducts,
      salesByType,
      salesByPayment,
      dailySales: dateRange === 'year' 
        ? dailySales.filter((_, i) => i % 7 === 0) // Weekly for year view
        : dailySales,
    });

    setLoading(false);
  };

  const exportReport = () => {
    if (!reportData) return;

    const report = {
      generatedAt: new Date().toISOString(),
      period: dateRange,
      summary: {
        totalSales: reportData.totalSales,
        totalProfit: reportData.totalProfit,
        totalOrders: reportData.totalOrders,
        avgOrderValue: reportData.avgOrderValue,
      },
      topProducts: reportData.topProducts,
      salesByType: reportData.salesByType,
      salesByPayment: reportData.salesByPayment,
      dailySales: reportData.dailySales,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
          <p className="text-muted-foreground mt-1">
            تحليل شامل للمبيعات والأرباح
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={(v: 'week' | 'month' | 'year') => setDateRange(v)}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <Calendar className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذه السنة</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline" className="border-border">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {reportData.totalSales.toFixed(0)} ج.م
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/20">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                  <p className="text-2xl font-bold text-success mt-1">
                    {reportData.totalProfit.toFixed(0)} ج.م
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-success/20">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {reportData.totalOrders}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-info/20">
                  <ShoppingCart className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الطلب</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {reportData.avgOrderValue.toFixed(0)} ج.م
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-warning/20">
                  <BarChart3 className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">المبيعات والأرباح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.dailySales}>
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
                    <XAxis dataKey="date" stroke="hsl(220, 10%, 60%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 60%)" fontSize={12} />
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
                      dataKey="sales"
                      name="المبيعات"
                      stroke="hsl(35, 95%, 55%)"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      name="الأرباح"
                      stroke="hsl(142, 76%, 36%)"
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sales by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">توزيع المبيعات حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.salesByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {reportData.salesByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(0)} ج.م`}
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 13%)',
                        border: '1px solid hsl(220, 15%, 22%)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              الأصناف الأكثر مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                  <XAxis type="number" stroke="hsl(220, 10%, 60%)" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(220, 10%, 60%)"
                    width={100}
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `${value.toFixed(0)} ج.م` : value,
                      name === 'revenue' ? 'الإيرادات' : 'الكمية'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 13%)',
                      border: '1px solid hsl(220, 15%, 22%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" name="الإيرادات" fill="hsl(35, 95%, 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">طرق الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {reportData.salesByPayment.map((item, index) => (
                <div
                  key={item.name}
                  className="p-4 rounded-xl text-center"
                  style={{ backgroundColor: `${COLORS[index]}20` }}
                >
                  <p className="text-2xl font-bold" style={{ color: COLORS[index] }}>
                    {item.value.toFixed(0)} ج.م
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {((item.value / reportData.totalSales) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}