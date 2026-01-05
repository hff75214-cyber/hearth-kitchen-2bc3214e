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
  Users,
  UserPlus,
  Tag,
  Sparkles,
} from 'lucide-react';
import { db, Product, Category, Order, OrderItem, Customer, Settings, Offer, generateOrderNumber, updateDailySummary, addNotification, deductRawMaterials, logActivity } from '@/lib/database';
import { printThermalReceipt, printKitchenTicket } from '@/lib/thermalPrint';
import { printA5Invoice } from '@/lib/a5Invoice';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  
  // Customer selection state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  
  // Auto offers state
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [autoDiscountAmount, setAutoDiscountAmount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, categoriesData, tablesData, customersData, settingsData, offersData] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray(),
      db.restaurantTables.toArray(),
      db.customers.toArray(),
      db.settings.toArray(),
      db.offers.toArray(),
    ]);
    setProducts(productsData.filter(p => p.isActive));
    setCategories(categoriesData.filter(c => c.isActive));
    setTables(tablesData.filter(t => t.isActive).map(t => ({ id: t.id!, name: t.name, number: t.number })));
    setCustomers(customersData);
    if (settingsData.length > 0) {
      setSettings(settingsData[0]);
    }
    
    // Filter active offers
    const now = new Date();
    const activeOffersFiltered = offersData.filter(o => 
      o.isActive && 
      new Date(o.startDate) <= now && 
      new Date(o.endDate) >= now &&
      (!o.usageLimit || o.usageCount < o.usageLimit)
    );
    setActiveOffers(activeOffersFiltered);
  };

  // Calculate best applicable offer for cart
  useEffect(() => {
    if (cart.length === 0 || activeOffers.length === 0) {
      setAppliedOffer(null);
      setAutoDiscountAmount(0);
      return;
    }

    const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const cartProductIds = cart.map(item => item.productId);

    let bestOffer: Offer | null = null;
    let bestDiscount = 0;

    for (const offer of activeOffers) {
      // Check minimum order amount
      if (offer.minOrderAmount && cartSubtotal < offer.minOrderAmount) continue;

      // Check applicable products
      let applicableAmount = 0;
      if (offer.applicableProducts === 'all') {
        applicableAmount = cartSubtotal;
      } else {
        applicableAmount = cart
          .filter(item => (offer.applicableProducts as number[]).includes(item.productId))
          .reduce((sum, item) => sum + item.total, 0);
      }

      if (applicableAmount === 0) continue;

      // Calculate discount
      let offerDiscount = 0;
      if (offer.discountType === 'percentage') {
        offerDiscount = applicableAmount * (offer.discountValue / 100);
        if (offer.maxDiscount && offerDiscount > offer.maxDiscount) {
          offerDiscount = offer.maxDiscount;
        }
      } else {
        offerDiscount = Math.min(offer.discountValue, applicableAmount);
      }

      if (offerDiscount > bestDiscount) {
        bestDiscount = offerDiscount;
        bestOffer = offer;
      }
    }

    setAppliedOffer(bestOffer);
    setAutoDiscountAmount(bestDiscount);
  }, [cart, activeOffers]);

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
        preparationTime: product.type === 'prepared' ? product.preparationTime : undefined,
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
  const manualDiscountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
  const totalDiscountAmount = manualDiscountAmount + autoDiscountAmount;
  const total = subtotal - totalDiscountAmount;
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

      // Check if order has any prepared items (need kitchen processing)
      const hasPreparedItems = cart.some(item => item.preparationTime && item.preparationTime > 0);
      
      // Determine order status:
      // - Prepared items -> start 'preparing' automatically
      // - Delivery without prepared items -> start 'pending' for tracking
      // - Other orders without prepared items -> completed immediately
      let orderStatus: Order['status'];
      if (hasPreparedItems) {
        orderStatus = 'preparing'; // Auto-start preparation
      } else if (orderType === 'delivery') {
        orderStatus = 'pending'; // Delivery needs tracking
      } else {
        orderStatus = 'completed';
      }

      // Get current user data
      const currentUserData = localStorage.getItem('currentUserData');
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null;

      const order: Omit<Order, 'id'> = {
        orderNumber,
        type: orderType,
        tableId: selectedTable || undefined,
        tableName: tableData?.name,
        items: cart,
        subtotal,
        discount: totalDiscountAmount,
        discountType: appliedOffer ? 'fixed' : discountType,
        total,
        totalCost,
        profit,
        paymentMethod,
        status: orderStatus,
        customerName: customerInfo.name || undefined,
        customerPhone: customerInfo.phone || undefined,
        customerAddress: customerInfo.address || undefined,
        notes: orderNotes || undefined,
        createdAt: new Date(),
        completedAt: orderStatus === 'completed' ? new Date() : undefined,
        userId: currentUser?.id,
        userName: currentUser?.name,
      };

      const orderId = await db.orders.add(order);

      // Add notification for kitchen if order has prepared items
      if (hasPreparedItems) {
        await addNotification({
          type: 'new_order',
          title: 'طلب جديد للمطبخ',
          message: `طلب جديد #${orderNumber} بدأ التحضير`,
          relatedId: orderId as number,
        });
        
        // Auto-print kitchen ticket for prepared items
        const kitchenOrder: Order = {
          ...order,
          id: orderId as number,
        };
        printKitchenTicket(kitchenOrder);
      }
      
      // Add notification for delivery orders
      if (orderType === 'delivery') {
        await addNotification({
          type: 'new_order',
          title: 'طلب توصيل جديد',
          message: `طلب توصيل جديد #${orderNumber} للعميل ${customerInfo.name}`,
          relatedId: orderId as number,
        });
      }

      // Update stock for stored products and deduct raw materials for prepared products
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product?.type === 'stored') {
          await db.products.update(item.productId, {
            quantity: product.quantity - item.quantity,
            updatedAt: new Date(),
          });
        } else if (product?.type === 'prepared') {
          // Deduct raw materials for prepared products
          await deductRawMaterials(item.productId, item.quantity);
        }
      }
      
      // Save or update customer info
      if (orderType === 'delivery' && customerInfo.phone) {
        const existingCustomer = await db.customers.where('phone').equals(customerInfo.phone).first();
        if (existingCustomer) {
          await db.customers.update(existingCustomer.id!, {
            name: customerInfo.name || existingCustomer.name,
            address: customerInfo.address || existingCustomer.address,
            updatedAt: new Date(),
          });
        } else if (customerInfo.name) {
          await db.customers.add({
            name: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      // Update table status if dine-in - set to OCCUPIED
      if (orderType === 'dine-in' && selectedTable) {
        await db.restaurantTables.update(selectedTable, { 
          status: 'occupied', 
          currentOrderId: undefined,
          occupiedAt: new Date()
        });
        
        // Add notification for new table order
        const tableData2 = tables.find(t => t.id === selectedTable);
        await addNotification({
          type: 'new_order',
          title: 'طلب جديد',
          message: `طلب جديد للطاولة ${tableData2?.name || selectedTable}`,
          relatedId: selectedTable,
        });
      }

      // Update offer usage count if an offer was applied
      if (appliedOffer && appliedOffer.id) {
        await db.offers.update(appliedOffer.id, {
          usageCount: appliedOffer.usageCount + 1
        });
      }

      // Update daily summary
      await updateDailySummary(new Date());

      // Log sale activity
      if (currentUser) {
        await logActivity(
          { id: currentUser.id, name: currentUser.name, role: currentUser.role },
          'sale',
          `عملية بيع - طلب #${orderNumber}`,
          { orderType, itemsCount: cart.length, paymentMethod },
          total,
          orderId as number
        );
      }

      // Store order for receipt printing
      setReceiptContent(JSON.stringify({ ...order, orderNumber }));

      // Reset
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
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إنشاء الطلب', variant: 'destructive' });
    }
  };

  const printReceipt = () => {
    if (receiptContent) {
      try {
        const orderData = JSON.parse(receiptContent);
        const order: Order = {
          ...orderData,
          createdAt: new Date(orderData.createdAt),
        };
        // Print A5 professional invoice
        printA5Invoice(order, settings || undefined);
      } catch (error) {
        console.error('Error printing receipt:', error);
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
            {appliedOffer && autoDiscountAmount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {appliedOffer.name}
                </span>
                <span>-{autoDiscountAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            {manualDiscountAmount > 0 && (
              <div className="flex justify-between text-success">
                <span>خصم يدوي</span>
                <span>-{manualDiscountAmount.toFixed(2)} ج.م</span>
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
                {/* Customer Selection Toggle */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={isNewCustomer ? 'default' : 'outline'}
                    onClick={() => {
                      setIsNewCustomer(true);
                      setSelectedCustomerId(null);
                      setCustomerInfo({ name: '', phone: '', address: '' });
                    }}
                    className={`flex-1 ${isNewCustomer ? 'gradient-primary text-primary-foreground' : 'border-border'}`}
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    عميل جديد
                  </Button>
                  <Button
                    variant={!isNewCustomer ? 'default' : 'outline'}
                    onClick={() => setIsNewCustomer(false)}
                    className={`flex-1 ${!isNewCustomer ? 'gradient-primary text-primary-foreground' : 'border-border'}`}
                    disabled={customers.length === 0}
                  >
                    <Users className="w-4 h-4 ml-2" />
                    عميل مسجل ({customers.length})
                  </Button>
                </div>

                {/* Registered Customer Selection */}
                {!isNewCustomer && customers.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-foreground">اختر عميل مسجل</Label>
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-secondary border-border"
                        >
                          <Users className="w-4 h-4 ml-2" />
                          {selectedCustomerId 
                            ? customers.find(c => c.id === selectedCustomerId)?.name || 'اختر عميل'
                            : 'اختر عميل'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <Command>
                          <CommandInput placeholder="ابحث بالاسم أو رقم الهاتف..." />
                          <CommandList>
                            <CommandEmpty>لا يوجد عملاء</CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={`${customer.name} ${customer.phone}`}
                                  onSelect={() => {
                                    setSelectedCustomerId(customer.id!);
                                    setCustomerInfo({
                                      name: customer.name,
                                      phone: customer.phone,
                                      address: customer.address || '',
                                    });
                                    setCustomerSearchOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{customer.name}</span>
                                    <span className="text-xs text-muted-foreground">{customer.phone}</span>
                                    {customer.address && (
                                      <span className="text-xs text-muted-foreground truncate max-w-60">{customer.address}</span>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Customer Info Fields */}
                <div className="space-y-2">
                  <Label className="text-foreground">اسم العميل *</Label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="bg-secondary border-border"
                    readOnly={!isNewCustomer && !!selectedCustomerId}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">رقم الهاتف *</Label>
                  <Input
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="bg-secondary border-border"
                    readOnly={!isNewCustomer && !!selectedCustomerId}
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
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">الفاتورة</DialogTitle>
          </DialogHeader>

          <div 
            className="max-h-[60vh] overflow-y-auto rounded-lg"
            dangerouslySetInnerHTML={{ __html: receiptContent || '' }}
          />

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