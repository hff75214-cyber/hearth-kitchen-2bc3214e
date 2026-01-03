import Dexie, { Table } from 'dexie';

// Types
export interface Product {
  id?: number;
  name: string;
  nameEn?: string;
  category: string;
  subcategory?: string;
  type: 'prepared' | 'stored'; // مأكولات تُحضّر أو منتجات مخزنة
  preparationTime?: number; // وقت التحضير بالدقائق (للمنتجات المحضرة)
  costPrice: number;
  salePrice: number;
  unit: string;
  quantity: number;
  minQuantityAlert: number;
  sku?: string;
  barcode?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id?: number;
  name: string;
  nameEn?: string;
  type: 'food' | 'drinks' | 'other';
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
}

export interface RestaurantTable {
  id?: number;
  name: string;
  number: number;
  chairs: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: number;
  position: { x: number; y: number };
  shape: 'square' | 'round' | 'rectangle';
  isActive: boolean;
  occupiedAt?: Date;
}

export interface Notification {
  id?: number;
  type: 'low_stock' | 'table_time' | 'new_order' | 'order_ready' | 'system' | 'raw_material_low';
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: Date;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
  notes?: string;
  preparationTime?: number; // وقت التحضير بالدقائق
  isPrepared?: boolean; // هل تم التحضير
}

export interface Order {
  id?: number;
  orderNumber: string;
  type: 'dine-in' | 'delivery' | 'takeaway';
  tableId?: number;
  tableName?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  totalCost: number;
  profit: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
  // بيانات الموظف الذي أجرى البيع
  userId?: number;
  userName?: string;
}

export interface Settings {
  id?: number;
  restaurantName: string;
  restaurantNameEn?: string;
  phone?: string;
  address?: string;
  taxRate: number;
  currency: string;
  logo?: string;
  receiptFooter?: string;
}

export interface DailySummary {
  id?: number;
  date: string;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  ordersCount: number;
  dineInCount: number;
  deliveryCount: number;
  takeawayCount: number;
  cashPayments: number;
  cardPayments: number;
  walletPayments: number;
}

