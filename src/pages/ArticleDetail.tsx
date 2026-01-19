import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Clock, 
  Eye,
  Loader2,
  ExternalLink,
  Sparkles,
  Star
} from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toggleSaveArticle, fetchSavedArticles } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/LanguageContext'

interface Article {
  _id: string
  title: string
  summary: string
  content?: string
  category: string
  source: string
  publishedAt: string
  coverImage: string
  views: number
  tags: string[]
  isFeatured: boolean
  isTrending: boolean
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isSignedIn } = useUser()
  const { t } = useLanguage()
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (id) {
      loadArticle()
      if (isSignedIn && user) {
        checkIfSaved()
      }
    }
  }, [id, isSignedIn, user])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/news/${id}`)
      if (!response.ok) throw new Error('Article not found')
      const result = await response.json()
      // Handle both {success, data} format and direct data format
      if (result.success && result.data) {
        setArticle(result.data)
      } else if (result._id) {
        setArticle(result)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError('Failed to load article')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const checkIfSaved = async () => {
    if (!user) return
    const result = await fetchSavedArticles(
      user.id,
      user.primaryEmailAddress?.emailAddress || ''
    )
    if (result.success) {
      const savedIds = result.data.map((a: any) => a._id)
      setIsSaved(savedIds.includes(id))
    }
  }

  const handleSave = async () => {
    if (!isSignedIn) {
      navigate('/login')
      return
    }
    if (!user || !id) return

    setIsSaved(!isSaved)
    const result = await toggleSaveArticle(
      user.id,
      user.primaryEmailAddress?.emailAddress || '',
      id
    )

    if (result.success) {
      toast({
        title: isSaved ? t('article.removedFromSaved') : t('article.articleSaved'),
      })
    } else {
      setIsSaved(isSaved)
      toast({
        title: t('article.failedToSave'),
        variant: 'destructive'
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: t('article.linkCopied') })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">{t('article.notFound')}</h1>
        <p className="text-muted-foreground mb-6">{error || t('article.notFoundDesc')}</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('saved.backToFeed')}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen pt-20 pb-16">
      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] md:h-[60vh] overflow-hidden"
      >
        <img
          src={article.coverImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button overlay */}
        <div className="absolute top-6 left-6 z-10">
          <Link to="/">
            <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Content */}
      <div className="content-container -mt-32 relative z-10">
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            {/* Tags & Category */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Badge variant="default" className="text-sm">
                {article.category}
              </Badge>
              {article.isFeatured && (
                <Badge variant="secondary"><Star className="w-3 h-3 mr-1" /> {t('article.featured')}</Badge>
              )}
              {article.isTrending && (
                <Badge variant="destructive" className="bg-gradient-to-r from-orange-500 to-red-500">
                  <Sparkles className="w-3 h-3 mr-1" /> {t('article.trending')}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <span className="font-medium text-foreground">{article.source}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {formatViews(article.views)} {t('article.views')}
              </span>
            </div>

            {/* Summary/Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.summary}
              </p>
              {article.content && (
                <div className="mt-6" dangerouslySetInnerHTML={{ __html: article.content }} />
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-8 border-t">
              <Button
                onClick={handleSave}
                variant={isSaved ? 'default' : 'outline'}
                className="gap-2"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    {t('article.saved')}
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    {t('article.saveArticle')}
                  </>
                )}
              </Button>

              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                {t('article.share')}
              </Button>

              {/* External link to source */}
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {t('article.findOnWeb')}
                </Button>
              </a>
            </div>
          </div>
        </motion.article>
      </div>
    </main>
  )
}
