import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db, Product } from '@/lib/database';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Package, AlertCircle, Info } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { formatCurrentPrice } = useCurrency();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const id = parseInt(productId, 10);
        const prod = await db.products.get(id);
        setProduct(prod || null);
      } catch (error) {
        console.error('[v0] Error loading product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-orange-200 dark:border-orange-900/20">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">المنتج غير موجود</h2>
              <p className="text-muted-foreground mb-6">للأسف، المنتج المطلوب غير موجود</p>
              <Button onClick={() => navigate('/menu')} className="gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة للقائمة
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </PublicLayout>
    );
  }

  const stockStatus = product.quantity > (product.minQuantityAlert || 10) ? 'متوفر' : 'محدود';
  const stockColor = product.quantity > (product.minQuantityAlert || 10) ? 'success' : 'warning';

  return (
    <PublicLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 mb-6 font-medium group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          العودة للقائمة
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border-orange-100 dark:border-orange-900/20">
              <CardContent className="p-0">
                <div className="w-full h-96 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-muted-foreground opacity-30" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock and Type Info */}
            <div className="flex gap-3 mt-4">
              <Badge
                className={`flex-1 justify-center py-2 text-sm ${
                  stockColor === 'success'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}
              >
                {stockStatus}
              </Badge>
              <Badge className="flex-1 justify-center py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                {product.type === 'prepared' ? 'محضّر' : 'جاهز'}
              </Badge>
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-start"
          >
            {/* Header */}
            <div className="mb-6">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 mb-3">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Price Section */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-100 dark:border-orange-900/20 mb-6">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">السعر</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-orange-600 dark:text-orange-500">
                    {formatCurrentPrice(product.salePrice)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="space-y-3 mb-6">
              {/* Quantity */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <Package className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">الكمية المتاحة</p>
                  <p className="font-bold text-foreground">{product.quantity} {product.unit}</p>
                </div>
              </div>

              {/* Preparation Time */}
              {product.preparationTime && product.type === 'prepared' && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">وقت التحضير</p>
                    <p className="font-bold text-foreground">{product.preparationTime} دقيقة</p>
                  </div>
                </div>
              )}

              {/* Min Quantity Alert */}
              {product.minQuantityAlert && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">الحد الأدنى للتنبيه</p>
                    <p className="font-bold text-foreground">{product.minQuantityAlert} {product.unit}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients Section */}
            {product.ingredients && product.ingredients.length > 0 && (
              <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 mb-6">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-3">المكونات الأساسية:</h3>
                  <div className="space-y-2">
                    {product.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-foreground">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <Button
              onClick={() => navigate('/menu')}
              className="w-full h-12 text-base font-bold gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              العودة للقائمة
            </Button>
          </motion.div>
        </div>

        {/* Full Description */}
        {product.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <Card className="border-orange-100 dark:border-orange-900/20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">وصف المنتج</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PublicLayout>
  );
}
