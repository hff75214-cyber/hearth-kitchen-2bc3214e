import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Users as UsersIcon, Shield, ShieldCheck,
  Eye, EyeOff, Check, X, UserCog,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface StaffMember {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  restaurant_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

type UserRole = 'admin' | 'cashier' | 'kitchen' | 'waiter' | 'delivery';

const roleNames: Record<string, string> = {
  admin: 'مدير',
  cashier: 'كاشير',
  kitchen: 'مطبخ',
  waiter: 'ويتر',
  delivery: 'توصيل',
};

const pageNames: Record<string, string> = {
  dashboard: 'لوحة التحكم', pos: 'نقطة البيع', products: 'المنتجات',
  inventory: 'المخزون', materials: 'المواد الخام', 'materials-report': 'تقرير المواد',
  tables: 'الطاولات', 'tables-view': 'عرض الطاولات', kitchen: 'المطبخ',
  delivery: 'التوصيل', customers: 'العملاء', sales: 'المبيعات',
  reports: 'التقارير', settings: 'الإعدادات', users: 'المستخدمين',
};

const defaultPermissions: Record<string, string[]> = {
  admin: Object.keys(pageNames),
  cashier: ['pos', 'products', 'customers'],
  kitchen: ['kitchen'],
  waiter: ['pos', 'tables', 'tables-view'],
  delivery: ['delivery'],
};

const allPermissions = Object.keys(pageNames);

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck, cashier: Shield, kitchen: Shield, waiter: Shield, delivery: Shield,
};

const roleColors: Record<string, string> = {
  admin: 'bg-primary text-primary-foreground',
  cashier: 'bg-info text-info-foreground',
  kitchen: 'bg-warning text-warning-foreground',
  waiter: 'bg-success text-success-foreground',
  delivery: 'bg-secondary text-secondary-foreground',
};

