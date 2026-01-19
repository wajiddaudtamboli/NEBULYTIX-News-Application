import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Bookmark, BookmarkCheck, ExternalLink, Clock, TrendingUp, Eye, Radio } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export interface LiveNewsItem {
  _id?: string
  id: string
  title: string
  description?: string
  summary?: string
  imageUrl?: string
  coverImage?: string
  source: string
  publishedAt: string
  url?: string
  externalLink?: string
  category: string
  views?: number
  isTrending?: boolean
  isLive?: boolean
}

interface LiveNewsCardProps {
  news: LiveNewsItem
  index: number
  onSave?: (id: string) => void
  isSaved?: boolean
  variant?: 'default' | 'compact' | 'horizontal'
}

export function LiveNewsCard({ 
  news, 
  index, 
  onSave, 
  isSaved = false,
  variant = 'default' 
}: LiveNewsCardProps) {
  const { t } = useLanguage()
  const [saved, setSaved] = useState(isSaved)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Normalize the data structure
  const imageUrl = news.coverImage || news.imageUrl || ''
  const description = news.summary || news.description || ''
  const articleId = news._id || news.id
  const articleUrl = news.url || news.externalLink || `/article/${articleId}`

  // 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { 
    stiffness: 300, 
    damping: 30 
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { 
    stiffness: 300, 
    damping: 30 
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || variant === 'horizontal') return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

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

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <motion.article
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group flex gap-4 p-3 news-card cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden">
          <img
            src={imageUrl}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop'
            }}
          />
          {news.isLive && (
            <div className="absolute top-1 left-1 live-badge text-[10px] py-0.5 px-1.5">
              <Radio className="h-2.5 w-2.5" />
              LIVE
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary">{news.source}</span>
            <span className="text-xs text-muted-foreground">{formatTime(news.publishedAt)}</span>
          </div>
          <h3 className="headline-small line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
        </div>
      </motion.article>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group news-card overflow-hidden cursor-pointer"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            {news.isLive && (
              <div className="live-badge text-[10px] py-0.5 px-1.5">
                <span className="live-dot" />
                LIVE
              </div>
            )}
            <span className="category-tag text-[10px] py-0.5 px-1.5">
              {news.category}
            </span>
          </div>
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-primary-foreground transition-colors">
              {news.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-white/70 text-xs">
              <span className="font-medium">{news.source}</span>
              <span>•</span>
              <span>{formatTime(news.publishedAt)}</span>
            </div>
          </div>
        </div>
      </motion.article>
    )
  }

  // Default variant with 3D effect
  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1]
      }}
      style={{ 
        rotateX, 
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group card-3d cursor-pointer"
    >
      {/* Image section */}
      <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
        
        <img
          src={imageUrl}
          alt={news.title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } group-hover:scale-105`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop'
            setImageLoaded(true)
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {news.isLive && (
            <div className="live-badge text-[10px] sm:text-xs py-1 px-2">
              <span className="live-dot" />
              LIVE
            </div>
          )}
          {news.isTrending && (
            <div className="trending-badge text-[10px] sm:text-xs py-1 px-2">
              <TrendingUp className="h-3 w-3" />
              Trending
            </div>
          )}
        </div>
        
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="category-tag text-[10px] sm:text-xs py-1 px-2">
            {news.category}
          </span>
        </div>
        
        {/* Save button */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className={`absolute bottom-3 right-3 save-button min-h-[44px] min-w-[44px] ${saved ? 'saved' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save article'}
        >
          {saved ? (
            <BookmarkCheck className="h-5 w-5" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Content section */}
      <div className="p-4 sm:p-5">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5 text-sm">
          <span className="source-text font-semibold">{news.source}</span>
          <span className="text-muted-foreground">•</span>
          <span className="timestamp-text flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(news.publishedAt)}
          </span>
          {news.views && (
            <>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="timestamp-text hidden sm:flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {news.views.toLocaleString()}
              </span>
            </>
          )}
        </div>
        
        {/* Headline */}
        <h2 className="headline-card text-base sm:text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
          {news.title}
        </h2>
        
        {/* Summary */}
        {description && (
          <p className="body-small text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-4">
            {description}
          </p>
        )}
        
        {/* Read more link */}
        <a
          href={articleUrl}
          target={news.externalLink ? '_blank' : undefined}
          rel={news.externalLink ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline min-h-[44px] pt-1"
        >
          Read Full Story
          {news.externalLink && <ExternalLink className="h-4 w-4" />}
        </a>
      </div>
    </motion.article>
  )
}
