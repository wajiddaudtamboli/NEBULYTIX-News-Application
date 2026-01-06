import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, Zap, ChevronDown, Sparkles } from 'lucide-react'
import { NewsGlobe } from '@/components/NewsGlobe'
import { NewsCard } from '@/components/NewsCard'
import { FeaturedCard } from '@/components/FeaturedCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { mockNews, categories } from '@/data/mockNews'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const newsRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const filteredNews = selectedCategory === 'All'
    ? mockNews
    : mockNews.filter(item => item.category === selectedCategory)

  const featuredNews = filteredNews[0]
  const regularNews = filteredNews.slice(1)

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

  const scrollToNews = () => {
    newsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-30" />
        
        {/* 3D Globe */}
        <NewsGlobe />

        {/* Decorative blurs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-accent/15 blur-[120px] animate-float-delayed" />

        <div className="relative z-10 content-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Live badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel-elevated mb-8"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Live Updates</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <motion.span 
                className="text-gradient inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                NEBULYTIX
              </motion.span>
              <br />
              <motion.span 
                className="text-foreground inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                NEWS
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Stay ahead with real-time insights. Your gateway to the stories that shape our world.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button 
                variant="hero" 
                size="xl" 
                className="gap-2 btn-depth min-w-[200px]"
                onClick={scrollToNews}
              >
                <TrendingUp className="h-5 w-5" />
                Explore Trending
              </Button>
              <Button variant="glass" size="xl" className="min-w-[200px]">
                <Sparkles className="h-5 w-5 mr-2" />
                Subscribe Free
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToNews}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ 
            opacity: { delay: 1 },
            y: { delay: 1, duration: 1.5, repeat: Infinity }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.section>

      {/* News Section */}
      <section ref={newsRef} className="content-container py-16 md:py-24">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12"
        >
          <div>
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <TrendingUp className="h-3 w-3" />
              Latest Stories
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Curated For You
            </h2>
            <p className="text-muted-foreground text-lg">
              Handpicked news from trusted sources worldwide
            </p>
          </div>
          
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        {/* News grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <SkeletonCard index={0} featured />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} index={i + 1} />
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <EmptyState 
            type="no-results"
            onRetry={() => setSelectedCategory('All')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Featured card */}
            {featuredNews && (
              <FeaturedCard
                news={featuredNews}
                onSave={handleSave}
                isSaved={savedIds.has(featuredNews.id)}
              />
            )}
            
            {/* Regular cards */}
            {regularNews.map((news, index) => (
              <NewsCard
                key={news.id}
                news={news}
                index={index + 1}
                onSave={handleSave}
                isSaved={savedIds.has(news.id)}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && filteredNews.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <Button variant="outline" size="lg" className="gap-2">
              Load More Stories
              <ChevronDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </section>
    </main>
  )
}
