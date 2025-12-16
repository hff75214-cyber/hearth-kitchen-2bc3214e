import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Edit,
} from 'lucide-react';
import { db, Product } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Only get stored products (not prepared items)
    const productsData = await db.products.where('type').equals('stored').toArray();
    setProducts(productsData);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !showLowStockOnly || product.quantity <= product.minQuantityAlert;
    return matchesSearch && matchesLowStock;
  });

  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantityAlert);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  const handleAdjustStock = async () => {
    if (!selectedProduct || adjustmentQuantity <= 0) return;

    const newQuantity = adjustmentType === 'add' 
      ? selectedProduct.quantity + adjustmentQuantity
      : Math.max(0, selectedProduct.quantity - adjustmentQuantity);

    await db.products.update(selectedProduct.id!, {
      quantity: newQuantity,
      updatedAt: new Date(),
    });

    toast({
      title: 'تم التعديل',
      description: `تم ${adjustmentType === 'add' ? 'إضافة' : 'خصم'} ${adjustmentQuantity} من ${selectedProduct.name}`,
    });

    setIsAdjustDialogOpen(false);
    setSelectedProduct(null);
    setAdjustmentQuantity(0);
    loadData();
  };

  const openAdjustDialog = (product: Product, type: 'add' | 'remove') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentQuantity(0);
    setIsAdjustDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المخزون</h1>
          <p className="text-muted-foreground mt-1">
            متابعة وإدارة كميات المنتجات المخزنة
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/20">
                <TrendingUp className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الوحدات</p>
                <p className="text-2xl font-bold text-foreground">{totalItems}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass shadow-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                <p className="text-2xl font-bold text-foreground">{totalValue.toFixed(0)} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`glass shadow-card ${lowStockProducts.length > 0 ? 'border-destructive/50' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${lowStockProducts.length > 0 ? 'bg-destructive/20' : 'bg-success/20'}`}>
                <AlertTriangle className={`w-6 h-6 ${lowStockProducts.length > 0 ? 'text-destructive' : 'text-success'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">منتجات منخفضة</p>
                <p className="text-2xl font-bold text-foreground">{lowStockProducts.length}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-warning flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                تنبيهات المخزون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30"
                  >
                    <TrendingDown className="w-4 h-4 text-warning" />
                    <span className="text-sm text-foreground">{product.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                      {product.quantity} {product.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <Card className="glass shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-secondary border-border"
              />
            </div>
            <Button
              variant={showLowStockOnly ? 'default' : 'outline'}
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={showLowStockOnly ? 'bg-warning text-warning-foreground' : 'border-border'}
            >
              <AlertTriangle className="w-4 h-4 ml-2" />
              المنخفض فقط
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="glass shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-right text-muted-foreground">المنتج</TableHead>
                <TableHead className="text-right text-muted-foreground">الفئة</TableHead>
                <TableHead className="text-right text-muted-foreground">الكمية</TableHead>
                <TableHead className="text-right text-muted-foreground">حد التنبيه</TableHead>
                <TableHead className="text-right text-muted-foreground">سعر التكلفة</TableHead>
                <TableHead className="text-right text-muted-foreground">القيمة</TableHead>
                <TableHead className="text-right text-muted-foreground">الحالة</TableHead>
                <TableHead className="text-right text-muted-foreground">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const isLowStock = product.quantity <= product.minQuantityAlert;
                const value = product.quantity * product.costPrice;
                
                return (
                  <TableRow key={product.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p>{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                        {product.quantity}
                      </span>
                      <span className="text-muted-foreground text-sm mr-1">{product.unit}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.minQuantityAlert}</TableCell>
                    <TableCell className="text-muted-foreground">{product.costPrice.toFixed(2)} ج.م</TableCell>
                    <TableCell className="text-foreground font-semibold">{value.toFixed(2)} ج.م</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.quantity === 0 ? 'bg-destructive/20 text-destructive' :
                        isLowStock ? 'bg-warning/20 text-warning' :
                        'bg-success/20 text-success'
                      }`}>
                        {product.quantity === 0 ? 'نفذ' : isLowStock ? 'منخفض' : 'متوفر'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-success/50 text-success hover:bg-success/10"
                          onClick={() => openAdjustDialog(product, 'add')}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => openAdjustDialog(product, 'remove')}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">لا توجد منتجات مخزنة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {adjustmentType === 'add' ? 'إضافة للمخزون' : 'خصم من المخزون'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      الكمية الحالية: {selectedProduct.quantity} {selectedProduct.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">الكمية</Label>
                <Input
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  className="bg-secondary border-border"
                  placeholder="أدخل الكمية"
                />
              </div>

              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الكمية الجديدة:</span>
                  <span className="font-bold text-foreground">
                    {adjustmentType === 'add'
                      ? selectedProduct.quantity + adjustmentQuantity
                      : Math.max(0, selectedProduct.quantity - adjustmentQuantity)
                    } {selectedProduct.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsAdjustDialogOpen(false)}
                  className="flex-1 border-border"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAdjustStock}
                  disabled={adjustmentQuantity <= 0}
                  className={`flex-1 ${
                    adjustmentType === 'add'
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  }`}
                >
                  {adjustmentType === 'add' ? (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4 ml-2" />
                      خصم
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}