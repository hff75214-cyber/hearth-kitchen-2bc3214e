import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  MapPin,
  DollarSign,
  Package,
  TrendingUp,
  Calendar,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Wallet,
  Receipt,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Interfaces
interface Supplier {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  category: 'food' | 'beverages' | 'packaging' | 'equipment' | 'other';
  notes?: string;
  isActive: boolean;
  createdAt: Date;
}

interface Purchase {
  id: number;
  supplierId: number;
  supplierName: string;
  invoiceNumber: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid';
  purchaseDate: Date;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
}

interface PurchaseItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Payment {
  id: number;
  purchaseId: number;
  supplierId: number;
  amount: number;
  method: 'cash' | 'bank' | 'check';
  reference?: string;
  notes?: string;
  paymentDate: Date;
  createdAt: Date;
}

const CATEGORY_NAMES: Record<string, string> = {
  food: 'مواد غذائية',
  beverages: 'مشروبات',
  packaging: 'تغليف',
  equipment: 'معدات',
  other: 'أخرى',
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function Suppliers() {
  // State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('suppliers');
  
  // Dialog states
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  // Form states
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    category: 'food' as Supplier['category'],
    notes: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: 0,
    invoiceNumber: '',
    items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }] as PurchaseItem[],
    tax: 0,
    dueDate: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash' as Payment['method'],
    reference: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // تحميل البيانات من localStorage (في الإنتاج ستكون من IndexedDB)
    const savedSuppliers = localStorage.getItem('suppliers');
    const savedPurchases = localStorage.getItem('purchases');
    const savedPayments = localStorage.getItem('payments');

    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      // بيانات افتراضية
      const defaultSuppliers: Supplier[] = [
        { id: 1, name: 'شركة الأغذية المتحدة', phone: '0501234567', address: 'الرياض - حي الصناعية', category: 'food', isActive: true, createdAt: new Date() },
        { id: 2, name: 'مصنع المشروبات الوطني', phone: '0507654321', address: 'جدة - المنطقة الصناعية', category: 'beverages', isActive: true, createdAt: new Date() },
        { id: 3, name: 'شركة التغليف الحديث', phone: '0509876543', address: 'الدمام - المنطقة الصناعية', category: 'packaging', isActive: true, createdAt: new Date() },
      ];
      setSuppliers(defaultSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
    }

    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    }

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  };

  const saveData = (type: 'suppliers' | 'purchases' | 'payments', data: any[]) => {
    localStorage.setItem(type, JSON.stringify(data));
  };

  // Supplier CRUD
  const handleSupplierSubmit = () => {
    if (!supplierForm.name || !supplierForm.phone) {
      toast({ title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    if (editingSupplier) {
      const updated = suppliers.map(s => 
        s.id === editingSupplier.id ? { ...s, ...supplierForm } : s
      );
      setSuppliers(updated);
      saveData('suppliers', updated);
      toast({ title: 'تم التحديث', description: 'تم تحديث بيانات المورد بنجاح' });
    } else {
      const newSupplier: Supplier = {
        id: Math.max(...suppliers.map(s => s.id), 0) + 1,
        ...supplierForm,
        isActive: true,
        createdAt: new Date(),
      };
      const updated = [...suppliers, newSupplier];
      setSuppliers(updated);
      saveData('suppliers', updated);
      toast({ title: 'تمت الإضافة', description: 'تم إضافة المورد بنجاح' });
    }

    resetSupplierForm();
  };

  const resetSupplierForm = () => {
    setSupplierForm({ name: '', phone: '', email: '', address: '', category: 'food', notes: '' });
    setEditingSupplier(null);
    setIsSupplierDialogOpen(false);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierForm({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address,
      category: supplier.category,
      notes: supplier.notes || '',
    });
    setEditingSupplier(supplier);
    setIsSupplierDialogOpen(true);
  };

  const handleDeleteSupplier = (id: number) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveData('suppliers', updated);
    toast({ title: 'تم الحذف', description: 'تم حذف المورد بنجاح' });
  };

  // Purchase CRUD
  const handlePurchaseSubmit = () => {
    if (!purchaseForm.supplierId || !purchaseForm.invoiceNumber) {
      toast({ title: 'خطأ', description: 'يرجى ملء الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);
    const subtotal = purchaseForm.items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + purchaseForm.tax;

    const newPurchase: Purchase = {
      id: Math.max(...purchases.map(p => p.id), 0) + 1,
      supplierId: purchaseForm.supplierId,
      supplierName: supplier?.name || '',
      invoiceNumber: purchaseForm.invoiceNumber,
      items: purchaseForm.items.filter(i => i.name),
      subtotal,
      tax: purchaseForm.tax,
      total,
      paidAmount: 0,
      remainingAmount: total,
      status: 'pending',
      purchaseDate: new Date(),
      dueDate: purchaseForm.dueDate ? new Date(purchaseForm.dueDate) : undefined,
      notes: purchaseForm.notes,
      createdAt: new Date(),
    };

    const updated = [...purchases, newPurchase];
    setPurchases(updated);
    saveData('purchases', updated);
    toast({ title: 'تمت الإضافة', description: 'تم إضافة المشتريات بنجاح' });

    resetPurchaseForm();
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      supplierId: 0,
      invoiceNumber: '',
      items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
      tax: 0,
      dueDate: '',
      notes: '',
    });
    setIsPurchaseDialogOpen(false);
  };

  const addPurchaseItem = () => {
    setPurchaseForm({
      ...purchaseForm,
      items: [...purchaseForm.items, { name: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const updatePurchaseItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...purchaseForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setPurchaseForm({ ...purchaseForm, items: newItems });
  };

  const removePurchaseItem = (index: number) => {
    if (purchaseForm.items.length > 1) {
      setPurchaseForm({
        ...purchaseForm,
        items: purchaseForm.items.filter((_, i) => i !== index),
      });
    }
  };

  // Payment CRUD
  const handlePaymentSubmit = () => {
    if (!selectedPurchase || paymentForm.amount <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال مبلغ صحيح', variant: 'destructive' });
      return;
    }

    if (paymentForm.amount > selectedPurchase.remainingAmount) {
      toast({ title: 'خطأ', description: 'المبلغ أكبر من المتبقي', variant: 'destructive' });
      return;
    }

    const newPayment: Payment = {
      id: Math.max(...payments.map(p => p.id), 0) + 1,
      purchaseId: selectedPurchase.id,
      supplierId: selectedPurchase.supplierId,
      amount: paymentForm.amount,
      method: paymentForm.method,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
      paymentDate: new Date(),
      createdAt: new Date(),
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    saveData('payments', updatedPayments);

    // تحديث المشتريات
    const newPaidAmount = selectedPurchase.paidAmount + paymentForm.amount;
    const newRemainingAmount = selectedPurchase.total - newPaidAmount;
    const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

    const updatedPurchases = purchases.map(p => 
      p.id === selectedPurchase.id 
        ? { ...p, paidAmount: newPaidAmount, remainingAmount: newRemainingAmount, status: newStatus as Purchase['status'] }
        : p
    );
    setPurchases(updatedPurchases);
    saveData('purchases', updatedPurchases);

    toast({ title: 'تم الدفع', description: 'تم تسجيل الدفعة بنجاح' });
    resetPaymentForm();
  };

  const resetPaymentForm = () => {
    setPaymentForm({ amount: 0, method: 'cash', reference: '', notes: '' });
    setSelectedPurchase(null);
    setIsPaymentDialogOpen(false);
  };

  const openPaymentDialog = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setPaymentForm({ ...paymentForm, amount: purchase.remainingAmount });
    setIsPaymentDialogOpen(true);
  };

  // Statistics
  const totalSuppliers = suppliers.length;
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalRemaining = purchases.reduce((sum, p) => sum + p.remainingAmount, 0);
  const pendingPurchases = purchases.filter(p => p.status !== 'paid').length;

  // Charts data
  const suppliersCategoryData = Object.entries(
    suppliers.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: CATEGORY_NAMES[name], value }));

  const purchasesBySupplier = suppliers.map(s => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
    المشتريات: purchases.filter(p => p.supplierId === s.id).reduce((sum, p) => sum + p.total, 0),
    المدفوع: purchases.filter(p => p.supplierId === s.id).reduce((sum, p) => sum + p.paidAmount, 0),
  })).filter(d => d.المشتريات > 0);

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const filteredPurchases = purchases.filter(p =>
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoiceNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Truck className="w-8 h-8 text-white" />
            </div>
            إدارة الموردين
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة الموردين والمشتريات والمدفوعات
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الموردين</p>
                <p className="text-2xl font-bold text-foreground">{totalSuppliers}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المشتريات</p>
                <p className="text-2xl font-bold text-foreground">{totalPurchases.toFixed(2)} ر.س</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدفوع</p>
                <p className="text-2xl font-bold text-success">{totalPaid.toFixed(2)} ر.س</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المتبقي</p>
                <p className="text-2xl font-bold text-destructive">{totalRemaining.toFixed(2)} ر.س</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass shadow-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">معلقة</p>
                <p className="text-2xl font-bold text-warning">{pendingPurchases}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مورد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Dialog open={isSupplierDialogOpen} onOpenChange={setIsSupplierDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مورد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>اسم المورد *</Label>
                    <Input
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                      placeholder="شركة الأغذية المتحدة"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>رقم الهاتف *</Label>
                      <Input
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        placeholder="0501234567"
                      />
                    </div>
                    <div>
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>العنوان</Label>
                    <Input
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      placeholder="الرياض - حي الصناعية"
                    />
                  </div>
                  <div>
                    <Label>الفئة</Label>
                    <Select
                      value={supplierForm.category}
                      onValueChange={(v) => setSupplierForm({ ...supplierForm, category: v as Supplier['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">مواد غذائية</SelectItem>
                        <SelectItem value="beverages">مشروبات</SelectItem>
                        <SelectItem value="packaging">تغليف</SelectItem>
                        <SelectItem value="equipment">معدات</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={supplierForm.notes}
                      onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSupplierSubmit} className="flex-1 gradient-primary text-primary-foreground">
                      <Save className="w-4 h-4 ml-2" />
                      {editingSupplier ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button onClick={resetSupplierForm} variant="outline">
                      <X className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Truck className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{supplier.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_NAMES[supplier.category]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteSupplier(supplier.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{supplier.phone}</span>
                      </div>
                      {supplier.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{supplier.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">إجمالي المشتريات:</span>
                        <span className="font-bold text-foreground">
                          {purchases.filter(p => p.supplierId === supplier.id).reduce((sum, p) => sum + p.total, 0).toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن فاتورة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مشتريات
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة مشتريات جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>المورد *</Label>
                      <Select
                        value={String(purchaseForm.supplierId)}
                        onValueChange={(v) => setPurchaseForm({ ...purchaseForm, supplierId: Number(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المورد" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>رقم الفاتورة *</Label>
                      <Input
                        value={purchaseForm.invoiceNumber}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNumber: e.target.value })}
                        placeholder="INV-001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">المنتجات</Label>
                    <div className="space-y-2">
                      {purchaseForm.items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Input
                              placeholder="اسم المنتج"
                              value={item.name}
                              onChange={(e) => updatePurchaseItem(index, 'name', e.target.value)}
                            />
                          </div>
                          <div className="w-20">
                            <Input
                              type="number"
                              placeholder="الكمية"
                              value={item.quantity}
                              onChange={(e) => updatePurchaseItem(index, 'quantity', Number(e.target.value))}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              placeholder="السعر"
                              value={item.unitPrice}
                              onChange={(e) => updatePurchaseItem(index, 'unitPrice', Number(e.target.value))}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              value={item.total}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          {purchaseForm.items.length > 1 && (
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removePurchaseItem(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button onClick={addPurchaseItem} variant="outline" size="sm">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة منتج
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>الضريبة</Label>
                      <Input
                        type="number"
                        value={purchaseForm.tax}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, tax: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>تاريخ الاستحقاق</Label>
                      <Input
                        type="date"
                        value={purchaseForm.dueDate}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={purchaseForm.notes}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                    />
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex justify-between text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span>{(purchaseForm.items.reduce((sum, i) => sum + i.total, 0) + purchaseForm.tax).toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handlePurchaseSubmit} className="flex-1 gradient-primary text-primary-foreground">
                      <Save className="w-4 h-4 ml-2" />
                      حفظ
                    </Button>
                    <Button onClick={resetPurchaseForm} variant="outline">
                      <X className="w-4 h-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="glass shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>المورد</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map(purchase => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono">{purchase.invoiceNumber}</TableCell>
                      <TableCell>{purchase.supplierName}</TableCell>
                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell className="font-bold">{purchase.total.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-success">{purchase.paidAmount.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-destructive">{purchase.remainingAmount.toFixed(2)} ر.س</TableCell>
                      <TableCell>
                        <Badge className={
                          purchase.status === 'paid' 
                            ? 'bg-success/20 text-success' 
                            : purchase.status === 'partial' 
                              ? 'bg-warning/20 text-warning'
                              : 'bg-destructive/20 text-destructive'
                        }>
                          {purchase.status === 'paid' ? 'مدفوع' : purchase.status === 'partial' ? 'جزئي' : 'معلق'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {purchase.status !== 'paid' && (
                          <Button size="sm" variant="outline" onClick={() => openPaymentDialog(purchase)}>
                            <CreditCard className="w-4 h-4 ml-1" />
                            دفع
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>تسجيل دفعة</DialogTitle>
              </DialogHeader>
              {selectedPurchase && (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-muted-foreground">فاتورة رقم: {selectedPurchase.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">المورد: {selectedPurchase.supplierName}</p>
                    <p className="text-lg font-bold text-foreground">المتبقي: {selectedPurchase.remainingAmount.toFixed(2)} ر.س</p>
                  </div>
                  <div>
                    <Label>المبلغ *</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>طريقة الدفع</Label>
                    <Select
                      value={paymentForm.method}
                      onValueChange={(v) => setPaymentForm({ ...paymentForm, method: v as Payment['method'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="bank">تحويل بنكي</SelectItem>
                        <SelectItem value="check">شيك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>رقم المرجع</Label>
                    <Input
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                      placeholder="رقم الحوالة أو الشيك"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePaymentSubmit} className="flex-1 gradient-primary text-primary-foreground">
                      <Wallet className="w-4 h-4 ml-2" />
                      تأكيد الدفع
                    </Button>
                    <Button onClick={resetPaymentForm} variant="outline">
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Suppliers by Category */}
            <Card className="glass shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  الموردين حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={suppliersCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {suppliersCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Purchases by Supplier */}
            <Card className="glass shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-info" />
                  المشتريات حسب المورد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={purchasesBySupplier}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="المشتريات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="المدفوع" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
