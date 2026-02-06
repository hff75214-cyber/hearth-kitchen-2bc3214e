/**
 * Console Welcome Message
 * Displays a beautiful developer credit message in the browser console
 */

export function showConsoleWelcome() {
  // Main title with large styled text
  console.log(
    `%c
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🍽️  نظام كاشير محمد أيمن  🍽️                                   ║
║   Mohamed Ayman POS System                                        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝`,
    'color: #f59e0b; font-size: 14px; font-weight: bold; font-family: monospace;'
  );

  // Developer info
  console.log(
    `%c✨ تم تصميم وبناء هذا النظام بواسطة ✨`,
    'color: #10b981; font-size: 16px; font-weight: bold; margin-top: 10px;'
  );

  console.log(
    `%c🧑‍💻 محمد أيمن محمد سلطان`,
    'color: #6366f1; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
  );

  console.log(
    `%cMohamed Ayman Mohamed Sultan`,
    'color: #8b5cf6; font-size: 18px; font-weight: bold;'
  );

  // Divider
  console.log(
    `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    'color: #64748b;'
  );

  // Developer details
  console.log(
    `%c📚 الكلية المصرية الكورية - قسم تكنولوجيا المعلومات`,
    'color: #f97316; font-size: 12px;'
  );

  console.log(
    `%c🎂 العمر: 18 عام`,
    'color: #ec4899; font-size: 12px;'
  );

  console.log(
    `%c⏱️ مدة التطوير: 6 أشهر`,
    'color: #14b8a6; font-size: 12px;'
  );

  // Technologies
  console.log(
    `%c
🛠️ التقنيات المستخدمة:`,
    'color: #3b82f6; font-size: 14px; font-weight: bold;'
  );

  console.log(
    `%c   ⚛️ React 18  |  📘 TypeScript  |  ⚡ Vite  |  🎨 Tailwind CSS  |  🗄️ IndexedDB`,
    'color: #94a3b8; font-size: 11px;'
  );

  // Divider
  console.log(
    `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    'color: #64748b;'
  );

  // System info
  console.log(
    `%c💡 هذا النظام يعمل بالكامل بدون إنترنت`,
    'color: #22c55e; font-size: 12px; font-weight: bold;'
  );

  console.log(
    `%c🔒 جميع البيانات مخزنة محلياً على جهازك`,
    'color: #22c55e; font-size: 12px;'
  );

  // Footer
  console.log(
    `%c
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🚀 شكراً لاستخدامك نظام كاشير محمد أيمن!                        ║
║   Thank you for using Mohamed Ayman POS System!                   ║
║                                                                   ║
║   © 2024 - جميع الحقوق محفوظة                                     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝`,
    'color: #f59e0b; font-size: 12px; font-weight: bold;'
  );

  // Easter egg
  console.log(
    `%c🎉 مرحباً أيها المطور الفضولي! أنت رائع! 🎉`,
    'background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); color: white; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: bold;'
  );
}

// Show welcome message when this module is imported
if (typeof window !== 'undefined') {
  showConsoleWelcome();
}
