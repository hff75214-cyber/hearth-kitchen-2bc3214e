import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gift,
  Star,
  Trophy,
  Users,
  TrendingUp,
  Plus,
  Search,
  Crown,
  Medal,
  Award,
  Coins,
} from 'lucide-react';
import { toast } from 'sonner';
import { db, LoyaltyProgram, LoyaltyReward, LoyaltyTransaction, Customer } from '@/lib/database';

const tierConfig = {
  bronze: { name: 'برونزي', icon: Medal, color: 'bg-amber-700 text-white', minSpent: 0 },
  silver: { name: 'فضي', icon: Award, color: 'bg-gray-400 text-white', minSpent: 1000 },
  gold: { name: 'ذهبي', icon: Trophy, color: 'bg-yellow-500 text-white', minSpent: 5000 },
  platinum: { name: 'بلاتيني', icon: Crown, color: 'bg-purple-600 text-white', minSpent: 15000 },
};

const Loyalty = () => {
  const [members, setMembers] = useState<LoyaltyProgram[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [newReward, setNewReward] = useState({ name: '', description: '', pointsCost: 0 });
  const [selectedMember, setSelectedMember] = useState<LoyaltyProgram | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loyaltyData = await db.loyaltyPrograms.toArray();
    const rewardsData = await db.loyaltyRewards.toArray();
    const transactionsData = await db.loyaltyTransactions.orderBy('createdAt').reverse().limit(100).toArray();
    setMembers(loyaltyData);
    setRewards(rewardsData);
    setTransactions(transactionsData);
  };

  const filteredMembers = members.filter(m =>
    m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.customerPhone.includes(searchQuery)
  );

  const totalMembers = members.length;
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  const goldAndAbove = members.filter(m => m.tier === 'gold' || m.tier === 'platinum').length;

  const handleAddReward = async () => {
    if (!newReward.name || newReward.pointsCost <= 0) {
      toast.error('يرجى إدخال اسم المكافأة والنقاط المطلوبة');
      return;
    }

    await db.loyaltyRewards.add({
      ...newReward,
      isActive: true,
      createdAt: new Date(),
    });

    toast.success('تم إضافة المكافأة بنجاح');
    setNewReward({ name: '', description: '', pointsCost: 0 });
    setIsAddRewardOpen(false);
    loadData();
  };

  const handleRedeemReward = async (reward: LoyaltyReward) => {
    if (!selectedMember) return;
    
    if (selectedMember.points < reward.pointsCost) {
      toast.error('نقاط العميل غير كافية');
      return;
    }

    await db.loyaltyPrograms.update(selectedMember.id!, {
      points: selectedMember.points - reward.pointsCost,
      updatedAt: new Date(),
    });

    await db.loyaltyTransactions.add({
      customerId: selectedMember.customerId,
      type: 'redeem',
      points: reward.pointsCost,
      description: `استبدال مكافأة: ${reward.name}`,
      createdAt: new Date(),
    });

    toast.success(`تم استبدال ${reward.name} بنجاح`);
    setSelectedMember(null);
    loadData();
  };

  const handleAddPoints = async () => {
    if (!selectedMember || redeemPoints <= 0) return;

    await db.loyaltyPrograms.update(selectedMember.id!, {
      points: selectedMember.points + redeemPoints,
      updatedAt: new Date(),
    });

    await db.loyaltyTransactions.add({
      customerId: selectedMember.customerId,
      type: 'earn',
      points: redeemPoints,
      description: 'إضافة نقاط يدوية',
      createdAt: new Date(),
    });

    toast.success(`تم إضافة ${redeemPoints} نقطة`);
    setRedeemPoints(0);
    setSelectedMember(null);
    loadData();
  };

  const getTierBadge = (tier: LoyaltyProgram['tier']) => {
    const config = tierConfig[tier];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Gift className="w-8 h-8 text-primary" />
          برنامج الولاء
        </h1>
        <p className="text-muted-foreground mt-1">إدارة نقاط ومكافآت العملاء</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأعضاء</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي النقاط</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ذهبي وبلاتيني</p>
                <p className="text-2xl font-bold">{goldAndAbove}</p>
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المكافآت المتاحة</p>
                <p className="text-2xl font-bold">{rewards.filter(r => r.isActive).length}</p>
              </div>
              <Gift className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">الأعضاء</TabsTrigger>
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
          <TabsTrigger value="transactions">سجل المعاملات</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>أعضاء برنامج الولاء</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث بالاسم أو الهاتف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>إجمالي الإنفاق</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.customerName}</TableCell>
                      <TableCell>{member.customerPhone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          {member.points.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{member.totalSpent.toFixed(2)} ج.م</TableCell>
                      <TableCell>{getTierBadge(member.tier)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedMember(member)}
                            >
                              إدارة النقاط
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>إدارة نقاط {member.customerName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                                <p className="text-3xl font-bold text-primary">{member.points}</p>
                                <p className="text-sm">نقطة</p>
                              </div>

                              <div className="space-y-2">
                                <Label>إضافة نقاط</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    value={redeemPoints || ''}
                                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                                    placeholder="عدد النقاط"
                                  />
                                  <Button onClick={handleAddPoints}>إضافة</Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>استبدال مكافأة</Label>
                                <div className="space-y-2">
                                  {rewards.filter(r => r.isActive).map((reward) => (
                                    <div
                                      key={reward.id}
                                      className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                      <div>
                                        <p className="font-medium">{reward.name}</p>
                                        <p className="text-sm text-muted-foreground">{reward.pointsCost} نقطة</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={member.points >= reward.pointsCost ? 'default' : 'outline'}
                                        disabled={member.points < reward.pointsCost}
                                        onClick={() => handleRedeemReward(reward)}
                                      >
                                        استبدال
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا يوجد أعضاء في برنامج الولاء
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>المكافآت المتاحة</CardTitle>
                <Dialog open={isAddRewardOpen} onOpenChange={setIsAddRewardOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة مكافأة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة مكافأة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>اسم المكافأة</Label>
                        <Input
                          value={newReward.name}
                          onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                          placeholder="مثال: خصم 10%"
                        />
                      </div>
                      <div>
                        <Label>الوصف</Label>
                        <Input
                          value={newReward.description}
                          onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                          placeholder="وصف المكافأة"
                        />
                      </div>
                      <div>
                        <Label>النقاط المطلوبة</Label>
                        <Input
                          type="number"
                          value={newReward.pointsCost || ''}
                          onChange={(e) => setNewReward({ ...newReward, pointsCost: Number(e.target.value) })}
                          placeholder="100"
                        />
                      </div>
                      <Button onClick={handleAddReward} className="w-full">
                        إضافة المكافأة
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className={!reward.isActive ? 'opacity-50' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                        <Gift className="w-6 h-6 text-primary" />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="text-xl font-bold">{reward.pointsCost}</span>
                        <span className="text-muted-foreground">نقطة</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {rewards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد مكافآت. أضف مكافأة جديدة للبدء.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {new Date(tx.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'earn' ? 'default' : 'secondary'}>
                          {tx.type === 'earn' ? 'كسب' : 'استبدال'}
                        </Badge>
                      </TableCell>
                      <TableCell className={tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.points}
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد معاملات بعد
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Loyalty;
