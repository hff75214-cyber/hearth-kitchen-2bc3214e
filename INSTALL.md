# دليل تثبيت نظام إدارة المطعم كتطبيق Desktop

## المتطلبات الأساسية
- Node.js (الإصدار 18 أو أحدث) - [تحميل](https://nodejs.org/)

---

## ⚠️ مهم جداً - المشكلة الشائعة

عند فك الضغط، يُنشأ مجلد داخل مجلد بنفس الاسم. **يجب أن تكون في المجلد الذي يحتوي على:**
- مجلد `src`
- مجلد `electron`  
- ملف `package.json`

**إذا رأيت مجلد واحد فقط، ادخل إليه!**

---

## الخطوات الكاملة (نسخ/لصق مباشر)

### 1. الدخول للمجلد الصحيح
```powershell
# انتقل للمجلد المفكوك
cd D:\restaurant-hub-aaf47d97-main

# تحقق من المحتويات
dir

# إذا رأيت مجلد واحد فقط، ادخل إليه:
cd restaurant-hub-aaf47d97-main

# تحقق مرة أخرى - يجب أن ترى: src, electron, package.json
dir
```

### 2. تثبيت الاعتماديات
```powershell
npm install
```

### 3. تثبيت Electron
```powershell
npm install --save-dev electron electron-builder
```

### 4. تعديل package.json (إجباري!)

افتح `package.json` بـ Notepad وأضف هذا السطر **مباشرة بعد** `"name":`:

```json
"main": "electron/main.js",
```

**يجب أن يبدو هكذا:**
```json
{
  "name": "vite_react_shadcn_ts",
  "main": "electron/main.js",
  "private": true,
  ...
}
```

**احفظ الملف!**

### 5. بناء المشروع
```powershell
npm run build
```

### 6. تشغيل التطبيق
```powershell
npx electron .
```

### 7. إنشاء ملف exe (اختياري)
```powershell
npx electron-builder --win
```

---

## 🎯 ملخص سريع

```powershell
cd D:\restaurant-hub-aaf47d97-main\restaurant-hub-aaf47d97-main
npm install
npm install --save-dev electron electron-builder
# (عدّل package.json وأضف "main": "electron/main.js")
npm run build
npx electron .
```

---

## ❌ حل الأخطاء الشائعة

### خطأ: Cannot find Electron app / Cannot find module
**السبب:** أنت في مجلد خاطئ أو لم تضف `"main"` في package.json

**الحل:**
1. تأكد أن المجلد الحالي يحتوي على `electron/main.js`
2. تأكد أنك أضفت `"main": "electron/main.js"` في package.json
3. نفذ `npm run build` قبل `npx electron .`

### خطأ: Module not found
```powershell
npm install
```

---

## موقع ملف التثبيت
بعد `npx electron-builder --win`، ستجد الملف في: `release/Restaurant POS Setup.exe`

---

**تم بنجاح! 🎉**
