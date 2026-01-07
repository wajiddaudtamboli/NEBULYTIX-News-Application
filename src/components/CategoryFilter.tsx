import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const { t } = useLanguage()
  
  // Map category names to translation keys
  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      'All': t('categories.all'),
      'Technology': t('categories.technology'),
      'Business': t('categories.business'),
      'Science': t('categories.science'),
      'World': t('categories.world'),
      'Health': t('categories.health'),
    }
    return categoryMap[category] || category
  }
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
        <Filter className="h-4 w-4" />
        <span>{t('common.filter')}:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category, idx) => {
          const isSelected = selected === category
          
          return (
            <motion.button
              key={category}
              onClick={() => onSelect(category)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium 
                transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-glow-sm' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
                }
              `}
            >
              {getCategoryLabel(category)}
              
              {/* Active indicator dot */}
              {isSelected && (
                <motion.div
                  layoutId="category-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
