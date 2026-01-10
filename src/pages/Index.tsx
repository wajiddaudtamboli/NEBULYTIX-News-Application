import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, Zap, ChevronDown, Sparkles, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Globe, ExternalLink, Search, RefreshCw, Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { fetchNews, fetchFeaturedNews, fetchTrendingNews, toggleSaveArticle, fetchSavedArticles, syncUser, fetchExternalHeadlines, fetchExternalNews, searchExternalNews, EXTERNAL_NEWS_CATEGORIES, type ExternalNewsCategory } from '@/lib/api'
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
  externalLink?: string
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
  
  // Live News from GNews API
  const [liveNews, setLiveNews] = useState<NewsItem[]>([])
  const [liveNewsLoading, setLiveNewsLoading] = useState(true)
  const [liveNewsCategory, setLiveNewsCategory] = useState<ExternalNewsCategory>('general')
  const [liveNewsDate, setLiveNewsDate] = useState<Date | undefined>(undefined)
  const [liveNewsSearch, setLiveNewsSearch] = useState('')
  const [liveNewsSearchInput, setLiveNewsSearchInput] = useState('')
  const [liveNewsLimit, setLiveNewsLimit] = useState(9)
  const [liveNewsLoadingMore, setLiveNewsLoadingMore] = useState(false)
  const [liveNewsTotal, setLiveNewsTotal] = useState(0)
  
  const newsRef = useRef<HTMLElement>(null)
  const liveNewsRef = useRef<HTMLElement>(null)
  
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

  // Fetch live news from GNews API
  useEffect(() => {
    loadLiveNews()
  }, [liveNewsCategory, liveNewsDate, liveNewsSearch])

  const loadLiveNews = async (append: boolean = false) => {
    if (!append) {
      setLiveNewsLoading(true)
      setLiveNewsLimit(9)
    } else {
      setLiveNewsLoadingMore(true)
    }
    
    try {
      const currentLimit = append ? liveNewsLimit + 6 : 9
      const dateStr = liveNewsDate ? format(liveNewsDate, 'yyyy-MM-dd') : undefined
      
      let result;
      if (liveNewsSearch.trim()) {
        // Search mode
        result = await searchExternalNews(liveNewsSearch, currentLimit, dateStr, dateStr)
      } else {
        // Category mode
        result = await fetchExternalNews(liveNewsCategory, currentLimit, dateStr, dateStr)
      }
      
      if (result.success && result.data) {
        setLiveNews(result.data as NewsItem[])
        setLiveNewsTotal(result.total || result.data.length)
        if (append) setLiveNewsLimit(currentLimit)
      }
    } catch (error) {
      console.error('Failed to load live news:', error)
    } finally {
      setLiveNewsLoading(false)
      setLiveNewsLoadingMore(false)
    }
  }

  const handleLiveNewsSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLiveNewsSearch(liveNewsSearchInput)
  }

  const clearLiveNewsFilters = () => {
    setLiveNewsSearch('')
    setLiveNewsSearchInput('')
    setLiveNewsDate(undefined)
    setLiveNewsCategory('general')
    setLiveNewsLimit(9)
  }

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
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-20" />
        
        {/* 3D Globe - Preserved with optimized opacity */}
        <NewsGlobe />

        {/* Enhanced text contrast overlay - subtle vignette effect */}
        <div className="absolute inset-0 hero-text-overlay pointer-events-none" />
        
        {/* Decorative blurs - refined */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-primary/15 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-accent/12 blur-[130px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[150px]" />

        <div className="relative z-10 content-container text-center max-w-4xl">
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

            {/* Main headline - Enhanced hierarchy */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
              <motion.span 
                className="text-gradient inline-block drop-shadow-2xl"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                NEBULYTIX
              </motion.span>
              <br />
              <motion.span 
                className="text-foreground inline-block hero-text-shadow"
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                NEWS
              </motion.span>
            </h1>

            {/* Subtitle - Improved readability */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg md:text-xl lg:text-2xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed font-medium hero-subtitle"
            >
              {t('home.subtitle')}
            </motion.p>

            {/* CTA buttons - Enhanced prominence */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="gap-3 btn-depth min-w-[220px] cta-primary shadow-2xl"
                  onClick={scrollToNews}
                >
                  <TrendingUp className="h-5 w-5" />
                  {t('home.exploreTrending')}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button variant="glass" size="xl" className="min-w-[220px] cta-secondary">
                  <Sparkles className="h-5 w-5 mr-2" />
                  {t('home.subscribeFree')}
                </Button>
              </motion.div>
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

      {/* Live News Section - From GNews API */}
      <section ref={liveNewsRef} className="content-container py-12 md:py-16 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
            <div>
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <Globe className="h-3 w-3" />
                LIVE FROM INDIA
              </motion.div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Live News Feed
              </h2>
              <p className="text-muted-foreground text-lg">
                Real-time news from top Indian sources via GNews API
              </p>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLiveNews()}
              disabled={liveNewsLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${liveNewsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Search and Date Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <form onSubmit={handleLiveNewsSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search live news..."
                  value={liveNewsSearchInput}
                  onChange={(e) => setLiveNewsSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="default" size="default">
                Search
              </Button>
              {(liveNewsSearch || liveNewsDate) && (
                <Button type="button" variant="ghost" size="default" onClick={clearLiveNewsFilters}>
                  Clear
                </Button>
              )}
            </form>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px] justify-start">
                  <CalendarIcon className="h-4 w-4" />
                  {liveNewsDate ? format(liveNewsDate, 'PPP') : 'Filter by date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={liveNewsDate}
                  onSelect={(date) => setLiveNewsDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
                {liveNewsDate && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setLiveNewsDate(undefined)}>
                      Clear Date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {EXTERNAL_NEWS_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={liveNewsCategory === cat && !liveNewsSearch ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setLiveNewsSearch('')
                  setLiveNewsSearchInput('')
                  setLiveNewsCategory(cat)
                }}
                className="capitalize"
                disabled={!!liveNewsSearch}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Active Filters Display */}
          {(liveNewsSearch || liveNewsDate) && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {liveNewsSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Search: "{liveNewsSearch}"
                </span>
              )}
              {liveNewsDate && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Date: {format(liveNewsDate, 'MMM d, yyyy')}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Live news grid */}
        {liveNewsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : liveNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No live news available. Please check your API configuration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveNews.map((item, index) => (
              <motion.article
                key={item._id || item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative glass-panel rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Live badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/90 text-white text-xs font-medium">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    LIVE
                  </div>
                  
                  {/* Category badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="font-medium text-primary">{item.source}</span>
                    <span>•</span>
                    <span>{format(new Date(item.publishedAt), 'MMM d, h:mm a')}</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {item.summary}
                  </p>

                  {/* Read more link */}
                  {item.externalLink && (
                    <a
                      href={item.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Read Full Article
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Load More button */}
        {liveNews.length > 0 && liveNews.length >= liveNewsLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4 mt-10"
          >
            <p className="text-sm text-muted-foreground">
              Showing {liveNews.length} of {liveNewsTotal > liveNews.length ? `${liveNewsTotal}+` : liveNews.length} articles
            </p>
            <div className="flex gap-3">
              <Button
                variant="default"
                size="lg"
                onClick={() => loadLiveNews(true)}
                disabled={liveNewsLoadingMore || liveNewsLoading}
                className="gap-2"
              >
                {liveNewsLoadingMore ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-5 w-5" />
                    Load More News
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => loadLiveNews()}
                disabled={liveNewsLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${liveNewsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </motion.div>
        )}

        {/* No results message */}
        {!liveNewsLoading && liveNews.length === 0 && (liveNewsSearch || liveNewsDate) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground mb-4">No news found for your search criteria.</p>
            <Button variant="outline" onClick={clearLiveNewsFilters}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </section>
    </main>
  )
}
