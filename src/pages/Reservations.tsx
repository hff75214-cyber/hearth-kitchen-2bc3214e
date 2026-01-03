import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarDays,
  Clock,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  Phone,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay, isToday, isTomorrow, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { db, TableReservation, RestaurantTable } from '@/lib/database';

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-500 text-white' },
  confirmed: { label: 'مؤكد', color: 'bg-green-500 text-white' },
  cancelled: { label: 'ملغي', color: 'bg-red-500 text-white' },
  completed: { label: 'مكتمل', color: 'bg-blue-500 text-white' },
};

const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const Reservations = () => {
  const [reservations, setReservations] = useState<TableReservation[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    tableId: 0,
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    reservationTime: '19:00',
    duration: 90,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    const tablesData = await db.restaurantTables.where('isActive').equals(1).toArray();
    setTables(tablesData);

    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    const reservationsData = await db.tableReservations
      .where('reservationDate')
      .between(start, end)
      .toArray();
    setReservations(reservationsData);
  };

  const todayReservations = reservations.filter(r => r.status !== 'cancelled');
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  const handleAddReservation = async () => {
    if (!newReservation.tableId || !newReservation.customerName || !newReservation.customerPhone) {
      toast.error('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    const table = tables.find(t => t.id === newReservation.tableId);
    if (!table) return;

    await db.tableReservations.add({
      tableId: newReservation.tableId,
      tableName: table.name,
      customerName: newReservation.customerName,
      customerPhone: newReservation.customerPhone,
      guestCount: newReservation.guestCount,
      reservationDate: selectedDate,
      reservationTime: newReservation.reservationTime,
      duration: newReservation.duration,
      status: 'pending',
      notes: newReservation.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    toast.success('تم إضافة الحجز بنجاح');
    setNewReservation({
      tableId: 0,
      customerName: '',
      customerPhone: '',
      guestCount: 2,
      reservationTime: '19:00',
      duration: 90,
      notes: '',
    });
    setIsAddOpen(false);
    loadData();
  };

  const handleUpdateStatus = async (id: number, status: TableReservation['status']) => {
    await db.tableReservations.update(id, { status, updatedAt: new Date() });
    toast.success('تم تحديث حالة الحجز');
    loadData();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'اليوم';
    if (isTomorrow(date)) return 'غداً';
    return format(date, 'EEEE d MMMM', { locale: ar });
  };

  const getAvailableTables = () => {
    const reservedTableIds = reservations
      .filter(r => r.status !== 'cancelled' && r.reservationTime === newReservation.reservationTime)
      .map(r => r.tableId);
    return tables.filter(t => !reservedTableIds.includes(t.id!));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary" />
            الحجوزات
          </h1>
          <p className="text-muted-foreground mt-1">إدارة حجوزات الطاولات</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              حجز جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>حجز جديد - {getDateLabel(selectedDate)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الوقت</Label>
                  <Select
                    value={newReservation.reservationTime}
                    onValueChange={(v) => setNewReservation({ ...newReservation, reservationTime: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المدة (دقيقة)</Label>
                  <Select
                    value={String(newReservation.duration)}
                    onValueChange={(v) => setNewReservation({ ...newReservation, duration: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">ساعة</SelectItem>
                      <SelectItem value="90">ساعة ونصف</SelectItem>
                      <SelectItem value="120">ساعتين</SelectItem>
                      <SelectItem value="180">3 ساعات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>الطاولة</Label>
                <Select
                  value={String(newReservation.tableId)}
                  onValueChange={(v) => setNewReservation({ ...newReservation, tableId: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طاولة" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTables().map((table) => (
                      <SelectItem key={table.id} value={String(table.id)}>
                        {table.name} ({table.chairs} مقاعد)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>عدد الضيوف</Label>
                <Input
                  type="number"
                  min={1}
                  value={newReservation.guestCount}
                  onChange={(e) => setNewReservation({ ...newReservation, guestCount: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label>اسم العميل</Label>
                <Input
                  value={newReservation.customerName}
                  onChange={(e) => setNewReservation({ ...newReservation, customerName: e.target.value })}
                  placeholder="الاسم الكامل"
                />
              </div>

              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={newReservation.customerPhone}
                  onChange={(e) => setNewReservation({ ...newReservation, customerPhone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                />
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <Button onClick={handleAddReservation} className="w-full">
                تأكيد الحجز
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">حجوزات {getDateLabel(selectedDate)}</p>
                <p className="text-2xl font-bold">{todayReservations.length}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مؤكدة</p>
                <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الطاولات المتاحة</p>
                <p className="text-2xl font-bold">{tables.length}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              التقويم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border pointer-events-auto"
              locale={ar}
            />
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedDate(new Date())}
              >
                اليوم
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedDate(addDays(new Date(), 1))}
              >
                غداً
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reservations List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>حجوزات {getDateLabel(selectedDate)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوقت</TableHead>
                  <TableHead>الطاولة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الضيوف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations
                  .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime))
                  .map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {reservation.reservationTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                          {reservation.tableName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {reservation.customerName}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {reservation.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {reservation.guestCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[reservation.status].color}>
                          {statusConfig[reservation.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {reservation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(reservation.id!, 'confirmed')}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(reservation.id!, 'cancelled')}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(reservation.id!, 'completed')}
                            >
                              مكتمل
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {reservations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد حجوزات لهذا اليوم
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reservations;
