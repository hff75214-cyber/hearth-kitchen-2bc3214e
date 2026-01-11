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
    // Step 3: Install
    {
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">تثبيت التطبيق</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              قم بتثبيت النظام كتطبيق على جهازك للوصول السريع والعمل بدون إنترنت
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Desktop */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">الكمبيوتر</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  يعمل على Windows, Mac, Linux
                </p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 text-right">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>شاشة كاملة بدون متصفح</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>اختصار على سطح المكتب</span>
                </li>
              </ul>
            </Card>

            {/* Mobile */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">الهاتف المحمول</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  يعمل على Android و iOS
                </p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 text-right">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>أيقونة على الشاشة الرئيسية</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>تجربة تطبيق كاملة</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Install Button */}
          <div className="pt-4 space-y-4">
            {isInstalled ? (
              <div className="flex items-center justify-center gap-3 text-success">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">تم تثبيت التطبيق بنجاح!</span>
              </div>
            ) : isInstallable ? (
              <Button
                size="lg"
                onClick={handleInstall}
                disabled={isInstalling}
                className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full ml-2" />
                    جاري التثبيت...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 ml-2" />
                    تثبيت التطبيق الآن
                  </>
                )}
              </Button>
            ) : isIOS ? (
              <div className="bg-secondary/50 rounded-xl p-4 max-w-md mx-auto text-right">
                <p className="text-sm text-foreground font-medium mb-2">للتثبيت على iPhone/iPad:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>اضغط على زر المشاركة <span className="inline-block rotate-90">⎋</span></li>
                  <li>اختر "إضافة إلى الشاشة الرئيسية"</li>
                  <li>اضغط "إضافة"</li>
                </ol>
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  للتثبيت، افتح قائمة المتصفح (⋮) واختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"
                </p>
              </div>
            )}
          </div>
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
