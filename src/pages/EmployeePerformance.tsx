import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  Award,
  Download,
  Calendar,
  BarChart3,
  Target,
  FileText,
} from 'lucide-react';
import { db, Order, SystemUser, WorkShift, Settings } from '@/lib/database';
import { generatePDFReport } from '@/lib/pdfReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

interface EmployeePerformance {
  userId: number;
  userName: string;
  userRole: string;
  totalSales: number;
  totalProfit: number;
  ordersCount: number;
  avgOrderValue: number;
  totalHours: number;
  salesPerHour: number;
  ordersPerHour: number;
  topSellingProducts: { name: string; count: number }[];
  dailyTrend: { date: string; sales: number; orders: number }[];
  // Comparison with previous period
  salesChange: number;
  ordersChange: number;
}

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(280, 70%, 50%)', 'hsl(0, 72%, 51%)'];

export default function EmployeePerformance() {
  const [performances, setPerformances] = useState<EmployeePerformance[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedUser, setSelectedUser] = useState<number | 'all'>('all');
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadSettings = async () => {
    const settingsData = await db.settings.toArray();
    if (settingsData.length > 0) {
      setSettings(settingsData[0]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = subDays(now, 7);
        prevStartDate = subDays(now, 14);
        prevEndDate = subDays(now, 7);
        break;
      case 'month':
        startDate = startOfMonth(now);
        prevStartDate = startOfMonth(subMonths(now, 1));
        prevEndDate = endOfMonth(subMonths(now, 1));
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    const [orders, previousOrders, shifts, usersData] = await Promise.all([
      db.orders
        .where('createdAt')
        .aboveOrEqual(startDate)
        .and(o => o.status === 'completed' && o.userId !== undefined)
        .toArray(),
      db.orders
        .where('createdAt')
        .between(prevStartDate, prevEndDate)
        .and(o => o.status === 'completed' && o.userId !== undefined)
        .toArray(),
      db.workShifts
        .where('startTime')
        .aboveOrEqual(startDate)
        .toArray(),
      db.systemUsers.where('isActive').equals(1).toArray(),
    ]);

    setUsers(usersData);

    // Group by user
    const userPerformanceMap = new Map<number, EmployeePerformance>();
    const prevUserSales = new Map<number, { sales: number; orders: number }>();

    // Previous period data
    previousOrders.forEach(order => {
      if (order.userId) {
        const prev = prevUserSales.get(order.userId) || { sales: 0, orders: 0 };
        prev.sales += order.total;
        prev.orders += 1;
        prevUserSales.set(order.userId, prev);
      }
    });

    // Calculate shifts hours per user
    const userHours = new Map<number, number>();
    shifts.forEach(shift => {
      if (shift.totalHours) {
        const current = userHours.get(shift.userId) || 0;
        userHours.set(shift.userId, current + shift.totalHours);
      }
    });

    // Current period data
    orders.forEach(order => {
      if (!order.userId) return;
      
      const existing = userPerformanceMap.get(order.userId);
      
      if (existing) {
        existing.totalSales += order.total;
        existing.totalProfit += order.profit;
        existing.ordersCount += 1;
        
        // Track products
        order.items.forEach(item => {
          const productIndex = existing.topSellingProducts.findIndex(p => p.name === item.productName);
          if (productIndex >= 0) {
            existing.topSellingProducts[productIndex].count += item.quantity;
          } else {
            existing.topSellingProducts.push({ name: item.productName, count: item.quantity });
          }
        });
        
        // Daily trend
        const dateStr = format(new Date(order.createdAt), 'yyyy-MM-dd');
        const dayIndex = existing.dailyTrend.findIndex(d => d.date === dateStr);
        if (dayIndex >= 0) {
          existing.dailyTrend[dayIndex].sales += order.total;
          existing.dailyTrend[dayIndex].orders += 1;
        } else {
          existing.dailyTrend.push({ date: dateStr, sales: order.total, orders: 1 });
        }
      } else {
        const user = usersData.find(u => u.id === order.userId);
        const prev = prevUserSales.get(order.userId);
        const hours = userHours.get(order.userId) || 1;
        
        userPerformanceMap.set(order.userId, {
          userId: order.userId,
          userName: order.userName || user?.name || 'غير معروف',
          userRole: user?.role || 'unknown',
          totalSales: order.total,
          totalProfit: order.profit,
          ordersCount: 1,
          avgOrderValue: 0,
          totalHours: hours,
          salesPerHour: 0,
          ordersPerHour: 0,
          topSellingProducts: order.items.map(item => ({ name: item.productName, count: item.quantity })),
          dailyTrend: [{ date: format(new Date(order.createdAt), 'yyyy-MM-dd'), sales: order.total, orders: 1 }],
          salesChange: prev ? ((order.total - prev.sales) / prev.sales) * 100 : 0,
          ordersChange: prev ? ((1 - prev.orders) / prev.orders) * 100 : 0,
        });
      }
    });

    // Calculate averages and sort
    const performanceArray = Array.from(userPerformanceMap.values()).map(p => {
      p.avgOrderValue = p.ordersCount > 0 ? p.totalSales / p.ordersCount : 0;
      p.salesPerHour = p.totalHours > 0 ? p.totalSales / p.totalHours : 0;
      p.ordersPerHour = p.totalHours > 0 ? p.ordersCount / p.totalHours : 0;
      p.topSellingProducts = p.topSellingProducts.sort((a, b) => b.count - a.count).slice(0, 5);
      
      // Recalculate changes
      const prev = prevUserSales.get(p.userId);
      if (prev) {
        p.salesChange = ((p.totalSales - prev.sales) / prev.sales) * 100;
        p.ordersChange = ((p.ordersCount - prev.orders) / prev.orders) * 100;
      }
      
      return p;
    }).sort((a, b) => b.totalSales - a.totalSales);

    setPerformances(performanceArray);
    setLoading(false);
  };

  const exportReport = () => {
    generatePDFReport({
      title: 'تقرير أداء الموظفين',
      subtitle: dateRange === 'week' ? 'آخر أسبوع' : dateRange === 'month' ? 'هذا الشهر' : 'هذه السنة',
      data: [
        {
          type: 'stats',
          title: 'ملخص عام',
          stats: [
            { label: 'عدد الموظفين', value: performances.length.toString(), color: '#3b82f6' },
            { label: 'إجمالي المبيعات', value: `${performances.reduce((s, p) => s + p.totalSales, 0).toFixed(0)} ج.م`, color: '#f97316' },
            { label: 'إجمالي الأرباح', value: `${performances.reduce((s, p) => s + p.totalProfit, 0).toFixed(0)} ج.م`, color: '#10b981' },
            { label: 'إجمالي الطلبات', value: performances.reduce((s, p) => s + p.ordersCount, 0).toString(), color: '#8b5cf6' },
          ],
        },
        {
          type: 'table',
          title: 'أداء الموظفين بالتفصيل',
          tableHeaders: ['#', 'الموظف', 'المبيعات', 'الأرباح', 'الطلبات', 'متوسط الطلب', 'ساعات العمل'],
          tableRows: performances.map((p, i) => [
            (i + 1).toString(),
            p.userName,
            `${p.totalSales.toFixed(0)} ج.م`,
            `${p.totalProfit.toFixed(0)} ج.م`,
            p.ordersCount.toString(),
            `${p.avgOrderValue.toFixed(0)} ج.م`,
            `${p.totalHours.toFixed(1)} ساعة`,
          ]),
        },
        {
          type: 'text',
          title: 'ملاحظات',
          text: performances.length > 0 
            ? `أفضل موظف: ${performances[0].userName} بمبيعات ${performances[0].totalSales.toFixed(0)} ج.م`
            : 'لا توجد بيانات',
        },
      ],
    }, settings);
  };

  const filteredPerformances = selectedUser === 'all' 
    ? performances 
    : performances.filter(p => p.userId === selectedUser);

  // Chart data
  const salesComparisonData = performances.slice(0, 10).map(p => ({
    name: p.userName.split(' ')[0],
    sales: p.totalSales,
    profit: p.totalProfit,
    orders: p.ordersCount,
  }));

  const radarData = filteredPerformances.length === 1 ? [
    { subject: 'المبيعات', value: Math.min(filteredPerformances[0].totalSales / Math.max(...performances.map(p => p.totalSales)) * 100, 100) },
    { subject: 'الطلبات', value: Math.min(filteredPerformances[0].ordersCount / Math.max(...performances.map(p => p.ordersCount)) * 100, 100) },
    { subject: 'متوسط الطلب', value: Math.min(filteredPerformances[0].avgOrderValue / Math.max(...performances.map(p => p.avgOrderValue)) * 100, 100) },
    { subject: 'الأرباح', value: Math.min(filteredPerformances[0].totalProfit / Math.max(...performances.map(p => p.totalProfit)) * 100, 100) },
    { subject: 'الإنتاجية', value: Math.min(filteredPerformances[0].salesPerHour / Math.max(...performances.map(p => p.salesPerHour)) * 100, 100) },
  ] : [];

  // Summary stats
  const totalSales = performances.reduce((sum, p) => sum + p.totalSales, 0);
  const totalOrders = performances.reduce((sum, p) => sum + p.ordersCount, 0);
  const avgPerformance = performances.length > 0 ? totalSales / performances.length : 0;
  const topPerformer = performances[0];

  if (loading) {
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
          <h1 className="text-3xl font-bold text-foreground">أداء الموظفين</h1>
          <p className="text-muted-foreground mt-1">مقارنة المبيعات والطلبات لكل موظف</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-primary">{totalSales.toFixed(0)} ج.م</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متوسط الأداء</p>
                  <p className="text-2xl font-bold text-foreground">{avgPerformance.toFixed(0)} ج.م</p>
                </div>
                <Target className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الأفضل أداءً</p>
                  <p className="text-xl font-bold text-primary">{topPerformer?.userName || '-'}</p>
                </div>
                <Award className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter by user */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-muted-foreground">عرض موظف محدد:</Label>
            <Select value={selectedUser.toString()} onValueChange={(v) => setSelectedUser(v === 'all' ? 'all' : parseInt(v))}>
              <SelectTrigger className="w-60">
                <SelectValue placeholder="اختر موظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id!.toString()}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Comparison */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              مقارنة المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" name="المبيعات" fill="hsl(35, 95%, 55%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="profit" name="الأرباح" fill="hsl(142, 76%, 36%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart for selected user */}
        {filteredPerformances.length === 1 && (
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                تحليل أداء {filteredPerformances[0].userName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Radar
                      name="الأداء"
                      dataKey="value"
                      stroke="hsl(35, 95%, 55%)"
                      fill="hsl(35, 95%, 55%)"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders comparison */}
        <Card className={`glass shadow-card ${filteredPerformances.length === 1 ? '' : 'lg:col-span-2'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
              مقارنة عدد الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="orders" name="الطلبات" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            جدول أداء الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right p-3 text-muted-foreground font-medium">#</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">الموظف</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">المبيعات</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">الأرباح</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">الطلبات</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">متوسط الطلب</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">ساعات العمل</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">المبيعات/ساعة</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">التغير</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformances.map((p, index) => (
                  <motion.tr
                    key={p.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-secondary/30"
                  >
                    <td className="p-3">
                      {index < 3 ? (
                        <Badge className={`
                          ${index === 0 ? 'bg-yellow-500/20 text-yellow-600' : ''}
                          ${index === 1 ? 'bg-gray-300/20 text-gray-600' : ''}
                          ${index === 2 ? 'bg-amber-600/20 text-amber-700' : ''}
                        `}>
                          {index + 1}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">{index + 1}</span>
                      )}
                    </td>
                    <td className="p-3 font-medium">{p.userName}</td>
                    <td className="p-3 font-bold text-primary">{p.totalSales.toFixed(0)} ج.م</td>
                    <td className="p-3 text-success">{p.totalProfit.toFixed(0)} ج.م</td>
                    <td className="p-3">{p.ordersCount}</td>
                    <td className="p-3">{p.avgOrderValue.toFixed(0)} ج.م</td>
                    <td className="p-3">{p.totalHours.toFixed(1)} س</td>
                    <td className="p-3">{p.salesPerHour.toFixed(0)} ج.م</td>
                    <td className="p-3">
                      <div className={`flex items-center gap-1 ${p.salesChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {p.salesChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{Math.abs(p.salesChange).toFixed(1)}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-sm font-medium ${className}`}>{children}</span>;
}
