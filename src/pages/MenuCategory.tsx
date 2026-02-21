import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Product, Category } from '@/lib/database';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MenuProductCard } from '@/components/MenuProductCard';
import { MenuFilters } from '@/components/MenuFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function MenuCategory() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Load data
  useEffect(() => {
    loadData();
  }, [categoryName]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        db.products.toArray(),
        db.categories.toArray(),
      ]);

      // Filter only active products
      const activeProducts = productsData.filter(p => p.isActive);
      setProducts(activeProducts);
      setCategories(categoriesData.filter(c => c.isActive));

      // Find the current category
      if (categoryName) {
        const currentCat = categoriesData.find((c) => c.name === decodeURIComponent(categoryName));
        setCategory(currentCat || null);
      }
    } catch (error) {
      console.error('[v0] Error loading category data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products for this category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter - show only products from this category
      if (product.category !== decodeURIComponent(categoryName || '')) {
        return false;
      }

      // Search filter - case insensitive
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDescription = product.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) {
          return false;
        }
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
  }, [products, searchQuery, selectedType, priceRange, categoryName]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900/20 border-t-orange-600 rounded-full"
          />
        </div>
      </PublicLayout>
    );
  }

  if (!category) {
    return (
      <PublicLayout>
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
              <h3 className="text-lg font-bold text-foreground mb-2">الفئة غير موجودة</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                عذراً، الفئة التي تبحث عنها غير موجودة. يرجى العودة إلى القائمة الرئيسية.
              </p>
              <Button onClick={() => navigate('/menu')} variant="outline" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة إلى القائمة
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout title={category.name} description={`استكشف منتجات ${category.name}`}>
      <div className="space-y-8">
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <Button
              onClick={() => navigate('/menu')}
              variant="outline"
              size="sm"
              className="mb-4 gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{category.name}</h2>
            {category.description && (
              <p className="text-muted-foreground mt-2">{category.description}</p>
            )}
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <MenuFilters
            categories={categories}
            onSearchChange={setSearchQuery}
            onCategoryChange={() => {}}
            onTypeChange={setSelectedType}
            onPriceRangeChange={(min, max) => setPriceRange([min, max])}
            searchQuery={searchQuery}
            selectedCategory={category.name}
            selectedType={selectedType}
            priceRange={priceRange}
          />
        </motion.section>

        {/* Results Section */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {filteredProducts.length === 0 ? (
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
                    عذراً، لم نجد منتجات في هذه الفئة تطابق معايير البحث الخاصة بك.
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
      </div>
    </PublicLayout>
  );
}
