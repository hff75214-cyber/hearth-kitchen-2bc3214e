import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
  Image as ImageIcon,
  X,
  Check,
} from 'lucide-react';
import { db, Product, Category, generateSKU, generateBarcode } from '@/lib/database';
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

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    subcategory: '',
    type: 'prepared',
    preparationTime: 15,
    costPrice: 0,
    salePrice: 0,
    unit: 'قطعة',
    quantity: 0,
    minQuantityAlert: 5,
    sku: generateSKU(),
    barcode: generateBarcode(),
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, categoriesData] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray(),
    ]);
    setProducts(productsData);
    setCategories(categoriesData.filter(c => c.isActive));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesType = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await db.products.update(editingProduct.id!, {
          ...formData,
          updatedAt: new Date(),
        });
        toast({ title: 'تم التحديث', description: 'تم تحديث المنتج بنجاح' });
      } else {
        await db.products.add({
          ...formData as Product,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast({ title: 'تمت الإضافة', description: 'تم إضافة المنتج بنجاح' });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ المنتج', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await db.products.delete(id);
      toast({ title: 'تم الحذف', description: 'تم حذف المنتج بنجاح' });
      loadData();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      type: 'prepared',
      preparationTime: 15,
      costPrice: 0,
      salePrice: 0,
      unit: 'قطعة',
      quantity: 0,
      minQuantityAlert: 5,
      sku: generateSKU(),
      barcode: generateBarcode(),
      description: '',
      image: '',
      isActive: true,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const profit = (formData.salePrice || 0) - (formData.costPrice || 0);
  const profitPercentage = formData.costPrice ? ((profit / formData.costPrice) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المنتجات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة المأكولات والمشروبات والمنتجات
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
          إضافة منتج
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary border-border"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="prepared">مأكولات (تُحضّر)</SelectItem>
                <SelectItem value="stored">منتجات (مخزنة)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass shadow-card hover:shadow-glow transition-all duration-300 overflow-hidden group">
                <div className="relative h-40 bg-secondary/50 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.type === 'prepared' ? 'bg-primary/80 text-primary-foreground' : 'bg-info/80 text-info-foreground'
                    }`}>
                      {product.type === 'prepared' ? 'يُحضّر' : 'مخزون'}
                    </span>
                    {!product.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground">
                        غير متاح
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <p className="font-bold text-primary">{product.salePrice.toFixed(2)} ج.م</p>
                  </div>
                  
                  {product.type === 'stored' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        product.quantity <= product.minQuantityAlert ? 'bg-destructive animate-pulse' : 'bg-success'
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        الكمية: {product.quantity} {product.unit}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border hover:bg-secondary"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(product.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد منتجات</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-secondary border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute -top-2 -left-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">اسم المنتج *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="مثال: كريب سادة"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">الفئة *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">نوع المنتج *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'prepared' | 'stored') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepared">مأكولات (تُحضّر عند الطلب)</SelectItem>
                    <SelectItem value="stored">منتجات (مخزنة بكمية)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'prepared' && (
                <div className="space-y-2">
                  <Label className="text-foreground">وقت التحضير *</Label>
                  <Select
                    value={String(formData.preparationTime || 15)}
                    onValueChange={(value) => setFormData({ ...formData, preparationTime: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 دقائق</SelectItem>
                      <SelectItem value="10">10 دقائق</SelectItem>
                      <SelectItem value="15">15 دقيقة</SelectItem>
                      <SelectItem value="20">20 دقيقة</SelectItem>
                      <SelectItem value="25">25 دقيقة</SelectItem>
                      <SelectItem value="30">30 دقيقة</SelectItem>
                      <SelectItem value="45">45 دقيقة</SelectItem>
                      <SelectItem value="60">ساعة</SelectItem>
                      <SelectItem value="90">ساعة ونصف</SelectItem>
                      <SelectItem value="120">ساعتين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                    <SelectItem value="قطعة">قطعة</SelectItem>
                    <SelectItem value="كوب">كوب</SelectItem>
                    <SelectItem value="طبق">طبق</SelectItem>
                    <SelectItem value="علبة">علبة</SelectItem>
                    <SelectItem value="كيلو">كيلو</SelectItem>
                    <SelectItem value="جرام">جرام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">سعر التكلفة *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">سعر البيع *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Profit Display */}
              <div className="md:col-span-2 p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="flex items-center justify-between">
                  <span className="text-success">الربح المتوقع:</span>
                  <div className="text-left">
                    <span className="font-bold text-success">{profit.toFixed(2)} ج.م</span>
                    <span className="text-sm text-muted-foreground mr-2">({profitPercentage}%)</span>
                  </div>
                </div>
              </div>

              {formData.type === 'stored' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">الكمية المتاحة</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">تنبيه عند الكمية</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.minQuantityAlert}
                      onChange={(e) => setFormData({ ...formData, minQuantityAlert: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-foreground">رمز المنتج (SKU)</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="اختياري"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">الباركود</Label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="اختياري"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-foreground">الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="وصف المنتج أو المكونات"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label className="text-foreground">المنتج متاح للبيع</Label>
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
                {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}