import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Monitor, 
  Download, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Utensils,
  CreditCard,
  Package,
  Bell,
  Clock,
  WifiOff,
  Database,
  Code2,
  Sparkles,
  Zap,
  Settings,
  BookOpen,
  HelpCircle,
  Globe,
  Layers,
  Server,
  Palette,
  Award,
  GraduationCap,
  Calendar,
  Heart,
  Star,
  Rocket,
  Target,
  TrendingUp,
  FileText,
  Truck,
  Receipt,
  Table2,
  ClipboardList,
  DollarSign,
  PieChart,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { Badge } from '@/components/ui/badge';
import { seedDemoData } from '@/lib/sampleData';
import developerPhoto from '@/assets/developer-photo.png';

interface WelcomeProps {
  onComplete: () => void;
}

const features = [
  {
    icon: ShoppingCart,
    title: 'نقطة البيع (POS)',
    description: 'واجهة سهلة وسريعة لإتمام عمليات البيع بكفاءة عالية'
  },
  {
    icon: LayoutDashboard,
    title: 'لوحة تحكم شاملة',
    description: 'متابعة أداء المطعم والمبيعات والإحصائيات في الوقت الفعلي'
  },
  {
    icon: Users,
    title: 'إدارة العملاء',
    description: 'نظام ولاء وتتبع العملاء وسجل الطلبات'
  },
  {
    icon: Package,
    title: 'إدارة المخزون',
    description: 'تتبع المواد الخام والمنتجات مع تنبيهات النقص'
  },
  {
    icon: BarChart3,
    title: 'تقارير متقدمة',
    description: 'تقارير مفصلة للمبيعات والمصروفات والأرباح'
  },
  {
    icon: Shield,
    title: 'نظام صلاحيات',
    description: 'تحكم كامل في صلاحيات المستخدمين والموظفين'
  }
];

const technologies = [
  { name: 'React', color: 'from-cyan-500 to-blue-500', icon: '⚛️' },
  { name: 'TypeScript', color: 'from-blue-500 to-blue-700', icon: '📘' },
  { name: 'Vite', color: 'from-purple-500 to-violet-600', icon: '⚡' },
  { name: 'Tailwind CSS', color: 'from-teal-400 to-cyan-500', icon: '🎨' },
  { name: 'Framer Motion', color: 'from-pink-500 to-purple-500', icon: '✨' },
  { name: 'IndexedDB (Dexie)', color: 'from-orange-400 to-amber-500', icon: '💾' },
  { name: 'PWA', color: 'from-green-500 to-emerald-600', icon: '📱' },
  { name: 'Radix UI', color: 'from-gray-600 to-gray-800', icon: '🧩' },
];

const systemModules = [
  { icon: ShoppingCart, name: 'نقطة البيع', description: 'بيع سريع ومرن' },
  { icon: Table2, name: 'إدارة الطاولات', description: 'حجز وتتبع الطاولات' },
  { icon: Utensils, name: 'شاشة المطبخ', description: 'متابعة الطلبات' },
  { icon: Package, name: 'المخزون', description: 'إدارة المواد الخام' },
  { icon: FileText, name: 'الفواتير', description: 'طباعة احترافية' },
  { icon: Receipt, name: 'المصروفات', description: 'تتبع النفقات' },
  { icon: Users, name: 'العملاء', description: 'نظام ولاء متكامل' },
  { icon: Truck, name: 'التوصيل', description: 'إدارة الطلبات' },
  { icon: ClipboardList, name: 'الحجوزات', description: 'حجز مسبق' },
  { icon: DollarSign, name: 'المالية', description: 'تقارير مالية' },
  { icon: PieChart, name: 'التقارير', description: 'إحصائيات شاملة' },
  { icon: UserPlus, name: 'الموظفين', description: 'إدارة الفريق' },
];

const workflowSteps = [
  { icon: UserPlus, title: 'إنشاء حساب', description: 'سجل كمدير للنظام' },
  { icon: Settings, title: 'إعداد المطعم', description: 'أضف منتجاتك وإعداداتك' },
  { icon: ShoppingCart, title: 'ابدأ البيع', description: 'استخدم نقطة البيع' },
  { icon: BarChart3, title: 'تابع الأداء', description: 'راقب التقارير والإحصائيات' },
];

