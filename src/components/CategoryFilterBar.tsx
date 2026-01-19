import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Flame, Globe, Briefcase, Cpu, Film, Trophy, Heart, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

const categories = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'breaking', label: 'Breaking', icon: Flame },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'technology', label: 'Tech', icon: Cpu },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'health', label: 'Health', icon: Heart },
]

interface CategoryFilterBarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  counts?: Record<string, number>
  lastUpdated?: Date
}

export function CategoryFilterBar({ 
  activeCategory, 
  onCategoryChange,
  counts = {},
  lastUpdated
}: CategoryFilterBarProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [timeAgo, setTimeAgo] = useState('')

  // Update time ago display
  useEffect(() => {
    if (!lastUpdated) return
    const updateTimeAgo = () => {
      const diff = Date.now() - lastUpdated.getTime()
      const seconds = Math.floor(diff / 1000)
      if (seconds < 60) setTimeAgo(`${seconds}s ago`)
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
    }
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 10000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    setShowLeftArrow(container.scrollLeft > 10)
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('category-scroll-container')
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="category-filter-bar">
      <div className="content-container">
        {/* Mobile: 2-row grid for better touch targets */}
        <div className="sm:hidden grid grid-cols-3 gap-2 py-2">
          {categories.slice(0, 6).map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border transition-all ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>
        
        {/* Desktop: horizontal scroll */}
        <div className="hidden sm:block relative">
          {/* Left scroll button */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll categories left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Categories container */}
          <div
            id="category-scroll-container"
            onScroll={handleScroll}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3 px-2"
          >
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              const count = counts[category.id]

              return (
                <motion.button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`category-pill ${isActive ? 'active' : ''} min-h-[44px] min-w-[44px]`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-sm">{category.label}</span>
                  {count !== undefined && count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {count}
                    </span>
                  )}
                </motion.button>
              )
            })}
            
            {/* Last updated indicator */}
            {timeAgo && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground border-l border-border ml-2">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Updated {timeAgo}</span>
              </div>
            )}
          </div>

          {/* Right scroll button */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll categories right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Fade edges */}
          {showLeftArrow && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
          )}
          {showRightArrow && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  )
}

// Vertical variant for sidebars
export function CategoryFilterSidebar({ 
  activeCategory, 
  onCategoryChange,
  counts = {}
}: CategoryFilterBarProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Categories
      </h3>
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = activeCategory === category.id
        const count = counts[category.id]

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary text-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left font-medium">{category.label}</span>
            {count !== undefined && count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive 
                  ? 'bg-white/20' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
