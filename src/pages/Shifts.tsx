import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Play,
  Square,
  User,
  Calendar,
  DollarSign,
  ShoppingCart,
  Download,
  Timer,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';
import { 
  db, 
  WorkShift, 
  SystemUser,
  roleNames,
  startWorkShift,
  endWorkShift,
  getActiveShift,
  logActivity,
} from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { format, differenceInMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface UserShiftSummary {
  userId: number;
  userName: string;
  userRole: string;
  totalShifts: number;
  totalHours: number;
  totalSales: number;
  totalOrders: number;
  avgHoursPerShift: number;
  avgSalesPerShift: number;
}

const COLORS = ['hsl(35, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(199, 89%, 48%)', 'hsl(280, 65%, 60%)', 'hsl(340, 82%, 59%)'];

export default function Shifts() {
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [activeShifts, setActiveShifts] = useState<WorkShift[]>([]);
  const [filterDate, setFilterDate] = useState<string>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [myActiveShift, setMyActiveShift] = useState<WorkShift | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserShiftSummary[]>([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    loadData();
    // Get current user from localStorage
    const userData = localStorage.getItem('currentUserData');
    if (userData) {
      const user = JSON.parse(userData) as SystemUser;
      setCurrentUser(user);
      loadMyShift(user.id!);
    }
  }, [filterDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [shiftsData, usersData] = await Promise.all([
        loadShifts(),
        db.systemUsers.filter(u => u.isActive).toArray(),
      ]);
      
      setShifts(shiftsData);
      setUsers(usersData);
      setActiveShifts(shiftsData.filter(s => s.isActive));
      
      // Calculate user summaries
      calculateUserSummaries(shiftsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShifts = async () => {
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (filterDate === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (filterDate === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    return await db.workShifts
      .where('startTime')
      .aboveOrEqual(startDate)
      .reverse()
      .toArray();
  };

  const calculateUserSummaries = (shiftsData: WorkShift[]) => {
    const summaryMap = new Map<number, UserShiftSummary>();
    
    shiftsData.forEach(shift => {
      const existing = summaryMap.get(shift.userId) || {
        userId: shift.userId,
        userName: shift.userName,
        userRole: roleNames[shift.userRole],
        totalShifts: 0,
        totalHours: 0,
        totalSales: 0,
        totalOrders: 0,
        avgHoursPerShift: 0,
        avgSalesPerShift: 0,
      };
      
      existing.totalShifts += 1;
      existing.totalHours += shift.totalHours || 0;
      existing.totalSales += shift.totalSales || 0;
      existing.totalOrders += shift.totalOrders || 0;
      
      summaryMap.set(shift.userId, existing);
    });
    
    const summaries = Array.from(summaryMap.values()).map(s => ({
      ...s,
      avgHoursPerShift: s.totalShifts > 0 ? s.totalHours / s.totalShifts : 0,
      avgSalesPerShift: s.totalShifts > 0 ? s.totalSales / s.totalShifts : 0,
    })).sort((a, b) => b.totalSales - a.totalSales);
    
    setUserSummaries(summaries);
  };

  const loadMyShift = async (userId: number) => {
    const shift = await getActiveShift(userId);
    setMyActiveShift(shift || null);
  };

  const handleStartShift = async () => {
    if (!currentUser) return;
    
    try {
      await startWorkShift({
        id: currentUser.id!,
        name: currentUser.name,
        role: currentUser.role,
      });
      
      toast({
        title: 'تم بدء الوردية',
        description: 'تم تسجيل بدء وردية العمل بنجاح',
      });
      
      loadData();
      loadMyShift(currentUser.id!);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء بدء الوردية',
        variant: 'destructive',
      });
    }
  };

  const handleEndShift = async () => {
    if (!currentUser) return;
    
    try {
      await endWorkShift(currentUser.id!);
      
      toast({
        title: 'تم إنهاء الوردية',
        description: 'تم تسجيل إنهاء وردية العمل بنجاح',
      });
      
      loadData();
      setMyActiveShift(null);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنهاء الوردية',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (shift: WorkShift) => {
    if (shift.totalHours) {
      const hours = Math.floor(shift.totalHours);
      const minutes = Math.round((shift.totalHours - hours) * 60);
      return `${hours} س ${minutes} د`;
    }
    if (shift.isActive) {
      const minutes = differenceInMinutes(new Date(), new Date(shift.startTime));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} س ${mins} د (جارية)`;
    }
    return '-';
  };

  const exportShifts = () => {
    const content = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير ورديات العمل</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 5px; }
          .stats { display: flex; gap: 20px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap; }
          .stat { background: white; padding: 15px 25px; border-radius: 8px; text-align: center; min-width: 150px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .stat-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
          th { background: #f59e0b; color: white; padding: 12px; text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #f9f9f9; }
          .active { background: #d1fae5; }
          .section-title { background: #333; color: white; padding: 10px 15px; margin: 20px 0 10px; border-radius: 4px; }
          .user-summary { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
          .user-name { font-weight: bold; font-size: 18px; color: #333; }
          .user-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
          .user-stat { text-align: center; padding: 10px; background: #f9f9f9; border-radius: 4px; }
          .user-stat-value { font-size: 18px; font-weight: bold; color: #f59e0b; }
          .user-stat-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ تقرير ورديات العمل المفصّل</h1>
          <p>تاريخ التصدير: ${format(new Date(), 'PPpp', { locale: ar })}</p>
          <p>الفترة: ${filterDate === 'today' ? 'اليوم' : filterDate === 'week' ? 'آخر أسبوع' : 'آخر شهر'}</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${shifts.length}</div>
            <div class="stat-label">إجمالي الورديات</div>
          </div>
          <div class="stat">
            <div class="stat-value">${userSummaries.length}</div>
            <div class="stat-label">عدد الموظفين</div>
          </div>
          <div class="stat">
            <div class="stat-value">${shifts.reduce((sum, s) => sum + (s.totalHours || 0), 0).toFixed(1)} س</div>
            <div class="stat-label">إجمالي الساعات</div>
          </div>
          <div class="stat">
            <div class="stat-value">${shifts.reduce((sum, s) => sum + (s.totalOrders || 0), 0)}</div>
            <div class="stat-label">إجمالي الطلبات</div>
          </div>
          <div class="stat">
            <div class="stat-value">${shifts.reduce((sum, s) => sum + (s.totalSales || 0), 0).toFixed(2)} ج.م</div>
            <div class="stat-label">إجمالي المبيعات</div>
          </div>
        </div>
        
        <h2 class="section-title">📊 ملخص أداء الموظفين</h2>
        ${userSummaries.map(user => `
          <div class="user-summary">
            <div class="user-name">${user.userName} - ${user.userRole}</div>
            <div class="user-stats">
              <div class="user-stat">
                <div class="user-stat-value">${user.totalShifts}</div>
                <div class="user-stat-label">الورديات</div>
              </div>
              <div class="user-stat">
                <div class="user-stat-value">${user.totalHours.toFixed(1)} س</div>
                <div class="user-stat-label">إجمالي الساعات</div>
              </div>
              <div class="user-stat">
                <div class="user-stat-value">${user.totalOrders}</div>
                <div class="user-stat-label">الطلبات</div>
              </div>
              <div class="user-stat">
                <div class="user-stat-value">${user.totalSales.toFixed(2)} ج.م</div>
                <div class="user-stat-label">المبيعات</div>
              </div>
            </div>
          </div>
        `).join('')}
        
        <h2 class="section-title">📋 تفاصيل الورديات</h2>
        <table>
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الدور</th>
              <th>البداية</th>
              <th>النهاية</th>
              <th>المدة</th>
              <th>الطلبات</th>
              <th>المبيعات</th>
            </tr>
          </thead>
          <tbody>
            ${shifts.map(shift => `
              <tr class="${shift.isActive ? 'active' : ''}">
                <td>${shift.userName}</td>
                <td>${roleNames[shift.userRole]}</td>
                <td>${format(new Date(shift.startTime), 'yyyy/MM/dd HH:mm')}</td>
                <td>${shift.endTime ? format(new Date(shift.endTime), 'yyyy/MM/dd HH:mm') : 'جارية'}</td>
                <td>${formatDuration(shift)}</td>
                <td>${shift.totalOrders || 0}</td>
                <td>${(shift.totalSales || 0).toFixed(2)} ج.م</td>
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
    a.download = `shifts-report-${format(new Date(), 'yyyy-MM-dd')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير التقرير بنجاح',
    });
  };

  const totalHours = shifts.reduce((sum, s) => sum + (s.totalHours || 0), 0);
  const totalSales = shifts.reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const totalOrders = shifts.reduce((sum, s) => sum + (s.totalOrders || 0), 0);

  // Chart data
  const salesByUserData = userSummaries.map(u => ({
    name: u.userName,
    sales: u.totalSales,
    hours: u.totalHours,
  }));

  const hoursDistributionData = userSummaries.map(u => ({
    name: u.userName,
    value: u.totalHours,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ورديات العمل</h1>
          <p className="text-muted-foreground mt-1">
            تسجيل دخول وخروج الموظفين وحساب ساعات العمل
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {myActiveShift ? (
            <Button
              onClick={handleEndShift}
              variant="destructive"
              className="shadow-lg"
            >
              <Square className="w-4 h-4 ml-2" />
              إنهاء الوردية
            </Button>
          ) : (
            <Button
              onClick={handleStartShift}
              className="gradient-primary text-primary-foreground shadow-glow"
            >
              <Play className="w-4 h-4 ml-2" />
              بدء الوردية
            </Button>
          )}
          <Button
            onClick={() => setShowReport(!showReport)}
            variant={showReport ? 'default' : 'outline'}
            className={showReport ? 'gradient-primary text-primary-foreground' : 'border-border'}
          >
            <BarChart3 className="w-4 h-4 ml-2" />
            {showReport ? 'إخفاء التقرير' : 'عرض التقرير'}
          </Button>
          <Button
            onClick={exportShifts}
            variant="outline"
            className="border-border"
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* My Current Shift */}
      {myActiveShift && (
        <Card className="glass shadow-card border-success/50 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/10 animate-pulse">
                  <Timer className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-bold text-foreground">ورديتك الحالية</p>
                  <p className="text-sm text-muted-foreground">
                    بدأت في {format(new Date(myActiveShift.startTime), 'HH:mm', { locale: ar })}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-success">
                  {formatDuration(myActiveShift)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الورديات</p>
                <p className="text-2xl font-bold text-foreground">{shifts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-info/10">
                <Users className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الموظفين</p>
                <p className="text-2xl font-bold text-foreground">{userSummaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <Timer className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الساعات</p>
                <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)} س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <ShoppingCart className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-foreground">{totalSales.toFixed(2)} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Section */}
      <AnimatePresence>
        {showReport && userSummaries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales by User Chart */}
              <Card className="glass shadow-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    المبيعات حسب الموظف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByUserData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                        <XAxis type="number" stroke="hsl(220, 10%, 60%)" />
                        <YAxis type="category" dataKey="name" stroke="hsl(220, 10%, 60%)" width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(220, 18%, 13%)',
                            border: '1px solid hsl(220, 15%, 22%)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(2)} ج.م`, 'المبيعات']}
                        />
                        <Bar dataKey="sales" fill="hsl(35, 95%, 55%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Distribution Pie Chart */}
              <Card className="glass shadow-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Timer className="w-5 h-5 text-success" />
                    توزيع ساعات العمل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={hoursDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {hoursDistributionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(220, 18%, 13%)',
                            border: '1px solid hsl(220, 15%, 22%)',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)} ساعة`, 'الساعات']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap mt-2">
                    {hoursDistributionData.slice(0, 5).map((item, index) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Summaries Table */}
            <Card className="glass shadow-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  ملخص أداء الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">الموظف</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">الدور</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">الورديات</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">إجمالي الساعات</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">متوسط ساعات/وردية</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">الطلبات</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">إجمالي المبيعات</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">متوسط مبيعات/وردية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userSummaries.map((user, index) => (
                        <motion.tr
                          key={user.userId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                index === 2 ? 'bg-orange-500/20 text-orange-500' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium text-foreground">{user.userName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{user.userRole}</Badge>
                          </td>
                          <td className="py-3 px-4 text-foreground">{user.totalShifts}</td>
                          <td className="py-3 px-4 text-foreground">{user.totalHours.toFixed(1)} س</td>
                          <td className="py-3 px-4 text-muted-foreground">{user.avgHoursPerShift.toFixed(1)} س</td>
                          <td className="py-3 px-4 text-foreground">{user.totalOrders}</td>
                          <td className="py-3 px-4 font-bold text-primary">{user.totalSales.toFixed(2)} ج.م</td>
                          <td className="py-3 px-4 text-muted-foreground">{user.avgSalesPerShift.toFixed(2)} ج.م</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Shifts */}
      {activeShifts.length > 0 && (
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
              الورديات النشطة ({activeShifts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="p-3 rounded-xl bg-success/10 border border-success/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/20">
                      <User className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{shift.userName}</p>
                      <p className="text-xs text-muted-foreground">{roleNames[shift.userRole]}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-success">{formatDuration(shift)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-48 bg-secondary border-border">
                <Calendar className="w-4 h-4 ml-2" />
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

      {/* Shifts List */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            سجل الورديات ({shifts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد ورديات مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">الموظف</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">الدور</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">البداية</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">النهاية</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">المدة</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">الطلبات</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">المبيعات</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {shifts.map((shift, index) => (
                      <motion.tr
                        key={shift.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`border-b border-border/50 ${shift.isActive ? 'bg-success/5' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{shift.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{roleNames[shift.userRole]}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {format(new Date(shift.startTime), 'yyyy/MM/dd HH:mm')}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {shift.endTime 
                            ? format(new Date(shift.endTime), 'yyyy/MM/dd HH:mm')
                            : <Badge variant="default" className="bg-success">جارية</Badge>
                          }
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {formatDuration(shift)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {shift.totalOrders || 0}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary">
                          {(shift.totalSales || 0).toFixed(2)} ج.م
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
