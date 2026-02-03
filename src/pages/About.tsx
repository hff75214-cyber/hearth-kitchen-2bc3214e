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
  Palette
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
    <div class="section-title">نظرة عامة على النظام</div>
    <p style="margin-bottom: 15px;">نظام إدارة مطاعم متكامل تم تطويره باستخدام أحدث تقنيات الويب. يعمل كتطبيق Progressive Web App (PWA) مما يتيح تشغيله على جميع الأجهزة وبدون اتصال بالإنترنت.</p>
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
      <div class="tech-card"><h3>⚛️ React 18</h3><p>مكتبة JavaScript لبناء واجهات المستخدم التفاعلية مع Hooks و Concurrent Features</p></div>
      <div class="tech-card"><h3>📘 TypeScript</h3><p>لغة برمجة تضيف Type Safety لـ JavaScript مما يقلل الأخطاء ويحسن قابلية الصيانة</p></div>
      <div class="tech-card"><h3>⚡ Vite</h3><p>أداة بناء سريعة للغاية مع Hot Module Replacement للتطوير الفوري</p></div>
      <div class="tech-card"><h3>🎨 Tailwind CSS</h3><p>إطار عمل CSS utility-first لتصميم سريع ومتناسق</p></div>
      <div class="tech-card"><h3>✨ Framer Motion</h3><p>مكتبة للحركات والانتقالات السلسة في React</p></div>
      <div class="tech-card"><h3>💾 IndexedDB (Dexie.js)</h3><p>قاعدة بيانات NoSQL محلية للمتصفح مع API بسيط</p></div>
      <div class="tech-card"><h3>🎯 shadcn/ui</h3><p>مكونات UI مبنية على Radix UI مع تخصيص كامل</p></div>
      <div class="tech-card"><h3>📊 Recharts</h3><p>مكتبة رسوم بيانية مبنية على D3.js لـ React</p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">الوحدات والميزات</div>
    <div class="module-list">
      <div class="module-item"><h4>نقطة البيع (POS)</h4><p>واجهة سريعة لإتمام عمليات البيع مع دعم الخصومات والعروض</p></div>
      <div class="module-item"><h4>لوحة التحكم</h4><p>إحصائيات ورسوم بيانية في الوقت الفعلي</p></div>
      <div class="module-item"><h4>إدارة المنتجات</h4><p>إضافة وتعديل المنتجات والأصناف</p></div>
      <div class="module-item"><h4>إدارة المخزون</h4><p>تتبع الكميات وتنبيهات النقص</p></div>
      <div class="module-item"><h4>المواد الخام</h4><p>ربط المنتجات بالمواد الخام والتكاليف</p></div>
      <div class="module-item"><h4>إدارة العملاء</h4><p>سجل العملاء وبرنامج الولاء</p></div>
      <div class="module-item"><h4>إدارة الطاولات</h4><p>خريطة تفاعلية للطاولات والحجوزات</p></div>
      <div class="module-item"><h4>شاشة المطبخ</h4><p>عرض الطلبات للطهاة مع تتبع الوقت</p></div>
      <div class="module-item"><h4>التقارير</h4><p>تقارير PDF مفصلة للمبيعات والأداء</p></div>
      <div class="module-item"><h4>العروض والخصومات</h4><p>إدارة العروض الترويجية والخصومات</p></div>
      <div class="module-item"><h4>المصروفات</h4><p>تتبع مصروفات المطعم وتصنيفها</p></div>
      <div class="module-item"><h4>نظام الصلاحيات</h4><p>أدوار متعددة مع صلاحيات مخصصة</p></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">البنية التقنية</div>
    <div class="architecture">
      <h4>المميزات التقنية:</h4>
      <ul>
        <li>Component-Based Architecture مع React Functional Components</li>
        <li>State Management باستخدام React Hooks (useState, useEffect, useMemo)</li>
        <li>Type Safety الكامل مع TypeScript Strict Mode</li>
        <li>Responsive Design يعمل على جميع أحجام الشاشات</li>
        <li>Dark/Light Theme مع CSS Variables</li>
        <li>Progressive Web App (PWA) للعمل Offline</li>
        <li>Local-First Architecture مع IndexedDB</li>
        <li>Print-Ready Reports بتنسيق A5 و Thermal</li>
        <li>Real-time Updates بدون Server</li>
        <li>Electron Support للتطبيق Desktop</li>
      </ul>
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

  const generatePresentationGuide = () => {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>دليل شرح النظام - نظام كاشير محمد أيمن</title>
  <style>
    @page { size: A4; margin: 15mm; }
    @media print { body { -webkit-print-color-adjust: exact !important; } .no-print { display: none !important; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #1a1a1a; line-height: 1.8; padding: 30px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f97316; }
    .header h1 { font-size: 28px; color: #c2410c; margin-bottom: 10px; }
    .page-section { margin-bottom: 30px; page-break-inside: avoid; }
    .page-title { font-size: 18px; font-weight: 700; color: #c2410c; margin-bottom: 10px; padding: 10px; background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-radius: 8px; border-right: 4px solid #f97316; }
    .page-content { padding: 15px; background: #f9fafb; border-radius: 8px; margin-top: 10px; }
    .script-item { margin-bottom: 15px; padding: 10px; border-right: 3px solid #f97316; background: white; border-radius: 0 8px 8px 0; }
    .script-item h4 { color: #1a1a1a; font-size: 14px; margin-bottom: 5px; }
    .script-item p { color: #666; font-size: 13px; }
    .tip { background: #fef3c7; border: 1px solid #fcd34d; padding: 10px; border-radius: 8px; margin-top: 10px; font-size: 12px; }
    .tip strong { color: #92400e; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #f3f4f6; text-align: center; color: #666; font-size: 12px; }
    @media screen { .print-btn { position: fixed; top: 20px; left: 20px; padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">طباعة الدليل</button>
  
  <div class="header">
    <h1>🎬 دليل شرح النظام للفيديو</h1>
    <p>نظام كاشير محمد أيمن - Mohamed Ayman POS</p>
    <p style="margin-top: 10px; font-size: 14px;">دليل مفصل لشرح كل صفحة في النظام</p>
  </div>

  <div class="page-section">
    <div class="page-title">📖 المقدمة (30 ثانية - دقيقة)</div>
    <div class="page-content">
      <div class="script-item">
        <h4>نص الافتتاحية:</h4>
        <p>"السلام عليكم ورحمة الله وبركاته، معكم محمد أيمن، وفي هذا الفيديو سأشرح لكم نظام كاشير متكامل لإدارة المطاعم. النظام تم بناؤه باستخدام أحدث التقنيات مثل React و TypeScript، ويعمل بدون إنترنت كتطبيق PWA."</p>
      </div>
      <div class="tip"><strong>💡 نصيحة:</strong> اعرض الشاشة الترحيبية أثناء المقدمة</div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">🏠 صفحات الترحيب (Welcome Pages)</div>
    <div class="page-content">
      <div class="script-item">
        <h4>الصفحة 1 - الترحيب:</h4>
        <p>"عند فتح النظام لأول مرة، تظهر صفحة ترحيبية أنيقة تعرض اسم النظام والميزات الرئيسية."</p>
      </div>
      <div class="script-item">
        <h4>الصفحة 2 - الميزات:</h4>
        <p>"هنا نرى الميزات الأساسية: نقطة البيع، لوحة التحكم، إدارة العملاء، إدارة المخزون، التقارير، ونظام الصلاحيات."</p>
      </div>
      <div class="script-item">
        <h4>الصفحة 3 - التقنيات:</h4>
        <p>"النظام مبني بـ React 18 للواجهة، TypeScript للأمان، Vite للسرعة، Tailwind للتصميم، و IndexedDB لقاعدة البيانات المحلية."</p>
      </div>
      <div class="script-item">
        <h4>الصفحة 4 - عن المطور:</h4>
        <p>"تم تطوير النظام بواسطتي، مهندس برمجيات متخصص في تطوير الويب والأنظمة المتكاملة."</p>
      </div>
      <div class="script-item">
        <h4>الصفحة 5 - تثبيت التطبيق:</h4>
        <p>"يمكن تثبيت النظام كتطبيق مستقل على الكمبيوتر أو الموبايل من خلال زر التثبيت هذا."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">🔐 تسجيل الدخول وإنشاء الحساب</div>
    <div class="page-content">
      <div class="script-item">
        <h4>إنشاء حساب المدير (أول مرة):</h4>
        <p>"في المرة الأولى، يطلب النظام إنشاء حساب المدير الرئيسي. هذا الحساب له كامل الصلاحيات."</p>
      </div>
      <div class="script-item">
        <h4>تسجيل الدخول:</h4>
        <p>"بعد ذلك، يمكن لأي مستخدم تسجيل الدخول بكود PIN سريع مكون من 4 أرقام."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">📊 لوحة التحكم (Dashboard)</div>
    <div class="page-content">
      <div class="script-item">
        <h4>الإحصائيات العامة:</h4>
        <p>"لوحة التحكم تعرض إحصائيات اليوم: إجمالي المبيعات، عدد الطلبات، متوسط قيمة الطلب، وعدد العملاء الجدد."</p>
      </div>
      <div class="script-item">
        <h4>الرسوم البيانية:</h4>
        <p>"هنا رسم بياني للمبيعات اليومية، يمكن التبديل بين العرض اليومي والشهري. أيضاً رسم دائري لتوزيع المنتجات الأكثر مبيعاً."</p>
      </div>
      <div class="script-item">
        <h4>لوحة الطلبات المباشرة:</h4>
        <p>"على اليسار لوحة الطلبات المباشرة التي تحدث تلقائياً كل 10 ثوانٍ وتعرض حالة كل طلب: جديد، قيد التحضير، جاهز."</p>
      </div>
      <div class="script-item">
        <h4>آخر الطلبات:</h4>
        <p>"وهنا قائمة بآخر الطلبات مع رقم الطلب والتاريخ والمبلغ والحالة."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">🛒 نقطة البيع (POS)</div>
    <div class="page-content">
      <div class="script-item">
        <h4>واجهة البيع:</h4>
        <p>"صفحة نقطة البيع مقسمة إلى جزئين: على اليمين قائمة المنتجات مع إمكانية التصفية حسب الفئة والبحث، وعلى اليسار سلة المشتريات."</p>
      </div>
      <div class="script-item">
        <h4>إضافة منتج:</h4>
        <p>"بالضغط على أي منتج يتم إضافته للسلة تلقائياً. يمكن تعديل الكمية أو حذف المنتج."</p>
      </div>
      <div class="script-item">
        <h4>الخصومات التلقائية:</h4>
        <p>"النظام يطبق الخصومات والعروض تلقائياً حسب الإعدادات المسبقة."</p>
      </div>
      <div class="script-item">
        <h4>إتمام البيع:</h4>
        <p>"بالضغط على 'دفع' تظهر نافذة اختيار طريقة الدفع: نقدي، بطاقة، أو آجل. بعد الدفع يمكن طباعة الفاتورة بحجم A5 أو حرارية."</p>
      </div>
      <div class="tip"><strong>💡 نصيحة:</strong> اعمل طلب تجريبي كامل أثناء الشرح</div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">📦 إدارة المنتجات</div>
    <div class="page-content">
      <div class="script-item">
        <h4>قائمة المنتجات:</h4>
        <p>"هنا جميع المنتجات في شكل بطاقات مع الصورة والاسم والسعر والفئة."</p>
      </div>
      <div class="script-item">
        <h4>إضافة منتج:</h4>
        <p>"بالضغط على 'إضافة منتج' تظهر نافذة لإدخال البيانات: الاسم، السعر، الفئة، الوصف، وربط المواد الخام."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">🥬 المواد الخام والمخزون</div>
    <div class="page-content">
      <div class="script-item">
        <h4>قائمة المواد:</h4>
        <p>"صفحة المواد الخام تعرض جميع المواد مع الكمية الحالية والحد الأدنى وسعر الوحدة."</p>
      </div>
      <div class="script-item">
        <h4>تنبيهات النقص:</h4>
        <p>"المواد التي وصلت للحد الأدنى تظهر بلون أحمر تنبيهي."</p>
      </div>
      <div class="script-item">
        <h4>تقرير المواد الخام:</h4>
        <p>"تقرير مفصل يعرض استهلاك المواد وتكلفتها مع رسوم بيانية."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">🍽️ إدارة الطاولات</div>
    <div class="page-content">
      <div class="script-item">
        <h4>خريطة الطاولات:</h4>
        <p>"عرض بصري لجميع الطاولات مع حالتها: فارغة (أخضر)، مشغولة (أحمر)، محجوزة (أصفر)."</p>
      </div>
      <div class="script-item">
        <h4>إدارة الطاولة:</h4>
        <p>"بالضغط على أي طاولة يمكن فتح طلب جديد أو عرض الطلب الحالي."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">👨‍🍳 شاشة المطبخ</div>
    <div class="page-content">
      <div class="script-item">
        <h4>عرض الطلبات:</h4>
        <p>"شاشة مخصصة للمطبخ تعرض الطلبات الجديدة في شكل بطاقات مع تفاصيل كل طلب ووقت الانتظار."</p>
      </div>
      <div class="script-item">
        <h4>تحديث الحالة:</h4>
        <p>"الطباخ يمكنه تحديث حالة الطلب: قيد التحضير أو جاهز."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">📈 التقارير</div>
    <div class="page-content">
      <div class="script-item">
        <h4>أنواع التقارير:</h4>
        <p>"النظام يوفر عدة تقارير: تقرير المبيعات، تقرير المصروفات، تقرير أداء الموظفين، وتقرير المواد الخام."</p>
      </div>
      <div class="script-item">
        <h4>تصدير PDF:</h4>
        <p>"جميع التقارير يمكن تصديرها كملف PDF احترافي مع شعار المطعم."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">⚙️ الإعدادات</div>
    <div class="page-content">
      <div class="script-item">
        <h4>إعدادات المطعم:</h4>
        <p>"تغيير اسم المطعم، رفع الشعار، إدخال بيانات الاتصال والعنوان."</p>
      </div>
      <div class="script-item">
        <h4>إعدادات الضرائب:</h4>
        <p>"تحديد نسبة الضريبة وطريقة تطبيقها."</p>
      </div>
      <div class="script-item">
        <h4>المظهر:</h4>
        <p>"التبديل بين الوضع الفاتح والداكن."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">👥 إدارة المستخدمين والصلاحيات</div>
    <div class="page-content">
      <div class="script-item">
        <h4>أدوار المستخدمين:</h4>
        <p>"النظام يدعم عدة أدوار: مدير (كامل الصلاحيات)، كاشير، طباخ، موظف توصيل. كل دور له صلاحيات محددة."</p>
      </div>
      <div class="script-item">
        <h4>إضافة مستخدم:</h4>
        <p>"المدير يمكنه إضافة مستخدمين جدد وتحديد صلاحياتهم."</p>
      </div>
    </div>
  </div>

  <div class="page-section">
    <div class="page-title">🎬 الخاتمة (30 ثانية)</div>
    <div class="page-content">
      <div class="script-item">
        <h4>نص الختام:</h4>
        <p>"هذا كان شرحاً شاملاً لنظام كاشير محمد أيمن. النظام مصمم ليكون سهل الاستخدام وفعال لإدارة المطاعم. للتواصل أو الاستفسارات، يمكنكم التواصل معي. شكراً لمتابعتكم، والسلام عليكم ورحمة الله وبركاته."</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p><strong>نظام كاشير محمد أيمن</strong></p>
    <p>دليل شرح النظام للفيديو</p>
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

  const generateSystemOverview = () => {
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>مستند النظام - نظام كاشير محمد أيمن</title>
  <style>
    @page { size: A4; margin: 20mm; }
    @media print { body { -webkit-print-color-adjust: exact !important; } .no-print { display: none !important; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #fff; color: #1a1a1a; line-height: 2; padding: 40px; }
    .cover { text-align: center; padding: 60px 0; border: 3px solid #f97316; border-radius: 15px; margin-bottom: 40px; }
    .cover h1 { font-size: 36px; color: #c2410c; margin-bottom: 15px; }
    .cover h2 { font-size: 24px; color: #666; margin-bottom: 30px; }
    .cover p { color: #888; }
    .section { margin-bottom: 40px; }
    .section h2 { font-size: 22px; color: #c2410c; border-bottom: 3px solid #f97316; padding-bottom: 10px; margin-bottom: 20px; }
    .section h3 { font-size: 18px; color: #1a1a1a; margin: 20px 0 10px; }
    .section p, .section li { font-size: 15px; color: #444; }
    .section ul { margin-right: 25px; }
    .section li { margin-bottom: 8px; }
    .highlight { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); padding: 20px; border-radius: 10px; border-right: 4px solid #f97316; margin: 20px 0; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #f3f4f6; text-align: center; color: #666; }
    @media screen { .print-btn { position: fixed; top: 20px; left: 20px; padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; } }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">طباعة المستند</button>

  <div class="cover">
    <h1>🍽️ نظام كاشير محمد أيمن</h1>
    <h2>Mohamed Ayman Restaurant POS System</h2>
    <p>مستند وصف النظام الشامل</p>
    <p style="margin-top: 20px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h2>📌 نبذة عن النظام</h2>
    <p>نظام كاشير محمد أيمن هو نظام متكامل لإدارة المطاعم والكافيهات، تم تطويره باستخدام أحدث تقنيات تطوير الويب. يتميز النظام بالعمل بدون اتصال بالإنترنت (Offline-First) مما يجعله مثالياً للمطاعم التي تحتاج لنظام موثوق ومستقل.</p>
    
    <div class="highlight">
      <strong>الرؤية:</strong> توفير نظام إدارة مطاعم احترافي، سهل الاستخدام، ويعمل بكفاءة عالية على جميع الأجهزة.
    </div>
  </div>

  <div class="section">
    <h2>✨ المميزات الرئيسية</h2>
    <ul>
      <li><strong>العمل بدون إنترنت:</strong> جميع البيانات مخزنة محلياً باستخدام IndexedDB</li>
      <li><strong>تطبيق PWA:</strong> يمكن تثبيته كتطبيق مستقل على أي جهاز</li>
      <li><strong>تصميم متجاوب:</strong> يعمل على الكمبيوتر والتابلت والموبايل</li>
      <li><strong>وضع ليلي/نهاري:</strong> راحة للعين في جميع ظروف الإضاءة</li>
      <li><strong>طباعة احترافية:</strong> فواتير بحجم A5 وفواتير حرارية</li>
      <li><strong>نظام صلاحيات متقدم:</strong> تحكم كامل في وصول المستخدمين</li>
      <li><strong>تقارير PDF:</strong> تقارير مفصلة قابلة للطباعة والمشاركة</li>
      <li><strong>تحديثات فورية:</strong> عرض البيانات في الوقت الفعلي</li>
    </ul>
  </div>

  <div class="section">
    <h2>🛠️ التقنيات المستخدمة</h2>
    <h3>Frontend (الواجهة الأمامية):</h3>
    <ul>
      <li><strong>React 18:</strong> مكتبة JavaScript لبناء واجهات المستخدم التفاعلية</li>
      <li><strong>TypeScript:</strong> لغة برمجة تضيف الأنواع لـ JavaScript لتقليل الأخطاء</li>
      <li><strong>Vite:</strong> أداة بناء سريعة للتطوير والإنتاج</li>
      <li><strong>Tailwind CSS:</strong> إطار عمل CSS للتصميم السريع</li>
      <li><strong>Framer Motion:</strong> مكتبة للحركات والانتقالات السلسة</li>
      <li><strong>shadcn/ui:</strong> مكونات واجهة مستخدم جاهزة ومخصصة</li>
      <li><strong>Recharts:</strong> مكتبة للرسوم البيانية التفاعلية</li>
    </ul>
    
    <h3>Database (قاعدة البيانات):</h3>
    <ul>
      <li><strong>IndexedDB:</strong> قاعدة بيانات NoSQL مدمجة في المتصفح</li>
      <li><strong>Dexie.js:</strong> مكتبة تسهل التعامل مع IndexedDB</li>
    </ul>
    
    <h3>Desktop (تطبيق سطح المكتب):</h3>
    <ul>
      <li><strong>Electron:</strong> لتحويل التطبيق لبرنامج Windows مستقل</li>
    </ul>
  </div>

  <div class="section">
    <h2>📱 الوحدات والصفحات</h2>
    <ul>
      <li><strong>لوحة التحكم (Dashboard):</strong> إحصائيات ورسوم بيانية شاملة</li>
      <li><strong>نقطة البيع (POS):</strong> واجهة سريعة لإتمام عمليات البيع</li>
      <li><strong>إدارة المنتجات:</strong> إضافة وتعديل المنتجات والفئات</li>
      <li><strong>المواد الخام:</strong> تتبع المخزون وتكاليف الإنتاج</li>
      <li><strong>إدارة الطاولات:</strong> خريطة تفاعلية للطاولات</li>
      <li><strong>الحجوزات:</strong> إدارة حجوزات العملاء</li>
      <li><strong>شاشة المطبخ:</strong> عرض الطلبات للطهاة</li>
      <li><strong>إدارة العملاء:</strong> سجل العملاء وبرنامج الولاء</li>
      <li><strong>التوصيل:</strong> تتبع طلبات التوصيل</li>
      <li><strong>العروض والخصومات:</strong> إدارة العروض الترويجية</li>
      <li><strong>المصروفات:</strong> تتبع مصروفات المطعم</li>
      <li><strong>التقارير:</strong> تقارير مفصلة للمبيعات والأداء</li>
      <li><strong>إدارة المستخدمين:</strong> إضافة مستخدمين وتحديد الصلاحيات</li>
      <li><strong>سجل النشاط:</strong> تتبع جميع العمليات في النظام</li>
      <li><strong>الإعدادات:</strong> تخصيص النظام والفواتير</li>
    </ul>
  </div>

  <div class="section">
    <h2>👥 أدوار المستخدمين</h2>
    <ul>
      <li><strong>المدير (Admin):</strong> صلاحيات كاملة على جميع الوظائف</li>
      <li><strong>الكاشير (Cashier):</strong> نقطة البيع وإدارة الطلبات</li>
      <li><strong>الطباخ (Chef):</strong> شاشة المطبخ وتحديث حالة الطلبات</li>
      <li><strong>موظف التوصيل (Delivery):</strong> إدارة طلبات التوصيل</li>
      <li><strong>المحاسب (Accountant):</strong> التقارير والمصروفات</li>
    </ul>
  </div>

  <div class="section">
    <h2>🔒 الأمان والخصوصية</h2>
    <ul>
      <li>جميع البيانات مخزنة محلياً على الجهاز فقط</li>
      <li>نظام تسجيل دخول بكود PIN سريع وآمن</li>
      <li>صلاحيات مفصلة لكل مستخدم</li>
      <li>سجل نشاط شامل لجميع العمليات</li>
    </ul>
  </div>

  <div class="section">
    <h2>📞 التواصل والدعم</h2>
    <div class="highlight">
      <p><strong>المطور:</strong> المهندس محمد أيمن</p>
      <p><strong>التخصص:</strong> مهندس برمجيات - تطوير الويب والتطبيقات</p>
      <p>للاستفسارات والدعم الفني، يرجى التواصل عبر القنوات الرسمية.</p>
    </div>
  </div>

  <div class="footer">
    <p><strong>نظام كاشير محمد أيمن</strong></p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">حول النظام</h1>
          <p className="text-muted-foreground mt-1">
            معلومات تقنية وتوثيق نظام كاشير محمد أيمن
          </p>
        </div>
      </div>

      {/* System Info Card */}
      <Card className="glass shadow-card overflow-hidden">
        <div className="bg-gradient-to-l from-primary/20 to-primary/5 p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <ChefHat className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">نظام كاشير محمد أيمن</h2>
              <p className="text-muted-foreground">Mohamed Ayman Restaurant POS System</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">PWA</Badge>
                <Badge variant="secondary">Offline-First</Badge>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass shadow-card text-center p-4">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Developer Section */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Award className="w-5 h-5 text-primary" />
            عن المطور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <img 
              src={developerPhoto} 
              alt="Developer" 
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
            />
            <div>
              <h3 className="text-xl font-bold text-foreground">المهندس محمد أيمن</h3>
              <p className="text-muted-foreground">مهندس برمجيات - متخصص في تطوير الويب</p>
              <p className="text-sm text-muted-foreground mt-2">
                مطور متخصص في بناء أنظمة إدارة متكاملة باستخدام أحدث تقنيات الويب
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Code2 className="w-5 h-5 text-primary" />
            التقنيات المستخدمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-all"
              >
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div className="font-medium text-foreground">{tech.name}</div>
                <div className="text-xs text-muted-foreground">{tech.description}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Modules */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Layers className="w-5 h-5 text-primary" />
            وحدات النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemModules.map((module, index) => (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-secondary/30 border border-border"
              >
                <module.icon className="w-6 h-6 text-primary mb-2" />
                <div className="font-medium text-foreground text-sm">{module.name}</div>
                <div className="text-xs text-muted-foreground">{module.description}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            التقارير والتوثيق
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={generateSystemOverview}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Globe className="w-8 h-8 text-primary" />
              <span className="font-medium">مستند النظام العام</span>
              <span className="text-xs text-muted-foreground">وصف شامل للنظام</span>
            </Button>
            
            <Button
              onClick={generatePresentationGuide}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Palette className="w-8 h-8 text-primary" />
              <span className="font-medium">دليل الشرح للفيديو</span>
              <span className="text-xs text-muted-foreground">سكريبت لشرح كل صفحة</span>
            </Button>
            
            <Button
              onClick={generateTechnicalReport}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Code2 className="w-8 h-8 text-primary" />
              <span className="font-medium">التقرير التقني</span>
              <span className="text-xs text-muted-foreground">التقنيات والبنية</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Highlights */}
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-primary" />
            أبرز المميزات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Monitor className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">يعمل على جميع الأجهزة</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">تطبيق PWA قابل للتثبيت</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Database className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">قاعدة بيانات محلية</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">نظام صلاحيات متقدم</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">أداء سريع وسلس</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">واجهة سهلة الاستخدام</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center text-muted-foreground text-sm">
        <p>نظام كاشير محمد أيمن - Mohamed Ayman POS System</p>
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
