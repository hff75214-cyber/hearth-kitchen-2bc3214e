import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { db, SystemUser, SalesGoal, Order } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface GoalWithProgress extends SalesGoal {
  currentAmount: number;
  progressPercent: number;
  userName: string;
}

export default function SalesGoals() {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SalesGoal | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    userId: 0,
    targetAmount: 0,
    period: 'daily' as 'daily' | 'weekly' | 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    bonus: 0,
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsData, usersData, ordersData] = await Promise.all([
        db.salesGoals.toArray(),
        db.systemUsers.where('isActive').equals(1).toArray(),
        db.orders.where('status').equals('completed').toArray(),
      ]);

      // Calculate progress for each goal
      const goalsWithProgress = goalsData.map(goal => {
        const user = usersData.find(u => u.id === goal.userId);
        const currentAmount = calculateGoalProgress(goal, ordersData);
        const progressPercent = Math.min((currentAmount / goal.targetAmount) * 100, 100);

        return {
          ...goal,
          currentAmount,
          progressPercent,
          userName: user?.name || 'غير معروف',
        };
      });

      setGoals(goalsWithProgress.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setUsers(usersData.filter(u => u.role !== 'kitchen'));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const calculateGoalProgress = (goal: SalesGoal, allOrders: Order[]): number => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (goal.period) {
      case 'daily':
        startDate = startOfDay(new Date(goal.startDate));
        endDate = endOfDay(new Date(goal.startDate));
        break;
      case 'weekly':
        startDate = startOfWeek(new Date(goal.startDate), { weekStartsOn: 0 });
        endDate = endOfWeek(new Date(goal.startDate), { weekStartsOn: 0 });
        break;
      case 'monthly':
        startDate = startOfMonth(new Date(goal.startDate));
        endDate = endOfMonth(new Date(goal.startDate));
        break;
      default:
        startDate = startOfDay(new Date(goal.startDate));
        endDate = endOfDay(now);
    }

    return allOrders
      .filter(order => 
        order.userId === goal.userId &&
        isWithinInterval(new Date(order.createdAt), { start: startDate, end: endDate })
      )
      .reduce((sum, order) => sum + order.total, 0);
  };

  const getGoalStatus = (goal: GoalWithProgress) => {
    const now = new Date();
    const startDate = new Date(goal.startDate);
    let endDate: Date;

    switch (goal.period) {
      case 'daily':
        endDate = endOfDay(startDate);
        break;
      case 'weekly':
        endDate = endOfWeek(startDate, { weekStartsOn: 0 });
        break;
      case 'monthly':
        endDate = endOfMonth(startDate);
        break;
      default:
        endDate = endOfDay(now);
    }

    if (goal.progressPercent >= 100) return 'achieved';
    if (now > endDate) return 'failed';
    return 'in_progress';
  };

  const resetForm = () => {
    setFormData({
      userId: 0,
      targetAmount: 0,
      period: 'daily',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      bonus: 0,
      description: '',
    });
    setEditingGoal(null);
  };

  const handleEdit = (goal: SalesGoal) => {
    setEditingGoal(goal);
    setFormData({
      userId: goal.userId,
      targetAmount: goal.targetAmount,
      period: goal.period,
      startDate: format(new Date(goal.startDate), 'yyyy-MM-dd'),
      bonus: goal.bonus || 0,
      description: goal.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.userId) {
      toast({ title: 'يرجى اختيار موظف', variant: 'destructive' });
      return;
    }

    if (formData.targetAmount <= 0) {
      toast({ title: 'يرجى إدخال هدف صحيح', variant: 'destructive' });
      return;
    }

    try {
      const goalData: SalesGoal = {
        userId: formData.userId,
        targetAmount: formData.targetAmount,
        period: formData.period,
        startDate: new Date(formData.startDate),
        bonus: formData.bonus || undefined,
        description: formData.description || undefined,
        isAchieved: false,
        createdAt: editingGoal?.createdAt || new Date(),
      };

      if (editingGoal?.id) {
        await db.salesGoals.update(editingGoal.id, goalData);
        toast({ title: 'تم تحديث الهدف بنجاح' });
      } else {
        await db.salesGoals.add(goalData);
        toast({ title: 'تم إضافة الهدف بنجاح' });
      }

      await loadData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({ title: 'حدث خطأ أثناء حفظ الهدف', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الهدف؟')) return;

    try {
      await db.salesGoals.delete(id);
      toast({ title: 'تم حذف الهدف بنجاح' });
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({ title: 'حدث خطأ أثناء حذف الهدف', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return <Badge className="bg-success/20 text-success border-success/30">محقق</Badge>;
      case 'failed':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">لم يتحقق</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning/20 text-warning border-warning/30">جاري</Badge>;
      default:
        return null;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      default: return period;
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'hsl(var(--success))';
    if (percent >= 75) return 'hsl(var(--primary))';
    if (percent >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  // Stats
  const activeGoals = goals.filter(g => getGoalStatus(g) === 'in_progress').length;
  const achievedGoals = goals.filter(g => getGoalStatus(g) === 'achieved').length;
  const failedGoals = goals.filter(g => getGoalStatus(g) === 'failed').length;
  const avgProgress = goals.length > 0 
    ? goals.reduce((sum, g) => sum + g.progressPercent, 0) / goals.length 
    : 0;

  // Chart data - group by user
  const chartData = users.map(user => {
    const userGoals = goals.filter(g => g.userId === user.id);
    const avgUserProgress = userGoals.length > 0
      ? userGoals.reduce((sum, g) => sum + g.progressPercent, 0) / userGoals.length
      : 0;
    return {
      name: user.name,
      progress: Math.round(avgUserProgress),
    };
  }).filter(d => d.progress > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">أهداف المبيعات</h1>
          <p className="text-muted-foreground mt-1">إدارة أهداف المبيعات للموظفين وتتبع التقدم</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة هدف جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أهداف جارية</p>
                <p className="text-2xl font-bold text-warning">{activeGoals}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أهداف محققة</p>
                <p className="text-2xl font-bold text-success">{achievedGoals}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">لم تتحقق</p>
                <p className="text-2xl font-bold text-destructive">{failedGoals}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط التقدم</p>
                <p className="text-2xl font-bold text-primary">{avgProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              متوسط تقدم الموظفين نحو الأهداف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'التقدم']}
                />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getProgressColor(entry.progress)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => {
            const status = getGoalStatus(goal);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`glass shadow-card overflow-hidden ${status === 'failed' ? 'opacity-60' : ''}`}>
                  <div className={`h-1 ${status === 'achieved' ? 'bg-success' : status === 'in_progress' ? 'bg-warning' : 'bg-muted'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.userName}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(status)}
                            <Badge variant="outline">{getPeriodLabel(goal.period)}</Badge>
                          </div>
                        </div>
                      </div>
                      {status === 'achieved' && (
                        <Award className="w-6 h-6 text-warning" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">التقدم</span>
                        <span className="font-bold" style={{ color: getProgressColor(goal.progressPercent) }}>
                          {goal.progressPercent.toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={goal.progressPercent} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{goal.currentAmount.toFixed(2)} ج.م</span>
                        <span>{goal.targetAmount.toFixed(2)} ج.م</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(goal.startDate), 'dd/MM/yyyy', { locale: ar })}
                      </span>
                    </div>

                    {goal.bonus && goal.bonus > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-warning" />
                        <span className="text-muted-foreground">مكافأة:</span>
                        <span className="font-bold text-warning">{goal.bonus} ج.م</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(goal)}
                      >
                        <Pencil className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(goal.id!)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد أهداف مبيعات</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="w-4 h-4 ml-2" />
              إضافة هدف جديد
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? 'تعديل الهدف' : 'إضافة هدف جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الموظف</Label>
              <Select
                value={formData.userId.toString()}
                onValueChange={(value) => setFormData({ ...formData, userId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر موظف" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id!.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الهدف (ج.م)</Label>
              <Input
                type="number"
                value={formData.targetAmount || ''}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <Label>الفترة</Label>
              <Select
                value={formData.period}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFormData({ ...formData, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاريخ البدء</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>المكافأة (اختياري)</Label>
              <Input
                type="number"
                value={formData.bonus || ''}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                min="0"
                placeholder="مكافأة عند تحقيق الهدف"
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف إضافي للهدف"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit}>
              {editingGoal ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
