import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Bookmark, BookmarkCheck, ExternalLink, Clock, Sparkles } from 'lucide-react'
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
  featured?: boolean
}

export function NewsCard({ news, index, onSave, isSaved = false, featured = false }: NewsCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
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

  const handleSave = () => {
    const newSavedState = !saved
    setSaved(newSavedState)
    onSave?.(news.id)
    
    if (newSavedState) {
      setShowSaveConfirm(true)
      setTimeout(() => setShowSaveConfirm(false), 1500)
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

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.08,
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
      whileHover={{ y: -12, scale: 1.02 }}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        ${featured ? 'card-featured' : 'card-3d'}
        ${featured ? 'md:col-span-2 md:row-span-2' : ''}
      `}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90 z-[1] pointer-events-none" />
      
      {/* Image section */}
      <div className={`relative overflow-hidden ${featured ? 'aspect-[16/10]' : 'aspect-video'}`}>
        <MediaFrame
          src={news.imageUrl}
          alt={news.title}
        />
        
        {/* Category tag with elevation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
          className="absolute top-4 left-4 z-10"
        >
          <span className="tag-elevated flex items-center gap-1.5">
            {featured && <Sparkles className="h-3 w-3" />}
            {news.category}
          </span>
        </motion.div>

        {/* Save button with feedback */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className={`
            absolute top-4 right-4 z-10 h-10 w-10 rounded-full 
            flex items-center justify-center save-btn
            backdrop-blur-md border transition-all duration-300
            ${saved 
              ? 'bg-primary text-primary-foreground border-primary/50 shadow-glow-sm' 
              : 'bg-background/70 text-foreground border-border/50 hover:bg-background/90'
            }
          `}
        >
          <motion.div
            animate={saved ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </motion.div>
          
          {/* Save confirmation ripple */}
          {showSaveConfirm && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full bg-primary"
            />
          )}
        </motion.button>

        {/* Save confirmation toast */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showSaveConfirm ? 1 : 0, y: showSaveConfirm ? 0 : 10 }}
          className="absolute top-16 right-4 z-10 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg"
        >
          Saved!
        </motion.div>
      </div>

      {/* Content section */}
      <div className={`relative z-[2] p-5 ${featured ? 'p-6 md:p-8' : ''}`}>
        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs mb-3">
          <span className="font-semibold text-primary">{news.source}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDate(news.publishedAt)}
          </span>
        </div>

        {/* Title with proper hierarchy */}
        <h3 className={`
          font-display font-bold leading-snug mb-3 line-clamp-2
          group-hover:text-primary transition-colors duration-300
          ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}
        `}>
          {news.title}
        </h3>

        {/* Description */}
        <p className={`text-muted-foreground mb-4 ${featured ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm'}`}>
          {news.description}
        </p>

        {/* CTA Button with depth */}
        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Button 
            variant="default" 
            size={featured ? 'lg' : 'sm'} 
            className="gap-2 btn-depth group/btn"
          >
            <span>Read Article</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
        </a>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), hsl(var(--primary) / 0.1), transparent 40%)'
        }}
      />
    </motion.article>
  )
}
