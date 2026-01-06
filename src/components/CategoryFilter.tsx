import { motion } from 'framer-motion'

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onSelect(category)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${selected === category 
              ? 'bg-primary text-primary-foreground shadow-lg' 
              : 'glass-panel text-foreground hover:bg-muted'
            }
          `}
        >
          {category}
        </motion.button>
      ))}
    </div>
  )
}
