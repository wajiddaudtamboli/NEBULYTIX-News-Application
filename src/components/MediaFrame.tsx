import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageOff, Play } from 'lucide-react'

interface MediaFrameProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  video?: boolean
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto'
}

export function MediaFrame({ 
  src, 
  alt, 
  className = '', 
  onLoad, 
  video = false,
  aspectRatio = 'auto'
}: MediaFrameProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setLoaded(true)
  }

  // Responsive aspect ratio classes
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    auto: ''
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-muted touch-manipulation ${aspectClasses[aspectRatio]} ${className}`}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Shimmer loader */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 skeleton-shimmer"
          />
        )}
      </AnimatePresence>

      {/* Error state */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted text-muted-foreground"
        >
          <div className="p-4 rounded-full bg-muted-foreground/10">
            <ImageOff className="h-8 w-8" />
          </div>
          <span className="text-sm font-medium">Failed to load image</span>
        </motion.div>
      ) : (
        <>
          {/* Main image */}
          <motion.img
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: loaded ? 1 : 0, 
              scale: loaded ? 1 : 1.1 
            }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Video play button overlay */}
          {video && loaded && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                <Play className="h-6 w-6 text-foreground fill-foreground ml-1" />
              </div>
            </motion.button>
          )}
        </>
      )}
    </div>
  )
}
