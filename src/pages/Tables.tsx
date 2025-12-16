import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  UtensilsCrossed,
  Clock,
  DollarSign,
} from 'lucide-react';
import { db, RestaurantTable, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface TableStats {
  tableId: number;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function Tables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tableStats, setTableStats] = useState<Map<number, TableStats>>(new Map());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [formData, setFormData] = useState<Partial<RestaurantTable>>({
    name: '',
    number: 1,
    chairs: 4,
    status: 'available',
    position: { x: 0, y: 0 },
    shape: 'square',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tablesData = await db.restaurantTables.toArray();
    setTables(tablesData);
    
    // Calculate stats for each table
    const stats = new Map<number, TableStats>();
    for (const table of tablesData) {
      const orders = await db.orders
        .where('tableId')
        .equals(table.id!)
        .and(o => o.status === 'completed')
        .toArray();
      
      stats.set(table.id!, {
        tableId: table.id!,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        totalProfit: orders.reduce((sum, o) => sum + o.profit, 0),
      });
    }
    setTableStats(stats);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTable) {
        await db.restaurantTables.update(editingTable.id!, formData);
        toast({ title: 'تم التحديث', description: 'تم تحديث الطاولة بنجاح' });
      } else {
        await db.restaurantTables.add(formData as RestaurantTable);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة الطاولة بنجاح' });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ الطاولة', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الطاولة؟')) {
      await db.restaurantTables.delete(id);
      toast({ title: 'تم الحذف', description: 'تم حذف الطاولة بنجاح' });
      loadData();
    }
  };

  const handleEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData(table);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: number, status: RestaurantTable['status']) => {
    await db.restaurantTables.update(id, { status });
    loadData();
  };

  const resetForm = () => {
    setEditingTable(null);
    const maxNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) : 0;
    setFormData({
      name: `طاولة ${maxNumber + 1}`,
      number: maxNumber + 1,
      chairs: 4,
      status: 'available',
      position: { x: 0, y: 0 },
      shape: 'square',
      isActive: true,
    });
  };

  const getStatusColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return 'bg-success/20 border-success text-success';
      case 'occupied': return 'bg-destructive/20 border-destructive text-destructive';
      case 'reserved': return 'bg-warning/20 border-warning text-warning';
    }
  };

  const getStatusLabel = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return 'شاغرة';
      case 'occupied': return 'مشغولة';
      case 'reserved': return 'محجوزة';
    }
  };

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الطاولات</h1>
          <p className="text-muted-foreground mt-1">
            متابعة وإدارة طاولات المطعم
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة طاولة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card border-success/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">طاولات شاغرة</p>
                <p className="text-2xl font-bold text-foreground">{availableCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card border-destructive/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/20">
                <UtensilsCrossed className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">طاولات مشغولة</p>
                <p className="text-2xl font-bold text-foreground">{occupiedCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card border-warning/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">طاولات محجوزة</p>
                <p className="text-2xl font-bold text-foreground">{reservedCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tables Grid - Visual Map */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            خريطة الطاولات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {tables.map((table, index) => {
                const stats = tableStats.get(table.id!);
                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-glow ${getStatusColor(table.status)}`}
                  >
                    {/* Table Shape */}
                    <div className={`mx-auto mb-3 flex items-center justify-center ${
                      table.shape === 'round' ? 'w-20 h-20 rounded-full' :
                      table.shape === 'rectangle' ? 'w-24 h-16 rounded-lg' :
                      'w-20 h-20 rounded-xl'
                    } bg-secondary/50 border border-current`}>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{table.number}</p>
                      </div>
                    </div>

                    {/* Table Info */}
                    <div className="text-center mb-3">
                      <p className="font-semibold text-foreground">{table.name}</p>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{table.chairs} كراسي</span>
                      </div>
                      <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${getStatusColor(table.status)}`}>
                        {getStatusLabel(table.status)}
                      </span>
                    </div>

                    {/* Stats */}
                    {stats && stats.totalOrders > 0 && (
                      <div className="text-xs space-y-1 p-2 rounded-lg bg-secondary/30 mb-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الطلبات</span>
                          <span className="text-foreground">{stats.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الإيرادات</span>
                          <span className="text-foreground">{stats.totalRevenue.toFixed(0)} ج.م</span>
                        </div>
                        <div className="flex justify-between text-success">
                          <span>الربح</span>
                          <span>{stats.totalProfit.toFixed(0)} ج.م</span>
                        </div>
                      </div>
                    )}

                    {/* Status Buttons */}
                    <div className="flex gap-1 mb-2">
                      <Button
                        size="sm"
                        variant={table.status === 'available' ? 'default' : 'outline'}
                        className={`flex-1 text-xs h-7 ${table.status === 'available' ? 'bg-success text-success-foreground' : 'border-border'}`}
                        onClick={() => handleStatusChange(table.id!, 'available')}
                      >
                        شاغرة
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'occupied' ? 'default' : 'outline'}
                        className={`flex-1 text-xs h-7 ${table.status === 'occupied' ? 'bg-destructive text-destructive-foreground' : 'border-border'}`}
                        onClick={() => handleStatusChange(table.id!, 'occupied')}
                      >
                        مشغولة
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'reserved' ? 'default' : 'outline'}
                        className={`flex-1 text-xs h-7 ${table.status === 'reserved' ? 'bg-warning text-warning-foreground' : 'border-border'}`}
                        onClick={() => handleStatusChange(table.id!, 'reserved')}
                      >
                        محجوزة
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border"
                        onClick={() => handleEdit(table)}
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(table.id!)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {tables.length === 0 && (
            <div className="text-center py-16">
              <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد طاولات</p>
              <p className="text-sm text-muted-foreground">أضف طاولة جديدة للبدء</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingTable ? 'تعديل الطاولة' : 'إضافة طاولة جديدة'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">اسم الطاولة</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="مثال: طاولة VIP"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">رقم الطاولة</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">عدد الكراسي</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.chairs}
                  onChange={(e) => setFormData({ ...formData, chairs: parseInt(e.target.value) || 4 })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">شكل الطاولة</Label>
                <Select
                  value={formData.shape}
                  onValueChange={(value: 'square' | 'round' | 'rectangle') => setFormData({ ...formData, shape: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">مربعة</SelectItem>
                    <SelectItem value="round">دائرية</SelectItem>
                    <SelectItem value="rectangle">مستطيلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-border"
              >
                إلغاء
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                <Check className="w-4 h-4 ml-2" />
                {editingTable ? 'حفظ التغييرات' : 'إضافة الطاولة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}