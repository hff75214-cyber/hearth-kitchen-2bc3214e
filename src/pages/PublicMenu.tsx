import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Product, Category } from '@/lib/database';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MenuProductCard } from '@/components/MenuProductCard';
import { MenuFilters } from '@/components/MenuFilters';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function PublicMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        db.products.where('isActive').equals(true).toArray(),
        db.categories.toArray(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('[v0] Error loading menu data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchQuery && !product.name.includes(searchQuery) && !product.description?.includes(searchQuery)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && product.type !== selectedType) {
        return false;
      }

      // Price range filter
      if (product.salePrice < priceRange[0] || product.salePrice > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedType, priceRange]);

  return (
    <PublicLayout title="قائمة المنتجات" description="استكشف منتجاتنا المتميزة">
      <div className="space-y-8">
        {/* Filters Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            اكتشف المنتجات
          </h2>
          <MenuFilters
            categories={categories}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onTypeChange={setSelectedType}
            onPriceRangeChange={(min, max) => setPriceRange([min, max])}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            priceRange={priceRange}
          />
        </motion.section>

        {/* Results Section */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {isLoading ? (
            // Loading state
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900/20 border-t-orange-600 rounded-full"
                  />
                </div>
                <p className="mt-4 text-muted-foreground">جاري تحميل المنتجات...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12"
            >
              <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-900/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">لم نجد منتجات</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    عذراً، لم نجد منتجات تطابق معايير البحث الخاصة بك. يرجى محاولة تغيير المرشحات.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Products Grid
            <>
              <div className="flex items-center justify-between mb-6">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold text-foreground"
                >
                  {filteredProducts.length} منتج
                </motion.h3>
              </div>

              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => (
                    <MenuProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </motion.section>

        {/* Info Section */}
        {filteredProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-6 border border-orange-200 dark:border-orange-900/20"
          >
            <h3 className="text-lg font-bold text-foreground mb-2">معلومات سريعة</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• جميع الأسعار شاملة ضريبة القيمة المضافة</li>
              <li>• المنتجات المعروضة متوفرة حالياً في المتجر</li>
              <li>• يتم تحديث القائمة تلقائياً عند إضافة منتجات جديدة</li>
            </ul>
          </motion.section>
        )}
      </div>
    </PublicLayout>
  );
}
