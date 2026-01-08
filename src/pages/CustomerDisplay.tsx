import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, Clock, Sparkles } from 'lucide-react';
import { db, Order, Settings } from '@/lib/database';

interface DisplayOrder {
  items: { productName: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  discount: number;
  total: number;
  orderNumber?: string;
}

export default function CustomerDisplay() {
  const [currentOrder, setCurrentOrder] = useState<DisplayOrder | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    loadSettings();
    
    // Listen for order updates via localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customerDisplayOrder') {
        const orderData = e.newValue ? JSON.parse(e.newValue) : null;
        setCurrentOrder(orderData);
        setShowThankYou(false);
      }
      if (e.key === 'customerDisplayComplete') {
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          setCurrentOrder(null);
        }, 5000);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check for existing order data
    const existingOrder = localStorage.getItem('customerDisplayOrder');
    if (existingOrder) {
      setCurrentOrder(JSON.parse(existingOrder));
    }

    // Poll for updates every 500ms (for same-tab updates)
    const interval = setInterval(() => {
      const orderData = localStorage.getItem('customerDisplayOrder');
      if (orderData) {
        const parsed = JSON.parse(orderData);
        setCurrentOrder(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
            return parsed;
          }
          return prev;
        });
      } else {
        setCurrentOrder(null);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadSettings = async () => {
    const settingsData = await db.settings.toArray();
    if (settingsData.length > 0) {
      setSettings(settingsData[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {settings?.logo && (
              <img src={settings.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover shadow-md" />
            )}
            <div>
              <h1 className="text-3xl font-bold">{settings?.restaurantName || 'مرحباً بكم'}</h1>
              <p className="text-primary-foreground/80">شاشة عرض الطلب</p>
            </div>
          </div>
          <Clock className="w-8 h-8 opacity-70" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {showThankYou ? (
            <motion.div
              key="thankyou"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block mb-6"
              >
                <div className="w-32 h-32 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Check className="w-16 h-16 text-success" />
                </div>
              </motion.div>
              <h2 className="text-5xl font-bold text-foreground mb-4">شكراً لزيارتكم!</h2>
              <p className="text-2xl text-muted-foreground">نتمنى لكم يوماً سعيداً</p>
            </motion.div>
          ) : currentOrder && currentOrder.items.length > 0 ? (
            <motion.div
              key="order"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <div className="glass rounded-3xl shadow-2xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/20">
                      <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">طلبكم الحالي</h2>
                      {currentOrder.orderNumber && (
                        <p className="text-muted-foreground">رقم الطلب: #{currentOrder.orderNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  <AnimatePresence>
                    {currentOrder.items.map((item, index) => (
                      <motion.div
                        key={`${item.productName}-${index}`}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between py-4 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {item.quantity}
                          </span>
                          <span className="text-xl font-medium text-foreground">{item.productName}</span>
                        </div>
                        <span className="text-xl font-bold text-primary">{item.total.toFixed(2)} ج.م</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Totals */}
                <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 p-6 space-y-4">
                  <div className="flex justify-between text-lg text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{currentOrder.subtotal.toFixed(2)} ج.م</span>
                  </div>
                  
                  {currentOrder.discount > 0 && (
                    <div className="flex justify-between text-lg text-success">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        الخصم
                      </span>
                      <span>-{currentOrder.discount.toFixed(2)} ج.م</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-foreground">الإجمالي</span>
                      <motion.span
                        key={currentOrder.total}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-bold text-primary"
                      >
                        {currentOrder.total.toFixed(2)} ج.م
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                {settings?.logo ? (
                  <img src={settings.logo} alt="Logo" className="w-40 h-40 mx-auto rounded-3xl object-cover shadow-2xl mb-8" />
                ) : (
                  <div className="w-40 h-40 mx-auto rounded-3xl bg-primary/20 flex items-center justify-center mb-8">
                    <ShoppingCart className="w-20 h-20 text-primary" />
                  </div>
                )}
              </motion.div>
              <h2 className="text-5xl font-bold text-foreground mb-4">
                {settings?.restaurantName || 'مرحباً بكم'}
              </h2>
              <p className="text-2xl text-muted-foreground">في انتظار طلبكم...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/50 py-4 text-center text-muted-foreground">
        <p>{settings?.address || ''} {settings?.phone ? `| ${settings.phone}` : ''}</p>
      </footer>
    </div>
  );
}
