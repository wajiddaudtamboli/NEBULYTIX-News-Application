import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { NewsCard } from '@/components/NewsCard'
import { EmptyState } from '@/components/EmptyState'

export default function SavedNews() {
  const [savedNews] = useState<any[]>([])

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
        {savedNews.length === 0 ? (
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
                key={news.id}
                news={news}
                index={index}
                isSaved
              />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}
