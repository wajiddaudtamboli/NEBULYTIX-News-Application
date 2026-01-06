import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ExternalLink, Clock, TrendingUp, Eye } from 'lucide-react'
import { Button } from './ui/button'
import { MediaFrame } from './MediaFrame'
import type { NewsItem } from './NewsCard'

interface FeaturedCardProps {
  news: NewsItem
  onSave?: (id: string) => void
  isSaved?: boolean
}

export function FeaturedCard({ news, onSave, isSaved = false }: FeaturedCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [showConfirm, setShowConfirm] = useState(false)

  // Normalize the data structure
  const imageUrl = news.coverImage || news.imageUrl || ''
  const description = news.summary || news.description || ''
  const articleId = news._id || news.id
  const articleUrl = news.url || `/article/${articleId}`
  const views = news.views || 0

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = !saved
    setSaved(newState)
    onSave?.(articleId)
    
    if (newState) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 1500)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -8 }}
      className="relative group col-span-full lg:col-span-2 rounded-3xl overflow-hidden card-featured"
    >
      <div className="grid lg:grid-cols-2 min-h-[400px]">
        {/* Image side */}
        <div className="relative overflow-hidden">
          <MediaFrame
            src={imageUrl}
            alt={news.title}
            className="absolute inset-0"
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent lg:hidden" />
          
          {/* Trending badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-6 left-6 z-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-semibold shadow-lg">
              <TrendingUp className="h-4 w-4" />
              Featured Story
            </div>
          </motion.div>

          {/* View count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-sm text-white/90"
          >
            <Eye className="h-4 w-4" />
            <span>{formatViews(views)} views</span>
          </motion.div>
        </div>

        {/* Content side */}
        <div className="relative flex flex-col justify-center p-8 lg:p-10">
          {/* Category */}
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center self-start px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-xs font-semibold"
          >
            {news.category}
          </motion.span>

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3 text-sm text-muted-foreground mb-4"
          >
            <span className="font-medium text-foreground">{news.source}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(news.publishedAt)}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors"
          >
            {news.title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-6 line-clamp-3"
          >
            {description}
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <a href={articleUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="hero" size="lg" className="gap-2 btn-depth">
                Read Full Story
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>

            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`
                relative h-12 w-12 rounded-full flex items-center justify-center
                border-2 transition-all duration-300
                ${saved 
                  ? 'bg-primary text-primary-foreground border-primary shadow-glow-sm' 
                  : 'bg-card text-foreground border-border hover:border-primary/50'
                }
              `}
            >
              <motion.div animate={saved ? { scale: [1, 1.4, 1] } : {}}>
                {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
              </motion.div>

              {/* Save confirmation */}
              {showConfirm && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: -40 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs whitespace-nowrap shadow-lg"
                >
                  Saved!
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
    </motion.article>
  )
}
