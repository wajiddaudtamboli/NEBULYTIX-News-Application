import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, Zap, ChevronDown, Sparkles, Calendar as CalendarIcon, Globe, ExternalLink, Search, RefreshCw, Loader2, Radio, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { useUser } from '@clerk/clerk-react'
import { NewsGlobe } from '@/components/NewsGlobe'
import { SkeletonCard } from '@/components/SkeletonCard'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toggleSaveArticle, fetchSavedArticles, syncUser, fetchExternalNews, searchExternalNews, EXTERNAL_NEWS_CATEGORIES, type ExternalNewsCategory } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/LanguageContext'
import { FeaturedHeadline } from '@/components/FeaturedHeadline'
import { LiveNewsCard } from '@/components/LiveNewsCard'
import { CategoryFilterBar } from '@/components/CategoryFilterBar'

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
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  
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
    liveNewsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-[65vh] sm:min-h-[70vh] md:min-h-[75vh] flex items-center justify-center overflow-hidden pt-24 pb-16"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-5 sm:opacity-8" />
        
        {/* 3D Globe - Now more subtle as background */}
        <NewsGlobe />

        {/* Strong text contrast overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80 pointer-events-none" />
        <div className="absolute inset-0 bg-background/40 sm:bg-background/30 md:bg-background/20 pointer-events-none" />
        
        {/* Decorative blurs - smaller and more subtle */}
        <div className="absolute top-1/4 -left-16 sm:-left-24 w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-primary/5 sm:bg-primary/8 blur-[60px] sm:blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 -right-16 sm:-right-24 w-40 sm:w-56 h-40 sm:h-56 rounded-full bg-accent/5 sm:bg-accent/8 blur-[70px] sm:blur-[100px] animate-float-delayed" />

        <div className="relative z-10 content-container text-center max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Live badge - broadcast style */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg glass-panel-elevated border-2 border-primary/20"
            >
              <div className="live-badge py-1.5 px-3 sm:px-4 text-xs sm:text-sm font-bold">
                <span className="live-dot" />
                LIVE
              </div>
              <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-pulse" />
              <span className="text-sm sm:text-base font-bold tracking-wide uppercase text-foreground">{t('home.liveUpdates')}</span>
            </motion.div>

            {/* Main headline - Dominant news-style with strong contrast */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-headline font-black leading-[1.05] tracking-tighter">
              <motion.span 
                className="text-gradient inline-block drop-shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                NEBULYTIX
              </motion.span>
              <br />
              <motion.span 
                className="text-foreground inline-block drop-shadow-md"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                NEWS
              </motion.span>
            </h1>

            {/* Subtitle - Better readability with strong contrast */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/90 max-w-3xl mx-auto leading-relaxed font-medium px-4"
            >
              {t('home.subtitle')}
            </motion.p>

            {/* CTA buttons - Enhanced prominence and touch targets */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="gap-3 btn-depth w-full sm:w-auto min-w-[200px] sm:min-w-[220px] cta-primary shadow-2xl text-base sm:text-lg h-12 sm:h-14 px-8"
                  onClick={scrollToNews}
                >
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                  {t('home.exploreTrending')}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button variant="glass" size="lg" className="w-full sm:w-auto min-w-[200px] sm:min-w-[220px] cta-secondary text-base sm:text-lg h-12 sm:h-14 px-8">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
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
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span className="text-[10px] sm:text-xs font-medium">{t('home.scrollToExplore')}</span>
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.button>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.section>

      {/* Breaking News Media Gallery */}
      <section className="py-8 bg-gradient-news-section">
        <div className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              {
                src: 'https://static.vecteezy.com/system/resources/thumbnails/020/922/672/small_2x/red-breaking-news-motion-graphic-abstract-background-modern-animation-loop-free-video.jpg',
                label: 'BREAKING'
              },
              {
                src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtIAE1y4ak6gMJdAGimz-TSyLa2CBcvhEMVbTmqb33&s',
                label: 'WORLD NEWS'
              },
              {
                src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ_eCnkkG53MqdQ2IIDCF3aaWyrf3e4mYRwg&s',
                label: 'HEADLINES'
              },
              {
                src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJv_LCdVeyeMHLI5wdBG3OarqjYz3hLRkQmg&s',
                label: 'LIVE UPDATES'
              }
            ].map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="relative overflow-hidden rounded-xl group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Label badge */}
                <div className="absolute bottom-3 left-3 right-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                    idx === 0 ? 'bg-red-600 text-white' : 
                    idx === 1 ? 'bg-blue-600 text-white' :
                    idx === 2 ? 'bg-orange-500 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {idx === 0 && <Zap className="h-3 w-3" />}
                    {idx === 3 && <Radio className="h-3 w-3 animate-pulse" />}
                    {img.label}
                  </span>
                </div>
                {/* Pulse ring for LIVE */}
                {idx === 3 && (
                  <div className="absolute top-3 right-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Globe, label: 'Global Coverage', value: '190+ Countries' },
              { icon: Zap, label: 'Breaking News', value: 'Real-time' },
              { icon: TrendingUp, label: 'Daily Updates', value: '1000+ Stories' },
              { icon: Radio, label: 'Live Sources', value: '50+ Channels' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold">{stat.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live News Section - Main News Feed */}
      <section ref={liveNewsRef} className="py-8 md:py-12">
        {/* Section Header */}
        <div className="content-container mb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
              <div className="section-header">
                <div className="live-badge">
                  <span className="live-dot" />
                  LIVE
                </div>
                <div>
                  <h2 className="section-title">Real-time News Feed</h2>
                  <p className="section-subtitle mt-1">Breaking stories from top Indian sources</p>
                </div>
                <div className="section-line hidden sm:block" />
              </div>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadLiveNews()}
                disabled={liveNewsLoading}
                className="gap-2 shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${liveNewsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Category Filter Bar - Sticky */}
        <CategoryFilterBar
          activeCategory={liveNewsSearch ? 'search' : liveNewsCategory}
          onCategoryChange={(cat) => {
            if (cat === 'all') {
              setLiveNewsCategory('general')
            } else if (cat === 'trending' || cat === 'latest' || cat === 'breaking') {
              setLiveNewsCategory('general')
            } else {
              setLiveNewsCategory(cat as ExternalNewsCategory)
            }
            setLiveNewsSearch('')
            setLiveNewsSearchInput('')
          }}
        />

        <div className="content-container pt-6">
          {/* Search and Date Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <form onSubmit={handleLiveNewsSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search breaking news..."
                  value={liveNewsSearchInput}
                  onChange={(e) => setLiveNewsSearchInput(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Button type="submit" variant="default" size="default" className="btn-news-primary px-6">
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
                <Button variant="outline" className="gap-2 min-w-[200px] justify-start h-11">
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

          {/* Live news grid with Featured + Grid layout */}
        {liveNewsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : liveNews.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-lg">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="headline-card mb-2">No News Available</h3>
            <p className="text-muted-foreground">Please check your API configuration or try a different category.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Headline - First article */}
            {liveNews[0] && (
              <FeaturedHeadline
                news={{
                  id: liveNews[0]._id || liveNews[0].id,
                  _id: liveNews[0]._id,
                  title: liveNews[0].title,
                  summary: liveNews[0].summary,
                  coverImage: liveNews[0].coverImage,
                  source: liveNews[0].source,
                  publishedAt: liveNews[0].publishedAt,
                  category: liveNews[0].category,
                  externalLink: liveNews[0].externalLink,
                  views: liveNews[0].views,
                  isTrending: liveNews[0].isTrending
                }}
                onSave={handleSave}
                isSaved={savedIds.has(liveNews[0]._id || liveNews[0].id)}
              />
            )}

            {/* News Grid - Remaining articles */}
            <div className="news-grid">
              {liveNews.slice(1).map((item, index) => (
                <LiveNewsCard
                  key={item._id || item.id}
                  news={{
                    id: item.id,
                    _id: item._id,
                    title: item.title,
                    summary: item.summary,
                    coverImage: item.coverImage,
                    source: item.source,
                    publishedAt: item.publishedAt,
                    category: item.category,
                    externalLink: item.externalLink,
                    views: item.views,
                    isTrending: item.isTrending,
                    isLive: true
                  }}
                  index={index}
                  onSave={handleSave}
                  isSaved={savedIds.has(item._id || item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load More button */}
        {liveNews.length > 0 && liveNews.length >= liveNewsLimit && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4 mt-12 pt-8 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground">
              Showing {liveNews.length} of {liveNewsTotal > liveNews.length ? `${liveNewsTotal}+` : liveNews.length} articles
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() => loadLiveNews(true)}
                disabled={liveNewsLoadingMore || liveNewsLoading}
                className="gap-2 btn-news-primary"
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
            className="text-center py-16 glass-panel rounded-lg"
          >
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="headline-card mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6">No news found for your search criteria.</p>
            <Button variant="outline" onClick={clearLiveNewsFilters} className="btn-news-secondary">
              Clear Filters
            </Button>
          </motion.div>
        )}
        </div>
      </section>
    </main>
  )
}
