import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UtensilsCrossed,
  Clock,
  Check,
  DollarSign,
  CircleDot,
  Square,
  RectangleHorizontal,
} from 'lucide-react';
import { db, RestaurantTable } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TableStats {
  tableId: number;
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
}

export default function TablesView() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tableStats, setTableStats] = useState<Map<number, TableStats>>(new Map());

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const tablesData = await db.restaurantTables.toArray();
    setTables(tablesData.filter(t => t.isActive));
    
    const stats = new Map<number, TableStats>();
    for (const table of tablesData) {
      const orders = await db.orders
        .where('tableId')
        .equals(table.id!)
        .and(o => o.status === 'completed')
        .toArray();
      
      stats.set(table.id!, {
        tableId: table.id!,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        totalProfit: orders.reduce((sum, o) => sum + o.profit, 0),
      });
    }
    setTableStats(stats);
  };

  const getStatusConfig = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available':
        return {
          bg: 'from-emerald-500/20 to-green-500/20',
          border: 'border-emerald-500/50',
          text: 'text-emerald-500',
          label: 'شاغرة',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
          icon: Check,
        };
      case 'occupied':
        return {
          bg: 'from-rose-500/20 to-red-500/20',
          border: 'border-rose-500/50',
          text: 'text-rose-500',
          label: 'مشغولة',
          glow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]',
          icon: UtensilsCrossed,
        };
      case 'reserved':
        return {
          bg: 'from-amber-500/20 to-orange-500/20',
          border: 'border-amber-500/50',
          text: 'text-amber-500',
          label: 'محجوزة',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
          icon: Clock,
        };
    }
  };

  const getShapeIcon = (shape: RestaurantTable['shape']) => {
    switch (shape) {
      case 'round': return CircleDot;
      case 'rectangle': return RectangleHorizontal;
      default: return Square;
    }
  };

  const availableCount = tables.filter(t => t.status === 'available').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;

  // Create chairs around table
  const renderChairs = (chairs: number, shape: string) => {
    const chairPositions = [];
    const radius = shape === 'round' ? 55 : 60;
    
    for (let i = 0; i < chairs; i++) {
      const angle = (i * 360 / chairs) - 90;
      const rad = (angle * Math.PI) / 180;
      const x = Math.cos(rad) * radius;
      const y = Math.sin(rad) * radius;
      
      chairPositions.push(
        <div
          key={i}
          className="absolute w-4 h-4 rounded-full bg-muted-foreground/30 border border-muted-foreground/50"
          style={{
            transform: `translate(${x}px, ${y}px)`,
            left: '50%',
            top: '50%',
            marginLeft: '-8px',
            marginTop: '-8px',
          }}
        />
      );
    }
    return chairPositions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">عرض الطاولات</h1>
        <p className="text-muted-foreground mt-1">
          عرض مباشر لحالة جميع الطاولات
        </p>
      </div>

      {/* Status Summary */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 font-semibold">{availableCount} شاغرة</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-500 font-semibold">{occupiedCount} مشغولة</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-500 font-semibold">{reservedCount} محجوزة</span>
        </div>
      </div>

      {/* Tables Floor Map */}
      <Card className="glass shadow-card min-h-[600px]">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            خريطة صالة المطعم
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {/* Restaurant Floor Visualization */}
          <div className="relative w-full min-h-[500px] rounded-3xl bg-gradient-to-br from-secondary/50 to-secondary/30 border-2 border-dashed border-border p-8">
            {/* Floor Pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                currentColor 10px,
                currentColor 11px
              )`
            }} />
            
            {/* Tables Grid */}
            <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
              <AnimatePresence>
                {tables.map((table, index) => {
                  const config = getStatusConfig(table.status);
                  const stats = tableStats.get(table.id!);
                  const ShapeIcon = getShapeIcon(table.shape);
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={table.id}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="relative"
                    >
                      {/* Table with Chairs */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {/* Chairs */}
                        {renderChairs(table.chairs, table.shape)}
                        
                        {/* Table Surface */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`
                            relative z-10 flex flex-col items-center justify-center
                            bg-gradient-to-br ${config.bg}
                            border-2 ${config.border}
                            ${config.glow}
                            transition-all duration-300 cursor-pointer
                            ${table.shape === 'round' ? 'w-24 h-24 rounded-full' :
                              table.shape === 'rectangle' ? 'w-28 h-20 rounded-xl' :
                              'w-24 h-24 rounded-2xl'}
                          `}
                        >
                          {/* Table Number */}
                          <span className={`text-3xl font-bold ${config.text}`}>
                            {table.number}
                          </span>
                          
                          {/* Status Icon */}
                          <StatusIcon className={`w-4 h-4 ${config.text} mt-1`} />
                        </motion.div>
                      </div>
                      
                      {/* Table Info */}
                      <div className="text-center mt-2">
                        <p className="font-semibold text-foreground text-sm">{table.name}</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{table.chairs}</span>
                          <ShapeIcon className="w-3 h-3 mr-2" />
                        </div>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.border} ${config.text}`}>
                          {config.label}
                        </span>
                        
                        {/* Stats on hover */}
                        {stats && stats.totalOrders > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-xs space-y-0.5 p-2 rounded-lg bg-secondary/50"
                          >
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">طلبات:</span>
                              <span className="text-foreground font-medium">{stats.totalOrders}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">الإيراد:</span>
                              <span className="text-foreground font-medium">{stats.totalRevenue.toFixed(0)} ج.م</span>
                            </div>
                            <div className="flex justify-between gap-4 text-success">
                              <span>الربح:</span>
                              <span className="font-medium">{stats.totalProfit.toFixed(0)} ج.م</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {tables.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <UtensilsCrossed className="w-20 h-20 mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground text-lg">لا توجد طاولات</p>
                  <p className="text-sm text-muted-foreground">أضف طاولات من صفحة إدارة الطاولات</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/50" />
              <span className="text-sm text-muted-foreground">شاغرة - جاهزة للاستقبال</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/50" />
              <span className="text-sm text-muted-foreground">مشغولة - يوجد عملاء</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50" />
              <span className="text-sm text-muted-foreground">محجوزة - حجز مسبق</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-muted-foreground/30 border border-muted-foreground/50" />
              <span className="text-sm text-muted-foreground">كرسي</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
