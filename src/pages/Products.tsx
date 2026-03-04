import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Package, Image as ImageIcon, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface CloudProduct {
  id: string; name: string; name_en: string | null; category: string; category_id: string | null;
  subcategory: string | null; type: string; preparation_time: number | null;
  cost_price: number; sale_price: number; unit: string; quantity: number; min_quantity_alert: number;
  sku: string | null; barcode: string | null; description: string | null; image_url: string | null;
  is_active: boolean; is_taxable: boolean; restaurant_id: string;
}

interface CloudCategory {
  id: string; name: string; name_en: string | null; type: string; is_active: boolean;
}

const genSKU = () => `SKU-${Date.now().toString(36).toUpperCase()}`;

export default function Products() {
  const { restaurantId } = useRestaurant();
  const [products, setProducts] = useState<CloudProduct[]>([]);
  const [categories, setCategories] = useState<CloudCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CloudProduct | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '', category: '', type: 'prepared', preparation_time: 15,
    cost_price: 0, sale_price: 0, unit: 'قطعة', quantity: 0,
    min_quantity_alert: 5, sku: genSKU(), description: '', image_url: '', is_active: true, is_taxable: true,
  });

  useEffect(() => { if (restaurantId) loadData(); }, [restaurantId]);

  const loadData = async () => {
    if (!restaurantId) return;
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').eq('restaurant_id', restaurantId),
      supabase.from('categories').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchType = filterType === 'all' || p.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update({
          name: formData.name, category: formData.category, type: formData.type,
          preparation_time: formData.type === 'prepared' ? formData.preparation_time : null,
          cost_price: formData.cost_price, sale_price: formData.sale_price,
          unit: formData.unit, quantity: formData.quantity, min_quantity_alert: formData.min_quantity_alert,
          sku: formData.sku, description: formData.description, image_url: formData.image_url,
          is_active: formData.is_active, is_taxable: formData.is_taxable,
        }).eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: 'تم التحديث', description: 'تم تحديث المنتج بنجاح' });
      } else {
        const { error } = await supabase.from('products').insert({
          restaurant_id: restaurantId, name: formData.name, category: formData.category,
          type: formData.type, preparation_time: formData.type === 'prepared' ? formData.preparation_time : null,
          cost_price: formData.cost_price, sale_price: formData.sale_price,
          unit: formData.unit, quantity: formData.quantity, min_quantity_alert: formData.min_quantity_alert,
          sku: formData.sku, description: formData.description, image_url: formData.image_url,
          is_active: formData.is_active, is_taxable: formData.is_taxable,
        });
        if (error) throw error;
        toast({ title: 'تمت الإضافة', description: 'تم إضافة المنتج بنجاح' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await supabase.from('product_ingredients').delete().eq('product_id', id);
      await supabase.from('products').delete().eq('id', id);
      toast({ title: 'تم الحذف', description: 'تم حذف المنتج بنجاح' });
      loadData();
    }
  };

  const handleEdit = (product: CloudProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, category: product.category, type: product.type,
      preparation_time: product.preparation_time || 15,
      cost_price: product.cost_price, sale_price: product.sale_price,
      unit: product.unit, quantity: product.quantity, min_quantity_alert: product.min_quantity_alert,
      sku: product.sku || '', description: product.description || '', image_url: product.image_url || '',
      is_active: product.is_active, is_taxable: product.is_taxable,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '', category: '', type: 'prepared', preparation_time: 15,
      cost_price: 0, sale_price: 0, unit: 'قطعة', quantity: 0,
      min_quantity_alert: 5, sku: genSKU(), description: '', image_url: '', is_active: true, is_taxable: true,
    });
  };

  const profit = (formData.sale_price || 0) - (formData.cost_price || 0);
  const profitPct = formData.cost_price ? ((profit / formData.cost_price) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المنتجات</h1>
          <p className="text-muted-foreground mt-1">إدارة المأكولات والمشروبات والمنتجات</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 ml-2" /> إضافة منتج
        </Button>
      </div>

      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو الكود..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 bg-secondary border-border" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border"><SelectValue placeholder="الفئة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border"><SelectValue placeholder="النوع" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="prepared">مأكولات (تُحضّر)</SelectItem>
                <SelectItem value="stored">منتجات (مخزنة)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }}>
              <Card className="glass shadow-card hover:shadow-glow transition-all duration-300 overflow-hidden group">
                <div className="relative h-40 bg-secondary/50 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-16 h-16 text-muted-foreground/30" /></div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${product.type === 'prepared' ? 'bg-primary/80 text-primary-foreground' : 'bg-info/80 text-info-foreground'}`}>
                      {product.type === 'prepared' ? 'يُحضّر' : 'مخزون'}
                    </span>
                    {!product.is_active && <span className="text-xs px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground">غير متاح</span>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div><h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3><p className="text-sm text-muted-foreground">{product.category}</p></div>
                    <p className="font-bold text-primary">{product.sale_price.toFixed(2)} ج.م</p>
                  </div>
                  {product.type === 'stored' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${product.quantity <= product.min_quantity_alert ? 'bg-destructive animate-pulse' : 'bg-success'}`} />
                      <span className="text-sm text-muted-foreground">الكمية: {product.quantity} {product.unit}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-secondary" onClick={() => handleEdit(product)}><Edit className="w-4 h-4 ml-1" /> تعديل</Button>
                    <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16"><Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">لا توجد منتجات</p></div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-secondary border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                  {formData.image_url ? <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-muted-foreground" />}
                </div>
                {formData.image_url && (
                  <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="absolute -top-2 -left-2 p-1 rounded-full bg-destructive text-destructive-foreground"><X className="w-4 h-4" /></button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">رابط الصورة</Label>
              <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} className="bg-secondary border-border" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">اسم المنتج *</Label>
                <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">الفئة *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">نوع المنتج *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepared">مأكولات (تُحضّر)</SelectItem>
                    <SelectItem value="stored">منتجات (مخزنة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === 'prepared' && (
                <div className="space-y-2">
                  <Label className="text-foreground">وقت التحضير</Label>
                  <Select value={String(formData.preparation_time)} onValueChange={(v) => setFormData({ ...formData, preparation_time: parseInt(v) })}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5,10,15,20,25,30,45,60].map(t => <SelectItem key={t} value={String(t)}>{t} دقيقة</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-foreground">سعر التكلفة *</Label>
                <Input type="number" step="0.01" min="0" required value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">سعر البيع *</Label>
                <Input type="number" step="0.01" min="0" required value={formData.sale_price} onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })} className="bg-secondary border-border" />
              </div>
              <div className="md:col-span-2 p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="flex items-center justify-between">
                  <span className="text-success">الربح المتوقع:</span>
                  <div><span className="font-bold text-success">{profit.toFixed(2)} ج.م</span><span className="text-sm text-muted-foreground mr-2">({profitPct}%)</span></div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">الوحدة</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['قطعة','كوب','طبق','علبة','كيلو','جرام'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {formData.type === 'stored' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">الكمية</Label>
                    <Input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">تنبيه عند الكمية</Label>
                    <Input type="number" min="0" value={formData.min_quantity_alert} onChange={(e) => setFormData({ ...formData, min_quantity_alert: parseInt(e.target.value) || 0 })} className="bg-secondary border-border" />
                  </div>
                </>
              )}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-foreground">الوصف</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-secondary border-border" rows={3} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                <Label className="text-foreground">متاح للبيع</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_taxable} onCheckedChange={(c) => setFormData({ ...formData, is_taxable: c })} />
                <Label className="text-foreground">خاضع للضريبة</Label>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">إلغاء</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground"><Check className="w-4 h-4 ml-2" /> {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
