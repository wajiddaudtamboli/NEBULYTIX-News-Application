import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, Zap, ChevronDown, Sparkles, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays, isToday, isSameDay } from 'date-fns'
import { useUser } from '@clerk/clerk-react'
import { NewsGlobe } from '@/components/NewsGlobe'
import { NewsCard } from '@/components/NewsCard'
import { FeaturedCard } from '@/components/FeaturedCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { EmptyState } from '@/components/EmptyState'
import { TrendingStrip } from '@/components/TrendingStrip'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { fetchNews, fetchFeaturedNews, fetchTrendingNews, toggleSaveArticle, fetchSavedArticles, syncUser } from '@/lib/api'
import { mockNews, categories } from '@/data/mockNews'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/LanguageContext'

interface NewsItem {
  _id: string
  id: string
  title: string
  summary: string
  category: string
  source: string
  publishedAt: string
  coverImage: string
  isFeatured: boolean
  isTrending: boolean
  views: number
  tags: string[]
}

export default function Index() {
  const { user, isSignedIn } = useUser()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [news, setNews] = useState<NewsItem[]>([])
  const [featuredNews, setFeaturedNews] = useState<NewsItem[]>([])
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [useMockData, setUseMockData] = useState(false)
  const newsRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  // Fetch saved articles on mount and sync user
  useEffect(() => {
    if (isSignedIn && user) {
      // Sync user with backend
      syncUser(user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || user.firstName || '')
      loadSavedArticles()
    }
  }, [isSignedIn, user])

  // Fetch news on category/date change
  useEffect(() => {
    loadNews()
    if (isToday(selectedDate)) {
      loadFeaturedAndTrending()
    }
  }, [selectedCategory, selectedDate])

  const loadSavedArticles = async () => {
    if (!user) return
    const result = await fetchSavedArticles(user.id, user.primaryEmailAddress?.emailAddress || '')
    if (result.success) {
      setSavedIds(new Set(result.data.map((n: NewsItem) => n._id)))
    }
  }

  const loadNews = async () => {
    setLoading(true)
    setPage(1)
    
    try {
      const result = await fetchNews({
        category: selectedCategory,
        date: isToday(selectedDate) ? undefined : format(selectedDate, 'yyyy-MM-dd'),
        page: 1,
        limit: 20,
      })

      if (result.success && result.data.length > 0) {
        const mapped = result.data.map(n => ({ ...n, id: n._id }))
        setNews(mapped)
        setHasMore(result.pagination ? page < result.pagination.pages : false)
        setUseMockData(false)
      } else {
        // Fallback to mock data
        const filtered = selectedCategory === 'All' 
          ? mockNews 
          : mockNews.filter(n => n.category === selectedCategory)
        setNews(filtered.map(n => ({ ...n, _id: n.id })) as any)
        setHasMore(false)
        setUseMockData(true)
      }
    } catch (error) {
      // Fallback to mock data
      const filtered = selectedCategory === 'All' 
        ? mockNews 
        : mockNews.filter(n => n.category === selectedCategory)
      setNews(filtered.map(n => ({ ...n, _id: n.id })) as any)
      setHasMore(false)
      setUseMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedAndTrending = async () => {
    try {
      const [featuredResult, trendingResult] = await Promise.all([
        fetchFeaturedNews(),
        fetchTrendingNews(),
      ])
      
      if (featuredResult.success) {
        setFeaturedNews(featuredResult.data.map(n => ({ ...n, id: n._id })))
      }
      if (trendingResult.success) {
        setTrendingNews(trendingResult.data.map(n => ({ ...n, id: n._id })))
      }
    } catch {
      // Use mock featured/trending
      setFeaturedNews(mockNews.filter(n => n.isFeatured).slice(0, 3) as any)
      setTrendingNews(mockNews.filter(n => n.isTrending).slice(0, 10) as any)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore || useMockData) return
    setLoadingMore(true)
    
    const nextPage = page + 1
    const result = await fetchNews({
      category: selectedCategory,
      date: isToday(selectedDate) ? undefined : format(selectedDate, 'yyyy-MM-dd'),
      page: nextPage,
      limit: 20,
    })

    if (result.success) {
      const mapped = result.data.map(n => ({ ...n, id: n._id }))
      setNews(prev => [...prev, ...mapped])
      setPage(nextPage)
      setHasMore(result.pagination ? nextPage < result.pagination.pages : false)
    }
    setLoadingMore(false)
  }

  const handleSave = async (id: string) => {
    if (!isSignedIn || !user) {
      toast({ title: 'Please sign in to save articles' })
      return
    }

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

    const result = await toggleSaveArticle(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      id
    )

    if (result.success) {
      toast({ title: result.message || (result.data.isSaved ? 'Article saved' : 'Article removed') })
    } else {
      // Revert optimistic update
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
  }

  const scrollToNews = () => {
    newsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const displayNews = news
  const primaryFeatured = featuredNews[0] || displayNews[0]
  const regularNews = featuredNews.length > 0 ? displayNews : displayNews.slice(1)

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
              <span className="text-sm font-semibold">{t('home.liveUpdates')}</span>
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
              {t('home.subtitle')}
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
                {t('home.exploreTrending')}
              </Button>
              <Button variant="glass" size="xl" className="min-w-[200px]">
                <Sparkles className="h-5 w-5 mr-2" />
                {t('home.subscribeFree')}
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
          <span className="text-xs font-medium">{t('home.scrollToExplore')}</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.section>

      {/* Trending Strip */}
      {trendingNews.length > 0 && (
        <TrendingStrip news={trendingNews} onSave={handleSave} savedIds={savedIds} />
      )}

      {/* News Section */}
      <section ref={newsRef} className="content-container py-12 md:py-16">
        {/* Section header with date picker */}
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
              {isToday(selectedDate) ? t('home.latestStories') : `${t('home.newsFrom')} ${format(selectedDate, 'MMM d, yyyy')}`}
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              {t('home.curatedForYou')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('home.handpickedNews')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[180px]">
                  <CalendarIcon className="h-4 w-4" />
                  {isToday(selectedDate) ? t('common.today') : format(selectedDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date() || date < subDays(new Date(), 100)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        </motion.div>

        {/* News grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <SkeletonCard index={0} featured />
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} index={i + 1} />
            ))}
          </div>
        ) : displayNews.length === 0 ? (
          <EmptyState 
            type="no-results"
            onRetry={() => {
              setSelectedCategory('All')
              setSelectedDate(new Date())
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Featured card */}
            {primaryFeatured && (
              <FeaturedCard
                news={primaryFeatured}
                onSave={handleSave}
                isSaved={savedIds.has(primaryFeatured._id || primaryFeatured.id)}
              />
            )}
            
            {/* Regular cards */}
            {regularNews.map((item, index) => (
              <NewsCard
                key={item._id || item.id}
                news={item}
                index={index + 1}
                onSave={handleSave}
                isSaved={savedIds.has(item._id || item.id)}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && displayNews.length > 0 && hasMore && !useMockData && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>
                  {t('home.loadMore')}
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </section>
    </main>
  )
}
