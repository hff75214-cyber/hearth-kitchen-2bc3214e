import { db, generateSKU, generateBarcode, addNotification } from './database';

// دالة لإضافة البيانات التجريبية
export async function seedDemoData() {
  // التحقق من عدم وجود بيانات مسبقة
  const productsCount = await db.products.count();
  if (productsCount > 0) return; // لا تضف بيانات إذا كانت موجودة

  const now = new Date();
  
  // إضافة المنتجات التجريبية
  const products = [
    // مشروبات ساخنة
    { name: 'شاي', nameEn: 'Tea', category: 'مشروبات ساخنة', type: 'prepared' as const, costPrice: 3, salePrice: 15, unit: 'كوب', quantity: 100, minQuantityAlert: 20, preparationTime: 3, isActive: true },
    { name: 'قهوة تركي', nameEn: 'Turkish Coffee', category: 'مشروبات ساخنة', type: 'prepared' as const, costPrice: 5, salePrice: 20, unit: 'فنجان', quantity: 100, minQuantityAlert: 20, preparationTime: 5, isActive: true },
    { name: 'نسكافيه', nameEn: 'Nescafe', category: 'مشروبات ساخنة', type: 'prepared' as const, costPrice: 4, salePrice: 18, unit: 'كوب', quantity: 100, minQuantityAlert: 20, preparationTime: 3, isActive: true },
    { name: 'كابتشينو', nameEn: 'Cappuccino', category: 'مشروبات ساخنة', type: 'prepared' as const, costPrice: 8, salePrice: 35, unit: 'كوب', quantity: 100, minQuantityAlert: 20, preparationTime: 5, isActive: true },
    
    // مشروبات باردة
    { name: 'عصير برتقال', nameEn: 'Orange Juice', category: 'عصائر طازجة', type: 'prepared' as const, costPrice: 10, salePrice: 30, unit: 'كوب', quantity: 50, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    { name: 'عصير مانجو', nameEn: 'Mango Juice', category: 'عصائر طازجة', type: 'prepared' as const, costPrice: 12, salePrice: 35, unit: 'كوب', quantity: 50, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    { name: 'ميلك شيك شوكولاتة', nameEn: 'Chocolate Milkshake', category: 'مشروبات باردة', type: 'prepared' as const, costPrice: 15, salePrice: 45, unit: 'كوب', quantity: 50, minQuantityAlert: 10, preparationTime: 7, isActive: true },
    { name: 'موهيتو', nameEn: 'Mojito', category: 'مشروبات باردة', type: 'prepared' as const, costPrice: 10, salePrice: 35, unit: 'كوب', quantity: 50, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    
    // وجبات رئيسية
    { name: 'كباب مشوي', nameEn: 'Grilled Kebab', category: 'وجبات رئيسية', type: 'prepared' as const, costPrice: 50, salePrice: 120, unit: 'طبق', quantity: 30, minQuantityAlert: 5, preparationTime: 25, isActive: true },
    { name: 'فراخ مشوية', nameEn: 'Grilled Chicken', category: 'وجبات رئيسية', type: 'prepared' as const, costPrice: 45, salePrice: 100, unit: 'طبق', quantity: 25, minQuantityAlert: 5, preparationTime: 30, isActive: true },
    { name: 'سمك مشوي', nameEn: 'Grilled Fish', category: 'وجبات رئيسية', type: 'prepared' as const, costPrice: 60, salePrice: 140, unit: 'طبق', quantity: 20, minQuantityAlert: 5, preparationTime: 25, isActive: true },
    { name: 'كفتة', nameEn: 'Kofta', category: 'وجبات رئيسية', type: 'prepared' as const, costPrice: 40, salePrice: 95, unit: 'طبق', quantity: 30, minQuantityAlert: 5, preparationTime: 20, isActive: true },
    { name: 'فتة شاورما', nameEn: 'Shawarma Fatta', category: 'وجبات رئيسية', type: 'prepared' as const, costPrice: 55, salePrice: 110, unit: 'طبق', quantity: 25, minQuantityAlert: 5, preparationTime: 20, isActive: true },
    
    // وجبات سريعة
    { name: 'برجر لحم', nameEn: 'Beef Burger', category: 'وجبات سريعة', type: 'prepared' as const, costPrice: 25, salePrice: 65, unit: 'ساندويتش', quantity: 40, minQuantityAlert: 10, preparationTime: 12, isActive: true },
    { name: 'برجر دجاج', nameEn: 'Chicken Burger', category: 'وجبات سريعة', type: 'prepared' as const, costPrice: 20, salePrice: 55, unit: 'ساندويتش', quantity: 40, minQuantityAlert: 10, preparationTime: 10, isActive: true },
    { name: 'شاورما لحم', nameEn: 'Beef Shawarma', category: 'وجبات سريعة', type: 'prepared' as const, costPrice: 18, salePrice: 50, unit: 'ساندويتش', quantity: 50, minQuantityAlert: 15, preparationTime: 8, isActive: true },
    { name: 'شاورما فراخ', nameEn: 'Chicken Shawarma', category: 'وجبات سريعة', type: 'prepared' as const, costPrice: 15, salePrice: 45, unit: 'ساندويتش', quantity: 50, minQuantityAlert: 15, preparationTime: 8, isActive: true },
    { name: 'بيتزا مارجريتا', nameEn: 'Margherita Pizza', category: 'وجبات سريعة', type: 'prepared' as const, costPrice: 30, salePrice: 80, unit: 'قطعة', quantity: 30, minQuantityAlert: 10, preparationTime: 20, isActive: true },
    { name: 'بيتزا بالخضار', nameEn: 'Veggie Pizza', category: 'وجبات سريعة', type: 'prepared' as const, costPrice: 35, salePrice: 90, unit: 'قطعة', quantity: 30, minQuantityAlert: 10, preparationTime: 20, isActive: true },
    
    // مقبلات
    { name: 'سلطة خضراء', nameEn: 'Green Salad', category: 'مقبلات', type: 'prepared' as const, costPrice: 8, salePrice: 25, unit: 'طبق', quantity: 50, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    { name: 'حمص', nameEn: 'Hummus', category: 'مقبلات', type: 'prepared' as const, costPrice: 10, salePrice: 30, unit: 'طبق', quantity: 40, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    { name: 'بابا غنوج', nameEn: 'Baba Ghanoush', category: 'مقبلات', type: 'prepared' as const, costPrice: 12, salePrice: 35, unit: 'طبق', quantity: 40, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    { name: 'فول', nameEn: 'Fava Beans', category: 'مقبلات', type: 'prepared' as const, costPrice: 6, salePrice: 20, unit: 'طبق', quantity: 50, minQuantityAlert: 15, preparationTime: 5, isActive: true },
    
    // حلويات
    { name: 'كنافة', nameEn: 'Kunafa', category: 'حلويات', type: 'prepared' as const, costPrice: 15, salePrice: 45, unit: 'قطعة', quantity: 30, minQuantityAlert: 5, preparationTime: 10, isActive: true },
    { name: 'بسبوسة', nameEn: 'Basbousa', category: 'حلويات', type: 'prepared' as const, costPrice: 8, salePrice: 25, unit: 'قطعة', quantity: 30, minQuantityAlert: 10, preparationTime: 5, isActive: true },
    { name: 'أم علي', nameEn: 'Om Ali', category: 'حلويات', type: 'prepared' as const, costPrice: 12, salePrice: 35, unit: 'طبق', quantity: 25, minQuantityAlert: 5, preparationTime: 15, isActive: true },
    { name: 'آيس كريم', nameEn: 'Ice Cream', category: 'حلويات', type: 'stored' as const, costPrice: 8, salePrice: 25, unit: 'طبق', quantity: 40, minQuantityAlert: 10, isActive: true },
    
    // سناكس
    { name: 'بطاطس مقلية', nameEn: 'French Fries', category: 'سناكس', type: 'prepared' as const, costPrice: 10, salePrice: 30, unit: 'طبق', quantity: 50, minQuantityAlert: 15, preparationTime: 10, isActive: true },
    { name: 'ناجتس دجاج', nameEn: 'Chicken Nuggets', category: 'سناكس', type: 'prepared' as const, costPrice: 15, salePrice: 40, unit: 'طبق', quantity: 40, minQuantityAlert: 10, preparationTime: 12, isActive: true },
    { name: 'أصابع الموزاريلا', nameEn: 'Mozzarella Sticks', category: 'سناكس', type: 'prepared' as const, costPrice: 18, salePrice: 50, unit: 'طبق', quantity: 35, minQuantityAlert: 10, preparationTime: 8, isActive: true },
  ];

  for (const product of products) {
    await db.products.add({
      ...product,
      sku: generateSKU(),
      barcode: generateBarcode(),
      createdAt: now,
      updatedAt: now,
    });
  }

  // إضافة الطاولات
  const tables = [
    { name: 'طاولة 1', number: 1, chairs: 4, status: 'available' as const, position: { x: 50, y: 50 }, shape: 'square' as const, isActive: true },
    { name: 'طاولة 2', number: 2, chairs: 4, status: 'available' as const, position: { x: 200, y: 50 }, shape: 'square' as const, isActive: true },
    { name: 'طاولة 3', number: 3, chairs: 6, status: 'available' as const, position: { x: 350, y: 50 }, shape: 'rectangle' as const, isActive: true },
    { name: 'طاولة 4', number: 4, chairs: 2, status: 'available' as const, position: { x: 50, y: 200 }, shape: 'round' as const, isActive: true },
    { name: 'طاولة 5', number: 5, chairs: 4, status: 'available' as const, position: { x: 200, y: 200 }, shape: 'square' as const, isActive: true },
    { name: 'طاولة 6', number: 6, chairs: 8, status: 'available' as const, position: { x: 350, y: 200 }, shape: 'rectangle' as const, isActive: true },
    { name: 'طاولة 7', number: 7, chairs: 4, status: 'available' as const, position: { x: 50, y: 350 }, shape: 'square' as const, isActive: true },
    { name: 'طاولة 8', number: 8, chairs: 6, status: 'available' as const, position: { x: 200, y: 350 }, shape: 'rectangle' as const, isActive: true },
  ];

  for (const table of tables) {
    await db.restaurantTables.add(table);
  }

  // إضافة المواد الخام
  const rawMaterials = [
    { name: 'لحم بقري', unit: 'كيلو', quantity: 50, minQuantityAlert: 10, costPerUnit: 250, isActive: true },
    { name: 'لحم دجاج', unit: 'كيلو', quantity: 80, minQuantityAlert: 15, costPerUnit: 80, isActive: true },
    { name: 'سمك', unit: 'كيلو', quantity: 30, minQuantityAlert: 10, costPerUnit: 120, isActive: true },
    { name: 'أرز', unit: 'كيلو', quantity: 100, minQuantityAlert: 20, costPerUnit: 30, isActive: true },
    { name: 'زيت طبخ', unit: 'لتر', quantity: 40, minQuantityAlert: 10, costPerUnit: 50, isActive: true },
    { name: 'بصل', unit: 'كيلو', quantity: 50, minQuantityAlert: 15, costPerUnit: 15, isActive: true },
    { name: 'ثوم', unit: 'كيلو', quantity: 10, minQuantityAlert: 3, costPerUnit: 60, isActive: true },
    { name: 'طماطم', unit: 'كيلو', quantity: 40, minQuantityAlert: 10, costPerUnit: 20, isActive: true },
    { name: 'خيار', unit: 'كيلو', quantity: 30, minQuantityAlert: 10, costPerUnit: 15, isActive: true },
    { name: 'خس', unit: 'كيلو', quantity: 20, minQuantityAlert: 5, costPerUnit: 25, isActive: true },
    { name: 'جبنة موزاريلا', unit: 'كيلو', quantity: 25, minQuantityAlert: 5, costPerUnit: 180, isActive: true },
    { name: 'خبز برجر', unit: 'قطعة', quantity: 100, minQuantityAlert: 30, costPerUnit: 3, isActive: true },
    { name: 'عجينة بيتزا', unit: 'قطعة', quantity: 50, minQuantityAlert: 15, costPerUnit: 8, isActive: true },
    { name: 'شاي', unit: 'كيلو', quantity: 5, minQuantityAlert: 1, costPerUnit: 150, isActive: true },
    { name: 'قهوة', unit: 'كيلو', quantity: 5, minQuantityAlert: 1, costPerUnit: 200, isActive: true },
    { name: 'سكر', unit: 'كيلو', quantity: 30, minQuantityAlert: 10, costPerUnit: 25, isActive: true },
    { name: 'حليب', unit: 'لتر', quantity: 50, minQuantityAlert: 15, costPerUnit: 35, isActive: true },
    { name: 'برتقال', unit: 'كيلو', quantity: 40, minQuantityAlert: 10, costPerUnit: 25, isActive: true },
    { name: 'مانجو', unit: 'كيلو', quantity: 25, minQuantityAlert: 8, costPerUnit: 45, isActive: true },
    { name: 'بطاطس', unit: 'كيلو', quantity: 60, minQuantityAlert: 15, costPerUnit: 12, isActive: true },
  ];

  for (const material of rawMaterials) {
    await db.rawMaterials.add({
      ...material,
      createdAt: now,
      updatedAt: now,
    });
  }

  // إضافة العملاء
  const customers = [
    { name: 'أحمد محمد', phone: '01012345678', address: 'شارع التحرير، القاهرة' },
    { name: 'محمود علي', phone: '01123456789', address: 'شارع الهرم، الجيزة' },
    { name: 'سارة أحمد', phone: '01234567890', address: 'المعادي، القاهرة' },
    { name: 'فاطمة حسن', phone: '01098765432', address: 'مدينة نصر، القاهرة' },
    { name: 'خالد إبراهيم', phone: '01111111111', address: 'الدقي، الجيزة' },
    { name: 'نورا سعيد', phone: '01222222222', address: 'الزمالك، القاهرة' },
    { name: 'يوسف أمين', phone: '01555555555', address: 'العباسية، القاهرة' },
    { name: 'مريم طارق', phone: '01066666666', address: 'شبرا، القاهرة' },
  ];

  for (const customer of customers) {
    await db.customers.add({
      ...customer,
      createdAt: now,
      updatedAt: now,
    });
  }

  // إضافة مكافآت الولاء
  const loyaltyRewards = [
    { name: 'خصم 10%', description: 'خصم 10% على الطلب التالي', pointsCost: 100, isActive: true },
    { name: 'مشروب مجاني', description: 'مشروب ساخن مجاني', pointsCost: 50, isActive: true },
    { name: 'حلوى مجانية', description: 'قطعة حلوى مجانية', pointsCost: 75, isActive: true },
    { name: 'خصم 25%', description: 'خصم 25% على الطلب التالي', pointsCost: 200, isActive: true },
    { name: 'وجبة مجانية', description: 'وجبة رئيسية مجانية', pointsCost: 500, isActive: true },
  ];

  for (const reward of loyaltyRewards) {
    await db.loyaltyRewards.add({
      ...reward,
      createdAt: now,
    });
  }

  // إضافة العروض
  const offers = [
    { 
      name: 'عرض الافتتاح', 
      description: 'خصم 20% على جميع الطلبات', 
      discountType: 'percentage' as const, 
      discountValue: 20, 
      applicableProducts: 'all' as const, 
      startDate: new Date(), 
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      isActive: true, 
      usageLimit: 100, 
      usageCount: 15 
    },
    { 
      name: 'خصم الغداء', 
      description: 'خصم 15 جنيه على الوجبات الرئيسية', 
      discountType: 'fixed' as const, 
      discountValue: 15, 
      minOrderAmount: 100,
      applicableProducts: 'all' as const, 
      startDate: new Date(), 
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 
      isActive: true, 
      usageCount: 8 
    },
  ];

  for (const offer of offers) {
    await db.offers.add({
      ...offer,
      createdAt: now,
    });
  }

  // إضافة حجوزات تجريبية
  const reservations = [
    {
      tableId: 3,
      tableName: 'طاولة 3',
      customerName: 'أحمد محمد',
      customerPhone: '01012345678',
      guestCount: 5,
      reservationDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // بعد ساعتين
      reservationTime: '19:00',
      duration: 120,
      status: 'confirmed' as const,
      notes: 'حفلة عيد ميلاد',
    },
    {
      tableId: 6,
      tableName: 'طاولة 6',
      customerName: 'خالد إبراهيم',
      customerPhone: '01111111111',
      guestCount: 7,
      reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // غداً
      reservationTime: '20:00',
      duration: 180,
      status: 'pending' as const,
      notes: 'اجتماع عمل',
    },
  ];

  for (const reservation of reservations) {
    await db.tableReservations.add({
      ...reservation,
      createdAt: now,
      updatedAt: now,
    });
  }

  // إضافة بعض المصروفات
  const expenses = [
    { category: 'rent' as const, description: 'إيجار المحل - يناير', amount: 15000, date: new Date() },
    { category: 'utilities' as const, description: 'فاتورة الكهرباء', amount: 2500, date: new Date() },
    { category: 'supplies' as const, description: 'أدوات مطبخ', amount: 800, date: new Date() },
    { category: 'salaries' as const, description: 'رواتب الموظفين', amount: 25000, date: new Date() },
    { category: 'maintenance' as const, description: 'صيانة التكييف', amount: 500, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  ];

  for (const expense of expenses) {
    await db.expenses.add({
      ...expense,
      createdAt: now,
    });
  }

  // إضافة بعض الطلبات التجريبية للتقارير
  const allProducts = await db.products.toArray();
  const orderTypes: ('dine-in' | 'takeaway' | 'delivery')[] = ['dine-in', 'takeaway', 'delivery'];
  const paymentMethods: ('cash' | 'card' | 'wallet')[] = ['cash', 'card', 'wallet'];

  // إنشاء طلبات للأيام السبعة الماضية
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const orderDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    const ordersPerDay = Math.floor(Math.random() * 10) + 5; // 5-15 طلب يومياً

    for (let i = 0; i < ordersPerDay; i++) {
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // اختيار 2-5 منتجات عشوائية
      const itemCount = Math.floor(Math.random() * 4) + 2;
      const selectedProducts = [];
      for (let j = 0; j < itemCount; j++) {
        const product = allProducts[Math.floor(Math.random() * allProducts.length)];
        selectedProducts.push(product);
      }

      const items = selectedProducts.map(p => ({
        productId: p.id!,
        productName: p.name,
        quantity: Math.floor(Math.random() * 3) + 1,
        unitPrice: p.salePrice,
        costPrice: p.costPrice,
        discount: 0,
        total: p.salePrice * (Math.floor(Math.random() * 3) + 1),
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

      const orderHour = Math.floor(Math.random() * 12) + 10; // 10 صباحاً - 10 مساءً
      orderDate.setHours(orderHour, Math.floor(Math.random() * 60));

      await db.orders.add({
        orderNumber: `ORD-${orderDate.toISOString().split('T')[0].replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
        type: orderType,
        tableId: orderType === 'dine-in' ? Math.floor(Math.random() * 8) + 1 : undefined,
        tableName: orderType === 'dine-in' ? `طاولة ${Math.floor(Math.random() * 8) + 1}` : undefined,
        items,
        subtotal,
        discount: 0,
        discountType: 'fixed',
        total: subtotal,
        totalCost,
        profit: subtotal - totalCost,
        paymentMethod,
        status: 'completed',
        customerName: orderType === 'delivery' ? customers[Math.floor(Math.random() * customers.length)].name : undefined,
        customerPhone: orderType === 'delivery' ? customers[Math.floor(Math.random() * customers.length)].phone : undefined,
        createdAt: new Date(orderDate),
        completedAt: new Date(orderDate),
        userId: 1,
        userName: 'المدير',
      });
    }
  }

  // إضافة إشعار ترحيبي
  await addNotification({
    type: 'system',
    title: 'مرحباً بك في نظام إدارة المطعم!',
    message: 'تم تحميل البيانات التجريبية بنجاح. يمكنك البدء في استخدام النظام الآن.',
  });

  console.log('✅ تم إضافة البيانات التجريبية بنجاح');
}
