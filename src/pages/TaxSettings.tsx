import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Percent, Save, Loader2, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurant } from '@/hooks/useRestaurant';

interface TaxSetting {
  id: string;
  restaurant_id: string;
  tax_type: string;
  name: string;
  rate: number;
  is_enabled: boolean;
  min_price_threshold: number;
  applicable_categories: string[];
}

export default function TaxSettings() {
  const { restaurantId } = useRestaurant();
  const [taxes, setTaxes] = useState<TaxSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    fetchTaxes();
  }, [restaurantId]);

  const fetchTaxes = async () => {
    if (!restaurantId) return;
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (!error && data) {
      setTaxes(data);
    }
    setIsLoading(false);
  };

  const handleToggle = async (taxType: string, enabled: boolean) => {
    if (!restaurantId) return;
    
    const { error } = await supabase
      .from('tax_settings')
      .update({ is_enabled: enabled })
      .eq('restaurant_id', restaurantId)
      .eq('tax_type', taxType);

    if (!error) {
      setTaxes(prev => prev.map(t => t.tax_type === taxType ? { ...t, is_enabled: enabled } : t));
      toast({
        title: enabled ? 'تم التفعيل ✅' : 'تم التعطيل',
        description: `${taxType === 'vat' ? 'ضريبة القيمة المضافة' : 'ضريبة الجدول'} ${enabled ? 'مفعّلة' : 'معطّلة'} الآن`,
      });
    }
  };

  const handleSave = async (taxType: string, rate: number, minThreshold: number) => {
    if (!restaurantId) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('tax_settings')
      .update({ rate, min_price_threshold: minThreshold })
      .eq('restaurant_id', restaurantId)
      .eq('tax_type', taxType);

    if (!error) {
      setTaxes(prev => prev.map(t => t.tax_type === taxType ? { ...t, rate, min_price_threshold: minThreshold } : t));
      toast({ title: 'تم الحفظ ✅', description: 'تم تحديث إعدادات الضريبة بنجاح' });
    } else {
      toast({ title: 'خطأ', description: 'فشل حفظ الإعدادات', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const vatTax = taxes.find(t => t.tax_type === 'vat');
  const tableTax = taxes.find(t => t.tax_type === 'table_tax');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Receipt className="w-7 h-7 text-primary" />
          إعدادات الضرائب
        </h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة ضريبة القيمة المضافة وضريبة الجدول</p>
      </div>

      {/* Info Card */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium mb-1">كيف تعمل الضرائب؟</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• <strong>ضريبة القيمة المضافة (VAT)</strong>: تُطبَّق كنسبة مئوية على سعر المنتج (مثلاً 14%)</li>
              <li>• <strong>ضريبة الجدول</strong>: ضريبة ثابتة تُفرض على منتجات محددة (مثل المشروبات الغازية والمعسّل)</li>
              <li>• يمكنك تحديد حد أدنى للسعر - المنتجات بسعر أقل لن تُطبَّق عليها الضريبة</li>
              <li>• الضرائب تُحسب تلقائياً عند البيع في نقطة البيع</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* VAT Card */}
      {vatTax && <TaxCard tax={vatTax} onToggle={handleToggle} onSave={handleSave} isSaving={isSaving} />}

      {/* Table Tax Card */}
      {tableTax && <TaxCard tax={tableTax} onToggle={handleToggle} onSave={handleSave} isSaving={isSaving} />}
    </div>
  );
}

function TaxCard({ tax, onToggle, onSave, isSaving }: {
  tax: TaxSetting;
  onToggle: (type: string, enabled: boolean) => void;
  onSave: (type: string, rate: number, minThreshold: number) => void;
  isSaving: boolean;
}) {
  const [rate, setRate] = useState(tax.rate);
  const [minThreshold, setMinThreshold] = useState(tax.min_price_threshold);
  const isVAT = tax.tax_type === 'vat';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`glass shadow-card ${tax.is_enabled ? 'border-primary/30' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                tax.is_enabled ? 'bg-primary/10' : 'bg-muted'
              }`}>
                {isVAT ? <Percent className="w-6 h-6 text-primary" /> : <Receipt className="w-6 h-6 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-lg">{tax.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isVAT ? 'Value Added Tax - ضريبة على القيمة المضافة' : 'Table Tax - ضريبة جدول على منتجات محددة'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={tax.is_enabled ? 'default' : 'secondary'}>
                {tax.is_enabled ? 'مفعّلة' : 'معطّلة'}
              </Badge>
              <Switch checked={tax.is_enabled} onCheckedChange={(val) => onToggle(tax.tax_type, val)} />
            </div>
          </div>
        </CardHeader>
        
        {tax.is_enabled && (
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نسبة الضريبة (%)</Label>
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={0.5}
                  className="h-11 bg-secondary"
                  placeholder="مثال: 14"
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى للسعر (ج.م)</Label>
                <Input
                  type="number"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={1}
                  className="h-11 bg-secondary"
                  placeholder="0 = تطبق على الكل"
                />
                <p className="text-xs text-muted-foreground">
                  المنتجات بسعر أقل من هذا المبلغ لن تُطبَّق عليها الضريبة (0 = تطبق على الجميع)
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm font-medium text-foreground mb-2">مثال على الحساب:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>سعر المنتج: 100 ج.م</p>
                <p>الضريبة ({rate}%): {(100 * rate / 100).toFixed(2)} ج.م</p>
                <p className="font-medium text-foreground">الإجمالي: {(100 + 100 * rate / 100).toFixed(2)} ج.م</p>
              </div>
            </div>

            <Button
              onClick={() => onSave(tax.tax_type, rate, minThreshold)}
              disabled={isSaving}
              className="w-full sm:w-auto gradient-primary text-primary-foreground"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
              حفظ الإعدادات
            </Button>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
