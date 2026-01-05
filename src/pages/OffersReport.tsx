import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
} from 'lucide-react';
import { db, Offer, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
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
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface OfferAnalytics {
  offer: Offer;
  ordersCount: number;
  totalSales: number;
  totalDiscount: number;
  avgOrderValue: number;
  effectivenessScore: number;
}

export default function OffersReport() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<OfferAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [offersData, ordersData] = await Promise.all([
        db.offers.toArray(),
        db.orders.where('status').equals('completed').toArray(),
      ]);

      setOffers(offersData);
      setOrders(ordersData);

      // Calculate analytics for each offer
      const analyticsData = offersData.map(offer => {
        // Find orders that used this offer (based on date range and discount applied)
        const offerOrders = ordersData.filter(order => {
          const orderDate = new Date(order.createdAt);
          const startDate = new Date(offer.startDate);
          const endDate = new Date(offer.endDate);
          return orderDate >= startDate && orderDate <= endDate && order.discount > 0;
        });

        const ordersCount = offer.usageCount;
        const totalSales = offerOrders.reduce((sum, o) => sum + o.total, 0);
        const totalDiscount = offerOrders.reduce((sum, o) => sum + o.discount, 0);
        const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;
        
        // Effectiveness score: (usage / expected usage) * (sales generated / discount given)
        const usageRate = offer.usageLimit ? (offer.usageCount / offer.usageLimit) * 100 : (offer.usageCount > 0 ? 100 : 0);
        const roi = totalDiscount > 0 ? (totalSales / totalDiscount) : 0;
        const effectivenessScore = Math.min((usageRate * 0.3) + (roi * 10 * 0.7), 100);

        return {
          offer,
          ordersCount,
          totalSales,
          totalDiscount,
          avgOrderValue,
          effectivenessScore,
        };
      });

      setAnalytics(analyticsData.sort((a, b) => b.effectivenessScore - a.effectivenessScore));
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Summary stats
  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => {
    const now = new Date();
    return o.isActive && new Date(o.startDate) <= now && new Date(o.endDate) >= now;
  }).length;
  const totalUsage = offers.reduce((sum, o) => sum + o.usageCount, 0);
  const totalDiscountGiven = analytics.reduce((sum, a) => sum + a.totalDiscount, 0);
  const totalSalesWithOffers = analytics.reduce((sum, a) => sum + a.totalSales, 0);

  // Usage by offer type chart data
  const usageByType = [
    {
      name: 'نسبة مئوية',
      value: offers.filter(o => o.discountType === 'percentage').reduce((sum, o) => sum + o.usageCount, 0),
    },
    {
      name: 'مبلغ ثابت',
      value: offers.filter(o => o.discountType === 'fixed').reduce((sum, o) => sum + o.usageCount, 0),
    },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

  // Top offers chart data
  const topOffersData = analytics
    .slice(0, 5)
    .map(a => ({
      name: a.offer.name.substring(0, 15),
      usage: a.ordersCount,
      sales: a.totalSales,
    }));

  // Daily usage trend (last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay(date) && orderDate <= endOfDay(date) && order.discount > 0;
    });
    return {
      date: format(date, 'dd/MM'),
      orders: dayOrders.length,
      discount: dayOrders.reduce((sum, o) => sum + o.discount, 0),
    };
  });

  const exportReport = () => {
    const reportContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير فعالية العروض</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; direction: rtl; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; border-bottom: 3px solid #6366f1; padding-bottom: 15px; }
    h2 { color: #333; margin-top: 30px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .stat { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; }
    .stat-label { font-size: 12px; opacity: 0.9; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e5e5e5; padding: 12px; text-align: right; }
    th { background: #f8f9fa; font-weight: bold; }
    tr:nth-child(even) { background: #fafafa; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
    .badge-success { background: #dcfce7; color: #16a34a; }
    .badge-warning { background: #fef3c7; color: #d97706; }
    .badge-danger { background: #fee2e2; color: #dc2626; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 تقرير فعالية العروض والخصومات</h1>
    <p>التاريخ: ${format(new Date(), 'dd/MM/yyyy', { locale: ar })}</p>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${totalOffers}</div>
        <div class="stat-label">إجمالي العروض</div>
      </div>
      <div class="stat">
        <div class="stat-value">${activeOffers}</div>
        <div class="stat-label">عروض نشطة</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalUsage}</div>
        <div class="stat-label">إجمالي الاستخدام</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalDiscountGiven.toFixed(2)}</div>
        <div class="stat-label">إجمالي الخصومات (ج.م)</div>
      </div>
    </div>

    <h2>تفاصيل العروض</h2>
    <table>
      <thead>
        <tr>
          <th>العرض</th>
          <th>النوع</th>
          <th>القيمة</th>
          <th>الاستخدام</th>
          <th>المبيعات</th>
          <th>الخصومات</th>
          <th>الفعالية</th>
        </tr>
      </thead>
      <tbody>
        ${analytics.map(a => `
          <tr>
            <td>${a.offer.name}</td>
            <td>${a.offer.discountType === 'percentage' ? 'نسبة' : 'ثابت'}</td>
            <td>${a.offer.discountType === 'percentage' ? a.offer.discountValue + '%' : a.offer.discountValue + ' ج.م'}</td>
            <td>${a.ordersCount}</td>
            <td>${a.totalSales.toFixed(2)} ج.م</td>
            <td>${a.totalDiscount.toFixed(2)} ج.م</td>
            <td>
              <span class="badge ${a.effectivenessScore >= 70 ? 'badge-success' : a.effectivenessScore >= 40 ? 'badge-warning' : 'badge-danger'}">
                ${a.effectivenessScore.toFixed(0)}%
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام نقطة البيع</p>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offers-report-${format(new Date(), 'yyyy-MM-dd')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'تم تصدير التقرير بنجاح' });
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getEffectivenessBadge = (score: number) => {
    if (score >= 70) return <Badge className="bg-success/20 text-success">ممتاز</Badge>;
    if (score >= 40) return <Badge className="bg-warning/20 text-warning">جيد</Badge>;
    return <Badge className="bg-destructive/20 text-destructive">ضعيف</Badge>;
  };

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
          <h1 className="text-3xl font-bold text-foreground">تقرير فعالية العروض</h1>
          <p className="text-muted-foreground mt-1">تحليل شامل لأداء العروض والخصومات</p>
        </div>
        <Button onClick={exportReport} className="gap-2">
          <Download className="w-4 h-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العروض</p>
                <p className="text-2xl font-bold text-primary">{totalOffers}</p>
              </div>
              <Tag className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عروض نشطة</p>
                <p className="text-2xl font-bold text-success">{activeOffers}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاستخدام</p>
                <p className="text-2xl font-bold text-warning">{totalUsage}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الخصومات الممنوحة</p>
                <p className="text-2xl font-bold text-destructive">{totalDiscountGiven.toFixed(0)} ج.م</p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المبيعات مع العروض</p>
                <p className="text-2xl font-bold text-success">{totalSalesWithOffers.toFixed(0)} ج.م</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              اتجاه استخدام العروض (14 يوم)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last14Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="الطلبات"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage by Type */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              توزيع الاستخدام حسب نوع الخصم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {usageByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Offers */}
        <Card className="glass shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              أفضل العروض أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topOffersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis yAxisId="left" stroke="hsl(var(--primary))" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--success))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="usage" fill="hsl(var(--primary))" name="الاستخدام" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="sales" fill="hsl(var(--success))" name="المبيعات" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle>تحليل تفصيلي للعروض</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">العرض</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">النوع</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">القيمة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاستخدام</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">المبيعات</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">الخصومات</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">متوسط الطلب</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">الفعالية</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((a, index) => (
                  <motion.tr
                    key={a.offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-secondary/50"
                  >
                    <td className="py-3 px-4 font-medium">{a.offer.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {a.offer.discountType === 'percentage' ? 'نسبة' : 'ثابت'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {a.offer.discountType === 'percentage' 
                        ? `${a.offer.discountValue}%` 
                        : `${a.offer.discountValue} ج.م`}
                    </td>
                    <td className="py-3 px-4">{a.ordersCount}</td>
                    <td className="py-3 px-4 text-success">{a.totalSales.toFixed(2)} ج.م</td>
                    <td className="py-3 px-4 text-destructive">{a.totalDiscount.toFixed(2)} ج.م</td>
                    <td className="py-3 px-4">{a.avgOrderValue.toFixed(2)} ج.م</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getEffectivenessColor(a.effectivenessScore)}`}>
                          {a.effectivenessScore.toFixed(0)}%
                        </span>
                        {getEffectivenessBadge(a.effectivenessScore)}
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
