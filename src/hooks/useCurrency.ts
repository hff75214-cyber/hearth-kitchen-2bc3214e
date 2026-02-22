import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/database';
import { CurrencyCode, SUPPORTED_CURRENCIES, DEFAULT_EXCHANGE_RATES, convertCurrency, formatPrice } from '@/lib/currencies';

export function useCurrency() {
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('EGP');
  const [exchangeRates, setExchangeRates] = useState(DEFAULT_EXCHANGE_RATES);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل العملة المحفوظة من الإعدادات
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        setIsLoading(true);
        const settings = await db.settings.toCollection().first();
        if (settings && settings.currency) {
          // محاولة تحويل العملة المحفوظة إلى CurrencyCode
          const currencyCode = (settings.currency as unknown as CurrencyCode);
          if (currencyCode in SUPPORTED_CURRENCIES) {
            setCurrentCurrency(currencyCode);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('[v0] Error loading currency settings:', error);
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, []);

  // تحديث العملة وحفظها في الإعدادات
  const changeCurrency = useCallback(async (newCurrency: CurrencyCode) => {
    try {
      setCurrentCurrency(newCurrency);
      
      // حفظ في الإعدادات
      const settings = await db.settings.toCollection().first();
      if (settings && settings.id) {
        await db.settings.update(settings.id, { currency: newCurrency });
      }
    } catch (error) {
      console.error('[v0] Error changing currency:', error);
    }
  }, []);

  // دالة لتحويل السعر باستخدام العملة الحالية
  const convertToCurrentCurrency = useCallback(
    (amount: number, fromCurrency: CurrencyCode = 'EGP') => {
      return convertCurrency(amount, fromCurrency, currentCurrency, exchangeRates);
    },
    [currentCurrency, exchangeRates]
  );

  // دالة لتنسيق السعر بالعملة الحالية
  const formatCurrentPrice = useCallback(
    (amount: number) => {
      return formatPrice(amount, currentCurrency);
    },
    [currentCurrency]
  );

  // دالة للحصول على رمز العملة الحالية
  const getCurrencySymbol = useCallback(() => {
    return SUPPORTED_CURRENCIES[currentCurrency]?.symbol || '';
  }, [currentCurrency]);

  // دالة للحصول على اسم العملة الحالية
  const getCurrencyName = useCallback(() => {
    return SUPPORTED_CURRENCIES[currentCurrency]?.name || '';
  }, [currentCurrency]);

  return {
    currentCurrency,
    changeCurrency,
    convertToCurrentCurrency,
    formatCurrentPrice,
    getCurrencySymbol,
    getCurrencyName,
    exchangeRates,
    setExchangeRates,
    isLoading,
  };
}
