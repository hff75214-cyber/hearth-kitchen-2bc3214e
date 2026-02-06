import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Database, Clock, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DemoDataNotificationProps {
  onDismiss: () => void;
}

export function DemoDataNotification({ onDismiss }: DemoDataNotificationProps) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4"
        >
          <Card className="glass border-warning/30 shadow-2xl overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-warning/20 via-primary/20 to-warning/20 animate-pulse" />
            
            <CardContent className="relative p-6">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 left-3 p-1 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Icon and Title */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center"
                  >
                    <Database className="w-7 h-7 text-warning" />
                  </motion.div>
                </div>

                <div className="flex-1 text-right">
                  <h3 className="text-lg font-bold text-foreground mb-1 flex items-center justify-end gap-2">
                    <Sparkles className="w-5 h-5 text-warning" />
                    بيانات تجريبية
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    البيانات الموجودة حالياً في النظام هي <span className="text-warning font-semibold">بيانات تجريبية</span> تم إنشاؤها لمساعدتك في فهم وتجربة النظام.
                  </p>
                </div>
              </div>

              {/* Timer */}
              <div className="mt-4 p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>يمكنك حذفها من الإعدادات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-warning"
                    />
                    <span className="text-warning font-mono font-bold">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Developer Credit */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">تم بناء هذا النظام بواسطة</span>
                  <span className="font-bold text-primary">محمد أيمن محمد سلطان</span>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="w-full"
                >
                  فهمت، شكراً! 👍
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
