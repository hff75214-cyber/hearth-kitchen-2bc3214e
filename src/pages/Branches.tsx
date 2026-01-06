import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Save,
  X,
} from 'lucide-react';
import { db, Order, SystemUser } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Branch interface
interface Branch {
  id?: number;
  name: string;
  address: string;
  phone: string;
  manager?: string;
  isActive: boolean;
  createdAt: Date;
}

// نظرًا لأن النظام يعمل محليًا، سنحاكي بيانات الفروع
// في الإنتاج يمكن ربط كل جهاز بفرع معين
const mockBranches: Branch[] = [
  { id: 1, name: 'الفرع الرئيسي', address: 'شارع الملك فهد', phone: '0501234567', manager: 'أحمد محمد', isActive: true, createdAt: new Date() },
  { id: 2, name: 'فرع المول', address: 'مول العثيم', phone: '0507654321', manager: 'سعيد أحمد', isActive: true, createdAt: new Date() },
  { id: 3, name: 'فرع الحي الشمالي', address: 'حي النرجس', phone: '0509876543', manager: 'خالد علي', isActive: true, createdAt: new Date() },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allOrders = await db.orders.toArray();
    const allUsers = await db.systemUsers.where('isActive').equals(1).toArray();
    setOrders(allOrders);
    setUsers(allUsers);
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate: now };
  };

  // محاكاة بيانات الفروع (في الواقع ستأتي من قاعدة بيانات مركزية)
  const getBranchStats = (branchId: number) => {
    const { startDate, endDate } = getDateRange();
    
    // محاكاة البيانات لكل فرع
    const randomFactor = branchId * 0.8 + Math.random() * 0.4;
    const baseOrders = orders.filter(o => 
      new Date(o.createdAt) >= startDate && 
      new Date(o.createdAt) <= endDate &&
      o.status === 'completed'
    );

    const totalSales = baseOrders.reduce((sum, o) => sum + o.total, 0) * randomFactor;
    const totalProfit = baseOrders.reduce((sum, o) => sum + o.profit, 0) * randomFactor;
    const ordersCount = Math.floor(baseOrders.length * randomFactor);
    const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

    return {
      totalSales,
      totalProfit,
      ordersCount,
      avgOrderValue,
      employeesCount: Math.floor(users.length * randomFactor) + 1,
    };
  };

  const branchesWithStats = branches.map(branch => ({
    ...branch,
    stats: getBranchStats(branch.id || 0),
  }));

  // بيانات الرسوم البيانية
  const salesComparisonData = branchesWithStats.map(branch => ({
    name: branch.name,
    المبيعات: Math.round(branch.stats.totalSales),
    الأرباح: Math.round(branch.stats.totalProfit),
  }));

  const ordersComparisonData = branchesWithStats.map(branch => ({
    name: branch.name,
    الطلبات: branch.stats.ordersCount,
    'متوسط_الطلب': Math.round(branch.stats.avgOrderValue),
  }));

  const pieData = branchesWithStats.map(branch => ({
    name: branch.name,
    value: Math.round(branch.stats.totalSales),
  }));

  // إجمالي الإحصائيات
  const totalStats = {
    totalSales: branchesWithStats.reduce((sum, b) => sum + b.stats.totalSales, 0),
    totalProfit: branchesWithStats.reduce((sum, b) => sum + b.stats.totalProfit, 0),
    totalOrders: branchesWithStats.reduce((sum, b) => sum + b.stats.ordersCount, 0),
    totalEmployees: branchesWithStats.reduce((sum, b) => sum + b.stats.employeesCount, 0),
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    if (editingBranch) {
      setBranches(prev => prev.map(b => 
        b.id === editingBranch.id 
          ? { ...b, ...formData }
          : b
      ));
      toast({ title: 'تم التحديث', description: 'تم تحديث بيانات الفرع بنجاح' });
    } else {
      const newBranch: Branch = {
        id: Math.max(...branches.map(b => b.id || 0)) + 1,
        ...formData,
        isActive: true,
        createdAt: new Date(),
      };
      setBranches(prev => [...prev, newBranch]);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة الفرع الجديد بنجاح' });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', phone: '', manager: '' });
    setEditingBranch(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      manager: branch.manager || '',
    });
    setEditingBranch(branch);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (branchId: number) => {
    setBranches(prev => prev.filter(b => b.id !== branchId));
    toast({ title: 'تم الحذف', description: 'تم حذف الفرع بنجاح' });
  };

  const filteredBranches = branchesWithStats.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // أفضل فرع أداءً
  const topBranch = branchesWithStats.reduce((best, current) => 
    current.stats.totalSales > (best?.stats.totalSales || 0) ? current : best
  , branchesWithStats[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            إدارة الفروع
          </h1>
          <p className="text-muted-foreground mt-1">
            تقارير مقارنة الأداء بين الفروع المختلفة
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={(v: 'week' | 'month' | 'year') => setSelectedPeriod(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 ml-2" />
                إضافة فرع
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>اسم الفرع</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="الفرع الرئيسي"
                  />
                </div>
                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="شارع الملك فهد"
                  />
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0501234567"
                  />
                </div>
                <div>
                  <Label>المدير</Label>
                  <Input
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="اسم المدير"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} className="flex-1 gradient-primary text-primary-foreground">
                    <Save className="w-4 h-4 ml-2" />
                    {editingBranch ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalSales.toFixed(2)} ر.س</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalProfit.toFixed(2)} ر.س</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalOrders}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalEmployees}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Branch */}
      {topBranch && (
        <Card className="glass shadow-card border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">أفضل فرع أداءً</p>
                <p className="text-xl font-bold text-foreground">{topBranch.name}</p>
                <p className="text-sm text-success">
                  {topBranch.stats.totalSales.toFixed(2)} ر.س مبيعات • {topBranch.stats.ordersCount} طلب
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Comparison Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              مقارنة المبيعات والأرباح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="المبيعات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="الأرباح" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Comparison Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-info" />
              مقارنة الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="الطلبات" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="متوسط_الطلب" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Distribution Pie Chart */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              توزيع المبيعات بين الفروع
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
                    formatter={(value: number) => [`${value.toFixed(2)} ر.س`, 'المبيعات']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Branches Table */}
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              تفاصيل الفروع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن فرع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفرع</TableHead>
                    <TableHead>المبيعات</TableHead>
                    <TableHead>الطلبات</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {branch.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-success">
                        {branch.stats.totalSales.toFixed(0)} ر.س
                      </TableCell>
                      <TableCell>{branch.stats.ordersCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(branch)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(branch.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
