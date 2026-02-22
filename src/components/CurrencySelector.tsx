import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '@/hooks/useCurrency';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/lib/currencies';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function CurrencySelector() {
  const { currentCurrency, changeCurrency } = useCurrency();

  const handleCurrencyChange = (value: string) => {
    changeCurrency(value as CurrencyCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-2"
    >
      <Select value={currentCurrency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <AnimatePresence>
            {Object.entries(SUPPORTED_CURRENCIES).map(([code, currency]) => (
              <motion.div
                key={code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <SelectItem value={code}>
                  <div className="flex items-center gap-2">
                    <span>{currency.flag}</span>
                    <span>{currency.name}</span>
                    <span className="text-muted-foreground">({code})</span>
                  </div>
                </SelectItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </SelectContent>
      </Select>
    </motion.div>
  );
}
