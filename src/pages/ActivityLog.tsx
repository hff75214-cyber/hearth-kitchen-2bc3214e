import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  Filter,
  User,
  ShoppingCart,
  LogIn,
  LogOut,
  Package,
  Users,
  Settings,
  XCircle,
  Clock,
  Download,
  Calendar,
} from 'lucide-react';
import { 
  db, 
  ActivityLog, 
  ActivityType,
  activityTypeNames,
  roleNames,
} from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  logout: LogOut,
  sale: ShoppingCart,
  refund: XCircle,
  product_add: Package,
  product_edit: Package,
  product_delete: Package,
  customer_add: Users,
  order_cancel: XCircle,
  shift_start: Clock,
  shift_end: Clock,
  settings_change: Settings,
  user_add: User,
  user_edit: User,
};

const activityColors: Record<ActivityType, string> = {
  login: 'bg-success/10 text-success',
  logout: 'bg-muted text-muted-foreground',
  sale: 'bg-primary/10 text-primary',
  refund: 'bg-destructive/10 text-destructive',
  product_add: 'bg-info/10 text-info',
  product_edit: 'bg-warning/10 text-warning',
  product_delete: 'bg-destructive/10 text-destructive',
  customer_add: 'bg-info/10 text-info',
  order_cancel: 'bg-destructive/10 text-destructive',
  shift_start: 'bg-success/10 text-success',
  shift_end: 'bg-warning/10 text-warning',
  settings_change: 'bg-secondary text-secondary-foreground',
  user_add: 'bg-info/10 text-info',
  user_edit: 'bg-warning/10 text-warning',
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [filterDate]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      let startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      if (filterDate === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (filterDate === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      const allLogs = await db.activityLogs
        .where('createdAt')
        .aboveOrEqual(startDate)
        .reverse()
        .toArray();
      
      setLogs(allLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const exportLogs = () => {
    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سجل النشاط</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 5px; }
          .header p { color: #666; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
          th { background: #f59e0b; color: white; padding: 12px; text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #f9f9f9; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
          .sale { background: #fef3c7; color: #92400e; }
          .login { background: #d1fae5; color: #065f46; }
          .logout { background: #f3f4f6; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 سجل النشاط</h1>
          <p>تاريخ التصدير: ${format(new Date(), 'PPpp', { locale: ar })}</p>
          <p>عدد السجلات: ${filteredLogs.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>التاريخ والوقت</th>
              <th>المستخدم</th>
              <th>الدور</th>
              <th>النوع</th>
              <th>الوصف</th>
              <th>المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => `
              <tr>
                <td>${format(new Date(log.createdAt), 'yyyy/MM/dd HH:mm', { locale: ar })}</td>
                <td>${log.userName}</td>
                <td>${roleNames[log.userRole]}</td>
                <td><span class="badge ${log.type}">${activityTypeNames[log.type]}</span></td>
                <td>${log.description}</td>
                <td>${log.amount ? log.amount.toFixed(2) + ' ج.م' : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const todaySales = logs
    .filter(l => l.type === 'sale' && l.amount)
    .reduce((sum, l) => sum + (l.amount || 0), 0);
  
  const todayLogins = logs.filter(l => l.type === 'login').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">سجل النشاط</h1>
          <p className="text-muted-foreground mt-1">
            متابعة جميع العمليات والنشاطات في النظام
          </p>
        </div>
        <Button
          onClick={exportLogs}
          variant="outline"
          className="border-border"
        >
          <Download className="w-4 h-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي النشاطات</p>
                <p className="text-2xl font-bold text-foreground">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <ShoppingCart className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عمليات البيع</p>
                <p className="text-2xl font-bold text-foreground">
                  {logs.filter(l => l.type === 'sale').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <LogIn className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تسجيلات الدخول</p>
                <p className="text-2xl font-bold text-foreground">{todayLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/10">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-foreground">{todaySales.toFixed(2)} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary border-border"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="نوع النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {(Object.keys(activityTypeNames) as ActivityType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {activityTypeNames[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            سجل النشاطات ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد نشاطات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {filteredLogs.map((log, index) => {
                  const Icon = activityIcons[log.type] || Activity;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 border border-border/50"
                    >
                      <div className={`p-2 rounded-xl ${activityColors[log.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{log.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {roleNames[log.userRole]}
                          </Badge>
                          <Badge className={`text-xs ${activityColors[log.type]}`}>
                            {activityTypeNames[log.type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {log.description}
                        </p>
                      </div>
                      <div className="text-left">
                        {log.amount && (
                          <p className="font-bold text-primary">{log.amount.toFixed(2)} ج.م</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), 'HH:mm', { locale: ar })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), 'yyyy/MM/dd', { locale: ar })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
