import { motion } from 'framer-motion'

interface SkeletonCardProps {
  index: number
  featured?: boolean
}

export function SkeletonCard({ index, featured = false }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`
        rounded-2xl overflow-hidden bg-card border border-border/50
        ${featured ? 'col-span-full lg:col-span-2' : ''}
      `}
    >
      {featured ? (
        <div className="grid lg:grid-cols-2 min-h-[400px]">
          {/* Image skeleton */}
          <div className="relative h-64 lg:h-full skeleton-shimmer" />
          
          {/* Content skeleton */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            <div className="h-6 w-24 rounded-full skeleton-shimmer mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="h-4 w-20 rounded skeleton-shimmer" />
              <div className="h-2 w-2 rounded-full skeleton-shimmer" />
              <div className="h-4 w-16 rounded skeleton-shimmer" />
            </div>
            <div className="space-y-3 mb-4">
              <div className="h-8 w-full rounded skeleton-shimmer" />
              <div className="h-8 w-4/5 rounded skeleton-shimmer" />
            </div>
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full rounded skeleton-shimmer" />
              <div className="h-4 w-5/6 rounded skeleton-shimmer" />
              <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-36 rounded-xl skeleton-shimmer" />
              <div className="h-12 w-12 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Image skeleton */}
          <div className="aspect-video skeleton-shimmer" />
          
          {/* Content skeleton */}
          <div className="p-5 space-y-4">
            {/* Meta */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-20 rounded-full skeleton-shimmer" />
              <div className="h-2 w-2 rounded-full skeleton-shimmer" />
              <div className="h-4 w-16 rounded skeleton-shimmer" />
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 w-full rounded skeleton-shimmer" />
              <div className="h-5 w-3/4 rounded skeleton-shimmer" />
            </div>
            
            {/* Description */}
            <div className="space-y-1.5">
              <div className="h-4 w-full rounded skeleton-shimmer" />
              <div className="h-4 w-5/6 rounded skeleton-shimmer" />
            </div>

            {/* Button */}
            <div className="h-9 w-28 rounded-lg skeleton-shimmer" />
          </div>
        </>
      )}
    </motion.div>
  )
}
