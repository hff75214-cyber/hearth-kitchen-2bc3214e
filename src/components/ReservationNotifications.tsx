import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Clock, X, Check, AlertTriangle, Users } from 'lucide-react';
import { db, TableReservation } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow, differenceInMinutes, addMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ReservationAlert {
  reservation: TableReservation;
  type: 'upcoming' | 'imminent' | 'overdue';
  message: string;
}

export function ReservationNotifications() {
  const [alerts, setAlerts] = useState<ReservationAlert[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const { toast } = useToast();

  const checkReservations = useCallback(async () => {
    const now = new Date();
    const reservations = await db.tableReservations
      .where('status')
      .anyOf(['pending', 'confirmed'])
      .toArray();

    const newAlerts: ReservationAlert[] = [];

    reservations.forEach(reservation => {
      if (dismissedIds.includes(reservation.id!)) return;

      const reservationDateTime = new Date(reservation.reservationDate);
      const [hours, minutes] = reservation.reservationTime.split(':').map(Number);
      reservationDateTime.setHours(hours, minutes, 0, 0);

      const minutesUntil = differenceInMinutes(reservationDateTime, now);

      // Imminent: within 30 minutes
      if (minutesUntil > 0 && minutesUntil <= 30) {
        newAlerts.push({
          reservation,
          type: 'imminent',
          message: `حجز ${reservation.customerName} بعد ${minutesUntil} دقيقة`,
        });
      }
      // Upcoming: within 2 hours
      else if (minutesUntil > 30 && minutesUntil <= 120) {
        newAlerts.push({
          reservation,
          type: 'upcoming',
          message: `حجز ${reservation.customerName} خلال ${Math.round(minutesUntil / 60)} ساعة`,
        });
      }
      // Overdue: past time but not completed
      else if (minutesUntil < 0 && minutesUntil > -60) {
        newAlerts.push({
          reservation,
          type: 'overdue',
          message: `حجز ${reservation.customerName} تأخر ${Math.abs(minutesUntil)} دقيقة`,
        });
      }
    });

    setAlerts(newAlerts.sort((a, b) => {
      const order = { imminent: 0, overdue: 1, upcoming: 2 };
      return order[a.type] - order[b.type];
    }));

    // Show toast for imminent reservations
    newAlerts
      .filter(a => a.type === 'imminent')
      .forEach(alert => {
        const key = `reservation-${alert.reservation.id}`;
        if (!sessionStorage.getItem(key)) {
          toast({
            title: '⏰ حجز قادم',
            description: alert.message,
          });
          sessionStorage.setItem(key, 'notified');
        }
      });
  }, [dismissedIds, toast]);

  useEffect(() => {
    checkReservations();
    const interval = setInterval(checkReservations, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkReservations]);

  const dismissAlert = (id: number) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const confirmReservation = async (reservation: TableReservation) => {
    await db.tableReservations.update(reservation.id!, { 
      status: 'confirmed',
      updatedAt: new Date()
    });
    toast({ title: 'تم تأكيد الحجز' });
    checkReservations();
  };

  const completeReservation = async (reservation: TableReservation) => {
    await db.tableReservations.update(reservation.id!, { 
      status: 'completed',
      updatedAt: new Date()
    });
    toast({ title: 'تم إتمام الحجز' });
    checkReservations();
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'imminent': return 'border-destructive bg-destructive/10';
      case 'overdue': return 'border-warning bg-warning/10';
      case 'upcoming': return 'border-primary bg-primary/10';
      default: return 'border-border';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'imminent': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'overdue': return <Clock className="w-5 h-5 text-warning" />;
      case 'upcoming': return <Calendar className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed left-4 bottom-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <Bell className="w-6 h-6" />
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold"
              >
                {alerts.length}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: -100, y: 100 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -100, y: 100 }}
              className="fixed left-4 bottom-20 w-96 max-h-[70vh] overflow-hidden z-50 rounded-xl shadow-2xl"
            >
              <Card className="border-2 border-border">
                <div className="p-4 bg-primary/10 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    تنبيهات الحجوزات
                  </h3>
                  <Badge>{alerts.length}</Badge>
                </div>
                
                <CardContent className="p-0 max-h-96 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={alert.reservation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border-b border-border last:border-0 ${getAlertColor(alert.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(alert.reservation.reservationDate), 'EEEE', { locale: ar })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {alert.reservation.reservationTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {alert.reservation.guestCount}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.reservation.tableName} • {alert.reservation.customerPhone}
                            </p>
                            
                            <div className="flex gap-2 mt-3">
                              {alert.reservation.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => confirmReservation(alert.reservation)}
                                >
                                  <Check className="w-3 h-3 ml-1" />
                                  تأكيد
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs"
                                onClick={() => completeReservation(alert.reservation)}
                              >
                                إتمام الحجز
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => dismissAlert(alert.reservation.id!)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
