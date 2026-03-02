import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Lock, Check, X, Shield, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useFeatureToggles, featureMetadata } from '@/hooks/useFeatureToggles';
import { useRestaurant } from '@/hooks/useRestaurant';

export default function FeatureSettings() {
  const { restaurant, restaurantId } = useRestaurant();
  const { toggles, isLoading, isFeatureEnabled, updateToggle } = useFeatureToggles(restaurantId);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const handleUnlock = () => {
    const correctPassword = restaurant?.settings_password || '123456789';
    if (passwordInput === correctPassword) {
      setIsUnlocked(true);
      toast({ title: 'تم فتح القفل ✅', description: 'يمكنك الآن تعديل الوظائف' });
    } else {
      toast({ title: 'خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' });
    }
    setPasswordInput('');
  };

  const handleToggle = async (featureKey: string, newValue: boolean) => {
    // Prevent disabling essential features
    const essentialFeatures = ['dashboard', 'pos', 'settings', 'about'];
    if (essentialFeatures.includes(featureKey) && !newValue) {
      toast({ title: 'تنبيه', description: 'لا يمكن تعطيل هذه الوظيفة الأساسية', variant: 'destructive' });
      return;
    }

    setUpdatingKey(featureKey);
    const result = await updateToggle(featureKey, newValue);
    setUpdatingKey(null);

    if (result?.error) {
      toast({ title: 'خطأ', description: 'فشل تحديث الوظيفة', variant: 'destructive' });
    } else {
      const meta = featureMetadata[featureKey];
      toast({
        title: newValue ? `تم تفعيل ${meta?.name}` : `تم تعطيل ${meta?.name}`,
        description: newValue ? 'الوظيفة متاحة الآن في النظام' : 'الوظيفة مخفية من النظام',
      });
    }
  };

  // Group features by category
  const categories = Array.from(new Set(Object.values(featureMetadata).map(m => m.category)));
  
  const filteredFeatures = Object.entries(featureMetadata).filter(([key, meta]) => {
    if (!searchQuery) return true;
    return meta.name.includes(searchQuery) || meta.description.includes(searchQuery) || key.includes(searchQuery);
  });

  if (!isUnlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <Card className="glass shadow-card">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">تفعيل الوظائف</h2>
                <p className="text-sm text-muted-foreground">أدخل كلمة مرور الإعدادات للمتابعة</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-4">
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="كلمة مرور الإعدادات"
                  className="h-12 text-center text-lg bg-secondary"
                  autoFocus
                />
                <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground font-semibold">
                  <Shield className="w-5 h-5 ml-2" />
                  فتح القفل
                </Button>
              </form>
              <p className="text-xs text-muted-foreground">كلمة المرور الافتراضية: 123456789</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-7 h-7 text-primary" />
            تفعيل وتعطيل الوظائف
          </h1>
          <p className="text-sm text-muted-foreground mt-1">تحكم في الوظائف المتاحة في نظامك</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {toggles.filter(t => t.is_enabled).length} / {toggles.length} مفعّل
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث عن وظيفة..."
          className="pr-10 bg-secondary"
        />
      </div>

      {/* Feature Cards by Category */}
      {categories.map(category => {
        const categoryFeatures = filteredFeatures.filter(([, meta]) => meta.category === category);
        if (categoryFeatures.length === 0) return null;

        return (
          <Card key={category} className="glass shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-foreground">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {categoryFeatures.map(([key, meta]) => {
                const enabled = isFeatureEnabled(key);
                const isEssential = ['dashboard', 'pos', 'settings', 'about'].includes(key);
                const isUpdating = updatingKey === key;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      enabled ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-sm">{meta.name}</span>
                          {isEssential && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">أساسي</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : enabled ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Switch
                        checked={enabled}
                        onCheckedChange={(val) => handleToggle(key, val)}
                        disabled={isEssential || isUpdating}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
