import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Maximize2, Minimize2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type KeyboardSize = 'small' | 'medium' | 'large';
type KeyboardLanguage = 'ar' | 'en';

const arabicKeys = [
  ['ذ', 'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
];

const englishKeys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
];

export function VirtualKeyboard({
  onKeyPress,
  onBackspace,
  onEnter,
  isOpen,
  onClose,
}: VirtualKeyboardProps) {
  const [size, setSize] = useState<KeyboardSize>('medium');
  const [language, setLanguage] = useState<KeyboardLanguage>('ar');
  const [isUppercase, setIsUppercase] = useState(false);

  const keys = language === 'ar' ? arabicKeys : englishKeys;

  const getKeySize = useCallback(() => {
    switch (size) {
      case 'small':
        return 'h-10 w-8 text-sm';
      case 'medium':
        return 'h-12 w-10 text-base';
      case 'large':
        return 'h-14 w-12 text-lg';
    }
  }, [size]);

  const getContainerWidth = useCallback(() => {
    switch (size) {
      case 'small':
        return 'max-w-xl';
      case 'medium':
        return 'max-w-3xl';
      case 'large':
        return 'max-w-full';
    }
  }, [size]);

  const handleKeyPress = (key: string) => {
    const outputKey = language === 'en' && isUppercase ? key.toUpperCase() : key;
    onKeyPress(outputKey);
  };

  const cycleSize = () => {
    const sizes: KeyboardSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(size);
    setSize(sizes[(currentIndex + 1) % sizes.length]);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl',
            'p-4'
          )}
        >
          <div className={cn('mx-auto', getContainerWidth())}>
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  لوحة المفاتيح الافتراضية
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="h-8 px-3 border-border hover:bg-secondary"
                >
                  <Globe className="w-4 h-4 ml-1" />
                  {language === 'ar' ? 'عربي' : 'EN'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cycleSize}
                  className="h-8 px-3 border-border hover:bg-secondary"
                >
                  {size === 'small' ? (
                    <Minimize2 className="w-4 h-4 ml-1" />
                  ) : (
                    <Maximize2 className="w-4 h-4 ml-1" />
                  )}
                  {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Keyboard Layout */}
            <div className="space-y-2">
              {keys.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex justify-center gap-1 flex-wrap"
                >
                  {row.map((key, keyIndex) => (
                    <motion.button
                      key={`${rowIndex}-${keyIndex}`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeyPress(key)}
                      className={cn(
                        getKeySize(),
                        'rounded-lg bg-secondary hover:bg-secondary/80 active:bg-primary/20',
                        'text-foreground font-medium transition-all duration-150',
                        'border border-border/50 shadow-sm',
                        'flex items-center justify-center'
                      )}
                    >
                      {language === 'en' && isUppercase ? key.toUpperCase() : key}
                    </motion.button>
                  ))}
                </div>
              ))}

              {/* Bottom Row - Special Keys */}
              <div className="flex justify-center gap-2 mt-3">
                {language === 'en' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUppercase(!isUppercase)}
                    className={cn(
                      'h-12 px-4 rounded-lg transition-all duration-150',
                      'border border-border/50 shadow-sm',
                      'flex items-center justify-center gap-2 text-sm font-medium',
                      isUppercase
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    )}
                  >
                    ⇧ Shift
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onKeyPress(' ')}
                  className={cn(
                    'h-12 px-16 rounded-lg bg-secondary hover:bg-secondary/80',
                    'text-foreground font-medium transition-all duration-150',
                    'border border-border/50 shadow-sm',
                    'flex items-center justify-center'
                  )}
                >
                  مسافة
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onBackspace}
                  className={cn(
                    'h-12 px-6 rounded-lg bg-destructive/10 hover:bg-destructive/20',
                    'text-destructive font-medium transition-all duration-150',
                    'border border-destructive/30 shadow-sm',
                    'flex items-center justify-center'
                  )}
                >
                  ⌫ مسح
                </motion.button>
                {onEnter && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onEnter}
                    className={cn(
                      'h-12 px-6 rounded-lg gradient-primary',
                      'text-primary-foreground font-medium transition-all duration-150',
                      'shadow-glow',
                      'flex items-center justify-center'
                    )}
                  >
                    إدخال ↵
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Keyboard Toggle Button Component
export function KeyboardToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      className="h-10 w-10 border-border hover:bg-secondary"
    >
      <Keyboard className="w-5 h-5" />
    </Button>
  );
}
