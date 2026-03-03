import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, MapPin, Phone, User, Send, Clock, ChefHat, Star, CalendarDays, Users as UsersIcon, MessageSquare, CheckCircle, Store, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface StoreProduct {
  id: string;
  name: string;
  name_en: string | null;
  category: string;
  description: string | null;
  sale_price: number;
  image_url: string | null;
  type: string;
  preparation_time: number | null;
  is_active: boolean;
  restaurant_id: string;
}

interface StoreCategory {
  id: string;
  name: string;
  name_en: string | null;
  type: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  restaurant_id: string;
}

interface CartItem {
  product: StoreProduct;
  quantity: number;
  notes: string;
}

interface StoreTable {
  id: string;
  name: string;
  number: number;
  chairs: number;
  status: string;
  is_active: boolean;
}

export default function PublicStore() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [tables, setTables] = useState<StoreTable[]>([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', notes: '' });
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  
  const [reservationInfo, setReservationInfo] = useState({
    name: '', phone: '', date: '', time: '', guests: 2, notes: '', tableId: ''
  });

  useEffect(() => {
    if (restaurantId) loadStoreData();
  }, [restaurantId]);

  const loadStoreData = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const [{ data: restaurant }, { data: prods }, { data: cats }, { data: tbls }] = await Promise.all([
        supabase.from('restaurants').select('name, phone, address').eq('id', restaurantId).single(),
        supabase.from('products').select('*').eq('restaurant_id', restaurantId).eq('is_active', true),
        supabase.from('categories').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order'),
        supabase.from('restaurant_tables').select('*').eq('restaurant_id', restaurantId).eq('is_active', true),
      ]);
      
      if (restaurant) {
        setRestaurantName(restaurant.name);
        setRestaurantPhone(restaurant.phone || '');
        setRestaurantAddress(restaurant.address || '');
      }
      setProducts(prods || []);
      setCategories(cats || []);
      setTables(tbls || []);
    } catch (e) {
      console.error('Error loading store:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
    toast({ title: 'تمت الإضافة', description: `${product.name} أُضيف للسلة` });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty <= 0 ? null! : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({ title: 'بيانات ناقصة', description: 'يرجى إدخال الاسم ورقم الهاتف', variant: 'destructive' });
      return;
    }
    if (orderType === 'delivery' && !customerInfo.address) {
      toast({ title: 'بيانات ناقصة', description: 'يرجى إدخال عنوان التوصيل', variant: 'destructive' });
      return;
    }

    try {
      const today = new Date();
      const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
      const orderNumber = `ONL-${dateStr}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;

      const subtotal = cartTotal;
      const { data: order, error } = await supabase.from('orders').insert({
        restaurant_id: restaurantId!,
        order_number: orderNumber,
        type: orderType,
        subtotal,
        total: subtotal,
        total_cost: 0,
        profit: 0,
        status: 'pending',
        payment_method: 'cash',
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address || null,
        notes: customerInfo.notes || `طلب أونلاين - ${orderType === 'delivery' ? 'توصيل' : 'استلام'}`,
      }).select().single();

      if (error) throw error;

      // Insert order items
      const items = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.sale_price,
        cost_price: 0,
        total: item.product.sale_price * item.quantity,
        notes: item.notes || null,
      }));

      await supabase.from('order_items').insert(items);

      // Add notification
      await supabase.from('notifications').insert({
        restaurant_id: restaurantId!,
        type: 'new_order',
        title: 'طلب أونلاين جديد 🛒',
        message: `طلب جديد #${orderNumber} من ${customerInfo.name} - ${orderType === 'delivery' ? 'توصيل' : 'استلام'}`,
        related_id: order.id,
      });

      setOrderSuccess(true);
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '', notes: '' });
    } catch (e) {
      console.error('Error placing order:', e);
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إرسال الطلب', variant: 'destructive' });
    }
  };

  const handleReservation = async () => {
    if (!reservationInfo.name || !reservationInfo.phone || !reservationInfo.date || !reservationInfo.time) {
      toast({ title: 'بيانات ناقصة', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    try {
      const tableName = reservationInfo.tableId 
        ? tables.find(t => t.id === reservationInfo.tableId)?.name || 'غير محدد'
        : 'أي طاولة متاحة';

      const { error } = await supabase.from('table_reservations').insert({
        restaurant_id: restaurantId!,
        table_id: reservationInfo.tableId || tables[0]?.id,
        table_name: tableName,
        customer_name: reservationInfo.name,
        customer_phone: reservationInfo.phone,
        reservation_date: reservationInfo.date,
        reservation_time: reservationInfo.time,
        guest_count: reservationInfo.guests,
        notes: reservationInfo.notes || null,
        status: 'pending',
      });

      if (error) throw error;

      // Add notification
      await supabase.from('notifications').insert({
        restaurant_id: restaurantId!,
        type: 'system',
        title: 'حجز جديد 📅',
        message: `حجز جديد من ${reservationInfo.name} - ${reservationInfo.date} الساعة ${reservationInfo.time}`,
      });

      setReservationSuccess(true);
      setReservationInfo({ name: '', phone: '', date: '', time: '', guests: 2, notes: '', tableId: '' });
    } catch (e) {
      console.error('Error creating reservation:', e);
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إنشاء الحجز', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!restaurantId || products.length === 0 && categories.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Store className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">المتجر غير متاح</h2>
            <p className="text-muted-foreground">لم يتم العثور على هذا المتجر أو لا توجد منتجات متاحة حالياً.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{restaurantName}</h1>
            {restaurantAddress && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {restaurantAddress}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReservationOpen(true)}>
              <CalendarDays className="w-4 h-4 ml-1" /> حجز طاولة
            </Button>
            <Button size="sm" className="relative gradient-primary text-primary-foreground" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-4 h-4 ml-1" />
              السلة
              {cartCount > 0 && (
                <span className="absolute -top-2 -left-2 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-card border-border"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'gradient-primary text-primary-foreground' : ''}
          >
            الكل ({products.length})
          </Button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat.name).length;
            return (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.name)}
                className={selectedCategory === cat.name ? 'gradient-primary text-primary-foreground' : ''}
              >
                {cat.name} ({count})
              </Button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 cursor-pointer group border-border" onClick={() => setSelectedProduct(product)}>
                  <div className="aspect-square bg-secondary/50 overflow-hidden relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.preparation_time && (
                      <Badge className="absolute top-2 right-2 bg-card/90 text-foreground text-[10px]">
                        <Clock className="w-3 h-3 ml-1" /> {product.preparation_time} د
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{product.name}</h3>
                    {product.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">{product.sale_price.toFixed(2)} ج.م</span>
                      <Button size="icon" className="h-7 w-7 gradient-primary text-primary-foreground" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                        <Plus className="w-3 h-3" />
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
            <Store className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
          </div>
        )}
      </main>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md bg-card">
          {selectedProduct && (
            <>
              <div className="aspect-video bg-secondary/50 rounded-lg overflow-hidden -mt-2 mb-4">
                {selectedProduct.image_url ? (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-16 h-16 text-muted-foreground/30" /></div>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">{selectedProduct.name}</h2>
              {selectedProduct.name_en && <p className="text-sm text-muted-foreground">{selectedProduct.name_en}</p>}
              {selectedProduct.description && <p className="text-sm text-muted-foreground mt-2">{selectedProduct.description}</p>}
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">{selectedProduct.category}</Badge>
                {selectedProduct.preparation_time && (
                  <Badge variant="outline"><Clock className="w-3 h-3 ml-1" /> {selectedProduct.preparation_time} دقيقة</Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-2xl font-bold text-primary">{selectedProduct.sale_price.toFixed(2)} ج.م</span>
                <Button className="gradient-primary text-primary-foreground" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                  <Plus className="w-4 h-4 ml-2" /> أضف للسلة
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-lg bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> السلة ({cartCount})</DialogTitle>
          </DialogHeader>
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">السلة فارغة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-5 h-5 text-muted-foreground/30" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">{item.product.sale_price.toFixed(2)} ج.م</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="font-bold text-primary text-sm w-16 text-left">{(item.product.sale_price * item.quantity).toFixed(2)}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{cartTotal.toFixed(2)} ج.م</span>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}>
                  <Send className="w-4 h-4 ml-2" /> إتمام الطلب
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={(open) => { setIsCheckoutOpen(open); if (!open) setOrderSuccess(false); }}>
        <DialogContent className="max-w-md bg-card">
          {orderSuccess ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-2">تم إرسال طلبك بنجاح! 🎉</h3>
              <p className="text-muted-foreground">سيتم التواصل معك قريباً لتأكيد الطلب</p>
              <Button className="mt-6" onClick={() => { setIsCheckoutOpen(false); setOrderSuccess(false); }}>عودة للمتجر</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>إتمام الطلب</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={orderType === 'delivery' ? 'default' : 'outline'}
                    onClick={() => setOrderType('delivery')}
                    className={orderType === 'delivery' ? 'gradient-primary text-primary-foreground flex-1' : 'flex-1'}
                  >
                    🚚 توصيل
                  </Button>
                  <Button
                    variant={orderType === 'takeaway' ? 'default' : 'outline'}
                    onClick={() => setOrderType('takeaway')}
                    className={orderType === 'takeaway' ? 'gradient-primary text-primary-foreground flex-1' : 'flex-1'}
                  >
                    🛍️ استلام
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>الاسم *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={customerInfo.name} onChange={(e) => setCustomerInfo(p => ({...p, name: e.target.value}))} className="pr-10" placeholder="اسمك الكامل" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={customerInfo.phone} onChange={(e) => setCustomerInfo(p => ({...p, phone: e.target.value}))} className="pr-10" placeholder="01xxxxxxxxx" dir="ltr" />
                  </div>
                </div>
                {orderType === 'delivery' && (
                  <div className="space-y-2">
                    <Label>عنوان التوصيل *</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea value={customerInfo.address} onChange={(e) => setCustomerInfo(p => ({...p, address: e.target.value}))} className="pr-10 min-h-[60px]" placeholder="العنوان بالتفصيل" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea value={customerInfo.notes} onChange={(e) => setCustomerInfo(p => ({...p, notes: e.target.value}))} placeholder="أي ملاحظات إضافية..." />
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold text-lg mb-3">
                    <span>الإجمالي</span>
                    <span className="text-primary">{cartTotal.toFixed(2)} ج.م</span>
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground h-12 text-lg" onClick={handlePlaceOrder}>
                    <Send className="w-5 h-5 ml-2" /> تأكيد الطلب
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reservation Dialog */}
      <Dialog open={isReservationOpen} onOpenChange={(open) => { setIsReservationOpen(open); if (!open) setReservationSuccess(false); }}>
        <DialogContent className="max-w-md bg-card">
          {reservationSuccess ? (
            <div className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-2">تم إرسال الحجز بنجاح! 📅</h3>
              <p className="text-muted-foreground">سيتم التواصل معك لتأكيد الحجز</p>
              <Button className="mt-6" onClick={() => { setIsReservationOpen(false); setReservationSuccess(false); }}>عودة للمتجر</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /> حجز طاولة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>الاسم *</Label>
                  <Input value={reservationInfo.name} onChange={(e) => setReservationInfo(p => ({...p, name: e.target.value}))} placeholder="اسمك الكامل" />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input value={reservationInfo.phone} onChange={(e) => setReservationInfo(p => ({...p, phone: e.target.value}))} placeholder="01xxxxxxxxx" dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input type="date" value={reservationInfo.date} onChange={(e) => setReservationInfo(p => ({...p, date: e.target.value}))} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label>الوقت *</Label>
                    <Input type="time" value={reservationInfo.time} onChange={(e) => setReservationInfo(p => ({...p, time: e.target.value}))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>عدد الأشخاص</Label>
                    <Select value={String(reservationInfo.guests)} onValueChange={(v) => setReservationInfo(p => ({...p, guests: Number(v)}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,10,12].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'شخص' : 'أشخاص'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {tables.length > 0 && (
                    <div className="space-y-2">
                      <Label>الطاولة</Label>
                      <Select value={reservationInfo.tableId} onValueChange={(v) => setReservationInfo(p => ({...p, tableId: v}))}>
                        <SelectTrigger><SelectValue placeholder="أي طاولة" /></SelectTrigger>
                        <SelectContent>
                          {tables.filter(t => t.status === 'available').map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name} ({t.chairs} كراسي)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea value={reservationInfo.notes} onChange={(e) => setReservationInfo(p => ({...p, notes: e.target.value}))} placeholder="أي طلبات خاصة..." />
                </div>
                <Button className="w-full gradient-primary text-primary-foreground h-12" onClick={handleReservation}>
                  <CalendarDays className="w-5 h-5 ml-2" /> تأكيد الحجز
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <Button className="w-full gradient-primary text-primary-foreground h-14 text-lg shadow-glow" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="w-5 h-5 ml-2" />
            عرض السلة ({cartCount}) - {cartTotal.toFixed(2)} ج.م
          </Button>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-sm text-muted-foreground">
        <p>{restaurantName} - جميع الحقوق محفوظة</p>
        {restaurantPhone && <p className="mt-1">للتواصل: {restaurantPhone}</p>}
      </footer>
    </div>
  );
}
