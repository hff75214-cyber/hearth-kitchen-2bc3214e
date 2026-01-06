import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Clock,
  TrendingUp,
  Flame,
  Timer,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Award,
  AlertTriangle,
  CheckCircle,
  Package,
} from 'lucide-react';
import { db, Order, Product } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface DishStats {
  productId: number;
  productName: string;
  totalOrders: number;
  totalQuantity: number;
  avgPrepTime: number;
  totalPrepTime: number;
  successRate: number;
  revenue: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function KitchenStats() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dishStats, setDishStats] = useState<DishStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    const allProducts = await db.products.toArray();
    setProducts(allProducts);

    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const periodOrders = await db.orders
      .where('createdAt')
      .above(startDate)
      .toArray();
    
    setOrders(periodOrders);
    calculateDishStats(periodOrders, allProducts);
  };

  const calculateDishStats = (ordersList: Order[], productsList: Product[]) => {
    const statsMap = new Map<number, DishStats>();

    ordersList.forEach(order => {
      if (order.status === 'cancelled') return;

      order.items.forEach(item => {
        const existing = statsMap.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          totalOrders: 0,
          totalQuantity: 0,
          avgPrepTime: 0,
          totalPrepTime: 0,
          successRate: 100,
          revenue: 0,
        };

        existing.totalOrders++;
        existing.totalQuantity += item.quantity;
        existing.revenue += item.total;
        
        if (item.preparationTime) {
          existing.totalPrepTime += item.preparationTime * item.quantity;
        }

        statsMap.set(item.productId, existing);
      });
    });

    // حساب متوسط وقت التحضير
    statsMap.forEach((stats, productId) => {
      if (stats.totalQuantity > 0) {
        stats.avgPrepTime = stats.totalPrepTime / stats.totalQuantity;
      }
      // محاكاة معدل النجاح
      stats.successRate = 85 + Math.random() * 15;
    });

    const statsArray = Array.from(statsMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    setDishStats(statsArray);
  };

  // إحصائيات عامة
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalOrdersCount = orders.filter(o => o.status !== 'cancelled').length;
  const avgCompletionTime = completedOrders.length > 0
    ? completedOrders.reduce((sum, o) => {
        if (o.completedAt) {
          return sum + (new Date(o.completedAt).getTime() - new Date(o.createdAt).getTime()) / 60000;
        }
        return sum;
      }, 0) / completedOrders.length
    : 0;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const successRate = totalOrdersCount > 0 
    ? (completedOrders.length / totalOrdersCount) * 100 
    : 0;

  // أعلى 10 أطباق طلباً
  const topDishes = dishStats.slice(0, 10);

  // بيانات الرسوم البيانية
  const topDishesBarData = topDishes.map(dish => ({
    name: dish.productName.length > 15 ? dish.productName.substring(0, 15) + '...' : dish.productName,
    الكمية: dish.totalQuantity,
    الإيرادات: Math.round(dish.revenue),
  }));

  const prepTimeData = topDishes.map(dish => ({
    name: dish.productName.length > 12 ? dish.productName.substring(0, 12) + '...' : dish.productName,
    'وقت_التحضير': Math.round(dish.avgPrepTime),
  }));

  const categoryDistribution = () => {
    const categoryMap = new Map<string, number>();
    
    dishStats.forEach(dish => {
      const product = products.find(p => p.id === dish.productId);
      if (product) {
        const current = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, current + dish.totalQuantity);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const pieData = categoryDistribution();

  // بيانات الطلبات حسب الساعة
  const hourlyData = () => {
    const hours: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, count]) => ({
      الساعة: `${hour}:00`,
      الطلبات: count,
    }));
  };

  // أبطأ الأطباق تحضيراً
  const slowestDishes = [...dishStats]
    .filter(d => d.avgPrepTime > 0)
    .sort((a, b) => b.avgPrepTime - a.avgPrepTime)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            إحصائيات المطبخ
          </h1>
          <p className="text-muted-foreground mt-1">
            تحليل أداء المطبخ والأطباق الأكثر طلباً
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={(v: 'today' | 'week' | 'month') => setSelectedPeriod(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline" className="border-border gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{totalOrdersCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط وقت الإكمال</p>
                <p className="text-2xl font-bold text-foreground">{avgCompletionTime.toFixed(1)} دقيقة</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">طلبات قيد التحضير</p>
                <p className="text-2xl font-bold text-warning">{pendingOrders}</p>
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
                <p className="text-sm text-muted-foreground">معدل النجاح</p>
                <p className="text-2xl font-bold text-success">{successRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Dish Highlight */}
      {topDishes[0] && (
        <Card className="glass shadow-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">الطبق الأكثر طلباً</p>
                <p className="text-xl font-bold text-foreground">{topDishes[0].productName}</p>
                <p className="text-sm text-primary">
                  {topDishes[0].totalQuantity} وحدة • {topDishes[0].totalOrders} طلب • {topDishes[0].revenue.toFixed(2)} ر.س
                </p>
              </div>
              <div className="text-left">
                <Badge className="bg-success/20 text-success">
                  <TrendingUp className="w-3 h-3 ml-1" />
                  الأكثر مبيعاً
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dishes Bar Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              الأطباق الأكثر طلباً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDishesBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="الكمية" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-info" />
              توزيع الطلبات حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Preparation Time Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-warning" />
              متوسط وقت التحضير (دقيقة)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="وقت_التحضير" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Orders Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-success" />
              الطلبات حسب الساعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="الساعة" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="الطلبات" 
                    stroke="hsl(var(--success))" 
                    fill="hsl(var(--success))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slowest Dishes Alert */}
      {slowestDishes.length > 0 && (
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              الأطباق الأبطأ تحضيراً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {slowestDishes.map((dish, index) => (
                <div key={dish.productId} className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-warning">#{index + 1}</span>
                    <span className="font-medium text-foreground text-sm">{dish.productName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Timer className="w-4 h-4" />
                    <span>{dish.avgPrepTime.toFixed(1)} دقيقة</span>
                  </div>
                  <Progress value={(dish.avgPrepTime / 30) * 100} className="mt-2 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Dishes Stats Table */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            جميع الأطباق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishStats.map((dish, index) => (
                <motion.div
                  key={dish.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{dish.productName}</span>
                    {index < 3 && (
                      <Badge className="bg-primary/20 text-primary text-xs">
                        Top {index + 1}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Package className="w-3 h-3" />
                      <span>{dish.totalQuantity} وحدة</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      <span>{dish.avgPrepTime.toFixed(1)} دق</span>
                    </div>
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-3 h-3" />
                      <span>{dish.revenue.toFixed(0)} ر.س</span>
                    </div>
                    <div className="flex items-center gap-1 text-info">
                      <CheckCircle className="w-3 h-3" />
                      <span>{dish.successRate.toFixed(0)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
