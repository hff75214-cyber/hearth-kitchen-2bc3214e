import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Plus,
  Edit,
  X,
  Store,
  Tag,
} from 'lucide-react';
import { db, Settings as SettingsType, Category, exportDatabase, importDatabase } from '@/lib/database';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>({
    restaurantName: 'مطعمي',
    restaurantNameEn: 'My Restaurant',
    phone: '',
    address: '',
    taxRate: 0,
    currency: 'ج.م',
    receiptFooter: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    nameEn: '',
    type: 'food',
    order: 1,
    isActive: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [settingsData, categoriesData] = await Promise.all([
      db.settings.toArray(),
      db.categories.orderBy('order').toArray(),
    ]);
    
    if (settingsData.length > 0) {
      setSettings(settingsData[0]);
    }
    setCategories(categoriesData);
  };

  const handleSaveSettings = async () => {
    try {
      const existing = await db.settings.toArray();
      if (existing.length > 0) {
        await db.settings.update(existing[0].id!, settings);
      } else {
        await db.settings.add(settings);
      }
      toast({ title: 'تم الحفظ', description: 'تم حفظ الإعدادات بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ الإعدادات', variant: 'destructive' });
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `restaurant-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'تم التصدير', description: 'تم تصدير النسخة الاحتياطية بنجاح' });
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء التصدير', variant: 'destructive' });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importDatabase(text);
      toast({ title: 'تم الاستيراد', description: 'تم استيراد النسخة الاحتياطية بنجاح' });
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الاستيراد. تأكد من صحة الملف', variant: 'destructive' });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }
    
    try {
      await db.products.clear();
      await db.orders.clear();
      await db.restaurantTables.clear();
      await db.dailySummaries.clear();
      toast({ title: 'تم الحذف', description: 'تم حذف جميع البيانات' });
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحذف', variant: 'destructive' });
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await db.categories.update(editingCategory.id!, categoryForm);
        toast({ title: 'تم التحديث', description: 'تم تحديث الفئة بنجاح' });
      } else {
        await db.categories.add(categoryForm as Category);
        toast({ title: 'تمت الإضافة', description: 'تم إضافة الفئة بنجاح' });
      }
      
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ الفئة', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    
    await db.categories.delete(id);
    toast({ title: 'تم الحذف', description: 'تم حذف الفئة بنجاح' });
    loadData();
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0;
    setCategoryForm({
      name: '',
      nameEn: '',
      type: 'food',
      order: maxOrder + 1,
      isActive: true,
    });
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm(category);
    setIsCategoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">
          إعدادات المطعم والنسخ الاحتياطي
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                معلومات المطعم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">اسم المطعم (عربي)</Label>
                <Input
                  value={settings.restaurantName}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">اسم المطعم (إنجليزي)</Label>
                <Input
                  value={settings.restaurantNameEn || ''}
                  onChange={(e) => setSettings({ ...settings, restaurantNameEn: e.target.value })}
                  className="bg-secondary border-border"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">رقم الهاتف</Label>
                <Input
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">العنوان</Label>
                <Textarea
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="bg-secondary border-border"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">نسبة الضريبة %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">العملة</Label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">تذييل الفاتورة</Label>
                <Textarea
                  value={settings.receiptFooter || ''}
                  onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="شكراً لزيارتكم!"
                  rows={2}
                />
              </div>

              <Button onClick={handleSaveSettings} className="w-full gradient-primary text-primary-foreground">
                <Save className="w-4 h-4 ml-2" />
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Backup & Restore */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                النسخ الاحتياطي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <p className="text-sm text-muted-foreground">
                  قم بتصدير نسخة احتياطية من جميع بيانات النظام (المنتجات، الطلبات، الطاولات، الإعدادات)
                </p>
                <Button onClick={handleExport} className="w-full bg-success text-success-foreground hover:bg-success/90">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير نسخة احتياطية
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <p className="text-sm text-muted-foreground">
                  استيراد نسخة احتياطية سابقة. سيتم استبدال جميع البيانات الحالية.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-border"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  استيراد نسخة احتياطية
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-semibold">منطقة خطرة</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  حذف جميع البيانات (المنتجات، الطلبات، الطاولات). لن يتم حذف الفئات والإعدادات.
                </p>
                <Button
                  onClick={handleClearData}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف جميع البيانات
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Categories Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              إدارة الفئات
            </CardTitle>
            <Button
              onClick={() => {
                resetCategoryForm();
                setIsCategoryDialogOpen(true);
              }}
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة فئة
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 rounded-xl border transition-all ${
                    category.isActive
                      ? 'bg-secondary/50 border-border'
                      : 'bg-secondary/20 border-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{category.name}</p>
                      {category.nameEn && (
                        <p className="text-sm text-muted-foreground">{category.nameEn}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.type === 'food' ? 'bg-primary/20 text-primary' :
                      category.type === 'drinks' ? 'bg-info/20 text-info' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {category.type === 'food' ? 'مأكولات' :
                       category.type === 'drinks' ? 'مشروبات' : 'أخرى'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border"
                      onClick={() => openEditCategory(category)}
                    >
                      <Edit className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCategory(category.id!)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد فئات</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">اسم الفئة (عربي) *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="bg-secondary border-border"
                placeholder="مثال: مشروبات ساخنة"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">اسم الفئة (إنجليزي)</Label>
              <Input
                value={categoryForm.nameEn || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                className="bg-secondary border-border"
                dir="ltr"
                placeholder="Example: Hot Drinks"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">النوع</Label>
              <Select
                value={categoryForm.type}
                onValueChange={(value: 'food' | 'drinks' | 'other') => setCategoryForm({ ...categoryForm, type: value })}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">مأكولات</SelectItem>
                  <SelectItem value="drinks">مشروبات</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">الترتيب</Label>
              <Input
                type="number"
                min="1"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 1 })}
                className="bg-secondary border-border"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
              />
              <Label className="text-foreground">الفئة نشطة</Label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
                className="flex-1 border-border"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSaveCategory}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                <Check className="w-4 h-4 ml-2" />
                {editingCategory ? 'حفظ التغييرات' : 'إضافة الفئة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}