import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageOff } from 'lucide-react'

interface MediaFrameProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
}

export function MediaFrame({ src, alt, className = '', onLoad }: MediaFrameProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setLoaded(true)
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-muted ${className}`}>
      <AnimatePresence mode="wait">
        {!loaded && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer"
          />
        )}
      </AnimatePresence>

      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
        >
          <ImageOff className="h-8 w-8" />
          <span className="text-xs">Failed to load</span>
        </motion.div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: loaded ? 1 : 0, 
            scale: loaded ? 1 : 1.1 
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
    </div>
  )
}
