import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, ExternalLink, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { MediaFrame } from './MediaFrame'

export interface NewsItem {
  id: string
  title: string
  description: string
  imageUrl: string
  source: string
  publishedAt: string
  url: string
  category: string
}

interface NewsCardProps {
  news: NewsItem
  index: number
  onSave?: (id: string) => void
  isSaved?: boolean
}

export function NewsCard({ news, index, onSave, isSaved = false }: NewsCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSave = () => {
    setSaved(!saved)
    onSave?.(news.id)
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8 }}
      className="group glass-panel overflow-hidden hover-lift"
    >
      <div className="relative aspect-video overflow-hidden">
        <MediaFrame
          src={news.imageUrl}
          alt={news.title}
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm">
            {news.category}
          </span>
        </div>

        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full glass-panel flex items-center justify-center"
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-foreground" />
          )}
        </motion.button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="font-medium text-primary">{news.source}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(news.publishedAt)}
          </span>
        </div>

        <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {news.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {news.description}
        </p>

        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            Read More
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>
    </motion.article>
  )
}
