import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  FileText,
  Eye,
  Printer,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  X,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { db, Order, logActivity, UserRole, Settings } from '@/lib/database';
import { printThermalReceipt } from '@/lib/thermalPrint';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Sales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadSettings();
  }, [dateFilter]);

  const loadSettings = async () => {
    const settingsData = await db.settings.toArray();
    if (settingsData.length > 0) {
      setSettings(settingsData[0]);
    }
  };

  const loadData = async () => {
    let query = db.orders.orderBy('createdAt').reverse();
    
    const now = new Date();
    let startDate: Date | null = null;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    let ordersData: Order[];
    if (startDate) {
      ordersData = await db.orders
        .where('createdAt')
        .aboveOrEqual(startDate)
        .reverse()
        .toArray();
    } else {
      ordersData = await query.toArray();
    }

    setOrders(ordersData);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery);
    const matchesType = filterType === 'all' || order.type === filterType;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const completedOrders = filteredOrders.filter(o => o.status === 'completed');
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalProfit = completedOrders.reduce((sum, o) => sum + o.profit, 0);

  const getTypeLabel = (type: Order['type']) => {
    switch (type) {
      case 'dine-in': return 'طاولة';
      case 'delivery': return 'توصيل';
      case 'takeaway': return 'استلام';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'preparing': return 'قيد التحضير';
      case 'ready': return 'جاهز';
      case 'delivered': return 'تم التوصيل';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'preparing': return 'bg-info/20 text-info';
      case 'ready': return 'bg-primary/20 text-primary';
      case 'delivered': return 'bg-success/20 text-success';
      case 'completed': return 'bg-success/20 text-success';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
    }
  };

  const printReceipt = (order: Order) => {
    printThermalReceipt(order, settings || undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المبيعات</h1>
          <p className="text-muted-foreground mt-1">
            سجل جميع المبيعات والطلبات
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/20">
                <DollarSign className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-foreground">{totalSales.toFixed(0)} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأرباح</p>
                <p className="text-2xl font-bold text-foreground">{totalProfit.toFixed(0)} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الطلب أو اسم العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary border-border"
              />
            </div>
            
            <div className="flex gap-2">
              {(['today', 'week', 'month', 'all'] as const).map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={dateFilter === filter ? 'default' : 'outline'}
                  onClick={() => setDateFilter(filter)}
                  className={dateFilter === filter ? 'gradient-primary text-primary-foreground' : 'border-border'}
                >
                  {filter === 'today' ? 'اليوم' :
                   filter === 'week' ? 'الأسبوع' :
                   filter === 'month' ? 'الشهر' : 'الكل'}
                </Button>
              ))}
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-secondary border-border">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="dine-in">طاولة</SelectItem>
                <SelectItem value="delivery">توصيل</SelectItem>
                <SelectItem value="takeaway">استلام</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-secondary border-border">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="glass shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">رقم الطلب</TableHead>
                <TableHead className="text-right text-muted-foreground">التاريخ</TableHead>
                <TableHead className="text-right text-muted-foreground">النوع</TableHead>
                <TableHead className="text-right text-muted-foreground">العميل</TableHead>
                <TableHead className="text-right text-muted-foreground">المجموع</TableHead>
                <TableHead className="text-right text-muted-foreground">الربح</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="font-mono font-medium text-foreground">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div>
                      <p>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      <p className="text-xs">{new Date(order.createdAt).toLocaleTimeString('ar-EG')}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.type === 'dine-in' ? 'bg-primary/20 text-primary' :
                      order.type === 'delivery' ? 'bg-info/20 text-info' :
                      'bg-success/20 text-success'
                    }`}>
                      {getTypeLabel(order.type)}
                      {order.tableName && ` - ${order.tableName}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.customerName || '-'}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {order.total.toFixed(2)} ج.م
                  </TableCell>
                  <TableCell className="text-success font-semibold">
                    {order.profit.toFixed(2)} ج.م
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-border"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-border"
                        onClick={() => printReceipt(order)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              تفاصيل الطلب {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الوقت</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString('ar-EG')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">النوع</p>
                  <p className="font-medium text-foreground">
                    {getTypeLabel(selectedOrder.type)}
                    {selectedOrder.tableName && ` - ${selectedOrder.tableName}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                  <p className="font-medium text-foreground">
                    {selectedOrder.paymentMethod === 'cash' ? 'نقدي' :
                     selectedOrder.paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}
                  </p>
                </div>
              </div>

              {selectedOrder.customerName && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-2">بيانات العميل</p>
                  <p className="text-foreground">{selectedOrder.customerName}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                  )}
                  {selectedOrder.customerAddress && (
                    <p className="text-muted-foreground">{selectedOrder.customerAddress}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <p className="font-semibold text-foreground">المنتجات</p>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {item.unitPrice.toFixed(2)} ج.م
                      </p>
                    </div>
                    <p className="font-bold text-foreground">{item.total.toFixed(2)} ج.م</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-secondary/50">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع</span>
                  <span>{selectedOrder.subtotal.toFixed(2)} ج.م</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>الخصم</span>
                    <span>-{selectedOrder.discount.toFixed(2)} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="text-primary">{selectedOrder.total.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-success text-sm">
                  <span>الربح</span>
                  <span>{selectedOrder.profit.toFixed(2)} ج.م</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 border-border"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => printReceipt(selectedOrder)}
                  className="flex-1 gradient-primary text-primary-foreground"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>

              {/* Cancel/Refund Buttons - Only show for non-cancelled orders */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="flex gap-3 pt-2 border-t border-border">
                  {selectedOrder.status !== 'completed' && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!selectedOrder.id) return;
                        try {
                          await db.orders.update(selectedOrder.id, { status: 'cancelled' });
                          const currentUserData = localStorage.getItem('currentUserData');
                          if (currentUserData) {
                            const user = JSON.parse(currentUserData);
                            await logActivity(
                              { id: user.id, name: user.name, role: user.role as UserRole },
                              'order_cancel',
                              `إلغاء طلب #${selectedOrder.orderNumber}`,
                              { orderId: selectedOrder.id, orderNumber: selectedOrder.orderNumber, total: selectedOrder.total },
                              selectedOrder.total,
                              selectedOrder.id
                            );
                          }
                          toast({ title: 'تم إلغاء الطلب', description: `تم إلغاء الطلب #${selectedOrder.orderNumber}` });
                          loadData();
                          setSelectedOrder(null);
                        } catch (error) {
                          toast({ title: 'خطأ', description: 'حدث خطأ أثناء إلغاء الطلب', variant: 'destructive' });
                        }
                      }}
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      إلغاء الطلب
                    </Button>
                  )}
                  {selectedOrder.status === 'completed' && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!selectedOrder.id) return;
                        try {
                          await db.orders.update(selectedOrder.id, { status: 'cancelled' });
                          const currentUserData = localStorage.getItem('currentUserData');
                          if (currentUserData) {
                            const user = JSON.parse(currentUserData);
                            await logActivity(
                              { id: user.id, name: user.name, role: user.role as UserRole },
                              'refund',
                              `استرجاع طلب #${selectedOrder.orderNumber}`,
                              { orderId: selectedOrder.id, orderNumber: selectedOrder.orderNumber, total: selectedOrder.total },
                              selectedOrder.total,
                              selectedOrder.id
                            );
                          }
                          toast({ title: 'تم الاسترجاع', description: `تم استرجاع الطلب #${selectedOrder.orderNumber} بقيمة ${selectedOrder.total.toFixed(2)} ج.م` });
                          loadData();
                          setSelectedOrder(null);
                        } catch (error) {
                          toast({ title: 'خطأ', description: 'حدث خطأ أثناء الاسترجاع', variant: 'destructive' });
                        }
                      }}
                      className="flex-1 border-warning text-warning hover:bg-warning hover:text-warning-foreground"
                    >
                      <RotateCcw className="w-4 h-4 ml-2" />
                      استرجاع
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}