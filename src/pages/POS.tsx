import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Wallet,
  Printer,
  Percent,
  X,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { db, Product, Category, Order, OrderItem, generateOrderNumber, updateDailySummary } from '@/lib/database';
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
import { toast } from '@/hooks/use-toast';

interface CartItem extends OrderItem {
  productId: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery' | 'takeaway'>('dine-in');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tables, setTables] = useState<{ id: number; name: string; number: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [receiptContent, setReceiptContent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, categoriesData, tablesData] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray(),
      db.restaurantTables.toArray(),
    ]);
    setProducts(productsData.filter(p => p.isActive));
    setCategories(categoriesData.filter(c => c.isActive));
    setTables(tablesData.filter(t => t.isActive).map(t => ({ id: t.id!, name: t.name, number: t.number })));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    // Check stock for stored products
    if (product.type === 'stored' && product.quantity <= 0) {
      toast({ title: 'نفذت الكمية', description: 'هذا المنتج غير متوفر حالياً', variant: 'destructive' });
      return;
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id);
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      const newQuantity = newCart[existingIndex].quantity + 1;
      
      // Check stock for stored products
      if (product.type === 'stored' && newQuantity > product.quantity) {
        toast({ title: 'كمية غير كافية', description: `الكمية المتاحة: ${product.quantity}`, variant: 'destructive' });
        return;
      }
      
      newCart[existingIndex].quantity = newQuantity;
      newCart[existingIndex].total = newQuantity * product.salePrice;
      setCart(newCart);
    } else {
      setCart([...cart, {
        productId: product.id!,
        productName: product.name,
        quantity: 1,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        discount: 0,
        total: product.salePrice,
      }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const newQuantity = newCart[index].quantity + delta;
    
    if (newQuantity <= 0) {
      newCart.splice(index, 1);
    } else {
      // Check stock for stored products
      const product = products.find(p => p.id === newCart[index].productId);
      if (product?.type === 'stored' && newQuantity > product.quantity) {
        toast({ title: 'كمية غير كافية', description: `الكمية المتاحة: ${product.quantity}`, variant: 'destructive' });
        return;
      }
      
      newCart[index].quantity = newQuantity;
      newCart[index].total = newQuantity * newCart[index].unitPrice;
    }
    
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const total = subtotal - discountAmount;
  const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const profit = total - totalCost;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({ title: 'السلة فارغة', description: 'أضف منتجات للمتابعة', variant: 'destructive' });
      return;
    }

    if (orderType === 'dine-in' && !selectedTable) {
      toast({ title: 'اختر طاولة', description: 'يجب اختيار طاولة للطلبات الداخلية', variant: 'destructive' });
      return;
    }

    if (orderType === 'delivery' && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) {
      toast({ title: 'بيانات ناقصة', description: 'أكمل بيانات العميل للتوصيل', variant: 'destructive' });
      return;
    }

    try {
      const orderNumber = await generateOrderNumber();
      const tableData = selectedTable ? tables.find(t => t.id === selectedTable) : null;

      const order: Omit<Order, 'id'> = {
        orderNumber,
        type: orderType,
        tableId: selectedTable || undefined,
        tableName: tableData?.name,
        items: cart,
        subtotal,
        discount: discountAmount,
        discountType,
        total,
        totalCost,
        profit,
        paymentMethod,
        status: 'completed',
        customerName: customerInfo.name || undefined,
        customerPhone: customerInfo.phone || undefined,
        customerAddress: customerInfo.address || undefined,
        notes: orderNotes || undefined,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      await db.orders.add(order);

      // Update stock for stored products
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product?.type === 'stored') {
          await db.products.update(item.productId, {
            quantity: product.quantity - item.quantity,
            updatedAt: new Date(),
          });
        }
      }

      // Update table status if dine-in
      if (orderType === 'dine-in' && selectedTable) {
        await db.restaurantTables.update(selectedTable, { status: 'available', currentOrderId: undefined });
      }

      // Update daily summary
      await updateDailySummary(new Date());

      // Generate receipt
      const receipt = generateReceipt(order as Order, orderNumber);
      setReceiptContent(receipt);

      // Reset
      setCart([]);
      setDiscount(0);
      setSelectedTable(null);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setOrderNotes('');
      setIsCheckoutOpen(false);

      toast({ title: 'تم إنشاء الطلب', description: `رقم الطلب: ${orderNumber}` });
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إنشاء الطلب', variant: 'destructive' });
    }
  };

  const generateReceipt = (order: Order, orderNumber: string): string => {
    const lines: string[] = [
      '═══════════════════════════════',
      '           مطعمي',
      '═══════════════════════════════',
      `رقم الطلب: ${orderNumber}`,
      `التاريخ: ${new Date().toLocaleDateString('ar-EG')}`,
      `الوقت: ${new Date().toLocaleTimeString('ar-EG')}`,
      '───────────────────────────────',
      `النوع: ${order.type === 'dine-in' ? 'طاولة ' + (order.tableName || '') : order.type === 'delivery' ? 'توصيل' : 'استلام'}`,
      '───────────────────────────────',
      '',
    ];

    order.items.forEach(item => {
      lines.push(`${item.productName}`);
      lines.push(`  ${item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)} ج.م`);
    });

    lines.push('');
    lines.push('───────────────────────────────');
    lines.push(`المجموع: ${order.subtotal.toFixed(2)} ج.م`);
    
    if (order.discount > 0) {
      lines.push(`الخصم: -${order.discount.toFixed(2)} ج.م`);
    }
    
    lines.push(`الإجمالي: ${order.total.toFixed(2)} ج.م`);
    lines.push('───────────────────────────────');
    lines.push(`طريقة الدفع: ${order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}`);
    lines.push('');
    lines.push('       شكراً لزيارتكم!');
    lines.push('═══════════════════════════════');

    return lines.join('\n');
  };

  const printReceipt = () => {
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>فاتورة</title>
              <style>
                body { font-family: monospace; white-space: pre; font-size: 14px; padding: 20px; }
              </style>
            </head>
            <body>${receiptContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex gap-4">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Order Type Selector */}
        <div className="mb-4 flex gap-2">
          {[
            { type: 'dine-in' as const, icon: UtensilsCrossed, label: 'طاولة' },
            { type: 'delivery' as const, icon: Truck, label: 'توصيل' },
            { type: 'takeaway' as const, icon: ShoppingBag, label: 'استلام' },
          ].map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant={orderType === type ? 'default' : 'outline'}
              onClick={() => setOrderType(type)}
              className={orderType === type ? 'gradient-primary text-primary-foreground shadow-glow' : 'border-border'}
            >
              <Icon className="w-4 h-4 ml-2" />
              {label}
            </Button>
          ))}
          
          {orderType === 'dine-in' && tables.length > 0 && (
            <Select
              value={selectedTable?.toString() || ''}
              onValueChange={(value) => setSelectedTable(parseInt(value))}
            >
              <SelectTrigger className="w-48 bg-secondary border-border">
                <SelectValue placeholder="اختر طاولة" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id.toString()}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Search and Categories */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-secondary border-border"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-4 flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className={selectedCategory === 'all' ? 'gradient-primary text-primary-foreground' : 'border-border'}
          >
            الكل
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.name ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.name)}
              className={selectedCategory === cat.name ? 'gradient-primary text-primary-foreground' : 'border-border'}
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all text-right"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-20 bg-secondary rounded-lg mb-2 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                <p className="font-semibold text-sm text-foreground line-clamp-1">{product.name}</p>
                <p className="text-primary font-bold">{product.salePrice.toFixed(2)} ج.م</p>
                {product.type === 'stored' && product.quantity <= product.minQuantityAlert && (
                  <p className="text-xs text-destructive">كمية: {product.quantity}</p>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <Card className="w-96 flex flex-col glass shadow-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-primary" />
            السلة ({cart.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {cart.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-secondary/50"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.unitPrice.toFixed(2)} ج.م</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-border"
                    onClick={() => updateQuantity(index, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-border"
                    onClick={() => updateQuantity(index, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="w-20 text-left font-bold text-primary">{item.total.toFixed(2)}</p>
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => removeFromCart(index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p>السلة فارغة</p>
            </div>
          )}
        </CardContent>

        {/* Cart Footer */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={discountType === 'percentage' ? 'default' : 'outline'}
              onClick={() => setDiscountType('percentage')}
              className={discountType === 'percentage' ? 'gradient-primary text-primary-foreground' : 'border-border'}
            >
              <Percent className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="خصم"
              className="bg-secondary border-border flex-1"
            />
            <Button
              size="sm"
              variant={discountType === 'fixed' ? 'default' : 'outline'}
              onClick={() => setDiscountType('fixed')}
              className={discountType === 'fixed' ? 'gradient-primary text-primary-foreground' : 'border-border'}
            >
              ج.م
            </Button>
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>المجموع</span>
              <span>{subtotal.toFixed(2)} ج.م</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>الخصم</span>
                <span>-{discountAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
              <span>الإجمالي</span>
              <span className="text-primary">{total.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between text-xs text-success">
              <span>الربح</span>
              <span>{profit.toFixed(2)} ج.م</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex gap-2">
            {[
              { method: 'cash' as const, icon: Banknote, label: 'نقدي' },
              { method: 'card' as const, icon: CreditCard, label: 'بطاقة' },
              { method: 'wallet' as const, icon: Wallet, label: 'محفظة' },
            ].map(({ method, icon: Icon, label }) => (
              <Button
                key={method}
                size="sm"
                variant={paymentMethod === method ? 'default' : 'outline'}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 ${paymentMethod === method ? 'gradient-primary text-primary-foreground' : 'border-border'}`}
              >
                <Icon className="w-4 h-4 ml-1" />
                {label}
              </Button>
            ))}
          </div>

          {/* Checkout Button */}
          <Button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full gradient-primary text-primary-foreground shadow-glow h-12 text-lg"
          >
            <Check className="w-5 h-5 ml-2" />
            إتمام الطلب
          </Button>
        </div>
      </Card>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">تأكيد الطلب</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {orderType === 'delivery' && (
              <>
                <div className="space-y-2">
                  <Label className="text-foreground">اسم العميل *</Label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">رقم الهاتف *</Label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">العنوان *</Label>
                  <Textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="text-foreground">ملاحظات (اختياري)</Label>
              <Textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="bg-secondary border-border"
                placeholder="أي ملاحظات خاصة بالطلب..."
              />
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع الطلب</span>
                <span className="text-foreground">
                  {orderType === 'dine-in' ? `طاولة ${tables.find(t => t.id === selectedTable)?.name || ''}` :
                   orderType === 'delivery' ? 'توصيل' : 'استلام'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">طريقة الدفع</span>
                <span className="text-foreground">
                  {paymentMethod === 'cash' ? 'نقدي' : paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span className="text-foreground">الإجمالي</span>
                <span className="text-primary">{total.toFixed(2)} ج.م</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 border-border"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                <Check className="w-4 h-4 ml-2" />
                تأكيد
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptContent} onOpenChange={() => setReceiptContent(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">الفاتورة</DialogTitle>
          </DialogHeader>

          <pre className="p-4 rounded-lg bg-secondary/50 text-foreground text-sm whitespace-pre-wrap font-mono">
            {receiptContent}
          </pre>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setReceiptContent(null)}
              className="flex-1 border-border"
            >
              إغلاق
            </Button>
            <Button
              onClick={printReceipt}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}