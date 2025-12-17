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
  type: 'low_stock' | 'table_time' | 'new_order' | 'order_ready' | 'system';
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

// Database Class
class RestaurantDatabase extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  restaurantTables!: Table<RestaurantTable>;
  orders!: Table<Order>;
  settings!: Table<Settings>;
  dailySummaries!: Table<DailySummary>;
  notifications!: Table<Notification>;

  constructor() {
    super('RestaurantPOS');
    
    this.version(2).stores({
      products: '++id, name, category, subcategory, type, sku, barcode, isActive',
      categories: '++id, name, type, order, isActive',
      restaurantTables: '++id, number, status, isActive',
      orders: '++id, orderNumber, type, tableId, status, createdAt, paymentMethod',
      settings: '++id',
      dailySummaries: '++id, date',
      notifications: '++id, type, isRead, createdAt'
    });
  }
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