import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Code2,
  Database,
  Shield,
  Smartphone,
  Monitor,
  Zap,
  Layers,
  Globe,
  Heart,
  Star,
  Award,
  FileText,
  Download,
  ChefHat,
  Users,
  Package,
  BarChart3,
  Settings,
  Clock,
  Palette,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import developerPhoto from '@/assets/developer-photo.png';

const technologies = [
  { name: 'React 18', description: 'مكتبة واجهات المستخدم', icon: '⚛️', color: 'from-cyan-500 to-blue-500' },
  { name: 'TypeScript', description: 'لغة البرمجة الآمنة', icon: '📘', color: 'from-blue-500 to-blue-700' },
  { name: 'Vite', description: 'أداة البناء السريعة', icon: '⚡', color: 'from-purple-500 to-violet-600' },
  { name: 'Tailwind CSS', description: 'إطار التصميم', icon: '🎨', color: 'from-teal-400 to-cyan-500' },
  { name: 'Framer Motion', description: 'مكتبة الحركات', icon: '✨', color: 'from-pink-500 to-purple-500' },
  { name: 'IndexedDB (Dexie)', description: 'قاعدة البيانات المحلية', icon: '💾', color: 'from-orange-400 to-amber-500' },
  { name: 'shadcn/ui', description: 'مكونات واجهة المستخدم', icon: '🎯', color: 'from-slate-500 to-slate-700' },
  { name: 'Recharts', description: 'مكتبة الرسوم البيانية', icon: '📊', color: 'from-green-500 to-emerald-600' },
];

const systemModules = [
  { name: 'نقطة البيع (POS)', icon: ChefHat, description: 'واجهة سريعة لإتمام عمليات البيع' },
  { name: 'إدارة المنتجات', icon: Package, description: 'إدارة المنتجات والأصناف والأسعار' },
  { name: 'إدارة المخزون', icon: Database, description: 'تتبع المواد الخام والكميات' },
  { name: 'إدارة العملاء', icon: Users, description: 'برنامج الولاء وسجل العملاء' },
  { name: 'التقارير', icon: BarChart3, description: 'تقارير مفصلة للمبيعات والأداء' },
  { name: 'نظام الصلاحيات', icon: Shield, description: 'إدارة المستخدمين والأدوار' },
  { name: 'الإعدادات', icon: Settings, description: 'تخصيص النظام والفواتير' },
  { name: 'سجل النشاط', icon: Clock, description: 'تتبع جميع العمليات' },
];

const stats = [
  { label: 'صفحة', value: '25+' },
  { label: 'مكون', value: '100+' },
  { label: 'وظيفة', value: '200+' },
  { label: 'ساعة تطوير', value: '500+' },
];

