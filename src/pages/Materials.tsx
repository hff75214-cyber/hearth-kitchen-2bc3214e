import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { db, RawMaterial, checkRawMaterialsStock } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const UNITS = [
  { value: 'كيلو', label: 'كيلو (kg)' },
  { value: 'جرام', label: 'جرام (g)' },
  { value: 'لتر', label: 'لتر (L)' },
  { value: 'مل', label: 'مللي لتر (ml)' },
  { value: 'قطعة', label: 'قطعة' },
  { value: 'علبة', label: 'علبة' },
  { value: 'كيس', label: 'كيس' },
  { value: 'صندوق', label: 'صندوق' },
];

export default function Materials() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  
  const [formData, setFormData] = useState({
    name: '',
    unit: 'كيلو',
    quantity: 0,
    minQuantityAlert: 5,
    costPerUnit: 0,
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allMaterials = await db.rawMaterials.toArray();
    setMaterials(allMaterials.filter(m => m.isActive));
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !showLowStockOnly || material.quantity <= material.minQuantityAlert;
    return matchesSearch && matchesLowStock;
  });

  const lowStockMaterials = materials.filter(m => m.quantity <= m.minQuantityAlert);
  const totalValue = materials.reduce((sum, m) => sum + (m.quantity * m.costPerUnit), 0);
  const totalItems = materials.length;

  const resetForm = () => {
    setFormData({
      name: '',
      unit: 'كيلو',
      quantity: 0,
      minQuantityAlert: 5,
      costPerUnit: 0,
      description: '',
    });
    setEditingMaterial(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      quantity: material.quantity,
      minQuantityAlert: material.minQuantityAlert,
      costPerUnit: material.costPerUnit,
      description: material.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'خطأ', description: 'يجب إدخال اسم المادة', variant: 'destructive' });
      return;
    }

    try {
      if (editingMaterial) {
        await db.rawMaterials.update(editingMaterial.id!, {
          ...formData,
          updatedAt: new Date(),
        });
        toast({ title: 'تم التحديث', description: `تم تحديث ${formData.name}` });
      } else {
        await db.rawMaterials.add({
          ...formData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast({ title: 'تمت الإضافة', description: `تمت إضافة ${formData.name}` });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
      await checkRawMaterialsStock();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  const handleDelete = async (material: RawMaterial) => {
    if (confirm(`هل تريد حذف "${material.name}"؟`)) {
      await db.rawMaterials.update(material.id!, { isActive: false });
      toast({ title: 'تم الحذف', description: `تم حذف ${material.name}` });
      loadData();
    }
  };

  const openAdjustDialog = (material: RawMaterial, type: 'add' | 'remove') => {
    setSelectedMaterial(material);
    setAdjustmentType(type);
    setAdjustmentQuantity(0);
    setIsAdjustDialogOpen(true);
  };

  const handleAdjustStock = async () => {
    if (!selectedMaterial || adjustmentQuantity <= 0) return;

    const newQuantity = adjustmentType === 'add'
      ? selectedMaterial.quantity + adjustmentQuantity
      : Math.max(0, selectedMaterial.quantity - adjustmentQuantity);

    await db.rawMaterials.update(selectedMaterial.id!, {
      quantity: newQuantity,
      updatedAt: new Date(),
    });

    toast({
      title: 'تم التعديل',
      description: `تم ${adjustmentType === 'add' ? 'إضافة' : 'خصم'} ${adjustmentQuantity} ${selectedMaterial.unit} من ${selectedMaterial.name}`,
    });

    setIsAdjustDialogOpen(false);
    setSelectedMaterial(null);
    setAdjustmentQuantity(0);
    loadData();
    await checkRawMaterialsStock();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المواد الخام</h1>
          <p className="text-muted-foreground mt-1">
            إدارة مخزون المواد الخام والمكونات
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 ml-2" />
          إضافة مادة خام
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المواد</p>
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                <p className="text-2xl font-bold text-foreground">{totalValue.toFixed(0)} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`glass shadow-card ${lowStockMaterials.length > 0 ? 'border-destructive/50' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${lowStockMaterials.length > 0 ? 'bg-destructive/20' : 'bg-success/20'}`}>
                <AlertTriangle className={`w-6 h-6 ${lowStockMaterials.length > 0 ? 'text-destructive' : 'text-success'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مواد منخفضة</p>
                <p className="text-2xl font-bold text-foreground">{lowStockMaterials.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockMaterials.length > 0 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-warning flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                تنبيهات المواد الخام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30"
                  >
                    <TrendingDown className="w-4 h-4 text-warning" />
                    <span className="text-sm text-foreground">{material.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مادة خام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary border-border"
              />
            </div>
            <Button
              variant={showLowStockOnly ? 'default' : 'outline'}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={showLowStockOnly ? 'bg-warning text-warning-foreground' : 'border-border'}
            >
              <AlertTriangle className="w-4 h-4 ml-2" />
              المنخفض فقط
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card className="glass shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">المادة</TableHead>
                <TableHead className="text-right text-muted-foreground">الوحدة</TableHead>
                <TableHead className="text-right text-muted-foreground">الكمية</TableHead>
                <TableHead className="text-right text-muted-foreground">حد التنبيه</TableHead>
                <TableHead className="text-right text-muted-foreground">سعر الوحدة</TableHead>
                <TableHead className="text-right text-muted-foreground">القيمة</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredMaterials.map((material) => {
                  const isLowStock = material.quantity <= material.minQuantityAlert;
                  const value = material.quantity * material.costPerUnit;

                  return (
                    <motion.tr
                      key={material.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-border"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p>{material.name}</p>
                            {material.description && (
                              <p className="text-xs text-muted-foreground">{material.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{material.unit}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                          {material.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{material.minQuantityAlert}</TableCell>
                      <TableCell className="text-muted-foreground">{material.costPerUnit.toFixed(2)} ج.م</TableCell>
                      <TableCell className="text-foreground font-semibold">{value.toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          material.quantity === 0 ? 'bg-destructive/20 text-destructive' :
                          isLowStock ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          {material.quantity === 0 ? 'نفذ' : isLowStock ? 'منخفض' : 'متوفر'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-success/50 text-success hover:bg-success/10"
                            onClick={() => openAdjustDialog(material, 'add')}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => openAdjustDialog(material, 'remove')}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-border"
                            onClick={() => openEditDialog(material)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(material)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد مواد خام</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                أضف مواد خام جديدة للبدء
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingMaterial ? 'تعديل مادة خام' : 'إضافة مادة خام جديدة'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">اسم المادة *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border"
                placeholder="مثال: دقيق، طماطم، زيت..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">الوحدة</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">الكمية الحالية</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">حد التنبيه</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minQuantityAlert}
                  onChange={(e) => setFormData({ ...formData, minQuantityAlert: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">سعر الوحدة (ج.م)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">وصف (اختياري)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-secondary border-border"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-border"
              >
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
              <Button onClick={handleSave} className="flex-1 gradient-primary text-primary-foreground">
                <Save className="w-4 h-4 ml-2" />
                {editingMaterial ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {adjustmentType === 'add' ? 'إضافة للمخزون' : 'خصم من المخزون'}
            </DialogTitle>
          </DialogHeader>

          {selectedMaterial && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedMaterial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      الكمية الحالية: {selectedMaterial.quantity} {selectedMaterial.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">الكمية</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseFloat(e.target.value) || 0)}
                  className="bg-secondary border-border"
                  placeholder="أدخل الكمية"
                />
              </div>

              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الكمية الجديدة:</span>
                  <span className="font-bold text-foreground">
                    {adjustmentType === 'add'
                      ? selectedMaterial.quantity + adjustmentQuantity
                      : Math.max(0, selectedMaterial.quantity - adjustmentQuantity)
                    } {selectedMaterial.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAdjustDialogOpen(false)}
                  className="flex-1 border-border"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAdjustStock}
                  disabled={adjustmentQuantity <= 0}
                  className={`flex-1 ${
                    adjustmentType === 'add'
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  }`}
                >
                  {adjustmentType === 'add' ? (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 ml-2" />
                      خصم
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
