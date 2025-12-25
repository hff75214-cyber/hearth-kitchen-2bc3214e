import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Filter,
  Image as ImageIcon,
  X,
  Check,
  Boxes,
  Calculator,
} from 'lucide-react';
import { db, Product, Category, RawMaterial, ProductIngredient, generateSKU, generateBarcode, calculateCostFromIngredients } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface IngredientInput {
  rawMaterialId: number;
  quantityUsed: number;
  materialName?: string;
  unit?: string;
  costPerUnit?: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [calculatedCost, setCalculatedCost] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    subcategory: '',
    type: 'prepared',
    preparationTime: 15,
    costPrice: 0,
    salePrice: 0,
    unit: 'قطعة',
    quantity: 0,
    minQuantityAlert: 5,
    sku: generateSKU(),
    barcode: generateBarcode(),
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsData, categoriesData, materialsData] = await Promise.all([
      db.products.toArray(),
      db.categories.toArray(),
      db.rawMaterials.toArray(),
    ]);
    setProducts(productsData);
    setCategories(categoriesData.filter(c => c.isActive));
    setRawMaterials(materialsData.filter(m => m.isActive));
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesType = filterType === 'all' || product.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let productId: number;
      
      if (editingProduct) {
        await db.products.update(editingProduct.id!, {
          ...formData,
          updatedAt: new Date(),
        });
        productId = editingProduct.id!;
        
        // Delete old ingredients and add new ones
        await db.productIngredients.where('productId').equals(productId).delete();
        
        toast({ title: 'تم التحديث', description: 'تم تحديث المنتج بنجاح' });
      } else {
        productId = await db.products.add({
          ...formData as Product,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as number;
        toast({ title: 'تمت الإضافة', description: 'تم إضافة المنتج بنجاح' });
      }
      
      // Save ingredients for prepared products
      if (formData.type === 'prepared' && ingredients.length > 0) {
        const ingredientsToAdd = ingredients
          .filter(ing => ing.rawMaterialId && ing.quantityUsed > 0)
          .map(ing => ({
            productId,
            rawMaterialId: ing.rawMaterialId,
            quantityUsed: ing.quantityUsed,
          }));
        
        if (ingredientsToAdd.length > 0) {
          await db.productIngredients.bulkAdd(ingredientsToAdd);
        }
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء حفظ المنتج', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      // Delete associated ingredients
      await db.productIngredients.where('productId').equals(id).delete();
      await db.products.delete(id);
      toast({ title: 'تم الحذف', description: 'تم حذف المنتج بنجاح' });
      loadData();
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    
    // Load existing ingredients
    if (product.type === 'prepared' && product.id) {
      const existingIngredients = await db.productIngredients
        .where('productId')
        .equals(product.id)
        .toArray();
      
      const ingredientsWithNames = existingIngredients.map(ing => {
        const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
        return {
          rawMaterialId: ing.rawMaterialId,
          quantityUsed: ing.quantityUsed,
          materialName: material?.name,
          unit: material?.unit,
        };
      });
      setIngredients(ingredientsWithNames);
    } else {
      setIngredients([]);
    }
    
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setIngredients([]);
    setCalculatedCost(0);
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      type: 'prepared',
      preparationTime: 15,
      costPrice: 0,
      salePrice: 0,
      unit: 'قطعة',
      quantity: 0,
      minQuantityAlert: 5,
      sku: generateSKU(),
      barcode: generateBarcode(),
      description: '',
      image: '',
      isActive: true,
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { rawMaterialId: 0, quantityUsed: 0, costPerUnit: 0 }]);
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    recalculateCost(updated);
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: number) => {
    const updated = [...ingredients];
    if (field === 'rawMaterialId') {
      const material = rawMaterials.find(m => m.id === value);
      updated[index] = {
        ...updated[index],
        rawMaterialId: value,
        materialName: material?.name,
        unit: material?.unit,
        costPerUnit: material?.costPerUnit || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
    recalculateCost(updated);
  };

  // Recalculate cost when ingredients change
  const recalculateCost = useCallback(async (ingredientsList: IngredientInput[]) => {
    setIsCalculating(true);
    try {
      const cost = await calculateCostFromIngredients(
        ingredientsList.map(i => ({ rawMaterialId: i.rawMaterialId, quantityUsed: i.quantityUsed }))
      );
      setCalculatedCost(cost);
    } catch (error) {
      console.error('Error calculating cost:', error);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  // Apply calculated cost to form
  const applyCalculatedCost = () => {
    setFormData(prev => ({ ...prev, costPrice: calculatedCost }));
    toast({
      title: 'تم تطبيق التكلفة',
      description: `تم تحديث سعر التكلفة إلى ${calculatedCost.toFixed(2)} ج.م`,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const profit = (formData.salePrice || 0) - (formData.costPrice || 0);
  const profitPercentage = formData.costPrice ? ((profit / formData.costPrice) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">المنتجات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة المأكولات والمشروبات والمنتجات
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="gradient-primary text-primary-foreground shadow-glow"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

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
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 bg-secondary border-border">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="prepared">مأكولات (تُحضّر)</SelectItem>
                <SelectItem value="stored">منتجات (مخزنة)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass shadow-card hover:shadow-glow transition-all duration-300 overflow-hidden group">
                <div className="relative h-40 bg-secondary/50 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.type === 'prepared' ? 'bg-primary/80 text-primary-foreground' : 'bg-info/80 text-info-foreground'
                    }`}>
                      {product.type === 'prepared' ? 'يُحضّر' : 'مخزون'}
                    </span>
                    {!product.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground">
                        غير متاح
                      </span>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <p className="font-bold text-primary">{product.salePrice.toFixed(2)} ج.م</p>
                  </div>
                  
                  {product.type === 'stored' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        product.quantity <= product.minQuantityAlert ? 'bg-destructive animate-pulse' : 'bg-success'
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        الكمية: {product.quantity} {product.unit}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border hover:bg-secondary"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(product.id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">لا توجد منتجات</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl bg-secondary border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute -top-2 -left-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">اسم المنتج *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="مثال: كريب سادة"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">الفئة *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">نوع المنتج *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'prepared' | 'stored') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepared">مأكولات (تُحضّر عند الطلب)</SelectItem>
                    <SelectItem value="stored">منتجات (مخزنة بكمية)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'prepared' && (
                <div className="space-y-2">
                  <Label className="text-foreground">وقت التحضير *</Label>
                  <Select
                    value={String(formData.preparationTime || 15)}
                    onValueChange={(value) => setFormData({ ...formData, preparationTime: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 دقائق</SelectItem>
                      <SelectItem value="10">10 دقائق</SelectItem>
                      <SelectItem value="15">15 دقيقة</SelectItem>
                      <SelectItem value="20">20 دقيقة</SelectItem>
                      <SelectItem value="25">25 دقيقة</SelectItem>
                      <SelectItem value="30">30 دقيقة</SelectItem>
                      <SelectItem value="45">45 دقيقة</SelectItem>
                      <SelectItem value="60">ساعة</SelectItem>
                      <SelectItem value="90">ساعة ونصف</SelectItem>
                      <SelectItem value="120">ساعتين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Ingredients Section for Prepared Products */}
              {formData.type === 'prepared' && rawMaterials.length > 0 && (
                <div className="md:col-span-2 space-y-3 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-primary" />
                      المواد الخام المستخدمة
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addIngredient}
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Plus className="w-4 h-4 ml-1" />
                      إضافة مادة
                    </Button>
                  </div>
                  
                  {ingredients.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      لم يتم إضافة مواد خام. أضف المواد التي يستهلكها هذا المنتج.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Select
                            value={String(ingredient.rawMaterialId || '')}
                            onValueChange={(value) => updateIngredient(index, 'rawMaterialId', parseInt(value))}
                          >
                            <SelectTrigger className="flex-1 bg-secondary border-border">
                              <SelectValue placeholder="اختر المادة الخام" />
                            </SelectTrigger>
                            <SelectContent>
                              {rawMaterials.map((material) => (
                                <SelectItem key={material.id} value={String(material.id)}>
                                  {material.name} ({material.unit}) - {material.costPerUnit.toFixed(2)} ج.م
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={ingredient.quantityUsed || ''}
                            onChange={(e) => updateIngredient(index, 'quantityUsed', parseFloat(e.target.value) || 0)}
                            className="w-24 bg-secondary border-border"
                            placeholder="الكمية"
                          />
                          {ingredient.unit && (
                            <span className="text-sm text-muted-foreground w-12">{ingredient.unit}</span>
                          )}
                          {ingredient.costPerUnit && ingredient.quantityUsed > 0 && (
                            <span className="text-xs text-primary font-medium w-20">
                              = {(ingredient.costPerUnit * ingredient.quantityUsed).toFixed(2)} ج.م
                            </span>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeIngredient(index)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {/* Calculated Cost Display */}
                      {ingredients.length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-info/10 border border-info/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calculator className="w-4 h-4 text-info" />
                              <span className="text-sm text-info">التكلفة المحسوبة من المواد الخام:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-info">
                                {isCalculating ? '...' : `${calculatedCost.toFixed(2)} ج.م`}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={applyCalculatedCost}
                                disabled={isCalculating || calculatedCost === 0}
                                className="h-7 text-xs border-info text-info hover:bg-info/10"
                              >
                                تطبيق
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {formData.type === 'prepared' && rawMaterials.length === 0 && (
                <div className="md:col-span-2 p-4 rounded-xl bg-warning/10 border border-warning/30">
                  <p className="text-sm text-warning text-center">
                    لم يتم إضافة مواد خام بعد. أضف المواد الخام من صفحة "المواد الخام" أولاً.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-foreground">الوحدة</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="قطعة">قطعة</SelectItem>
                    <SelectItem value="كوب">كوب</SelectItem>
                    <SelectItem value="طبق">طبق</SelectItem>
                    <SelectItem value="علبة">علبة</SelectItem>
                    <SelectItem value="كيلو">كيلو</SelectItem>
                    <SelectItem value="جرام">جرام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center justify-between">
                  <span>سعر التكلفة *</span>
                  {formData.type === 'prepared' && calculatedCost > 0 && formData.costPrice !== calculatedCost && (
                    <span className="text-xs text-info">
                      (التكلفة المحسوبة: {calculatedCost.toFixed(2)} ج.م)
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">سعر البيع *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Profit Display */}
              <div className="md:col-span-2 p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="flex items-center justify-between">
                  <span className="text-success">الربح المتوقع:</span>
                  <div className="text-left">
                    <span className="font-bold text-success">{profit.toFixed(2)} ج.م</span>
                    <span className="text-sm text-muted-foreground mr-2">({profitPercentage}%)</span>
                  </div>
                </div>
              </div>

              {formData.type === 'stored' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-foreground">الكمية المتاحة</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">تنبيه عند الكمية</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.minQuantityAlert}
                      onChange={(e) => setFormData({ ...formData, minQuantityAlert: parseInt(e.target.value) || 0 })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-foreground">رمز المنتج (SKU)</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="اختياري"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">الباركود</Label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="اختياري"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-foreground">الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="وصف المنتج أو المكونات"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label className="text-foreground">المنتج متاح للبيع</Label>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-border"
              >
                إلغاء
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground">
                <Check className="w-4 h-4 ml-2" />
                {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}