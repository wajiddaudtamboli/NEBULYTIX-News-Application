import { motion } from 'framer-motion'
import { Clock, ExternalLink, Bookmark, BookmarkCheck, Eye, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { useLanguage } from '@/lib/LanguageContext'

interface FeaturedHeadlineProps {
  news: {
    _id?: string
    id: string
    title: string
    summary?: string
    description?: string
    coverImage?: string
    imageUrl?: string
    source: string
    publishedAt: string
    category: string
    externalLink?: string
    views?: number
    isTrending?: boolean
  }
  onSave?: (id: string) => void
  isSaved?: boolean
}

export function FeaturedHeadline({ news, onSave, isSaved = false }: FeaturedHeadlineProps) {
  const { t } = useLanguage()
  const [saved, setSaved] = useState(isSaved)
  const [imageLoaded, setImageLoaded] = useState(false)

  const imageUrl = news.coverImage || news.imageUrl || ''
  const description = news.summary || news.description || ''
  const articleId = news._id || news.id
  const articleUrl = news.externalLink || `/article/${articleId}`

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaved(!saved)
    onSave?.(articleId)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="news-card-hero group relative overflow-hidden"
    >
      <div className="grid lg:grid-cols-2 min-h-[500px]">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          
          <motion.img
            src={imageUrl}
            alt={news.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } group-hover:scale-105`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=800&fit=crop'
              setImageLoaded(true)
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/40" />
          
          {/* Top badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {/* Live badge */}
            <div className="live-badge">
              <span className="live-dot" />
              LIVE
            </div>
            
            {/* Trending badge */}
            {news.isTrending && (
              <div className="trending-badge">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>
            )}
          </div>
          
          {/* Category on mobile */}
          <div className="absolute bottom-4 left-4 lg:hidden">
            <span className="category-tag">
              {news.category}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative p-6 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-card via-card to-secondary/30">
          {/* Category - Desktop */}
          <div className="hidden lg:block mb-4">
            <span className="category-tag">
              {news.category}
            </span>
          </div>
          
          {/* Meta row */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <span className="source-text">{news.source}</span>
            <span className="text-muted-foreground">•</span>
            <span className="timestamp-text flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(news.publishedAt)}
            </span>
            {news.views && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="timestamp-text flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {news.views.toLocaleString()} views
                </span>
              </>
            )}
          </div>
          
          {/* Headline */}
          <h1 className="headline-featured mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
            {news.title}
          </h1>
          
          {/* Summary */}
          {description && (
            <p className="body-normal text-muted-foreground line-clamp-3 mb-6">
              {description}
            </p>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-auto">
            <a
              href={articleUrl}
              target={news.externalLink ? '_blank' : undefined}
              rel={news.externalLink ? 'noopener noreferrer' : undefined}
              className="btn-news-primary"
            >
              Read Full Story
              {news.externalLink && <ExternalLink className="h-4 w-4" />}
            </a>
            
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`save-button ${saved ? 'saved' : ''}`}
              aria-label={saved ? 'Remove from saved' : 'Save article'}
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
