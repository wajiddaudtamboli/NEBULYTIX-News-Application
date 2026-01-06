import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap } from 'lucide-react'
import { NewsGlobe } from '@/components/NewsGlobe'
import { NewsCard } from '@/components/NewsCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Button } from '@/components/ui/button'
import { mockNews, categories } from '@/data/mockNews'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const filteredNews = selectedCategory === 'All'
    ? mockNews
    : mockNews.filter(item => item.category === selectedCategory)

  const handleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <NewsGlobe />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Live Updates</span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">NEBULYTIX</span>
              <br />
              <span className="text-foreground">NEWS</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Stay ahead with real-time insights. Your gateway to the stories that shape our world.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="hero" size="xl" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                Explore Trending
              </Button>
              <Button variant="glass" size="xl">
                Subscribe Free
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="font-display text-3xl font-bold mb-2">Latest Stories</h2>
            <p className="text-muted-foreground">Curated news from trusted sources</p>
          </div>
          
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))
          ) : (
            filteredNews.map((news, index) => (
              <NewsCard
                key={news.id}
                news={news}
                index={index}
                onSave={handleSave}
                isSaved={savedIds.has(news.id)}
              />
            ))
          )}
        </div>

        {!loading && filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground">No stories found in this category.</p>
          </motion.div>
        )}
      </section>
    </main>
  )
}
