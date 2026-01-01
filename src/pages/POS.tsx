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
} from 'lucide-react';
import { db, Product, Category, Order, OrderItem, Customer, generateOrderNumber, updateDailySummary, addNotification, deductRawMaterials, logActivity } from '@/lib/database';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, categoriesData, tablesData, customersData] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray(),
      db.restaurantTables.toArray(),
      db.customers.toArray(),
    ]);
    setProducts(productsData.filter(p => p.isActive));
    setCategories(categoriesData.filter(c => c.isActive));
    setTables(tablesData.filter(t => t.isActive).map(t => ({ id: t.id!, name: t.name, number: t.number })));
    setCustomers(customersData);
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
        status: orderStatus,
        customerName: customerInfo.name || undefined,
        customerPhone: customerInfo.phone || undefined,
        customerAddress: customerInfo.address || undefined,
        notes: orderNotes || undefined,
        createdAt: new Date(),
        completedAt: orderStatus === 'completed' ? new Date() : undefined,
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

      // Update daily summary
      await updateDailySummary(new Date());

      // Log sale activity
      const currentUserData = localStorage.getItem('currentUserData');
      if (currentUserData) {
        const user = JSON.parse(currentUserData);
        await logActivity(
          { id: user.id, name: user.name, role: user.role },
          'sale',
          `عملية بيع - طلب #${orderNumber}`,
          { orderType, itemsCount: cart.length, paymentMethod },
          total,
          orderId as number
        );
      }

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
      setSelectedCustomerId(null);
      setIsNewCustomer(true);

      toast({ title: 'تم إنشاء الطلب', description: `رقم الطلب: ${orderNumber}` });
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إنشاء الطلب', variant: 'destructive' });
    }
  };

  const generateReceipt = (order: Order, orderNumber: string): string => {
    const orderTypeLabel = order.type === 'dine-in' ? `طاولة ${order.tableName || ''}` : order.type === 'delivery' ? 'توصيل' : 'استلام';
    const paymentLabel = order.paymentMethod === 'cash' ? 'نقدي' : order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة إلكترونية';
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px 4px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
        <td style="padding: 8px 4px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px 4px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 8px 4px; border-bottom: 1px solid #e5e7eb; text-align: left; font-weight: 600;">${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 350px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 16px;">
        <div style="background: white; border-radius: 14px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; text-align: center;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">🍽️</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">مطعمي</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">فاتورة ضريبية</p>
          </div>

          <!-- Order Info -->
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 13px;">رقم الطلب</span>
              <span style="font-weight: 700; color: #667eea;">#${orderNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 13px;">التاريخ</span>
              <span style="font-weight: 500;">${new Date().toLocaleDateString('ar-EG')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 13px;">الوقت</span>
              <span style="font-weight: 500;">${new Date().toLocaleTimeString('ar-EG')}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280; font-size: 13px;">نوع الطلب</span>
              <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${orderTypeLabel}</span>
            </div>
          </div>

          <!-- Items Table -->
          <div style="padding: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;" dir="rtl">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px 4px; text-align: right; font-weight: 600; color: #374151; border-radius: 8px 0 0 0;">الصنف</th>
                  <th style="padding: 12px 4px; text-align: center; font-weight: 600; color: #374151;">الكمية</th>
                  <th style="padding: 12px 4px; text-align: center; font-weight: 600; color: #374151;">السعر</th>
                  <th style="padding: 12px 4px; text-align: left; font-weight: 600; color: #374151; border-radius: 0 8px 0 0;">المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div style="padding: 0 20px 20px;">
            <div style="background: #f8f9fa; border-radius: 12px; padding: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">المجموع الفرعي</span>
                <span style="font-weight: 500;">${order.subtotal.toFixed(2)} ج.م</span>
              </div>
              ${order.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #10b981;">
                  <span>الخصم</span>
                  <span style="font-weight: 500;">- ${order.discount.toFixed(2)} ج.م</span>
                </div>
              ` : ''}
              <div style="border-top: 2px dashed #e5e7eb; margin: 12px 0; padding-top: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 18px; font-weight: 700; color: #374151;">الإجمالي</span>
                  <span style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${order.total.toFixed(2)} ج.م</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div style="padding: 0 20px 20px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #ecfdf5; border-radius: 8px; color: #059669;">
              <span style="font-size: 18px;">✓</span>
              <span style="font-weight: 600;">تم الدفع - ${paymentLabel}</span>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600;">شكراً لزيارتكم! 🙏</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;">نتمنى لكم وجبة شهية</p>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
              <p style="margin: 0; font-size: 11px; opacity: 0.8;">هذه الفاتورة صادرة إلكترونياً</p>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const printReceipt = () => {
    if (receiptContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <title>فاتورة</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Segoe UI', Tahoma, sans-serif;
                  padding: 20px;
                  background: #f5f5f5;
                  display: flex;
                  justify-content: center;
                }
                @media print {
                  body { background: white; padding: 0; }
                }
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