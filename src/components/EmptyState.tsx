import { motion } from 'framer-motion'
import { Search, Bookmark, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  type: 'no-results' | 'no-saved' | 'error'
  title?: string
  description?: string
  onRetry?: () => void
}

const iconMap = {
  'no-results': Search,
  'no-saved': Bookmark,
  'error': WifiOff
}

const defaultContent = {
  'no-results': {
    title: 'No stories found',
    description: 'Try adjusting your filters or check back later for new content.'
  },
  'no-saved': {
    title: 'No saved articles yet',
    description: 'Start exploring and save articles that interest you. They\'ll appear here for easy access.'
  },
  'error': {
    title: 'Something went wrong',
    description: 'We couldn\'t load the content. Please check your connection and try again.'
  }
}

export function EmptyState({ type, title, description, onRetry }: EmptyStateProps) {
  const Icon = iconMap[type]
  const content = defaultContent[type]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center"
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        {/* Glow rings */}
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring" />
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
        
        {/* Icon circle */}
        <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50 shadow-lg">
          <motion.div
            animate={{ 
              y: [0, -4, 0],
              rotate: type === 'error' ? [0, -5, 5, 0] : 0
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <Icon className="h-10 w-10 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Content */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-2xl md:text-3xl font-bold mb-3"
      >
        {title || content.title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground max-w-md text-base md:text-lg mb-8"
      >
        {description || content.description}
      </motion.p>
      
      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        {type === 'error' && onRetry && (
          <Button onClick={onRetry} variant="hero" size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        
        {type === 'no-saved' && (
          <Link to="/">
            <Button variant="hero" size="lg">
              Explore News
            </Button>
          </Link>
        )}
        
        {type === 'no-results' && (
          <Button variant="outline" size="lg">
            Clear Filters
          </Button>
        )}
      </motion.div>

      {/* Decorative dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-float" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-accent/20 animate-float-delayed" />
        <div className="absolute bottom-1/4 right-1/4 w-2.5 h-2.5 rounded-full bg-primary/15 animate-float" />
      </div>
    </motion.div>
  )
}
