import { motion } from 'framer-motion';
import { Product } from '@/lib/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface MenuProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

export function MenuProductCard({ product, index = 0, onClick }: MenuProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.05,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -8,
      transition: { duration: 0.2 },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.95 },
    visible: { scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="h-full cursor-pointer group"
    >
      <Card className="overflow-hidden h-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl border-orange-100 dark:border-orange-900/20 transition-all">
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
          {product.image ? (
            <motion.img
              variants={imageVariants}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground">لا توجد صورة</p>
              </div>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
            {product.category && (
              <Badge variant="secondary" className="bg-orange-500/90 text-white border-0 text-xs">
                {product.category}
              </Badge>
            )}
            {product.type === 'prepared' && (
              <Badge variant="outline" className="bg-green-500/90 text-white border-0 text-xs">
                مطبوخ
              </Badge>
            )}
          </div>

          {/* Hover overlay */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center"
            >
              <span className="text-white font-medium text-sm">اعرض التفاصيل</span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2">
            {/* Product Name */}
            <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2">
              {product.name}
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price and Info */}
            <div className="flex items-end justify-between pt-2 border-t border-orange-100 dark:border-orange-900/20">
              <div>
                <p className="text-xs text-muted-foreground">السعر</p>
                <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-500">
                  {product.salePrice.toFixed(2)}
                </p>
              </div>
              {product.preparationTime && product.type === 'prepared' && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">وقت التحضير</p>
                  <p className="text-xs font-medium text-foreground">
                    {product.preparationTime} دقيقة
                  </p>
                </div>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-1 pt-2">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((product.quantity / Math.max(product.minQuantityAlert || 10, 10)) * 100, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {product.quantity} {product.unit}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
