import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Star,
  Calendar,
  Truck,
} from 'lucide-react';
import { db, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Customer {
  name: string;
  phone: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder: Date;
  avgOrderValue: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const orders = await db.orders.toArray();
    
    // Group orders by customer (using phone as unique identifier)
    const customerMap = new Map<string, Customer>();
    
    orders.forEach((order) => {
      if (order.customerPhone) {
        const key = order.customerPhone;
        const existing = customerMap.get(key);
        
        if (existing) {
          existing.ordersCount += 1;
          existing.totalSpent += order.total;
          existing.avgOrderValue = existing.totalSpent / existing.ordersCount;
          if (new Date(order.createdAt) > new Date(existing.lastOrder)) {
            existing.lastOrder = order.createdAt;
            existing.address = order.customerAddress || existing.address;
            existing.name = order.customerName || existing.name;
          }
        } else {
          customerMap.set(key, {
            name: order.customerName || 'غير معروف',
            phone: order.customerPhone,
            address: order.customerAddress || '',
            ordersCount: 1,
            totalSpent: order.total,
            lastOrder: order.createdAt,
            avgOrderValue: order.total,
          });
        }
      }
    });
    
    const customerList = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);
    
    setCustomers(customerList);
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.address.toLowerCase().includes(query)
    );
  });

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.ordersCount, 0);
  const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 5000) return { label: 'ذهبي', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' };
    if (totalSpent >= 2000) return { label: 'فضي', color: 'bg-slate-400/20 text-slate-500 border-slate-400/30' };
    if (totalSpent >= 500) return { label: 'برونزي', color: 'bg-orange-500/20 text-orange-600 border-orange-500/30' };
    return { label: 'جديد', color: 'bg-info/20 text-info border-info/30' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            العملاء
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة بيانات العملاء
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-success">{totalRevenue.toFixed(0)} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/20">
                <ShoppingBag className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <Star className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط قيمة العميل</p>
                <p className="text-2xl font-bold text-foreground">{avgCustomerValue.toFixed(0)} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الهاتف أو العنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="glass shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">العميل</TableHead>
                <TableHead className="text-right text-muted-foreground">الهاتف</TableHead>
                <TableHead className="text-right text-muted-foreground">العنوان</TableHead>
                <TableHead className="text-right text-muted-foreground">الطلبات</TableHead>
                <TableHead className="text-right text-muted-foreground">إجمالي الإنفاق</TableHead>
                <TableHead className="text-right text-muted-foreground">المستوى</TableHead>
                <TableHead className="text-right text-muted-foreground">آخر طلب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredCustomers.map((customer, index) => {
                  const tier = getCustomerTier(customer.totalSpent);
                  return (
                    <motion.tr
                      key={customer.phone}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-border"
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <span>{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.address && (
                          <div className="flex items-center gap-2 text-muted-foreground max-w-48 truncate">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            {customer.address}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{customer.ordersCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-success">
                        {customer.totalSpent.toFixed(2)} ج.م
                      </TableCell>
                      <TableCell>
                        <Badge className={tier.color}>
                          {tier.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(customer.lastOrder).toLocaleDateString('ar-EG')}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا يوجد عملاء</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                سيظهر العملاء هنا بعد طلبات التوصيل
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
