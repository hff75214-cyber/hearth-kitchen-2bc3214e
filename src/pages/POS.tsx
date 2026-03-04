import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Minus, Plus, Trash2, ShoppingCart, CreditCard, Banknote, Wallet,
  Printer, Percent, X, UtensilsCrossed, Truck, ShoppingBag, Check, Users,
  UserPlus, Sparkles, Receipt,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useCloudTaxSettings, calculateTax, generateCloudOrderNumber } from '@/hooks/useCloudProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
  taxAmount: number;
  preparationTime?: number;
  isTaxable: boolean;
}

export default function POS() {
  const { restaurantId } = useRestaurant();
  const { taxSettings } = useCloudTaxSettings();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery' | 'takeaway'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderNotes, setOrderNotes] = useState('');
  const [receiptContent, setReceiptContent] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [activeOffers, setActiveOffers] = useState<any[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [autoDiscountAmount, setAutoDiscountAmount] = useState(0);

  useEffect(() => { if (restaurantId) loadData(); }, [restaurantId]);

  const loadData = async () => {
    if (!restaurantId) return;
    const [{ data: prods }, { data: cats }, { data: tbls }, { data: custs }, { data: offers }] = await Promise.all([
      supabase.from('products').select('*').eq('restaurant_id', restaurantId).eq('is_active', true),
      supabase.from('categories').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order'),
      supabase.from('restaurant_tables').select('*').eq('restaurant_id', restaurantId).eq('is_active', true),
      supabase.from('customers').select('*').eq('restaurant_id', restaurantId),
      supabase.from('offers').select('*').eq('restaurant_id', restaurantId).eq('is_active', true),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setTables(tbls || []);
    setCustomers(custs || []);
    const now = new Date();
    setActiveOffers((offers || []).filter(o => new Date(o.start_date) <= now && new Date(o.end_date) >= now && (!o.usage_limit || o.usage_count < o.usage_limit)));
  };

  // Auto-apply best offer
  useEffect(() => {
    if (cart.length === 0 || activeOffers.length === 0) { setAppliedOffer(null); setAutoDiscountAmount(0); return; }
    const sub = cart.reduce((s, i) => s + i.total, 0);
    let bestOffer: any = null, bestDisc = 0;
    for (const offer of activeOffers) {
      if (offer.min_order_amount && sub < offer.min_order_amount) continue;
      let amt = offer.apply_to_all ? sub : cart.filter(i => (offer.applicable_products || []).includes(i.productId)).reduce((s, i) => s + i.total, 0);
      if (amt === 0) continue;
      let d = offer.discount_type === 'percentage' ? amt * (offer.discount_value / 100) : Math.min(offer.discount_value, amt);
      if (offer.max_discount && d > offer.max_discount) d = offer.max_discount;
      if (d > bestDisc) { bestDisc = d; bestOffer = offer; }
    }
    setAppliedOffer(bestOffer);
    setAutoDiscountAmount(bestDisc);
  }, [cart, activeOffers]);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product: any) => {
    if (product.type === 'stored' && product.quantity <= 0) {
      toast({ title: 'نفذت الكمية', variant: 'destructive' }); return;
    }
    const { taxAmount } = calculateTax(product.sale_price, taxSettings, { is_taxable: product.is_taxable, sale_price: product.sale_price, category: product.category });
    const existing = cart.findIndex(i => i.productId === product.id);
    if (existing >= 0) {
      const newCart = [...cart];
      const q = newCart[existing].quantity + 1;
      if (product.type === 'stored' && q > product.quantity) { toast({ title: 'كمية غير كافية', variant: 'destructive' }); return; }
      newCart[existing].quantity = q;
      newCart[existing].total = q * product.sale_price;
      newCart[existing].taxAmount = taxAmount * q;
      setCart(newCart);
    } else {
      setCart([...cart, {
        productId: product.id, productName: product.name, quantity: 1,
        unitPrice: product.sale_price, costPrice: product.cost_price, discount: 0,
        total: product.sale_price, taxAmount, isTaxable: product.is_taxable,
        preparationTime: product.type === 'prepared' ? product.preparation_time : undefined,
      }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const q = newCart[index].quantity + delta;
    if (q <= 0) { newCart.splice(index, 1); } else {
      const product = products.find(p => p.id === newCart[index].productId);
      if (product?.type === 'stored' && q > product.quantity) { toast({ title: 'كمية غير كافية', variant: 'destructive' }); return; }
      newCart[index].quantity = q;
      newCart[index].total = q * newCart[index].unitPrice;
      const { taxAmount } = calculateTax(newCart[index].unitPrice, taxSettings, { is_taxable: newCart[index].isTaxable, sale_price: newCart[index].unitPrice });
      newCart[index].taxAmount = taxAmount * q;
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => { const c = [...cart]; c.splice(index, 1); setCart(c); };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const totalTaxAmount = cart.reduce((s, i) => s + i.taxAmount, 0);
  const manualDiscountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const totalDiscountAmount = manualDiscountAmount + autoDiscountAmount;
  const total = subtotal + totalTaxAmount - totalDiscountAmount;
  const totalCost = cart.reduce((s, i) => s + (i.costPrice * i.quantity), 0);
  const profit = total - totalCost;

  const handleCheckout = async () => {
    if (cart.length === 0) { toast({ title: 'السلة فارغة', variant: 'destructive' }); return; }
    if (orderType === 'dine-in' && !selectedTable) { toast({ title: 'اختر طاولة', variant: 'destructive' }); return; }
    if (orderType === 'delivery' && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) { toast({ title: 'بيانات ناقصة', variant: 'destructive' }); return; }

    try {
      const orderNumber = await generateCloudOrderNumber(restaurantId!);
      const tableData = selectedTable ? tables.find(t => t.id === selectedTable) : null;
      const hasPrepared = cart.some(i => i.preparationTime && i.preparationTime > 0);
      let orderStatus = hasPrepared ? 'preparing' : orderType === 'delivery' ? 'pending' : 'completed';

      const taxDetails = taxSettings.filter(t => t.is_enabled).map(t => ({ name: t.name, type: t.tax_type, rate: t.rate, amount: totalTaxAmount }));

      const { data: order, error } = await supabase.from('orders').insert({
        restaurant_id: restaurantId!, order_number: orderNumber, type: orderType,
        table_id: selectedTable, table_name: tableData?.name,
        subtotal, discount: totalDiscountAmount, discount_type: appliedOffer ? 'fixed' : discountType,
        tax_amount: totalTaxAmount, tax_details: taxDetails,
        total, total_cost: totalCost, profit, payment_method: paymentMethod,
        status: orderStatus, customer_name: customerInfo.name || null,
        customer_phone: customerInfo.phone || null, customer_address: customerInfo.address || null,
        notes: orderNotes || null, completed_at: orderStatus === 'completed' ? new Date().toISOString() : null,
      }).select().single();
      if (error) throw error;

      // Insert order items
      const items = cart.map(item => ({
        order_id: order.id, product_id: item.productId, product_name: item.productName,
        quantity: item.quantity, unit_price: item.unitPrice, cost_price: item.costPrice,
        discount: item.discount, total: item.total, tax_amount: item.taxAmount,
        preparation_time: item.preparationTime || null,
      }));
      await supabase.from('order_items').insert(items);

      // Update stock for stored products
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product?.type === 'stored') {
          await supabase.from('products').update({ quantity: product.quantity - item.quantity }).eq('id', item.productId);
        }
      }

      // Notifications
      if (hasPrepared) {
        await supabase.from('notifications').insert({ restaurant_id: restaurantId!, type: 'new_order', title: 'طلب جديد للمطبخ', message: `طلب #${orderNumber} بدأ التحضير`, related_id: order.id });
      }
      if (orderType === 'delivery') {
        await supabase.from('notifications').insert({ restaurant_id: restaurantId!, type: 'new_order', title: 'طلب توصيل جديد', message: `طلب توصيل #${orderNumber} للعميل ${customerInfo.name}`, related_id: order.id });
      }

      // Update table status
      if (orderType === 'dine-in' && selectedTable) {
        await supabase.from('restaurant_tables').update({ status: 'occupied', occupied_at: new Date().toISOString() }).eq('id', selectedTable);
      }

      // Update offer usage
      if (appliedOffer) {
        await supabase.from('offers').update({ usage_count: appliedOffer.usage_count + 1 }).eq('id', appliedOffer.id);
      }

      // Save/update customer
      if (orderType === 'delivery' && customerInfo.phone) {
        const { data: existCust } = await supabase.from('customers').select('id').eq('restaurant_id', restaurantId!).eq('phone', customerInfo.phone).maybeSingle();
        if (existCust) {
          await supabase.from('customers').update({ name: customerInfo.name, address: customerInfo.address }).eq('id', existCust.id);
        } else if (customerInfo.name) {
          await supabase.from('customers').insert({ restaurant_id: restaurantId!, name: customerInfo.name, phone: customerInfo.phone, address: customerInfo.address });
        }
      }

      setReceiptContent(orderNumber);
      setCart([]);
      setDiscount(0);
      setSelectedTable(null);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setOrderNotes('');
      setIsCheckoutOpen(false);
      setSelectedCustomerId(null);
      setIsNewCustomer(true);
      setAppliedOffer(null);
      setAutoDiscountAmount(0);
      toast({ title: 'تم إنشاء الطلب', description: `رقم الطلب: ${orderNumber}` });
      loadData();
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex gap-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4 flex gap-2">
          {([
            { type: 'dine-in' as const, icon: UtensilsCrossed, label: 'طاولة' },
            { type: 'delivery' as const, icon: Truck, label: 'توصيل' },
            { type: 'takeaway' as const, icon: ShoppingBag, label: 'استلام' },
          ]).map(({ type, icon: Icon, label }) => (
            <Button key={type} variant={orderType === type ? 'default' : 'outline'} onClick={() => setOrderType(type)} className={orderType === type ? 'gradient-primary text-primary-foreground shadow-glow' : 'border-border'}>
              <Icon className="w-4 h-4 ml-2" /> {label}
            </Button>
          ))}
          {orderType === 'dine-in' && tables.length > 0 && (
            <Select value={selectedTable || ''} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-48 bg-secondary border-border"><SelectValue placeholder="اختر طاولة" /></SelectTrigger>
              <SelectContent>{tables.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>

        <div className="mb-4 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث عن منتج..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 bg-secondary border-border" />
        </div>

        <div className="mb-4 flex gap-2 flex-wrap">
          <Button size="sm" variant={selectedCategory === 'all' ? 'default' : 'outline'} onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'gradient-primary text-primary-foreground' : 'border-border'}>الكل</Button>
          {categories.map(cat => (
            <Button key={cat.id} size="sm" variant={selectedCategory === cat.name ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat.name)} className={selectedCategory === cat.name ? 'gradient-primary text-primary-foreground' : 'border-border'}>{cat.name}</Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <motion.button key={product.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => addToCart(product)} className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all text-right">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full aspect-square bg-secondary rounded-lg mb-2 flex items-center justify-center"><ShoppingCart className="w-8 h-8 text-muted-foreground/30" /></div>
                )}
                <p className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</p>
                <p className="text-primary font-bold">{product.sale_price.toFixed(2)} ج.م</p>
                {product.type === 'stored' && product.quantity <= product.min_quantity_alert && <p className="text-xs text-destructive">كمية: {product.quantity}</p>}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart */}
      <Card className="w-96 flex flex-col glass shadow-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground"><ShoppingCart className="w-5 h-5 text-primary" /> السلة ({cart.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {cart.map((item, index) => (
              <motion.div key={item.productId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-secondary/50">
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.unitPrice.toFixed(2)} ج.م</p>
                  {item.taxAmount > 0 && <p className="text-xs text-warning">ضريبة: {item.taxAmount.toFixed(2)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-7 w-7 border-border" onClick={() => updateQuantity(index, -1)}><Minus className="w-3 h-3" /></Button>
                  <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7 border-border" onClick={() => updateQuantity(index, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <p className="w-20 text-left font-bold text-primary">{item.total.toFixed(2)}</p>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(index)}><Trash2 className="w-3 h-3" /></Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><ShoppingCart className="w-16 h-16 mb-4 opacity-30" /><p>السلة فارغة</p></div>}
        </CardContent>

        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={discountType === 'percentage' ? 'default' : 'outline'} onClick={() => setDiscountType('percentage')} className={discountType === 'percentage' ? 'gradient-primary text-primary-foreground' : 'border-border'}><Percent className="w-3 h-3" /></Button>
            <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} placeholder="خصم" className="bg-secondary border-border flex-1" />
            <Button size="sm" variant={discountType === 'fixed' ? 'default' : 'outline'} onClick={() => setDiscountType('fixed')} className={discountType === 'fixed' ? 'gradient-primary text-primary-foreground' : 'border-border'}>ج.م</Button>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>المجموع</span><span>{subtotal.toFixed(2)} ج.م</span></div>
            {totalTaxAmount > 0 && <div className="flex justify-between text-warning"><span><Receipt className="w-3 h-3 inline ml-1" />الضريبة</span><span>+{totalTaxAmount.toFixed(2)} ج.م</span></div>}
            {appliedOffer && autoDiscountAmount > 0 && <div className="flex justify-between text-primary"><span className="flex items-center gap-1"><Sparkles className="w-3 h-3" />{appliedOffer.name}</span><span>-{autoDiscountAmount.toFixed(2)} ج.م</span></div>}
            {manualDiscountAmount > 0 && <div className="flex justify-between text-success"><span>خصم يدوي</span><span>-{manualDiscountAmount.toFixed(2)} ج.م</span></div>}
            <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border"><span>الإجمالي</span><span className="text-primary">{total.toFixed(2)} ج.م</span></div>
            <div className="flex justify-between text-xs text-success"><span>الربح</span><span>{profit.toFixed(2)} ج.م</span></div>
          </div>

          <div className="flex gap-2">
            {([
              { method: 'cash' as const, icon: Banknote, label: 'نقدي' },
              { method: 'card' as const, icon: CreditCard, label: 'بطاقة' },
              { method: 'wallet' as const, icon: Wallet, label: 'محفظة' },
            ]).map(({ method, icon: Icon, label }) => (
              <Button key={method} size="sm" variant={paymentMethod === method ? 'default' : 'outline'} onClick={() => setPaymentMethod(method)} className={`flex-1 ${paymentMethod === method ? 'gradient-primary text-primary-foreground' : 'border-border'}`}>
                <Icon className="w-4 h-4 ml-1" /> {label}
              </Button>
            ))}
          </div>

          <Button onClick={() => setIsCheckoutOpen(true)} disabled={cart.length === 0} className="w-full gradient-primary text-primary-foreground shadow-glow h-12 text-lg">
            <Check className="w-5 h-5 ml-2" /> إتمام الطلب
          </Button>
        </div>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">تأكيد الطلب</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {orderType === 'delivery' && (
              <>
                <div className="flex gap-2 mb-4">
                  <Button variant={isNewCustomer ? 'default' : 'outline'} onClick={() => { setIsNewCustomer(true); setSelectedCustomerId(null); setCustomerInfo({ name: '', phone: '', address: '' }); }} className={`flex-1 ${isNewCustomer ? 'gradient-primary text-primary-foreground' : 'border-border'}`}><UserPlus className="w-4 h-4 ml-2" /> عميل جديد</Button>
                  <Button variant={!isNewCustomer ? 'default' : 'outline'} onClick={() => setIsNewCustomer(false)} className={`flex-1 ${!isNewCustomer ? 'gradient-primary text-primary-foreground' : 'border-border'}`} disabled={customers.length === 0}><Users className="w-4 h-4 ml-2" /> عميل مسجل ({customers.length})</Button>
                </div>
                {!isNewCustomer && customers.length > 0 && (
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start bg-secondary border-border"><Users className="w-4 h-4 ml-2" />{selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name || 'اختر عميل' : 'اختر عميل'}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command><CommandInput placeholder="ابحث..." /><CommandList><CommandEmpty>لا يوجد</CommandEmpty><CommandGroup>{customers.map(c => (
                        <CommandItem key={c.id} value={`${c.name} ${c.phone}`} onSelect={() => { setSelectedCustomerId(c.id); setCustomerInfo({ name: c.name, phone: c.phone || '', address: c.address || '' }); setCustomerSearchOpen(false); }}>
                          <div className="flex flex-col"><span className="font-medium">{c.name}</span><span className="text-xs text-muted-foreground">{c.phone}</span></div>
                        </CommandItem>
                      ))}</CommandGroup></CommandList></Command>
                    </PopoverContent>
                  </Popover>
                )}
                <div className="space-y-2"><Label className="text-foreground">اسم العميل *</Label><Input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="bg-secondary border-border" readOnly={!isNewCustomer && !!selectedCustomerId} /></div>
                <div className="space-y-2"><Label className="text-foreground">رقم الهاتف *</Label><Input value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="bg-secondary border-border" readOnly={!isNewCustomer && !!selectedCustomerId} /></div>
                <div className="space-y-2"><Label className="text-foreground">العنوان *</Label><Textarea value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} className="bg-secondary border-border" /></div>
              </>
            )}
            <div className="space-y-2"><Label className="text-foreground">ملاحظات (اختياري)</Label><Textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="bg-secondary border-border" /></div>
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">نوع الطلب</span><span className="text-foreground">{orderType === 'dine-in' ? `طاولة ${tables.find(t => t.id === selectedTable)?.name || ''}` : orderType === 'delivery' ? 'توصيل' : 'استلام'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">طريقة الدفع</span><span className="text-foreground">{paymentMethod === 'cash' ? 'نقدي' : paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}</span></div>
              {totalTaxAmount > 0 && <div className="flex justify-between text-warning"><span>الضريبة</span><span>+{totalTaxAmount.toFixed(2)} ج.م</span></div>}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border"><span className="text-foreground">الإجمالي</span><span className="text-primary">{total.toFixed(2)} ج.م</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="flex-1 border-border">إلغاء</Button>
              <Button onClick={handleCheckout} className="flex-1 gradient-primary text-primary-foreground"><Check className="w-4 h-4 ml-2" /> تأكيد</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptContent} onOpenChange={() => setReceiptContent(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">تم إنشاء الطلب بنجاح</DialogTitle></DialogHeader>
          <div className="text-center py-8">
            <Check className="w-16 h-16 text-success mx-auto mb-4" />
            <p className="text-2xl font-bold text-foreground mb-2">طلب #{receiptContent}</p>
            <p className="text-muted-foreground">تم إنشاء الطلب بنجاح</p>
          </div>
          <Button onClick={() => setReceiptContent(null)} className="w-full gradient-primary text-primary-foreground">إغلاق</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
