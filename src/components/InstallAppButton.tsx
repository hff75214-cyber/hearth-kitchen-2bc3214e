import { useState } from 'react';
import { Download, Check, Monitor, Smartphone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePWA } from '@/hooks/usePWA';
import { toast } from '@/hooks/use-toast';

export function InstallAppButton() {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    
    if (success) {
      toast({
        title: 'تم التثبيت بنجاح!',
        description: 'يمكنك الآن فتح التطبيق من سطح المكتب أو الشاشة الرئيسية',
      });
      setShowDialog(false);
    }
  };

  if (isInstalled) {
    return (
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            التطبيق مثبت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">التطبيق مثبت بالفعل</p>
              <p className="text-sm text-muted-foreground">
                يمكنك الوصول للتطبيق من سطح المكتب أو الشاشة الرئيسية
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            تثبيت التطبيق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            قم بتثبيت النظام كتطبيق مستقل للوصول السريع والعمل بدون إنترنت
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Monitor className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">كمبيوتر</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">موبايل</span>
            </div>
          </div>

          {isInstallable ? (
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full gradient-primary text-primary-foreground"
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full ml-2" />
                  جاري التثبيت...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 ml-2" />
                  تثبيت الآن
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setShowDialog(true)}
              variant="outline"
              className="w-full"
            >
              <Info className="w-4 h-4 ml-2" />
              طريقة التثبيت
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">طريقة تثبيت التطبيق</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {isIOS ? (
              <div className="space-y-3">
                <p className="font-medium text-foreground">للتثبيت على iPhone أو iPad:</p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>اضغط على زر المشاركة في أسفل الشاشة</li>
                  <li>مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية"</li>
                  <li>اضغط "إضافة" في أعلى الشاشة</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-foreground">للتثبيت:</p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>افتح قائمة المتصفح (النقاط الثلاث ⋮)</li>
                  <li>اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</li>
                  <li>اضغط "تثبيت" للتأكيد</li>
                </ol>
              </div>
            )}
            
            <div className="p-3 rounded-lg bg-info/10 border border-info/30 text-sm text-muted-foreground">
              <p>
                <strong>ملاحظة:</strong> بعد التثبيت، سيظهر التطبيق على سطح المكتب أو الشاشة الرئيسية ويمكنك فتحه مباشرة بدون متصفح.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
