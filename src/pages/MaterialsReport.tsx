import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  Calendar,
  Download,
  Boxes,
  BarChart3,
  Package,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { db, RawMaterial, ProductIngredient, Order, Settings } from '@/lib/database';
import { generatePDFReport } from '@/lib/pdfReport';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MaterialConsumption {
  materialId: number;
  materialName: string;
  unit: string;
  totalConsumed: number;
  totalCost: number;
  currentStock: number;
  minAlert: number;
}

interface DailyConsumption {
  date: string;
  consumption: number;
}

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(0, 72%, 51%)', 'hsl(280, 65%, 60%)'];

export default function MaterialsReport() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [consumptionData, setConsumptionData] = useState<MaterialConsumption[]>([]);
  const [dailyConsumption, setDailyConsumption] = useState<DailyConsumption[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
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

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Load all data
    const [allMaterials, allIngredients, orders] = await Promise.all([
      db.rawMaterials.toArray(),
      db.productIngredients.toArray(),
      db.orders
        .where('createdAt')
        .aboveOrEqual(startDate)
        .and(o => o.status === 'completed')
        .toArray(),
    ]);

    setMaterials(allMaterials.filter(m => m.isActive));

    // Calculate consumption for each material
    const consumptionMap = new Map<number, { consumed: number; cost: number }>();
    
    // Initialize all materials
    allMaterials.forEach(m => {
      if (m.id) consumptionMap.set(m.id, { consumed: 0, cost: 0 });
    });

    // Calculate consumption from orders
    for (const order of orders) {
      for (const item of order.items) {
        // Find ingredients for this product
        const productIngredients = allIngredients.filter(ing => ing.productId === item.productId);
        
        for (const ingredient of productIngredients) {
          const current = consumptionMap.get(ingredient.rawMaterialId) || { consumed: 0, cost: 0 };
          const material = allMaterials.find(m => m.id === ingredient.rawMaterialId);
          const consumed = ingredient.quantityUsed * item.quantity;
          
          consumptionMap.set(ingredient.rawMaterialId, {
            consumed: current.consumed + consumed,
            cost: current.cost + (consumed * (material?.costPerUnit || 0)),
          });
        }
      }
    }

    // Build consumption data array
    const consumptionArray: MaterialConsumption[] = [];
    consumptionMap.forEach((data, materialId) => {
      const material = allMaterials.find(m => m.id === materialId);
      if (material && data.consumed > 0) {
        consumptionArray.push({
          materialId,
          materialName: material.name,
          unit: material.unit,
          totalConsumed: data.consumed,
          totalCost: data.cost,
          currentStock: material.quantity,
          minAlert: material.minQuantityAlert,
        });
      }
    });

    // Sort by consumption
    consumptionArray.sort((a, b) => b.totalConsumed - a.totalConsumed);
    setConsumptionData(consumptionArray);

    // Calculate daily consumption
    const days = dateRange === 'week' ? 7 : 30;
    const dailyData: DailyConsumption[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      let dailyTotal = 0;
      for (const order of dayOrders) {
        for (const item of order.items) {
          const productIngredients = allIngredients.filter(ing => ing.productId === item.productId);
          for (const ingredient of productIngredients) {
            const material = allMaterials.find(m => m.id === ingredient.rawMaterialId);
            dailyTotal += ingredient.quantityUsed * item.quantity * (material?.costPerUnit || 0);
          }
        }
      }
      
      dailyData.push({
        date: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        consumption: dailyTotal,
      });
    }
    
    setDailyConsumption(dailyData);
    setLoading(false);
  };

  const totalConsumptionCost = consumptionData.reduce((sum, item) => sum + item.totalCost, 0);
  const lowStockMaterials = consumptionData.filter(m => m.currentStock <= m.minAlert);
  const pieData = consumptionData.slice(0, 5).map(item => ({
    name: item.materialName,
    value: item.totalCost,
  }));

  const exportReport = () => {
    generatePDFReport({
      title: 'تقرير استهلاك المواد الخام',
      subtitle: dateRange === 'week' ? 'آخر أسبوع' : 'هذا الشهر',
      data: [
        {
          type: 'stats',
          title: 'ملخص الاستهلاك',
          stats: [
            { label: 'إجمالي التكلفة', value: `${totalConsumptionCost.toFixed(0)} ج.م`, color: '#10b981' },
            { label: 'المواد المستهلكة', value: consumptionData.length.toString(), color: '#3b82f6' },
            { label: 'مواد منخفضة', value: lowStockMaterials.length.toString(), color: '#f59e0b' },
          ],
        },
        {
          type: 'table',
          title: 'تفاصيل الاستهلاك',
          tableHeaders: ['#', 'المادة الخام', 'الكمية المستهلكة', 'التكلفة', 'المخزون الحالي', 'الحالة'],
          tableRows: consumptionData.map((item, i) => [
            (i + 1).toString(),
            item.materialName,
            `${item.totalConsumed.toFixed(2)} ${item.unit}`,
            `${item.totalCost.toFixed(0)} ج.م`,
            `${item.currentStock} ${item.unit}`,
            item.currentStock <= item.minAlert ? '⚠️ منخفض' : '✅ متوفر',
          ]),
        },
        ...(lowStockMaterials.length > 0 ? [{
          type: 'text' as const,
          title: 'تنبيهات المخزون',
          text: `المواد التالية بحاجة لإعادة الطلب: ${lowStockMaterials.map(m => m.materialName).join('، ')}`,
        }] : []),
      ],
    }, settings);
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Boxes className="w-8 h-8 text-primary" />
            تقرير استهلاك المواد الخام
          </h1>
          <p className="text-muted-foreground mt-1">
            تحليل استهلاك المواد الخام والمكونات
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={(v: 'week' | 'month') => setDateRange(v)}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <Calendar className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline" className="border-border">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي تكلفة الاستهلاك</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {totalConsumptionCost.toFixed(0)} ج.م
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/20">
                  <TrendingDown className="w-6 h-6 text-primary" />
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
                  <p className="text-sm text-muted-foreground">مواد مستهلكة</p>
                  <p className="text-2xl font-bold text-info mt-1">
                    {consumptionData.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-info/20">
                  <Package className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`glass shadow-card ${lowStockMaterials.length > 0 ? 'border-warning' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مواد منخفضة</p>
                  <p className={`text-2xl font-bold mt-1 ${lowStockMaterials.length > 0 ? 'text-warning' : 'text-success'}`}>
                    {lowStockMaterials.length}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${lowStockMaterials.length > 0 ? 'bg-warning/20' : 'bg-success/20'}`}>
                  <AlertTriangle className={`w-6 h-6 ${lowStockMaterials.length > 0 ? 'text-warning' : 'text-success'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Consumption Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              الاستهلاك اليومي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyConsumption}>
                  <defs>
                    <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)} ج.م`, 'التكلفة']}
                  />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="hsl(142, 76%, 36%)"
                    fillOpacity={1}
                    fill="url(#consumptionGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Materials Pie Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Boxes className="w-5 h-5 text-primary" />
              أكثر المواد استهلاكاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value.toFixed(0)} ج.م`, 'التكلفة']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات استهلاك
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consumption Table */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">تفاصيل الاستهلاك</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">#</TableHead>
                <TableHead className="text-right text-muted-foreground">المادة الخام</TableHead>
                <TableHead className="text-right text-muted-foreground">الكمية المستهلكة</TableHead>
                <TableHead className="text-right text-muted-foreground">التكلفة</TableHead>
                <TableHead className="text-right text-muted-foreground">المخزون الحالي</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumptionData.map((item, index) => (
                <TableRow key={item.materialId} className="border-border">
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      {item.materialName}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {item.totalConsumed.toFixed(2)} {item.unit}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {item.totalCost.toFixed(0)} ج.م
                  </TableCell>
                  <TableCell className={item.currentStock <= item.minAlert ? 'text-warning font-bold' : 'text-muted-foreground'}>
                    {item.currentStock} {item.unit}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.currentStock === 0 ? 'bg-destructive/20 text-destructive' :
                      item.currentStock <= item.minAlert ? 'bg-warning/20 text-warning' :
                      'bg-success/20 text-success'
                    }`}>
                      {item.currentStock === 0 ? 'نفذ' : item.currentStock <= item.minAlert ? 'منخفض' : 'متوفر'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {consumptionData.length === 0 && (
            <div className="text-center py-16">
              <Boxes className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد بيانات استهلاك</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                ستظهر البيانات بعد ربط المنتجات بالمواد الخام وإتمام طلبات
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