export default function About() {
  // تقرير دليل المستخدم
  const generateUserGuide = () => {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>دليل المستخدم - نظام كاشير محمد أيمن</title>
  <style>
    @page { size: A4; margin: 15mm; }
    @media print { body { -webkit-print-color-adjust: exact !important; } .no-print { display: none !important; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #1a1a1a; line-height: 1.8; padding: 30px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f97316; }
    .header h1 { font-size: 28px; color: #c2410c; margin-bottom: 10px; }
    .header p { color: #666; }
    .section { margin-bottom: 35px; page-break-inside: avoid; }
    .section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 15px; padding: 10px 15px; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 8px; border-right: 4px solid #f97316; }
    .content { padding: 0 15px; }
    .step { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; border-right: 3px solid #f97316; }
    .step h4 { color: #c2410c; font-size: 16px; margin-bottom: 8px; }
    .step p { color: #444; font-size: 14px; }
    .step ul { margin-right: 20px; margin-top: 8px; }
    .step li { margin-bottom: 5px; color: #555; font-size: 13px; }
    .tip { background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; border-radius: 8px; margin-top: 15px; }
    .tip strong { color: #92400e; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #f3f4f6; text-align: center; color: #666; font-size: 12px; }
    @media screen { .print-btn { position: fixed; top: 20px; left: 20px; padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">طباعة الدليل</button>
  
  <div class="header">
    <h1>📖 دليل المستخدم الشامل</h1>
    <p>نظام كاشير محمد أيمن - Mohamed Ayman POS</p>
    <p style="margin-top: 10px; font-size: 12px;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <div class="section-title">🚀 البدء السريع</div>
    <div class="content">
      <div class="step">
        <h4>1. إنشاء حساب المدير</h4>
        <p>عند فتح النظام لأول مرة، ستظهر شاشة لإنشاء حساب المدير الرئيسي:</p>
        <ul>
          <li>أدخل اسمك الثلاثي</li>
          <li>أدخل كلمة مرور (أرقام فقط من 1 إلى 10 أرقام)</li>
          <li>اضغط "إنشاء حساب المدير"</li>
        </ul>
      </div>
      <div class="step">
        <h4>2. تسجيل الدخول</h4>
        <p>بعد إنشاء الحساب، يمكنك تسجيل الدخول بالاسم وكلمة المرور في أي وقت.</p>
      </div>
      <div class="step">
        <h4>3. تثبيت التطبيق (اختياري)</h4>
        <p>يمكنك تثبيت النظام كتطبيق مستقل على جهازك من خلال زر "تثبيت التطبيق" في صفحة الترحيب.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🛒 استخدام نقطة البيع</div>
    <div class="content">
      <div class="step">
        <h4>إضافة منتجات للسلة</h4>
        <ul>
          <li>اختر الفئة من القائمة العلوية أو استخدم البحث</li>
          <li>اضغط على المنتج لإضافته للسلة</li>
          <li>يمكنك تعديل الكمية بالضغط على + أو -</li>
          <li>لحذف منتج، اضغط على أيقونة الحذف</li>
        </ul>
      </div>
      <div class="step">
        <h4>إتمام عملية البيع</h4>
        <ul>
          <li>راجع السلة والإجمالي</li>
          <li>اضغط "دفع" لفتح نافذة الدفع</li>
          <li>اختر طريقة الدفع: نقدي، بطاقة، أو آجل</li>
          <li>في حالة الدفع النقدي، أدخل المبلغ المستلم لحساب الباقي</li>
          <li>اضغط "تأكيد الدفع" لإتمام العملية</li>
        </ul>
      </div>
      <div class="step">
        <h4>طباعة الفاتورة</h4>
        <ul>
          <li>بعد الدفع، اختر نوع الفاتورة: حرارية (80mm) أو A5</li>
          <li>ستفتح نافذة الطباعة تلقائياً</li>
        </ul>
      </div>
      <div class="tip"><strong>💡 نصيحة:</strong> العروض والخصومات تُطبق تلقائياً على الطلب إذا كانت مفعّلة</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📦 إدارة المنتجات</div>
    <div class="content">
      <div class="step">
        <h4>إضافة منتج جديد</h4>
        <ul>
          <li>اذهب لصفحة "المنتجات" من القائمة الجانبية</li>
          <li>اضغط "إضافة منتج"</li>
          <li>أدخل: الاسم، الفئة، سعر التكلفة، سعر البيع</li>
          <li>اختر نوع المنتج: محضّر (يُحضر في المطبخ) أو مخزون (جاهز)</li>
          <li>يمكنك رفع صورة للمنتج</li>
          <li>اضغط "حفظ"</li>
        </ul>
      </div>
      <div class="step">
        <h4>تعديل أو حذف منتج</h4>
        <ul>
          <li>اضغط على زر "تعديل" في بطاقة المنتج</li>
          <li>عدّل البيانات المطلوبة</li>
          <li>لحذف المنتج، اضغط على زر "حذف"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🥬 إدارة المواد الخام</div>
    <div class="content">
      <div class="step">
        <h4>إضافة مادة خام</h4>
        <ul>
          <li>اذهب لصفحة "المواد الخام"</li>
          <li>اضغط "إضافة مادة"</li>
          <li>أدخل: الاسم، الوحدة، الكمية، الحد الأدنى، سعر الوحدة</li>
          <li>اضغط "حفظ"</li>
        </ul>
      </div>
      <div class="step">
        <h4>تنبيهات النقص</h4>
        <p>المواد التي تصل للحد الأدنى ستظهر بلون أحمر، وستظهر تنبيهات في النظام.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">👥 إدارة المستخدمين</div>
    <div class="content">
      <div class="step">
        <h4>إضافة مستخدم جديد</h4>
        <ul>
          <li>اذهب لصفحة "المستخدمين" (للمدير فقط)</li>
          <li>اضغط "إضافة مستخدم"</li>
          <li>أدخل الاسم وكلمة المرور</li>
          <li>اختر الدور: مدير، كاشير، طباخ، موظف توصيل</li>
          <li>حدد الصلاحيات المطلوبة</li>
          <li>اضغط "حفظ"</li>
        </ul>
      </div>
      <div class="step">
        <h4>الأدوار والصلاحيات</h4>
        <ul>
          <li><strong>المدير:</strong> كل الصلاحيات</li>
          <li><strong>الكاشير:</strong> نقطة البيع والمبيعات</li>
          <li><strong>الطباخ:</strong> شاشة المطبخ</li>
          <li><strong>موظف التوصيل:</strong> طلبات التوصيل</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">📊 التقارير</div>
    <div class="content">
      <div class="step">
        <h4>أنواع التقارير المتاحة</h4>
        <ul>
          <li><strong>تقرير المبيعات:</strong> مبيعات اليوم/الأسبوع/الشهر</li>
          <li><strong>تقرير المصروفات:</strong> المصروفات حسب الفئة</li>
          <li><strong>تقرير أداء الموظفين:</strong> مبيعات كل موظف</li>
          <li><strong>تقرير المواد الخام:</strong> استهلاك المواد</li>
          <li><strong>تقرير العروض:</strong> فعالية العروض والخصومات</li>
        </ul>
      </div>
      <div class="step">
        <h4>تصدير التقارير</h4>
        <p>جميع التقارير يمكن تصديرها كملف PDF احترافي بالضغط على زر "تصدير PDF".</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">⚙️ الإعدادات</div>
    <div class="content">
      <div class="step">
        <h4>إعدادات المطعم</h4>
        <ul>
          <li>تغيير اسم المطعم</li>
          <li>رفع شعار المطعم</li>
          <li>إضافة بيانات الاتصال والعنوان</li>
          <li>تحديد نسبة الضريبة</li>
        </ul>
      </div>
      <div class="step">
        <h4>المظهر</h4>
        <p>يمكنك التبديل بين الوضع الفاتح (Light) والداكن (Dark) من الإعدادات.</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p><strong>نظام كاشير محمد أيمن</strong></p>
    <p>دليل المستخدم الشامل</p>
    <p>© ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  // تقرير البناء التقني
  const generateTechnicalReport = () => {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>التقرير التقني - نظام كاشير محمد أيمن</title>
  <style>
    @page { size: A4; margin: 15mm; }
    @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #1a1a1a; line-height: 1.8; padding: 30px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f97316; }
    .header h1 { font-size: 28px; color: #c2410c; margin-bottom: 10px; }
    .header p { color: #666; }
    .section { margin-bottom: 35px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #fed7aa; display: flex; align-items: center; gap: 10px; }
    .section-title::before { content: ''; width: 4px; height: 24px; background: linear-gradient(180deg, #f97316, #ea580c); border-radius: 2px; }
    .tech-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .tech-card { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 15px; border-radius: 10px; border: 1px solid #fed7aa; }
    .tech-card h3 { font-size: 16px; color: #c2410c; margin-bottom: 5px; }
    .tech-card p { font-size: 13px; color: #666; }
    .module-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .module-item { background: #f9fafb; padding: 12px; border-radius: 8px; border-right: 3px solid #f97316; }
    .module-item h4 { font-size: 14px; color: #1a1a1a; margin-bottom: 3px; }
    .module-item p { font-size: 12px; color: #666; }
    .architecture { background: #f9fafb; padding: 20px; border-radius: 10px; margin-top: 15px; }
    .architecture h4 { color: #c2410c; margin-bottom: 10px; }
    .architecture ul { list-style: none; }
    .architecture li { padding: 5px 0; padding-right: 20px; position: relative; }
    .architecture li::before { content: '✓'; position: absolute; right: 0; color: #f97316; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #f3f4f6; text-align: center; color: #666; font-size: 12px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px; }
    .stat-card { text-align: center; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 15px; border-radius: 10px; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-label { font-size: 12px; opacity: 0.9; }
    .code-block { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; margin: 15px 0; }
    .code-block .keyword { color: #569cd6; }
    .code-block .string { color: #ce9178; }
    .code-block .comment { color: #6a9955; }
    .no-print { display: none; }
    @media screen { .print-btn { position: fixed; top: 20px; left: 20px; padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; } .no-print { display: block; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">طباعة التقرير</button>
  
  <div class="header">
    <h1>📋 التقرير التقني الشامل</h1>
    <p>نظام كاشير محمد أيمن - Mohamed Ayman POS System</p>
    <p style="margin-top: 10px; font-size: 12px;">تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <div class="section-title">كيف تم بناء النظام؟</div>
    <p style="margin-bottom: 15px;">تم بناء النظام على عدة مراحل متتالية، بدءاً من التخطيط والتصميم وصولاً للتنفيذ والاختبار:</p>
    
    <div class="architecture">
      <h4>📐 مرحلة التخطيط والتصميم:</h4>
      <ul>
        <li>تحليل متطلبات المطاعم والكافيهات المصرية</li>
        <li>تصميم قاعدة البيانات وهيكل البيانات</li>
        <li>تصميم واجهة المستخدم (UI/UX) بشكل عصري</li>
        <li>تخطيط نظام الصلاحيات والأدوار</li>
      </ul>
    </div>
    
    <div class="architecture" style="margin-top: 15px;">
      <h4>🔧 مرحلة التطوير:</h4>
      <ul>
        <li>إنشاء المشروع باستخدام Vite + React + TypeScript</li>
        <li>تصميم المكونات باستخدام Tailwind CSS و shadcn/ui</li>
        <li>بناء قاعدة البيانات المحلية باستخدام IndexedDB (Dexie.js)</li>
        <li>إضافة الحركات والانتقالات باستخدام Framer Motion</li>
        <li>تطوير نظام الطباعة (فواتير A5 وحرارية)</li>
      </ul>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="stat-value">25+</div><div class="stat-label">صفحة</div></div>
      <div class="stat-card"><div class="stat-value">100+</div><div class="stat-label">مكون</div></div>
      <div class="stat-card"><div class="stat-value">200+</div><div class="stat-label">وظيفة</div></div>
      <div class="stat-card"><div class="stat-value">500+</div><div class="stat-label">ساعة تطوير</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">التقنيات المستخدمة</div>
    <div class="tech-grid">
      <div class="tech-card">
        <h3>⚛️ React 18</h3>
        <p>مكتبة JavaScript لبناء واجهات المستخدم التفاعلية. تستخدم مفهوم Components لتقسيم الواجهة إلى أجزاء قابلة لإعادة الاستخدام.</p>
      </div>
      <div class="tech-card">
        <h3>📘 TypeScript</h3>
        <p>لغة برمجة تضيف Static Typing لـ JavaScript. تساعد في اكتشاف الأخطاء مبكراً وتحسين جودة الكود.</p>
      </div>
      <div class="tech-card">
        <h3>⚡ Vite</h3>
        <p>أداة بناء حديثة وسريعة للغاية. توفر Hot Module Replacement للتطوير الفوري بدون إعادة تحميل الصفحة.</p>
      </div>
      <div class="tech-card">
        <h3>🎨 Tailwind CSS</h3>
        <p>إطار CSS يوفر classes جاهزة للتصميم السريع. يدعم الوضع الداكن والتصميم المتجاوب.</p>
      </div>
      <div class="tech-card">
        <h3>✨ Framer Motion</h3>
        <p>مكتبة للحركات والانتقالات في React. تجعل الواجهة أكثر حيوية وجاذبية.</p>
      </div>
      <div class="tech-card">
        <h3>💾 IndexedDB (Dexie.js)</h3>
        <p>قاعدة بيانات NoSQL مدمجة في المتصفح. تخزن البيانات محلياً بدون الحاجة لخادم.</p>
      </div>
      <div class="tech-card">
        <h3>🎯 shadcn/ui</h3>
        <p>مكونات UI جاهزة ومخصصة بالكامل. مبنية على Radix UI مع إمكانية التعديل الكامل.</p>
      </div>
      <div class="tech-card">
        <h3>📊 Recharts</h3>
        <p>مكتبة رسوم بيانية لـ React. تعرض البيانات في شكل خطوط وأعمدة ودوائر.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">الوحدات والميزات</div>
    <div class="module-list">
      <div class="module-item"><h4>🛒 نقطة البيع (POS)</h4><p>واجهة سريعة لإتمام عمليات البيع مع دعم الخصومات والعروض التلقائية</p></div>
      <div class="module-item"><h4>📊 لوحة التحكم</h4><p>إحصائيات ورسوم بيانية في الوقت الفعلي مع طلبات مباشرة</p></div>
      <div class="module-item"><h4>📦 إدارة المنتجات</h4><p>إضافة وتعديل المنتجات مع الصور والفئات والأسعار</p></div>
      <div class="module-item"><h4>🥬 إدارة المخزون</h4><p>تتبع الكميات وتنبيهات النقص التلقائية</p></div>
      <div class="module-item"><h4>🍳 المواد الخام</h4><p>ربط المنتجات بالمواد الخام وحساب التكاليف</p></div>
      <div class="module-item"><h4>👥 إدارة العملاء</h4><p>سجل العملاء وبرنامج الولاء والنقاط</p></div>
      <div class="module-item"><h4>🍽️ إدارة الطاولات</h4><p>خريطة تفاعلية للطاولات مع الحجوزات</p></div>
      <div class="module-item"><h4>👨‍🍳 شاشة المطبخ</h4><p>عرض الطلبات للطهاة مع تتبع الوقت</p></div>
      <div class="module-item"><h4>📈 التقارير</h4><p>تقارير PDF مفصلة للمبيعات والأداء</p></div>
      <div class="module-item"><h4>🎁 العروض والخصومات</h4><p>إدارة العروض الترويجية مع تقارير الفعالية</p></div>
      <div class="module-item"><h4>💰 المصروفات</h4><p>تتبع مصروفات المطعم وتصنيفها</p></div>
      <div class="module-item"><h4>🔐 نظام الصلاحيات</h4><p>أدوار متعددة (مدير، كاشير، طباخ، توصيل)</p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">البنية التقنية</div>
    <div class="architecture">
      <h4>المميزات التقنية:</h4>
      <ul>
        <li><strong>Component-Based Architecture:</strong> بنية مكونات مع React Functional Components</li>
        <li><strong>State Management:</strong> إدارة الحالة باستخدام React Hooks (useState, useEffect, useMemo)</li>
        <li><strong>Type Safety:</strong> أمان الأنواع الكامل مع TypeScript Strict Mode</li>
        <li><strong>Responsive Design:</strong> تصميم متجاوب يعمل على جميع أحجام الشاشات</li>
        <li><strong>Dark/Light Theme:</strong> وضع ليلي/نهاري مع CSS Variables</li>
        <li><strong>Progressive Web App (PWA):</strong> تطبيق ويب تقدمي يعمل Offline</li>
        <li><strong>Local-First Architecture:</strong> بنية محلية أولاً مع IndexedDB</li>
        <li><strong>Print-Ready Reports:</strong> تقارير جاهزة للطباعة بتنسيق A5 و Thermal</li>
        <li><strong>Real-time Updates:</strong> تحديثات فورية بدون Server</li>
        <li><strong>Electron Support:</strong> دعم تطبيق Desktop</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">نموذج الكود</div>
    <p style="margin-bottom: 10px;">مثال على هيكل مكون React في النظام:</p>
    <div class="code-block">
<span class="comment">// مثال: مكون بطاقة منتج</span>
<span class="keyword">import</span> { useState } <span class="keyword">from</span> <span class="string">'react'</span>;
<span class="keyword">import</span> { Card } <span class="keyword">from</span> <span class="string">'@/components/ui/card'</span>;

<span class="keyword">export function</span> ProductCard({ product }: Props) {
  <span class="keyword">const</span> [quantity, setQuantity] = useState(1);
  
  <span class="keyword">return</span> (
    &lt;Card className=<span class="string">"glass shadow-card"</span>&gt;
      &lt;img src={product.image} alt={product.name} /&gt;
      &lt;h3&gt;{product.name}&lt;/h3&gt;
      &lt;p&gt;{product.price} ج.م&lt;/p&gt;
    &lt;/Card&gt;
  );
}
    </div>
  </div>

  <div class="footer">
    <p><strong>نظام كاشير محمد أيمن</strong></p>
    <p>تم التطوير بواسطة المهندس محمد أيمن</p>
    <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  // تقرير مستند المشروع
  const generateProjectDocument = () => {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>مستند المشروع - نظام كاشير محمد أيمن</title>
  <style>
    @page { size: A4; margin: 20mm; }
    @media print { body { -webkit-print-color-adjust: exact !important; } .no-print { display: none !important; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #1a1a1a; line-height: 2; padding: 40px; }
    .cover { text-align: center; padding: 60px 0; border: 3px solid #f97316; border-radius: 15px; margin-bottom: 40px; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); }
    .cover h1 { font-size: 36px; color: #c2410c; margin-bottom: 15px; }
    .cover h2 { font-size: 24px; color: #666; margin-bottom: 30px; }
    .cover p { color: #888; }
    .section { margin-bottom: 40px; page-break-inside: avoid; }
    .section h2 { font-size: 22px; color: #c2410c; border-bottom: 3px solid #f97316; padding-bottom: 10px; margin-bottom: 20px; }
    .section h3 { font-size: 18px; color: #1a1a1a; margin: 20px 0 10px; }
    .section p, .section li { font-size: 15px; color: #444; }
    .section ul { margin-right: 25px; }
    .section li { margin-bottom: 10px; }
    .highlight { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 20px; border-radius: 10px; border-right: 4px solid #f97316; margin: 20px 0; }
    .highlight strong { color: #c2410c; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #f3f4f6; text-align: center; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { text-align: center; padding: 20px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border-radius: 10px; }
    .stat-box .value { font-size: 28px; font-weight: 700; }
    .stat-box .label { font-size: 12px; }
    @media screen { .print-btn { position: fixed; top: 20px; left: 20px; padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">طباعة المستند</button>

  <div class="cover">
    <h1>🍽️ نظام كاشير محمد أيمن</h1>
    <h2>Mohamed Ayman Restaurant POS System</h2>
    <p>مستند المشروع الشامل</p>
    <p style="margin-top: 20px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h2>📌 نبذة عن النظام</h2>
    <p>نظام كاشير محمد أيمن هو نظام متكامل لإدارة المطاعم والكافيهات، تم تطويره باستخدام أحدث تقنيات تطوير الويب. يتميز النظام بالعمل بدون اتصال بالإنترنت (Offline-First) مما يجعله مثالياً للمطاعم التي تحتاج لنظام موثوق ومستقل.</p>
    
    <div class="highlight">
      <strong>الرؤية:</strong> توفير نظام إدارة مطاعم احترافي، سهل الاستخدام، ويعمل بكفاءة عالية على جميع الأجهزة.
    </div>
    
    <div class="stats-grid">
      <div class="stat-box"><div class="value">25+</div><div class="label">صفحة</div></div>
      <div class="stat-box"><div class="value">100+</div><div class="label">مكون</div></div>
      <div class="stat-box"><div class="value">200+</div><div class="label">وظيفة</div></div>
      <div class="stat-box"><div class="value">500+</div><div class="label">ساعة تطوير</div></div>
    </div>
  </div>

  <div class="section">
    <h2>✨ المميزات الرئيسية</h2>
    <ul>
      <li><strong>العمل بدون إنترنت:</strong> جميع البيانات مخزنة محلياً باستخدام IndexedDB، لا حاجة لاتصال دائم</li>
      <li><strong>تطبيق PWA:</strong> يمكن تثبيته كتطبيق مستقل على الكمبيوتر والموبايل والتابلت</li>
      <li><strong>تصميم متجاوب:</strong> يعمل على جميع أحجام الشاشات بشكل مثالي</li>
      <li><strong>وضع ليلي/نهاري:</strong> راحة للعين في جميع ظروف الإضاءة</li>
      <li><strong>طباعة الفواتير:</strong> دعم الطباعة الحرارية (80mm) وفواتير A5</li>
      <li><strong>نظام صلاحيات:</strong> أدوار متعددة (مدير، كاشير، طباخ، موظف توصيل)</li>
      <li><strong>تقارير PDF:</strong> تقارير احترافية قابلة للتصدير</li>
      <li><strong>برنامج ولاء:</strong> نظام نقاط ومكافآت للعملاء</li>
    </ul>
  </div>

  <div class="section">
    <h2>🛠️ التقنيات المستخدمة</h2>
    <h3>الواجهة الأمامية (Frontend):</h3>
    <ul>
      <li><strong>React 18:</strong> مكتبة JavaScript لبناء واجهات المستخدم التفاعلية</li>
      <li><strong>TypeScript:</strong> لغة برمجة تضيف Type Safety لـ JavaScript</li>
      <li><strong>Vite:</strong> أداة بناء سريعة للغاية مع Hot Module Replacement</li>
      <li><strong>Tailwind CSS:</strong> إطار CSS utility-first للتصميم السريع</li>
      <li><strong>Framer Motion:</strong> مكتبة للحركات والانتقالات السلسة</li>
      <li><strong>shadcn/ui:</strong> مكونات UI مبنية على Radix UI</li>
      <li><strong>Recharts:</strong> مكتبة رسوم بيانية مبنية على D3.js</li>
    </ul>
    
    <h3>قاعدة البيانات:</h3>
    <ul>
      <li><strong>IndexedDB:</strong> قاعدة بيانات NoSQL مدمجة في المتصفح</li>
      <li><strong>Dexie.js:</strong> مكتبة تبسط التعامل مع IndexedDB</li>
    </ul>
    
    <h3>التطبيق المستقل:</h3>
    <ul>
      <li><strong>PWA:</strong> Progressive Web App للتثبيت على أي جهاز</li>
      <li><strong>Electron:</strong> لبناء تطبيق Desktop (Windows/Mac/Linux)</li>
    </ul>
  </div>

  <div class="section">
    <h2>📦 وحدات النظام</h2>
    <ul>
      <li><strong>نقطة البيع (POS):</strong> واجهة سريعة لإتمام عمليات البيع مع دعم الخصومات والعروض التلقائية</li>
      <li><strong>لوحة التحكم:</strong> إحصائيات ورسوم بيانية في الوقت الفعلي مع لوحة طلبات مباشرة</li>
      <li><strong>إدارة المنتجات:</strong> إضافة وتعديل المنتجات مع الصور والفئات</li>
      <li><strong>إدارة المخزون:</strong> تتبع الكميات وتنبيهات النقص</li>
      <li><strong>المواد الخام:</strong> ربط المنتجات بالمواد الخام وحساب التكاليف</li>
      <li><strong>إدارة العملاء:</strong> سجل العملاء وبرنامج الولاء والنقاط</li>
      <li><strong>إدارة الطاولات:</strong> خريطة تفاعلية للطاولات مع الحجوزات</li>
      <li><strong>شاشة المطبخ:</strong> عرض الطلبات للطهاة مع تتبع الوقت</li>
      <li><strong>التقارير:</strong> تقارير PDF مفصلة (مبيعات، أداء، مواد خام، عروض)</li>
      <li><strong>العروض والخصومات:</strong> إدارة العروض الترويجية مع تقارير الفعالية</li>
      <li><strong>المصروفات:</strong> تتبع مصروفات المطعم وتصنيفها</li>
      <li><strong>نظام الصلاحيات:</strong> أدوار متعددة مع صلاحيات مخصصة</li>
      <li><strong>سجل النشاط:</strong> تتبع جميع العمليات في النظام</li>
    </ul>
  </div>

  <div class="section">
    <h2>👨‍💻 المطور</h2>
    <div class="highlight">
      <p><strong>المهندس محمد أيمن</strong></p>
      <p>مهندس برمجيات متخصص في تطوير تطبيقات الويب والأنظمة المتكاملة</p>
      <p>خبرة في: React, TypeScript, Node.js, Python, Databases</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>نظام كاشير محمد أيمن</strong></p>
    <p>Mohamed Ayman POS System</p>
    <p>جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-foreground mb-4">حول النظام</h1>
        <p className="text-muted-foreground text-lg">
          نظام كاشير محمد أيمن - نظام متكامل لإدارة المطاعم
        </p>
      </motion.div>

      {/* Developer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-glow">
                    <img
                      src={developerPhoto}
                      alt="المطور"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                    <Code2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="flex-1 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary">المطور</Badge>
                  <Badge variant="outline" className="border-success/50 text-success">متاح للعمل</Badge>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">المهندس محمد أيمن</h2>
                <p className="text-muted-foreground mb-4">
                  مهندس برمجيات متخصص في تطوير تطبيقات الويب والأنظمة المتكاملة
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">Databases</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="glass shadow-card text-center p-6">
            <div className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
          </Card>
        ))}
      </motion.div>

      {/* Technologies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              التقنيات المستخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 rounded-xl bg-secondary/50 border border-border hover:shadow-glow transition-all duration-300"
                >
                  <div className="text-2xl mb-2">{tech.icon}</div>
                  <h3 className="font-semibold text-foreground">{tech.name}</h3>
                  <p className="text-xs text-muted-foreground">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              وحدات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {systemModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-secondary/30 border border-border"
                  >
                    <Icon className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold text-foreground text-sm">{module.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports Section - For Customer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              التقارير والتوثيق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={generateUserGuide}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 border-border hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                <BookOpen className="w-10 h-10 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">دليل المستخدم</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    شرح استخدام جميع وظائف النظام
                  </p>
                </div>
              </Button>

              <Button
                onClick={generateTechnicalReport}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 border-border hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                <Code2 className="w-10 h-10 text-info" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">التقرير التقني</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    كيف تم بناء النظام والتقنيات المستخدمة
                  </p>
                </div>
              </Button>

              <Button
                onClick={generateProjectDocument}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-3 border-border hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                <FileText className="w-10 h-10 text-success" />
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">مستند المشروع</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    نبذة شاملة عن النظام ومميزاته
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              مميزات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">يعمل بدون إنترنت</h4>
                  <p className="text-sm text-muted-foreground">جميع البيانات مخزنة محلياً على جهازك</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                <div className="p-2 rounded-lg bg-info/10">
                  <Smartphone className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">تطبيق PWA</h4>
                  <p className="text-sm text-muted-foreground">يمكن تثبيته على أي جهاز كتطبيق مستقل</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                <div className="p-2 rounded-lg bg-success/10">
                  <Monitor className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">تصميم متجاوب</h4>
                  <p className="text-sm text-muted-foreground">يعمل على الكمبيوتر والتابلت والموبايل</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Palette className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">وضع ليلي/نهاري</h4>
                  <p className="text-sm text-muted-foreground">راحة للعين في جميع ظروف الإضاءة</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">سريع وموثوق</h4>
                  <p className="text-sm text-muted-foreground">أداء عالي مع تجربة مستخدم سلسة</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">آمن ومحمي</h4>
                  <p className="text-sm text-muted-foreground">نظام صلاحيات متقدم لحماية البيانات</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Heart className="w-4 h-4 text-destructive" />
          <span>صُنع بحب في مصر</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          جميع الحقوق محفوظة © {new Date().getFullYear()} - نظام كاشير محمد أيمن
        </p>
      </motion.div>
    </div>
  );
}
