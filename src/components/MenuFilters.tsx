import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Category } from '@/lib/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuFiltersProps {
  categories: Category[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onTypeChange: (type: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  searchQuery: string;
  selectedCategory: string;
  selectedType: string;
  priceRange: [number, number];
}

export function MenuFilters({
  categories,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onPriceRangeChange,
  searchQuery,
  selectedCategory,
  selectedType,
  priceRange,
}: MenuFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(priceRange[0]);
  const [localMaxPrice, setLocalMaxPrice] = useState(priceRange[1]);

  const handlePriceChange = (min: number, max: number) => {
    setLocalMinPrice(min);
    setLocalMaxPrice(max);
    onPriceRangeChange(min, max);
  };

  const activeFilters = [
    searchQuery && { type: 'search', label: `البحث: ${searchQuery}` },
    selectedCategory !== 'all' && { type: 'category', label: selectedCategory },
    selectedType !== 'all' && { type: 'type', label: selectedType === 'prepared' ? 'مطبوخ' : 'جاهز' },
    (localMinPrice > 0 || localMaxPrice < 1000) && { type: 'price', label: `${localMinPrice} - ${localMaxPrice}` },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <motion.div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن المنتج..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 border-orange-200 dark:border-orange-900/20 focus:ring-orange-500 focus:border-orange-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Filter Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-sm text-orange-600">
            المرشحات {activeFilters.length > 0 && `(${activeFilters.length})`}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {activeFilters.map((filter, index) => (
              <motion.div
                key={`${filter.type}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  variant="secondary"
                  className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-900/50 text-xs py-1"
                >
                  {filter.label}
                  <button
                    onClick={() => {
                      if (filter.type === 'search') onSearchChange('');
                      if (filter.type === 'category') onCategoryChange('all');
                      if (filter.type === 'type') onTypeChange('all');
                      if (filter.type === 'price') handlePriceChange(0, 1000);
                    }}
                    className="ml-1 hover:text-orange-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-orange-100 dark:border-orange-900/20"
            >
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">الفئة</label>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCategoryChange('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-foreground border border-orange-200 dark:border-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    الكل
                  </motion.button>
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCategoryChange(cat.name)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedCategory === cat.name
                          ? 'bg-orange-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-foreground border border-orange-200 dark:border-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                      }`}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">النوع</label>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTypeChange('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedType === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-foreground border border-orange-200 dark:border-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    الكل
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTypeChange('prepared')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedType === 'prepared'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-foreground border border-orange-200 dark:border-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    مطبوخ
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onTypeChange('ready')}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedType === 'ready'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-foreground border border-orange-200 dark:border-orange-900/20 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    جاهز
                  </motion.button>
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">نطاق السعر</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">الحد الأدنى</p>
                    <Input
                      type="number"
                      min="0"
                      value={localMinPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value), localMaxPrice)}
                      className="border-orange-200 dark:border-orange-900/20"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">الحد الأقصى</p>
                    <Input
                      type="number"
                      min="0"
                      value={localMaxPrice}
                      onChange={(e) => handlePriceChange(localMinPrice, Number(e.target.value))}
                      className="border-orange-200 dark:border-orange-900/20"
                    />
                  </div>
                </div>
              </div>

              {/* Clear All Filters Button */}
              <Button
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('all');
                  onTypeChange('all');
                  handlePriceChange(0, 1000);
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                مسح جميع المرشحات
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
