import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';
import { db, SystemUser, defaultPermissionsByRole, defaultPageByRole, roleNames } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { VirtualKeyboard, KeyboardToggle } from '@/components/VirtualKeyboard';
import { toast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (user: SystemUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState<'name' | 'password' | null>(null);
  const [restaurantName, setRestaurantName] = useState('مطعمي');
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    loadSettings();
    checkFirstTimeSetup();
  }, []);

  const loadSettings = async () => {
    const settings = await db.settings.toCollection().first();
    if (settings?.restaurantName) {
      setRestaurantName(settings.restaurantName);
    }
  };

  const checkFirstTimeSetup = async () => {
    try {
      const count = await db.systemUsers.count();
      setIsFirstTime(count === 0);
    } catch {
      setIsFirstTime(true);
    }
  };

  const handleKeyPress = (key: string) => {
    if (activeInput === 'name') {
      setName(prev => prev + key);
    } else if (activeInput === 'password') {
      if (/^[0-9]$/.test(key)) {
        if (password.length < 10) {
          setPassword(prev => prev + key);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (activeInput === 'name') {
      setName(prev => prev.slice(0, -1));
    } else if (activeInput === 'password') {
      setPassword(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال الاسم',
        variant: 'destructive',
      });
      return;
    }

    if (!password || password.length < 1 || password.length > 10) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال كلمة مرور صحيحة (من 1 إلى 10 أرقام)',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFirstTime) {
        // First time - create admin user
        const newUser: SystemUser = {
          name: name.trim(),
          password: password,
          role: 'admin',
          permissions: [...defaultPermissionsByRole.admin],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const id = await db.systemUsers.add(newUser);
        newUser.id = id as number;
        
        toast({
          title: 'مرحباً بك!',
          description: 'تم إنشاء حساب المدير بنجاح',
        });
        
        onLogin(newUser);
      } else {
        // Check credentials
        // Get all users and find matching one (case-insensitive, trimmed)
        const allUsers = await db.systemUsers.toArray();
        const user = allUsers.find(u => 
          u.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
        
        if (user && user.password === password) {
          if (!user.isActive) {
            toast({
              title: 'خطأ',
              description: 'هذا الحساب غير نشط. تواصل مع المدير.',
              variant: 'destructive',
            });
            return;
          }
          
          toast({
            title: 'مرحباً بك!',
            description: `أهلاً ${user.name} (${roleNames[user.role]})`,
          });
          onLogin(user);
        } else {
          toast({
            title: 'خطأ',
            description: 'الاسم أو كلمة المرور غير صحيحة',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    const filtered = value.replace(/[^0-9]/g, '').slice(0, 10);
    setPassword(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-info/5 rounded-full blur-[120px]" />
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass shadow-card border-border/50 overflow-hidden">
          <CardContent className="p-8">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {restaurantName}
              </h1>
              <p className="text-muted-foreground">
                {isFirstTime ? 'إنشاء حساب المدير' : 'تسجيل الدخول للنظام'}
              </p>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-foreground">الاسم الثلاثي</Label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setActiveInput('name')}
                      className="pr-10 h-12 bg-secondary border-border text-lg"
                      placeholder="أدخل اسمك الثلاثي"
                      autoComplete="off"
                    />
                  </div>
                  <KeyboardToggle onClick={() => {
                    setActiveInput('name');
                    setShowKeyboard(!showKeyboard);
                  }} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <Label className="text-foreground">كلمة المرور (1-10 أرقام فقط)</Label>
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      onFocus={() => setActiveInput('password')}
                      className="pr-10 pl-10 h-12 bg-secondary border-border text-lg tracking-widest"
                      placeholder="• • • •"
                      autoComplete="off"
                      inputMode="numeric"
                      maxLength={10}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <KeyboardToggle onClick={() => {
                    setActiveInput('password');
                    setShowKeyboard(!showKeyboard);
                  }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  أرقام فقط من 0 إلى 9 (بحد أقصى 10 أرقام)
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 gradient-primary text-primary-foreground text-lg font-semibold shadow-glow"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 ml-2" />
                      {isFirstTime ? 'إنشاء حساب المدير' : 'تسجيل الدخول'}
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-muted-foreground mt-6"
            >
              {isFirstTime 
                ? 'سيتم إنشاء حساب مدير بجميع الصلاحيات'
                : 'نظام نقاط البيع المحلي - جميع البيانات مخزنة على جهازك'
              }
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isOpen={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={() => {
          setShowKeyboard(false);
        }}
      />
    </div>
  );
}
