import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users as UsersIcon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Check,
  X,
  UserCog,
} from 'lucide-react';
import { 
  db, 
  SystemUser, 
  UserRole, 
  PagePermission, 
  defaultPermissionsByRole, 
  roleNames, 
  pageNames 
} from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const allPermissions: PagePermission[] = [
  'dashboard', 'pos', 'products', 'inventory', 'materials', 'materials-report',
  'tables', 'tables-view', 'kitchen', 'delivery', 'customers', 'sales', 'reports', 'settings', 'users'
];

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  cashier: Shield,
  kitchen: Shield,
  waiter: Shield,
  delivery: Shield,
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  cashier: 'bg-info text-info-foreground',
  kitchen: 'bg-warning text-warning-foreground',
  waiter: 'bg-success text-success-foreground',
  delivery: 'bg-secondary text-secondary-foreground',
};

export default function Users() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<SystemUser>>({
    name: '',
    password: '',
    role: 'cashier',
    permissions: [],
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const usersData = await db.systemUsers.toArray();
    setUsers(usersData);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = (role: UserRole) => {
    setFormData({
      ...formData,
      role,
      permissions: [...defaultPermissionsByRole[role]],
    });
  };

  const togglePermission = (permission: PagePermission) => {
    const currentPermissions = formData.permissions || [];
    if (currentPermissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter(p => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permission],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال اسم المستخدم', variant: 'destructive' });
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 1)) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال كلمة المرور', variant: 'destructive' });
      return;
    }

    // Validate password is numeric only
    if (formData.password && !/^\d{1,10}$/.test(formData.password)) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون أرقام فقط (1-10 أرقام)', variant: 'destructive' });
      return;
    }

    try {
      if (editingUser) {
        const updateData: Partial<SystemUser> = {
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions,
          isActive: formData.isActive,
          updatedAt: new Date(),
        };
        
        // Only update password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await db.systemUsers.update(editingUser.id!, updateData);
        toast({ title: 'تم التحديث', description: 'تم تحديث المستخدم بنجاح' });
      } else {
        await db.systemUsers.add({
          ...formData as SystemUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast({ title: 'تمت الإضافة', description: 'تم إضافة المستخدم بنجاح' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ المستخدم', variant: 'destructive' });
    }
  };

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      password: '', // Don't show existing password
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    // Prevent deleting the last admin
    const admins = users.filter(u => u.role === 'admin' && u.isActive);
    const userToDelete = users.find(u => u.id === id);
    
    if (userToDelete?.role === 'admin' && admins.length <= 1) {
      toast({ title: 'خطأ', description: 'لا يمكن حذف آخر مدير في النظام', variant: 'destructive' });
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      await db.systemUsers.delete(id);
      toast({ title: 'تم الحذف', description: 'تم حذف المستخدم بنجاح' });
      loadUsers();
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      password: '',
      role: 'cashier',
      permissions: [...defaultPermissionsByRole.cashier],
      isActive: true,
    });
  };

  const handlePasswordChange = (value: string) => {
    const filtered = value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData({ ...formData, password: filtered });
  };

  const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">
            إضافة وتعديل المستخدمين وصلاحياتهم
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <ShieldCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المستخدمين النشطين</p>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <UserCog className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المديرين</p>
                <p className="text-2xl font-bold text-foreground">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن مستخدم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredUsers.map((user, index) => {
            const RoleIcon = roleIcons[user.role] || Shield;
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`glass shadow-card hover:shadow-glow transition-all duration-300 ${!user.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${roleColors[user.role]}`}>
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{user.name}</h3>
                          <Badge variant="outline" className="mt-1">
                            {roleNames[user.role]}
                          </Badge>
                        </div>
                      </div>
                      {!user.isActive && (
                        <Badge variant="destructive">غير نشط</Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">الصلاحيات:</p>
                      <div className="flex flex-wrap gap-1">
                        {(user.permissions || []).slice(0, 4).map(perm => (
                          <span key={perm} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {pageNames[perm]}
                          </span>
                        ))}
                        {(user.permissions || []).length > 4 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            +{(user.permissions || []).length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border hover:bg-secondary"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(user.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا يوجد مستخدمين</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-foreground">اسم المستخدم *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border"
                placeholder="الاسم الثلاثي"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">
                كلمة المرور {editingUser ? '(اتركها فارغة للإبقاء على القديمة)' : '*'}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="bg-secondary border-border pr-10"
                  placeholder="أرقام فقط (1-10)"
                  inputMode="numeric"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">الدور *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => handleRoleChange(value)}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleNames) as UserRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleNames[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-foreground">الصلاحيات</Label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-secondary/50 border border-border max-h-60 overflow-y-auto">
                {allPermissions.map((permission) => (
                  <div key={permission} className="flex items-center gap-2">
                    <Checkbox
                      id={permission}
                      checked={(formData.permissions || []).includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                    />
                    <label
                      htmlFor={permission}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {pageNames[permission]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label className="text-foreground">المستخدم نشط</Label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-border"
              >
                إلغاء
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                <Check className="w-4 h-4 ml-2" />
                {editingUser ? 'حفظ التغييرات' : 'إضافة المستخدم'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
