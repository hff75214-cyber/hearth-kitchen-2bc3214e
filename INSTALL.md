# دليل تثبيت نظام إدارة المطعم كتطبيق Desktop

## المتطلبات الأساسية
- Node.js (الإصدار 18 أو أحدث) - [تحميل](https://nodejs.org/)
- Git (اختياري)

---

## الخطوات السريعة (نسخ ولصق الأوامر)

### الخطوة 1: فك ضغط المشروع والدخول للمجلد
```bash
cd restaurant-pos
```

### الخطوة 2: تثبيت جميع الاعتماديات
```bash
npm install
```

### الخطوة 3: تثبيت Electron و Electron Builder
```bash
npm install --save-dev electron@latest electron-builder@latest
```

### الخطوة 4: إضافة السكربتات في package.json
افتح ملف `package.json` وأضف هذه الأسطر داخل `"scripts"`:

```json
"electron": "npm run build && electron .",
"electron:dev": "electron .",
"electron:build": "npm run build && electron-builder --win",
"electron:build:portable": "npm run build && electron-builder --win portable"
```

**مثال على شكل scripts بعد الإضافة:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "electron": "npm run build && electron .",
  "electron:dev": "electron .",
  "electron:build": "npm run build && electron-builder --win",
  "electron:build:portable": "npm run build && electron-builder --win portable"
}
```

### الخطوة 5: أضف "main" في package.json
أضف هذا السطر في بداية package.json (بعد "name" مباشرة):
```json
"main": "electron/main.js",
```

---

## تشغيل التطبيق

### للتجربة (عرض سريع):
```bash
npm run build
npx electron .
```

### لإنشاء ملف exe قابل للتثبيت:
```bash
npm run build
npx electron-builder --win
```

### لإنشاء نسخة Portable (بدون تثبيت):
```bash
npm run build
npx electron-builder --win portable
```

---

## موقع ملف التثبيت
بعد التنفيذ، ستجد الملفات في مجلد `release/`:
- `Restaurant POS Setup x.x.x.exe` - ملف التثبيت
- `Restaurant POS x.x.x.exe` - النسخة المحمولة (إن اخترت portable)

---

## ملاحظات مهمة

1. **البيانات محفوظة محلياً**: جميع البيانات تُحفظ في IndexedDB على الجهاز
2. **النسخ الاحتياطي**: استخدم ميزة التصدير من الإعدادات لعمل نسخة احتياطية
3. **نقل البيانات**: يمكنك نقل ملف JSON الاحتياطي لجهاز آخر واستيراده

---

## استكشاف الأخطاء

### خطأ: Cannot find module 'electron'
```bash
npm install --save-dev electron@latest
```

### خطأ: electron-builder not found
```bash
npm install --save-dev electron-builder@latest
```

### خطأ في البناء
تأكد من:
1. تثبيت Node.js الإصدار 18+
2. تنفيذ `npm install` أولاً
3. تنفيذ `npm run build` قبل electron-builder

---

## الأوامر الكاملة (نسخ/لصق مباشر)

```bash
# 1. الدخول للمجلد
cd restaurant-pos

# 2. تثبيت كل شيء
npm install
npm install --save-dev electron@latest electron-builder@latest

# 3. بناء المشروع
npm run build

# 4. تشغيل للتجربة
npx electron .

# 5. إنشاء ملف exe (اختياري)
npx electron-builder --win
```

---

**تم بنجاح! 🎉**
