import { useState } from 'react';
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
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

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

const additionalFeatures = [
  { icon: Utensils, text: 'إدارة الطاولات' },
  { icon: CreditCard, text: 'طرق دفع متعددة' },
  { icon: Bell, text: 'نظام الحجوزات' },
  { icon: Clock, text: 'إدارة الورديات' },
];

export default function Welcome({ onComplete }: WelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    if (success) {
      // Wait a moment then proceed
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const steps = [
    // Step 1: Welcome
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl">
              <ChefHat className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              نظام إدارة المطعم
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              الحل المتكامل لإدارة مطعمك بكفاءة واحترافية
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">يعمل بدون إنترنت</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 text-info border border-info/20">
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">قاعدة بيانات محلية</span>
            </div>
          </div>
        </motion.div>
      )
    },
    // Step 2: Features
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">مميزات النظام</h2>
            <p className="text-muted-foreground">كل ما تحتاجه لإدارة مطعمك في مكان واحد</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-5 h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
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

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {additionalFeatures.map((feat) => (
              <div 
                key={feat.text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm"
              >
                <feat.icon className="w-4 h-4" />
                <span>{feat.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )
    },
    // Step 3: Install - Enhanced Professional Card
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Main Install Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl"
          >
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-2xl">
              {/* Decorative Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              </div>

              <div className="relative p-8 space-y-6">
                {/* Header */}
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

                {/* Features Grid */}
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

                {/* Benefits List */}
                <div className="bg-background/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground">يفتح كتطبيق مستقل بدون متصفح</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground">اختصار على سطح المكتب أو الشاشة الرئيسية</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground">يعمل بدون إنترنت مع حفظ البيانات محلياً</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground">تحديثات تلقائية في الخلفية</span>
                  </div>
                </div>

                {/* Install Button Section */}
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
                        <li>اضغط على زر المشاركة <span className="inline-block">⬆️</span></li>
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

          {/* Skip Option */}
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
          <span className="font-semibold text-foreground">Restaurant POS</span>
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
      <div className="flex-1 flex items-center justify-center p-6">
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

        <div className="flex gap-3">
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="gradient-primary text-primary-foreground gap-2"
            >
              التالي
              <ArrowLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="gradient-primary text-primary-foreground gap-2 px-6"
            >
              البدء الآن
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
