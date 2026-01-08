import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  Calendar as CalendarIcon,
  FileText,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { db, Expense, Order, Settings } from '@/lib/database';
import { generatePDFReport } from '@/lib/pdfReport';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const categoryConfig: Record<Expense['category'], { label: string; color: string }> = {
  rent: { label: 'إيجار', color: '#8884d8' },
  salaries: { label: 'رواتب', color: '#82ca9d' },
  utilities: { label: 'مرافق', color: '#ffc658' },
  supplies: { label: 'مستلزمات', color: '#ff7300' },
  maintenance: { label: 'صيانة', color: '#00C49F' },
  marketing: { label: 'تسويق', color: '#FFBB28' },
  other: { label: 'أخرى', color: '#FF8042' },
};

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'other',
    description: '',
    amount: 0,
    date: new Date(),
    notes: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    const expensesData = await db.expenses
      .where('date')
      .between(dateRange.from, dateRange.to)
      .toArray();
    setExpenses(expensesData);

    const ordersData = await db.orders
      .where('createdAt')
      .between(dateRange.from, dateRange.to)
      .and(o => o.status === 'completed')
      .toArray();
    setOrders(ordersData);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalCost = orders.reduce((sum, o) => sum + o.totalCost, 0);
  const grossProfit = orders.reduce((sum, o) => sum + o.profit, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const expensesByCategory = Object.entries(categoryConfig).map(([key, config]) => ({
    name: config.label,
    value: expenses.filter(e => e.category === key).reduce((sum, e) => sum + e.amount, 0),
    color: config.color,
  })).filter(item => item.value > 0);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return {
      month: format(month, 'MMM', { locale: ar }),
      revenue: orders.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end)
        .reduce((sum, o) => sum + o.total, 0),
      expenses: expenses.filter(e => new Date(e.date) >= start && new Date(e.date) <= end)
        .reduce((sum, e) => sum + e.amount, 0),
    };
  });

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || newExpense.amount <= 0) {
      toast.error('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    await db.expenses.add({
      category: newExpense.category as Expense['category'],
      description: newExpense.description,
      amount: newExpense.amount,
      date: selectedDate,
      notes: newExpense.notes,
      createdAt: new Date(),
    });

    toast.success('تم إضافة المصروف بنجاح');
    setNewExpense({
      category: 'other',
      description: '',
      amount: 0,
      date: new Date(),
      notes: '',
    });
    setIsAddOpen(false);
    loadData();
  };

  const handleExportReport = () => {
    generatePDFReport({
      title: 'تقرير المصروفات والإيرادات',
      subtitle: `الفترة: ${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`,
      data: [
        {
          type: 'stats',
          title: 'ملخص مالي',
          stats: [
            { label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(0)} ج.م`, color: '#10b981' },
            { label: 'إجمالي المصروفات', value: `${totalExpenses.toFixed(0)} ج.م`, color: '#ef4444' },
            { label: 'تكلفة البضاعة', value: `${totalCost.toFixed(0)} ج.م`, color: '#f59e0b' },
            { label: 'صافي الربح', value: `${netProfit.toFixed(0)} ج.م`, color: netProfit >= 0 ? '#10b981' : '#ef4444' },
          ],
        },
        {
          type: 'table',
          title: 'تفاصيل المصروفات',
          tableHeaders: ['التاريخ', 'الفئة', 'الوصف', 'المبلغ'],
          tableRows: expenses.map(e => [
            format(new Date(e.date), 'dd/MM/yyyy'),
            categoryConfig[e.category].label,
            e.description,
            `${e.amount.toFixed(0)} ج.م`,
          ]),
        },
        {
          type: 'text',
          title: 'الخلاصة',
          text: netProfit >= 0 
            ? `تحقق ربح صافي قدره ${netProfit.toFixed(0)} ج.م خلال هذه الفترة.`
            : `هناك خسارة قدرها ${Math.abs(netProfit).toFixed(0)} ج.م خلال هذه الفترة. يُنصح بمراجعة المصروفات.`,
        },
      ],
    }, settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            المصروفات والإيرادات
          </h1>
          <p className="text-muted-foreground mt-1">تقرير شامل مع صافي الربح</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 ml-2" />
                {format(dateRange.from, 'dd/MM')} - {format(dateRange.to, 'dd/MM')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: startOfMonth(new Date()),
                      to: endOfMonth(new Date()),
                    })}
                  >
                    هذا الشهر
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRange({
                      from: startOfMonth(subMonths(new Date(), 1)),
                      to: endOfMonth(subMonths(new Date(), 1)),
                    })}
                  >
                    الشهر السابق
                  </Button>
                </div>
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  className="pointer-events-auto"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handleExportReport}>
            <FileText className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مصروف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>الفئة</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(v) => setNewExpense({ ...newExpense, category: v as Expense['category'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="وصف المصروف"
                  />
                </div>

                <div>
                  <Label>المبلغ</Label>
                  <Input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>التاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 ml-2" />
                        {format(selectedDate, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(d) => d && setSelectedDate(d)}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="ملاحظات إضافية..."
                  />
                </div>

                <Button onClick={handleAddExpense} className="w-full">
                  إضافة المصروف
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تكلفة البضاعة</p>
                <p className="text-2xl font-bold text-blue-600">{totalCost.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الربح الإجمالي</p>
                <p className="text-2xl font-bold text-yellow-600">{grossProfit.toFixed(0)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(0)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br",
          netProfit >= 0 ? "from-emerald-500/20 to-emerald-500/10" : "from-red-500/20 to-red-500/10"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">صافي الربح</p>
                <p className={cn(
                  "text-2xl font-bold",
                  netProfit >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {netProfit.toFixed(0)}
                </p>
              </div>
              <Wallet className={cn(
                "w-8 h-8",
                netProfit >= 0 ? "text-emerald-600" : "text-red-600"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              توزيع المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)} ج.م`} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                لا توجد مصروفات لعرضها
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              مقارنة الإيرادات والمصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(0)} ج.م`} />
                <Legend />
                <Bar dataKey="revenue" name="الإيرادات" fill="#22c55e" />
                <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المصروفات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        style={{ backgroundColor: categoryConfig[expense.category].color }}
                        className="text-white"
                      >
                        {categoryConfig[expense.category].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="font-medium">{expense.amount.toFixed(2)} ج.م</TableCell>
                    <TableCell className="text-muted-foreground">{expense.notes || '-'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {expenses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مصروفات في هذه الفترة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