// جدول العملاء
export interface Customer {
  id?: number;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// جدول المواد الخام
export interface RawMaterial {
  id?: number;
  name: string;
  unit: string; // كيلو، لتر، قطعة، إلخ
  quantity: number;
  minQuantityAlert: number;
  costPerUnit: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// جدول مكونات المنتج (ربط المنتج بالمواد الخام)
export interface ProductIngredient {
  id?: number;
  productId: number;
  rawMaterialId: number;
  quantityUsed: number; // الكمية المستخدمة من المادة الخام لكل وحدة من المنتج
}

// أنواع الأدوار المتاحة
export type UserRole = 'admin' | 'cashier' | 'kitchen' | 'waiter' | 'delivery';

// الصفحات المتاحة في النظام
export type PagePermission = 
  | 'dashboard' 
  | 'pos' 
  | 'products' 
  | 'inventory' 
  | 'materials' 
  | 'materials-report'
  | 'tables' 
  | 'tables-view' 
  | 'kitchen' 
  | 'delivery' 
  | 'customers' 
  | 'sales' 
  | 'reports' 
  | 'settings'
  | 'users'
  | 'activity-log'
  | 'shifts'
  | 'loyalty'
  | 'reservations'
  | 'expenses';

// جدول المستخدمين المحليين
export interface SystemUser {
  id?: number;
  name: string;
  password: string;
  role: UserRole;
  permissions: PagePermission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// أنواع النشاط
export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'sale' 
  | 'refund' 
  | 'product_add' 
  | 'product_edit' 
  | 'product_delete'
  | 'customer_add'
  | 'order_cancel'
  | 'shift_start'
  | 'shift_end'
  | 'settings_change'
  | 'user_add'
  | 'user_edit';

// جدول سجل النشاط
export interface ActivityLog {
  id?: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  type: ActivityType;
  description: string;
  details?: string; // JSON string for additional data
  amount?: number; // For sales
  orderId?: number;
  createdAt: Date;
}

// جدول ورديات العمل
export interface WorkShift {
  id?: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  startTime: Date;
  endTime?: Date;
  totalHours?: number;
  totalSales?: number;
  totalOrders?: number;
  notes?: string;
  isActive: boolean;
}

// برنامج ولاء العملاء
export interface LoyaltyProgram {
  id?: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  points: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: Date;
  updatedAt: Date;
}

// سجل نقاط الولاء
export interface LoyaltyTransaction {
  id?: number;
  customerId: number;
  orderId?: number;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  createdAt: Date;
}

// المكافآت
export interface LoyaltyReward {
  id?: number;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  createdAt: Date;
}

// حجوزات الطاولات
export interface TableReservation {
  id?: number;
  tableId: number;
  tableName: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  reservationDate: Date;
  reservationTime: string;
  duration: number; // بالدقائق
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// المصروفات
export interface Expense {
  id?: number;
  category: 'rent' | 'salaries' | 'utilities' | 'supplies' | 'maintenance' | 'marketing' | 'other';
  description: string;
  amount: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

// الصلاحيات الافتراضية لكل دور
export const defaultPermissionsByRole: Record<UserRole, PagePermission[]> = {
  admin: ['dashboard', 'pos', 'products', 'inventory', 'materials', 'materials-report', 'tables', 'tables-view', 'kitchen', 'delivery', 'customers', 'sales', 'reports', 'settings', 'users', 'activity-log', 'shifts', 'loyalty', 'reservations', 'expenses'],
  cashier: ['pos', 'customers', 'loyalty'],
  kitchen: ['kitchen'],
  waiter: ['pos', 'tables', 'tables-view', 'reservations'],
  delivery: ['delivery', 'customers'],
};

// أسماء الأدوار بالعربي
export const roleNames: Record<UserRole, string> = {
  admin: 'مدير',
  cashier: 'كاشير',
  kitchen: 'مطبخ',
  waiter: 'نادل',
  delivery: 'توصيل',
};

// أسماء الصفحات بالعربي
export const pageNames: Record<PagePermission, string> = {
  dashboard: 'لوحة التحكم',
  pos: 'نقطة البيع',
  products: 'المنتجات',
  inventory: 'المخزون',
  materials: 'المواد الخام',
  'materials-report': 'تقرير المواد',
  tables: 'إدارة الطاولات',
  'tables-view': 'عرض الطاولات',
  kitchen: 'شاشة المطبخ',
  delivery: 'التوصيل',
  customers: 'العملاء',
  sales: 'المبيعات',
  reports: 'التقارير',
  settings: 'الإعدادات',
  users: 'المستخدمين',
  'activity-log': 'سجل النشاط',
  shifts: 'ورديات العمل',
  loyalty: 'برنامج الولاء',
  reservations: 'الحجوزات',
  expenses: 'المصروفات',
};

// أسماء أنواع النشاط بالعربي
export const activityTypeNames: Record<ActivityType, string> = {
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  sale: 'عملية بيع',
  refund: 'استرجاع',
  product_add: 'إضافة منتج',
  product_edit: 'تعديل منتج',
  product_delete: 'حذف منتج',
  customer_add: 'إضافة عميل',
  order_cancel: 'إلغاء طلب',
  shift_start: 'بدء وردية',
  shift_end: 'إنهاء وردية',
  settings_change: 'تغيير إعدادات',
  user_add: 'إضافة مستخدم',
  user_edit: 'تعديل مستخدم',
};

// الصفحة الافتراضية لكل دور
export const defaultPageByRole: Record<UserRole, string> = {
  admin: '/',
  cashier: '/pos',
  kitchen: '/kitchen',
  waiter: '/tables-view',
  delivery: '/delivery',
};

// Database Class
class RestaurantDatabase extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  restaurantTables!: Table<RestaurantTable>;
  orders!: Table<Order>;
  settings!: Table<Settings>;
  dailySummaries!: Table<DailySummary>;
  notifications!: Table<Notification>;
  customers!: Table<Customer>;
  rawMaterials!: Table<RawMaterial>;
  productIngredients!: Table<ProductIngredient>;
  systemUsers!: Table<SystemUser>;
  activityLogs!: Table<ActivityLog>;
  workShifts!: Table<WorkShift>;
  loyaltyPrograms!: Table<LoyaltyProgram>;
  loyaltyTransactions!: Table<LoyaltyTransaction>;
  loyaltyRewards!: Table<LoyaltyReward>;
  tableReservations!: Table<TableReservation>;
  expenses!: Table<Expense>;