export default function Welcome({ onComplete }: WelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // تحميل البيانات التجريبية عند بدء التطبيق
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        await seedDemoData();
        setDataLoaded(true);
      } catch (error) {
        console.log('Sample data already exists or error:', error);
        setDataLoaded(true);
      }
    };
    loadSampleData();
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    if (success) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const steps = [
    // Step 0: Developer Page
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl w-full max-w-3xl">
            {/* Decorative Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-info/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
            </div>

            <div className="relative p-8 md:p-12 space-y-8">
              {/* Header with Avatar */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="relative inline-block"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary via-primary/80 to-amber-600 p-1 shadow-2xl shadow-primary/30">
                    <img 
                      src={developerPhoto} 
                      alt="محمد أيمن طلب" 
                      className="w-full h-full rounded-full object-cover object-top"
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-success flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-6 h-6 text-success-foreground" />
                  </motion.div>
                </motion.div>

                <div className="space-y-2">
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-4 py-1">
                    <Star className="w-3 h-3 ml-1" />
                    مطور النظام
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    محمد أيمن طلب
                  </h1>
                  <p className="text-lg text-primary font-medium">
                    Full-Stack Developer
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">الكلية المصرية الكورية</p>
                    <p className="text-sm text-muted-foreground">قسم تكنولوجيا المعلومات</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">العمر: 18 سنة</p>
                    <p className="text-sm text-muted-foreground">مبرمج طموح ومتحمس</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">مدة التطوير: 6 أشهر</p>
                    <p className="text-sm text-muted-foreground">من يوليو 2024 إلى يناير 2025</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">التخصصات</p>
                    <p className="text-sm text-muted-foreground">Full-Stack • قواعد بيانات • تطبيقات موبايل</p>
                  </div>
                </motion.div>
              </div>

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-foreground text-center">التقنيات المستخدمة في بناء النظام</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {technologies.map((tech, index) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tech.color} text-white text-sm font-medium shadow-lg`}
                    >
                      <span>{tech.icon}</span>
                      <span>{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quote */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-center pt-4 border-t border-border/50"
              >
                <p className="text-muted-foreground italic flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  صُنع بحب وشغف للتقنية
                  <Heart className="w-4 h-4 text-destructive" />
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )
    },
    // Step 1: Welcome
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div className="flex justify-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center shadow-2xl shadow-primary/30"
            >
              <ChefHat className="w-14 h-14 text-primary-foreground" />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-foreground"
            >
              POS System
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-lg mx-auto"
            >
              نظام إدارة متكامل لإدارة متجرك أو مطعمك بكفاءة واحترافية
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">يعمل بدون إنترنت</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 text-info border border-info/20">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">قاعدة بيانات محلية</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">تصميم عصري</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-6"
          >
            <p className="text-sm text-muted-foreground">
              نظام متكامل يدعم جميع عمليات المتجر والمطعم من نقطة البيع إلى التقارير المالية المتقدمة
            </p>
          </motion.div>
        </motion.div>
      )
    },
    // Step 2: Features Overview
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">مميزات النظام</h2>
            <p className="text-muted-foreground">كل ما تحتاجه لإدارة متجرك أو مطعمك في مكان واحد</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )
    },
    // Step 3: System Modules
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-info to-info/60 flex items-center justify-center shadow-lg">
                <Layers className="w-8 h-8 text-info-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">وحدات النظام</h2>
            <p className="text-muted-foreground">12 وحدة متكاملة تغطي جميع احتياجات متجرك أو مطعمك</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {systemModules.map((module, index) => (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="p-4 h-full bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 flex items-center justify-center transition-all">
                      <module.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{module.name}</h3>
                      <p className="text-xs text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )
    },
    // Step 4: How It Works
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/60 flex items-center justify-center shadow-lg">
                <Rocket className="w-8 h-8 text-success-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">كيف يعمل النظام؟</h2>
            <p className="text-muted-foreground">4 خطوات بسيطة للبدء</p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {workflowSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20">
                      <step.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-success/10 via-success/5 to-success/10 rounded-2xl p-6 text-center max-w-2xl mx-auto"
          >
            <Zap className="w-8 h-8 text-success mx-auto mb-3" />
            <p className="text-foreground font-medium">
              النظام يعمل بشكل كامل بدون الحاجة للاتصال بالإنترنت!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              جميع البيانات مخزنة بشكل آمن على جهازك
            </p>
          </motion.div>
        </motion.div>
      )
    },
    // Step 5: Benefits & Why Choose Us
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center shadow-lg">
                <Target className="w-8 h-8 text-warning-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">لماذا تختار نظامنا؟</h2>
            <p className="text-muted-foreground">مميزات تجعلنا الخيار الأمثل</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { icon: WifiOff, title: 'يعمل أوفلاين', desc: 'لا حاجة للاتصال بالإنترنت', color: 'success' },
              { icon: Zap, title: 'سريع جداً', desc: 'أداء عالي وسلس', color: 'warning' },
              { icon: Shield, title: 'آمن ومحمي', desc: 'بياناتك محفوظة على جهازك', color: 'info' },
              { icon: Palette, title: 'واجهة عصرية', desc: 'تصميم أنيق وسهل الاستخدام', color: 'primary' },
              { icon: Globe, title: 'يدعم العربية', desc: 'واجهة عربية بالكامل', color: 'success' },
              { icon: TrendingUp, title: 'تقارير ذكية', desc: 'تحليلات وإحصائيات مفصلة', color: 'info' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-${item.color}/10 flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-7 h-7 text-${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )
    },
    // Step 6: Quick Guide
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">دليل الاستخدام السريع</h2>
            <p className="text-muted-foreground">نصائح لبداية موفقة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { title: 'إعداد المنتجات', desc: 'أضف منتجاتك وحدد أسعارها وصورها من صفحة المنتجات', icon: Package },
              { title: 'إنشاء الفئات', desc: 'نظم منتجاتك في فئات لسهولة الوصول أثناء البيع', icon: Layers },
              { title: 'إدارة الموظفين', desc: 'أنشئ حسابات للموظفين وحدد صلاحياتهم', icon: Users },
              { title: 'إعداد الطابعة', desc: 'اضبط إعدادات الطباعة للفواتير من صفحة الإعدادات', icon: FileText },
            ].map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="p-5 bg-card/50 border-border/50 h-full">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <tip.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-muted-foreground"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">يمكنك العودة لهذا الدليل لاحقاً من صفحة الإعدادات</span>
          </motion.div>
        </motion.div>
      )
    },
    // Step 7: Install - Enhanced Professional Card
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              </div>

              <div className="relative p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                      <Download className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      تثبيت النظام كتطبيق
                    </h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                      احصل على تجربة تطبيق كاملة مع إمكانية العمل بدون إنترنت
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/50">
                    <Monitor className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-foreground">ديسكتوب</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/50">
                    <Smartphone className="w-6 h-6 text-primary" />
                    <span className="text-xs font-medium text-foreground">موبايل</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/50">
                    <WifiOff className="w-6 h-6 text-success" />
                    <span className="text-xs font-medium text-foreground">أوفلاين</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/50">
                    <Database className="w-6 h-6 text-info" />
                    <span className="text-xs font-medium text-foreground">بيانات محلية</span>
                  </div>
                </div>

                <div className="bg-background/50 rounded-xl p-4 space-y-3">
                  {[
                    'يفتح كتطبيق مستقل بدون متصفح',
                    'اختصار على سطح المكتب أو الشاشة الرئيسية',
                    'يعمل بدون إنترنت مع حفظ البيانات محلياً',
                    'تحديثات تلقائية في الخلفية',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-2">
                  {isInstalled ? (
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl bg-success/10 border border-success/30"
                    >
                      <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-7 h-7 text-success" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg text-success">تم تثبيت التطبيق بنجاح!</p>
                        <p className="text-sm text-muted-foreground mt-1">يمكنك الآن فتحه من سطح المكتب</p>
                      </div>
                    </motion.div>
                  ) : isInstallable ? (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        size="lg"
                        onClick={handleInstall}
                        disabled={isInstalling}
                        className="w-full h-16 text-lg font-bold gradient-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                      >
                        {isInstalling ? (
                          <>
                            <div className="animate-spin w-6 h-6 border-3 border-primary-foreground border-t-transparent rounded-full ml-3" />
                            <span>جاري التثبيت...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-6 h-6 ml-3" />
                            <span>تثبيت التطبيق الآن</span>
                          </>
                        )}
                      </Button>
                    </motion.div>
                  ) : isIOS ? (
                    <div className="bg-gradient-to-br from-secondary to-secondary/50 rounded-xl p-5 text-right space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">التثبيت على iPhone/iPad</span>
                      </div>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>اضغط على زر المشاركة ⬆️</li>
                        <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                        <li>اضغط "إضافة" للتأكيد</li>
                      </ol>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-secondary to-secondary/50 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">طريقة التثبيت</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        افتح قائمة المتصفح (⋮) ثم اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            يمكنك التثبيت لاحقاً من صفحة الإعدادات
          </motion.p>
        </motion.div>
      )
    }
  ];

  const totalSteps = steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-primary" />
          <span className="font-semibold text-foreground">نظام كاشير محمد أيمن</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentStep 
                  ? 'w-6 bg-primary' 
                  : i < currentStep 
                    ? 'bg-primary/60' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          السابق
        </Button>
        
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} / {totalSteps}
        </span>

        {currentStep === totalSteps - 1 ? (
          <Button onClick={onComplete} className="gap-2 gradient-primary text-primary-foreground">
            ابدأ الآن
            <ArrowLeft className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
            className="gap-2"
          >
            التالي
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