export default function Users() {
  const { restaurantId } = useRestaurant();
  const [users, setUsers] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', username: '', password: '', role: 'cashier' as UserRole,
    permissions: [...defaultPermissions.cashier], isActive: true,
  });

  useEffect(() => { if (restaurantId) loadUsers(); }, [restaurantId]);

  const loadUsers = async () => {
    if (!restaurantId) return;
    const { data } = await supabase.from('staff_members').select('*').eq('restaurant_id', restaurantId);
    setUsers(data || []);
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleRoleChange = (role: UserRole) => {
    setFormData({ ...formData, role, permissions: [...(defaultPermissions[role] || [])] });
  };

  const togglePermission = (perm: string) => {
    const perms = formData.permissions;
    setFormData({
      ...formData,
      permissions: perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    if (!formData.name?.trim() || !formData.username?.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال الاسم واسم المستخدم', variant: 'destructive' });
      return;
    }
    if (!editingUser && !formData.password) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال كلمة المرور', variant: 'destructive' });
      return;
    }

    try {
      if (editingUser) {
        const updateData: any = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          role: formData.role,
          permissions: formData.permissions,
          is_active: formData.isActive,
        };
        if (formData.password) updateData.password_hash = formData.password;
        
        const { error } = await supabase.from('staff_members').update(updateData).eq('id', editingUser.id);
        if (error) throw error;
        toast({ title: 'تم التحديث', description: 'تم تحديث المستخدم بنجاح' });
      } else {
        const { error } = await supabase.from('staff_members').insert({
          restaurant_id: restaurantId,
          name: formData.name.trim(),
          username: formData.username.trim(),
          password_hash: formData.password,
          role: formData.role,
          permissions: formData.permissions,
          is_active: formData.isActive,
        });
        if (error) throw error;
        toast({ title: 'تمت الإضافة', description: 'تم إضافة المستخدم بنجاح' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message || 'حدث خطأ', variant: 'destructive' });
    }
  };

  const handleEdit = (user: StaffMember) => {
    setEditingUser(user);
    setFormData({
      name: user.name, username: user.username, password: '',
      role: user.role as UserRole, permissions: user.permissions || [],
      isActive: user.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const admins = users.filter(u => u.role === 'admin' && u.is_active);
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin' && admins.length <= 1) {
      toast({ title: 'خطأ', description: 'لا يمكن حذف آخر مدير', variant: 'destructive' });
      return;
    }
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await supabase.from('staff_members').delete().eq('id', id);
      toast({ title: 'تم الحذف', description: 'تم حذف المستخدم بنجاح' });
      loadUsers();
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({ name: '', username: '', password: '', role: 'cashier', permissions: [...defaultPermissions.cashier], isActive: true });
  };

  const adminCount = users.filter(u => u.role === 'admin' && u.is_active).length;
  const activeCount = users.filter(u => u.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">إضافة وتعديل المستخدمين وصلاحياتهم</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4 ml-2" /> إضافة مستخدم
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass shadow-card"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-primary/10"><UsersIcon className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">إجمالي المستخدمين</p><p className="text-2xl font-bold text-foreground">{users.length}</p></div></div></CardContent></Card>
        <Card className="glass shadow-card"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-success/10"><ShieldCheck className="w-6 h-6 text-success" /></div><div><p className="text-sm text-muted-foreground">المستخدمين النشطين</p><p className="text-2xl font-bold text-foreground">{activeCount}</p></div></div></CardContent></Card>
        <Card className="glass shadow-card"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-3 rounded-xl bg-warning/10"><UserCog className="w-6 h-6 text-warning" /></div><div><p className="text-sm text-muted-foreground">المديرين</p><p className="text-2xl font-bold text-foreground">{adminCount}</p></div></div></CardContent></Card>
      </div>

      <Card className="glass shadow-card"><CardContent className="p-4"><div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="بحث عن مستخدم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 bg-secondary border-border" /></div></CardContent></Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredUsers.map((user, index) => {
            const RoleIcon = roleIcons[user.role] || Shield;
            return (
              <motion.div key={user.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.05 }}>
                <Card className={`glass shadow-card hover:shadow-glow transition-all duration-300 ${!user.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${roleColors[user.role] || 'bg-secondary text-secondary-foreground'}`}><RoleIcon className="w-5 h-5" /></div>
                        <div>
                          <h3 className="font-bold text-foreground">{user.name}</h3>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                          <Badge variant="outline" className="mt-1">{roleNames[user.role] || user.role}</Badge>
                        </div>
                      </div>
                      {!user.is_active && <Badge variant="destructive">غير نشط</Badge>}
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">الصلاحيات:</p>
                      <div className="flex flex-wrap gap-1">
                        {(user.permissions || []).slice(0, 4).map(perm => (
                          <span key={perm} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{pageNames[perm] || perm}</span>
                        ))}
                        {(user.permissions || []).length > 4 && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{(user.permissions || []).length - 4}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-border hover:bg-secondary" onClick={() => handleEdit(user)}><Edit className="w-4 h-4 ml-1" /> تعديل</Button>
                      <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16"><UsersIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">لا يوجد مستخدمين</p></div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-foreground">الاسم الكامل *</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-secondary border-border" placeholder="الاسم الثلاثي" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">اسم المستخدم *</Label>
              <Input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="bg-secondary border-border" placeholder="اسم الدخول" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">كلمة المرور {editingUser ? '(اتركها فارغة للإبقاء على القديمة)' : '*'}</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-secondary border-border pr-10" placeholder="كلمة المرور" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">الدور *</Label>
              <Select value={formData.role} onValueChange={(v: UserRole) => handleRoleChange(v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(roleNames).map(([key, name]) => <SelectItem key={key} value={key}>{name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-foreground">الصلاحيات</Label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-secondary/50 border border-border max-h-60 overflow-y-auto">
                {allPermissions.map(perm => (
                  <div key={perm} className="flex items-center gap-2">
                    <Checkbox id={perm} checked={formData.permissions.includes(perm)} onCheckedChange={() => togglePermission(perm)} />
                    <label htmlFor={perm} className="text-sm text-foreground cursor-pointer">{pageNames[perm]}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
              <Label className="text-foreground">المستخدم نشط</Label>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-border">إلغاء</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground"><Check className="w-4 h-4 ml-2" /> {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
