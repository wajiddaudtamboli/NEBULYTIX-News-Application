import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ChevronLeft, ChevronRight, Flame, Eye } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

interface NewsItem {
  _id: string
  id: string
  title: string
  summary: string
  category: string
  source: string
  coverImage: string
  views: number
}

interface TrendingStripProps {
  news: NewsItem[]
  onSave: (id: string) => void
  savedIds: Set<string>
}

export function TrendingStrip({ news, onSave, savedIds }: TrendingStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!news.length) return null

  return (
    <section className="py-8 bg-gradient-to-r from-primary/5 via-background to-accent/5 border-y border-border/30">
      <div className="content-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500"
            >
              <Flame className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-display font-bold text-xl">Trending Now</h3>
              <p className="text-sm text-muted-foreground">Hot stories everyone is reading</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {news.map((item, index) => (
            <motion.article
              key={item._id || item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <div className="group relative glass-panel rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Rank badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold">
                    <TrendingUp className="h-3 w-3" />
                    #{index + 1}
                  </div>

                  {/* Category */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                    {item.category}
                  </div>

                  {/* Views */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs">
                    <Eye className="h-3 w-3" />
                    {item.views?.toLocaleString() || '0'}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.source}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