  constructor() {
    super('RestaurantPOS');
    
    this.version(7).stores({
      products: '++id, name, category, subcategory, type, sku, barcode, isActive',
      categories: '++id, name, type, order, isActive',
      restaurantTables: '++id, number, status, isActive',
      orders: '++id, orderNumber, type, tableId, status, createdAt, paymentMethod',
      settings: '++id',
      dailySummaries: '++id, date',
      notifications: '++id, type, isRead, createdAt',
      customers: '++id, name, phone',
      rawMaterials: '++id, name, isActive',
      productIngredients: '++id, productId, rawMaterialId',
      systemUsers: '++id, name, role, isActive',
      activityLogs: '++id, userId, type, createdAt',
      workShifts: '++id, userId, isActive, startTime',
      loyaltyPrograms: '++id, customerId, customerPhone, tier',
      loyaltyTransactions: '++id, customerId, orderId, type, createdAt',
      loyaltyRewards: '++id, name, isActive',
      tableReservations: '++id, tableId, reservationDate, status, customerPhone',
      expenses: '++id, category, date, createdAt'
    });
  }
}

// Helper function to log activity
export async function logActivity(
  user: { id: number; name: string; role: UserRole },
  type: ActivityType,
  description: string,
  details?: object,
  amount?: number,
  orderId?: number
): Promise<void> {
  await db.activityLogs.add({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    type,
    description,
    details: details ? JSON.stringify(details) : undefined,
    amount,
    orderId,
    createdAt: new Date(),
  });
}

// Helper function to start a work shift
export async function startWorkShift(user: { id: number; name: string; role: UserRole }): Promise<number> {
  // End any active shifts for this user
  const activeShift = await db.workShifts
    .where('userId')
    .equals(user.id)
    .and(s => s.isActive)
    .first();
  
  if (activeShift) {
    await endWorkShift(user.id);
  }
  
  const shiftId = await db.workShifts.add({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    startTime: new Date(),
    isActive: true,
    totalSales: 0,
    totalOrders: 0,
  });
  
  await logActivity(user, 'shift_start', `بدأ وردية عمل جديدة`);
  
  return shiftId as number;
}

// Helper function to end a work shift
export async function endWorkShift(userId: number): Promise<void> {
  const activeShift = await db.workShifts
    .where('userId')
    .equals(userId)
    .and(s => s.isActive)
    .first();
  
  if (activeShift) {
    const endTime = new Date();
    const startTime = new Date(activeShift.startTime);
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    // Calculate sales during this shift
    const shiftOrders = await db.orders
      .where('createdAt')
      .between(startTime, endTime)
      .and(o => o.status === 'completed')
      .toArray();
    
    const totalSales = shiftOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = shiftOrders.length;
    
    await db.workShifts.update(activeShift.id!, {
      endTime,
      totalHours: Math.round(totalHours * 100) / 100,
      totalSales,
      totalOrders,
      isActive: false,
    });
    
    await logActivity(
      { id: userId, name: activeShift.userName, role: activeShift.userRole },
      'shift_end',
      `أنهى وردية العمل - ${totalHours.toFixed(2)} ساعة`
    );
  }
}

// Get active shift for user
export async function getActiveShift(userId: number): Promise<WorkShift | undefined> {
  return await db.workShifts
    .where('userId')
    .equals(userId)
    .and(s => s.isActive)
    .first();
}

// Helper function to calculate product cost from ingredients
export async function calculateProductCost(productId: number): Promise<number> {
  const ingredients = await db.productIngredients
    .where('productId')
    .equals(productId)
    .toArray();
  
  let totalCost = 0;
  
  for (const ingredient of ingredients) {
    const material = await db.rawMaterials.get(ingredient.rawMaterialId);
    if (material) {
      totalCost += material.costPerUnit * ingredient.quantityUsed;
    }
  }
  
  return totalCost;
}

// Helper function to calculate cost from ingredients array (for form preview)
export async function calculateCostFromIngredients(
  ingredients: Array<{ rawMaterialId: number; quantityUsed: number }>
): Promise<number> {
  let totalCost = 0;
  
  for (const ingredient of ingredients) {
    if (ingredient.rawMaterialId && ingredient.quantityUsed > 0) {
      const material = await db.rawMaterials.get(ingredient.rawMaterialId);
      if (material) {
        totalCost += material.costPerUnit * ingredient.quantityUsed;
      }
    }
  }
  
  return totalCost;
}

// Helper function to generate SKU
export function generateSKU(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SKU-${timestamp}-${random}`;
}

// Helper function to generate Barcode
export function generateBarcode(): string {
  const prefix = '628';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
}

// Helper function to add notification
export async function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
  await db.notifications.add({
    ...notification,
    isRead: false,
    createdAt: new Date(),
  });
}

// Helper function to check table time and create notifications
export async function checkTableTimes(): Promise<void> {
  const occupiedTables = await db.restaurantTables
    .where('status')
    .equals('occupied')
    .toArray();

  for (const table of occupiedTables) {
    if (table.occupiedAt) {
      const occupiedTime = Date.now() - new Date(table.occupiedAt).getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (occupiedTime >= oneHour) {
        // Check if notification already exists
        const existingNotification = await db.notifications
          .where('type')
          .equals('table_time')
          .and(n => n.relatedId === table.id && !n.isRead)
          .first();
        
        if (!existingNotification) {
          await addNotification({
            type: 'table_time',
            title: `طاولة ${table.name} مشغولة منذ ساعة`,
            message: `الطاولة رقم ${table.number} مشغولة منذ أكثر من ساعة. هل تريد تحريرها أو تمديد الفترة؟`,
            relatedId: table.id,
          });
        }
      }
    }
  }
}

// Check low stock and create notifications
export async function checkLowStock(): Promise<void> {
  const products = await db.products
    .where('type')
    .equals('stored')
    .and(p => p.isActive && p.quantity <= p.minQuantityAlert)
    .toArray();

  for (const product of products) {
    const existingNotification = await db.notifications
      .where('type')
      .equals('low_stock')
      .and(n => n.relatedId === product.id && !n.isRead)
      .first();
    
    if (!existingNotification) {
      await addNotification({
        type: 'low_stock',
        title: `نفاد مخزون: ${product.name}`,
        message: `الكمية المتبقية: ${product.quantity} ${product.unit}. الحد الأدنى: ${product.minQuantityAlert}`,
        relatedId: product.id,
      });
    }
  }
}

// Check raw materials low stock
export async function checkRawMaterialsStock(): Promise<void> {
  const materials = await db.rawMaterials
    .filter(m => m.isActive && m.quantity <= m.minQuantityAlert)
    .toArray();

  for (const material of materials) {
    const existingNotification = await db.notifications
      .where('type')
      .equals('raw_material_low')
      .and(n => n.relatedId === material.id && !n.isRead)
      .first();
    
    if (!existingNotification) {
      await addNotification({
        type: 'raw_material_low',
        title: `نفاد مادة خام: ${material.name}`,
        message: `الكمية المتبقية: ${material.quantity} ${material.unit}. الحد الأدنى: ${material.minQuantityAlert}`,
        relatedId: material.id,
      });
    }
  }
}

// Deduct raw materials when selling a prepared product
export async function deductRawMaterials(productId: number, quantity: number): Promise<void> {
  const ingredients = await db.productIngredients
    .where('productId')
    .equals(productId)
    .toArray();

  for (const ingredient of ingredients) {
    const material = await db.rawMaterials.get(ingredient.rawMaterialId);
    if (material) {
      const newQuantity = Math.max(0, material.quantity - (ingredient.quantityUsed * quantity));
      await db.rawMaterials.update(ingredient.rawMaterialId, {
        quantity: newQuantity,
        updatedAt: new Date(),
      });
    }
  }

  // Check for low stock after deduction
  await checkRawMaterialsStock();
}

export const db = new RestaurantDatabase();

// Helper functions
export async function initializeDefaultData() {
  const categoriesCount = await db.categories.count();
  
  if (categoriesCount === 0) {
    // Add default categories
    await db.categories.bulkAdd([
      { name: 'مشروبات ساخنة', nameEn: 'Hot Drinks', type: 'drinks', order: 1, isActive: true },
      { name: 'مشروبات باردة', nameEn: 'Cold Drinks', type: 'drinks', order: 2, isActive: true },
      { name: 'عصائر طازجة', nameEn: 'Fresh Juices', type: 'drinks', order: 3, isActive: true },
      { name: 'وجبات رئيسية', nameEn: 'Main Dishes', type: 'food', order: 4, isActive: true },
      { name: 'وجبات سريعة', nameEn: 'Fast Food', type: 'food', order: 5, isActive: true },
      { name: 'مقبلات', nameEn: 'Appetizers', type: 'food', order: 6, isActive: true },
      { name: 'حلويات', nameEn: 'Desserts', type: 'food', order: 7, isActive: true },
      { name: 'سناكس', nameEn: 'Snacks', type: 'other', order: 8, isActive: true },
    ]);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      restaurantName: 'مطعمي',
      restaurantNameEn: 'My Restaurant',
      taxRate: 0,
      currency: 'ج.م',
    });
  }
}

export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const todayOrders = await db.orders
    .where('createdAt')
    .between(
      new Date(today.setHours(0, 0, 0, 0)),
      new Date(today.setHours(23, 59, 59, 999))
    )
    .count();
  
  return `ORD-${dateStr}-${String(todayOrders + 1).padStart(4, '0')}`;
}

export async function exportDatabase(): Promise<string> {
  const data = {
    products: await db.products.toArray(),
    categories: await db.categories.toArray(),
    tables: await db.restaurantTables.toArray(),
    orders: await db.orders.toArray(),
    settings: await db.settings.toArray(),
    dailySummaries: await db.dailySummaries.toArray(),
    exportDate: new Date().toISOString(),
  };
  
  return JSON.stringify(data, null, 2);
}

export async function importDatabase(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  
  await db.transaction('rw', [db.products, db.categories, db.restaurantTables, db.orders, db.settings, db.dailySummaries], async () => {
    await db.products.clear();
    await db.categories.clear();
    await db.restaurantTables.clear();
    await db.orders.clear();
    await db.settings.clear();
    await db.dailySummaries.clear();
    
    if (data.products?.length) await db.products.bulkAdd(data.products);
    if (data.categories?.length) await db.categories.bulkAdd(data.categories);
    if (data.tables?.length) await db.restaurantTables.bulkAdd(data.tables);
    if (data.orders?.length) {
      const orders = data.orders.map((o: Order) => ({
        ...o,
        createdAt: new Date(o.createdAt),
        completedAt: o.completedAt ? new Date(o.completedAt) : undefined,
      }));
      await db.orders.bulkAdd(orders);
    }
    if (data.settings?.length) await db.settings.bulkAdd(data.settings);
    if (data.dailySummaries?.length) await db.dailySummaries.bulkAdd(data.dailySummaries);
  });
}

export async function updateDailySummary(date: Date): Promise<void> {
  const dateStr = date.toISOString().split('T')[0];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const orders = await db.orders
    .where('createdAt')
    .between(startOfDay, endOfDay)
    .and(o => o.status === 'completed')
    .toArray();
  
  const summary: Omit<DailySummary, 'id'> = {
    date: dateStr,
    totalSales: orders.reduce((sum, o) => sum + o.total, 0),
    totalCost: orders.reduce((sum, o) => sum + o.totalCost, 0),
    totalProfit: orders.reduce((sum, o) => sum + o.profit, 0),
    ordersCount: orders.length,
    dineInCount: orders.filter(o => o.type === 'dine-in').length,
    deliveryCount: orders.filter(o => o.type === 'delivery').length,
    takeawayCount: orders.filter(o => o.type === 'takeaway').length,
    cashPayments: orders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0),
    cardPayments: orders.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.total, 0),
    walletPayments: orders.filter(o => o.paymentMethod === 'wallet').reduce((sum, o) => sum + o.total, 0),
  };
  
  const existing = await db.dailySummaries.where('date').equals(dateStr).first();
  if (existing) {
    await db.dailySummaries.update(existing.id!, summary);
  } else {
    await db.dailySummaries.add(summary);
  }
}