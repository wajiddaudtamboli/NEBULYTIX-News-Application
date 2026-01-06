import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { NewsCard } from '@/components/NewsCard'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonCard } from '@/components/SkeletonCard'
import { fetchSavedArticles, toggleSaveArticle } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

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

export default function SavedNews() {
  const { user, isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate()
  const [savedNews, setSavedNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login')
    }
  }, [isLoaded, isSignedIn, navigate])

  useEffect(() => {
    if (isSignedIn && user) {
      loadSavedNews()
    }
  }, [isSignedIn, user])

  const loadSavedNews = async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await fetchSavedArticles(
        user.id,
        user.primaryEmailAddress?.emailAddress || ''
      )
      if (result.success) {
        setSavedNews(result.data.map((n: any) => ({ ...n, id: n._id })))
      }
    } catch (error) {
      console.error('Failed to load saved news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!user) return

    // Optimistic remove
    setSavedNews(prev => prev.filter(n => n._id !== id && n.id !== id))

    const result = await toggleSaveArticle(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      id
    )

    if (result.success) {
      toast({ title: 'Article removed from saved' })
    } else {
      // Reload on failure
      loadSavedNews()
      toast({ title: 'Failed to remove article', variant: 'destructive' })
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="content-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link to="/">
            <motion.div whileHover={{ x: -4 }} className="inline-block">
              <Button variant="ghost" className="gap-2 mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Button>
            </motion.div>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              Saved Articles
            </h1>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
              {savedNews.length} saved
            </span>
          </div>
          <p className="text-muted-foreground text-lg">
            Your bookmarked stories in one place
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : savedNews.length === 0 ? (
          <EmptyState type="no-saved" />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {savedNews.map((news, index) => (
              <NewsCard
                key={news._id || news.id}
                news={news}
                index={index}
                isSaved
                onSave={() => handleRemove(news._id || news.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}
