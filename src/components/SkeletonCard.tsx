import { motion } from 'framer-motion'

interface SkeletonCardProps {
  index: number
}

export function SkeletonCard({ index }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-panel overflow-hidden"
    >
      <div className="aspect-video bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
      
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 rounded-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-16 rounded-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        
        <div className="space-y-2">
          <div className="h-5 w-full rounded bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-5 w-3/4 rounded bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>
        
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
          <div className="h-4 w-5/6 rounded bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
        </div>

        <div className="h-9 w-24 rounded-lg bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </motion.div>
  )
}
