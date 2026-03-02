import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2, User, Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    if (isSignUp && !fullName.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال الاسم الكامل', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, restaurantName || 'مطعمي');
        if (error) {
          toast({ title: 'خطأ في إنشاء الحساب', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'مرحباً بك! 🎉', description: 'تم إنشاء حسابك ومطعمك بنجاح' });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'خطأ في تسجيل الدخول', description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', variant: 'destructive' });
        } else {
          toast({ title: 'مرحباً بك!', description: 'تم تسجيل الدخول بنجاح' });
        }
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass shadow-card border-border/50 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'أنشئ حساب مطعمك وابدأ الآن' : 'ادخل إلى نظام إدارة مطعمك'}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                    <Label>الاسم الكامل *</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pr-10 h-11 bg-secondary" placeholder="محمد أحمد" />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                    <Label>اسم المطعم</Label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="pr-10 h-11 bg-secondary" placeholder="مطعمي (اختياري)" />
                    </div>
                  </motion.div>
                </>
              )}

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10 h-11 bg-secondary" placeholder="email@example.com" dir="ltr" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                <Label>كلمة المرور *</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 h-11 bg-secondary"
                    placeholder="••••••"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">6 أحرف على الأقل</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Button type="submit" disabled={isLoading} className="w-full h-12 gradient-primary text-primary-foreground text-lg font-semibold shadow-glow">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSignUp ? (
                    <><UserPlus className="w-5 h-5 ml-2" />إنشاء الحساب</>
                  ) : (
                    <><LogIn className="w-5 h-5 ml-2" />تسجيل الدخول</>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center mt-6">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setEmail(''); setPassword(''); setFullName(''); setRestaurantName(''); }}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
              </button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center text-xs text-muted-foreground mt-4">
              نظام إدارة المطاعم ونقاط البيع - بواسطة محمد أيمن
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
