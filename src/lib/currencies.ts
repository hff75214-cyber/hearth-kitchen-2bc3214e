// العملات المدعومة في النظام
export const SUPPORTED_CURRENCIES = {
  EGP: { name: 'جنيه مصري', symbol: '₊.‎', code: 'EGP', country: 'مصر', flag: '🇪🇬' },
  SAR: { name: 'ريال سعودي', symbol: '﷼', code: 'SAR', country: 'المملكة العربية السعودية', flag: '🇸🇦' },
  SYP: { name: 'ليرة سورية', symbol: '£', code: 'SYP', country: 'سوريا', flag: '🇸🇾' },
  JOD: { name: 'دينار أردني', symbol: 'د.ا', code: 'JOD', country: 'الأردن', flag: '🇯🇴' },
  ILS: { name: 'شيقل إسرائيلي', symbol: '₪', code: 'ILS', country: 'فلسطين', flag: '🇵🇸' },
  LBP: { name: 'ليرة لبنانية', symbol: '£', code: 'LBP', country: 'لبنان', flag: '🇱🇧' },
  LYD: { name: 'دينار ليبي', symbol: 'ل.د', code: 'LYD', country: 'ليبيا', flag: '🇱🇾' },
  IQD: { name: 'دينار عراقي', symbol: 'ع.د', code: 'IQD', country: 'العراق', flag: '🇮🇶' },
  KWD: { name: 'دينار كويتي', symbol: 'د.ك', code: 'KWD', country: 'الكويت', flag: '🇰🇼' },
  AED: { name: 'درهم إماراتي', symbol: 'د.إ', code: 'AED', country: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  QAR: { name: 'ريال قطري', symbol: 'ر.ق', code: 'QAR', country: 'قطر', flag: '🇶🇦' },
  BHD: { name: 'دينار بحريني', symbol: 'د.ب', code: 'BHD', country: 'البحرين', flag: '🇧🇭' },
  OMR: { name: 'ريال عماني', symbol: 'ر.ع.', code: 'OMR', country: 'عمان', flag: '🇴🇲' },
  YER: { name: 'ريال يمني', symbol: '﷼', code: 'YER', country: 'اليمن', flag: '🇾🇪' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// أسعار الصرف (نسبة إلى الجنيه المصري كعملة أساسية)
// يتم تحديثها يدويًا أو من خلال API خارجي
export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  EGP: 1, // الأساس
  SAR: 0.12, // 1 جنيه = 0.12 ريال سعودي تقريباً
  SYP: 2.5, // تقريبي
  JOD: 0.028, // 1 جنيه = 0.028 دينار أردني تقريباً
  ILS: 0.15, // تقريبي
  LBP: 60, // 1 جنيه = 60 ليرة لبنانية تقريباً
  LYD: 0.2, // تقريبي
  IQD: 45, // 1 جنيه = 45 دينار عراقي تقريباً
  KWD: 0.011, // تقريبي
  AED: 0.135, // 1 جنيه = 0.135 درهم إماراتي تقريباً
  QAR: 0.165, // تقريبي
  BHD: 0.012, // تقريبي
  OMR: 0.015, // تقريبي
  YER: 10, // 1 جنيه = 10 ريالات يمنية تقريباً
};

// دالة لتحويل السعر من عملة إلى أخرى
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // تحويل إلى الجنيه المصري أولاً (العملة الأساسية)
  const amountInEGP = amount / rates[fromCurrency];
  
  // ثم تحويل من الجنيه المصري إلى العملة المستهدفة
  const convertedAmount = amountInEGP * rates[toCurrency];
  
  return Math.round(convertedAmount * 100) / 100; // تقريب لـ 2 عشري
}

// دالة لتنسيق السعر حسب العملة
export function formatPrice(
  amount: number,
  currencyCode: CurrencyCode = 'EGP'
): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode];
  
  // تنسيق الرقم مع فواصل الألوف
  const formattedAmount = amount.toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formattedAmount} ${currency.symbol}`;
}

// دالة للحصول على اسم العملة
export function getCurrencyName(currencyCode: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[currencyCode]?.name || currencyCode;
}

// دالة للحصول على جميع العملات
export function getAllCurrencies() {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, data]) => ({
    code: code as CurrencyCode,
    ...data,
  }));
}
