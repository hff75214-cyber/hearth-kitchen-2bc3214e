import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Clock,
  Package,
  ToggleLeft,
  ToggleRight,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { db, Product, Offer } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'upcoming'>('all');
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    applicableProducts: 'all' as number[] | 'all',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    isActive: true,
    usageLimit: 0,
  });

  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [selectAllProducts, setSelectAllProducts] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [offersData, productsData] = await Promise.all([
        db.offers.toArray(),
        db.products.where('isActive').equals(1).toArray(),
      ]);
      setOffers(offersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const getOfferStatus = (offer: Offer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    
    if (!offer.isActive) return 'inactive';
    if (isBefore(now, start)) return 'upcoming';
    if (isAfter(now, end)) return 'expired';
    return 'active';
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const status = getOfferStatus(offer);
    if (filter === 'all') return true;
    if (filter === 'active') return status === 'active';
    if (filter === 'expired') return status === 'expired';
    if (filter === 'upcoming') return status === 'upcoming';
    return true;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      applicableProducts: 'all',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      isActive: true,
      usageLimit: 0,
    });
    setSelectedProducts([]);
    setSelectAllProducts(true);
    setEditingOffer(null);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderAmount: offer.minOrderAmount || 0,
      maxDiscount: offer.maxDiscount || 0,
      applicableProducts: offer.applicableProducts,
      startDate: format(new Date(offer.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(offer.endDate), 'yyyy-MM-dd'),
      isActive: offer.isActive,
      usageLimit: offer.usageLimit || 0,
    });
    
    if (offer.applicableProducts === 'all') {
      setSelectAllProducts(true);
      setSelectedProducts([]);
    } else {
      setSelectAllProducts(false);
      setSelectedProducts(offer.applicableProducts as number[]);
    }
    
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'يرجى إدخال اسم العرض', variant: 'destructive' });
      return;
    }

    if (formData.discountValue <= 0) {
      toast({ title: 'يرجى إدخال قيمة خصم صحيحة', variant: 'destructive' });
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      toast({ title: 'نسبة الخصم لا يمكن أن تتجاوز 100%', variant: 'destructive' });
      return;
    }

    const startDate = parseISO(formData.startDate);
    const endDate = parseISO(formData.endDate);

    if (isAfter(startDate, endDate)) {
      toast({ title: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية', variant: 'destructive' });
      return;
    }

    try {
      const offerData: Offer = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount || undefined,
        maxDiscount: formData.maxDiscount || undefined,
        applicableProducts: selectAllProducts ? 'all' : selectedProducts,
        startDate,
        endDate,
        isActive: formData.isActive,
        usageLimit: formData.usageLimit || undefined,
        usageCount: editingOffer?.usageCount || 0,
        createdAt: editingOffer?.createdAt || new Date(),
      };

      if (editingOffer?.id) {
        await db.offers.update(editingOffer.id, offerData);
        toast({ title: 'تم تحديث العرض بنجاح' });
      } else {
        await db.offers.add(offerData);
        toast({ title: 'تم إضافة العرض بنجاح' });
      }

      await loadData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({ title: 'حدث خطأ أثناء حفظ العرض', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    
    try {
      await db.offers.delete(id);
      toast({ title: 'تم حذف العرض بنجاح' });
      await loadData();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({ title: 'حدث خطأ أثناء حذف العرض', variant: 'destructive' });
    }
  };

  const toggleOfferStatus = async (offer: Offer) => {
    try {
      await db.offers.update(offer.id!, { isActive: !offer.isActive });
      toast({ title: offer.isActive ? 'تم إيقاف العرض' : 'تم تفعيل العرض' });
      await loadData();
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30">نشط</Badge>;
      case 'expired':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">منتهي</Badge>;
      case 'upcoming':
        return <Badge className="bg-warning/20 text-warning border-warning/30">قادم</Badge>;
      case 'inactive':
        return <Badge className="bg-muted text-muted-foreground">متوقف</Badge>;
      default:
        return null;
    }
  };

  // Stats
  const activeOffers = offers.filter(o => getOfferStatus(o) === 'active').length;
  const expiredOffers = offers.filter(o => getOfferStatus(o) === 'expired').length;
  const upcomingOffers = offers.filter(o => getOfferStatus(o) === 'upcoming').length;
  const totalUsage = offers.reduce((sum, o) => sum + o.usageCount, 0);

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
          <h1 className="text-3xl font-bold text-foreground">العروض والخصومات</h1>
          <p className="text-muted-foreground mt-1">إدارة العروض والخصومات المؤقتة</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة عرض جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">عروض منتهية</p>
                <p className="text-2xl font-bold text-destructive">{expiredOffers}</p>
              </div>
              <XCircle className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عروض قادمة</p>
                <p className="text-2xl font-bold text-warning">{upcomingOffers}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاستخدام</p>
                <p className="text-2xl font-bold text-primary">{totalUsage}</p>
              </div>
              <Tag className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في العروض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'expired', 'upcoming'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' && 'الكل'}
                  {f === 'active' && 'نشط'}
                  {f === 'expired' && 'منتهي'}
                  {f === 'upcoming' && 'قادم'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredOffers.map((offer, index) => {
            const status = getOfferStatus(offer);
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`glass shadow-card overflow-hidden ${status === 'expired' ? 'opacity-60' : ''}`}>
                  <div className={`h-1 ${status === 'active' ? 'bg-success' : status === 'upcoming' ? 'bg-warning' : 'bg-muted'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/20">
                          {offer.discountType === 'percentage' ? (
                            <Percent className="w-5 h-5 text-primary" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{offer.name}</CardTitle>
                          {getStatusBadge(status)}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleOfferStatus(offer)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {offer.isActive ? (
                          <ToggleRight className="w-6 h-6 text-success" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{offer.description || 'بدون وصف'}</p>
                    
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">الخصم</span>
                      <span className="font-bold text-primary text-lg">
                        {offer.discountType === 'percentage' 
                          ? `${offer.discountValue}%` 
                          : `${offer.discountValue} ج.م`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        من {format(new Date(offer.startDate), 'dd/MM/yyyy', { locale: ar })} 
                        إلى {format(new Date(offer.endDate), 'dd/MM/yyyy', { locale: ar })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {offer.applicableProducts === 'all' 
                          ? 'جميع المنتجات' 
                          : `${(offer.applicableProducts as number[]).length} منتج`}
                      </span>
                      {offer.usageLimit && (
                        <span>
                          الاستخدام: {offer.usageCount}/{offer.usageLimit}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(offer)}
                      >
                        <Pencil className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(offer.id!)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredOffers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد عروض</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>اسم العرض *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: خصم نهاية الأسبوع"
                />
              </div>

              <div className="col-span-2">
                <Label>وصف العرض</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر للعرض"
                />
              </div>

              <div>
                <Label>نوع الخصم</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية %</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت ج.م</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>قيمة الخصم *</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                />
              </div>

              <div>
                <Label>الحد الأدنى للطلب (اختياري)</Label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>الحد الأقصى للخصم (اختياري)</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>تاريخ البداية</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <Label>تاريخ النهاية</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div>
                <Label>حد الاستخدام (اختياري)</Label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                  placeholder="0 = غير محدود"
                />
              </div>

              <div className="flex items-center gap-2 mt-6">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(c) => setFormData({ ...formData, isActive: c as boolean })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">العرض نشط</Label>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">المنتجات المشمولة</Label>
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="allProducts"
                  checked={selectAllProducts}
                  onCheckedChange={(c) => {
                    setSelectAllProducts(c as boolean);
                    if (c) setSelectedProducts([]);
                  }}
                />
                <Label htmlFor="allProducts" className="cursor-pointer">جميع المنتجات</Label>
              </div>

              {!selectAllProducts && (
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={selectedProducts.includes(product.id!)}
                        onCheckedChange={(c) => {
                          if (c) {
                            setSelectedProducts([...selectedProducts, product.id!]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                      />
                      <Label htmlFor={`product-${product.id}`} className="cursor-pointer text-sm">
                        {product.name} - {product.salePrice} ج.م
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button onClick={handleSubmit}>
              {editingOffer ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
