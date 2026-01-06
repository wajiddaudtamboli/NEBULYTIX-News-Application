import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function SavedNews() {
  const [savedNews] = useState<any[]>([])

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Button>
          </Link>

          <h1 className="font-display text-4xl font-bold mb-2">Saved Articles</h1>
          <p className="text-muted-foreground">Your bookmarked stories in one place</p>
        </motion.div>

        {savedNews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
            </div>
            
            <h2 className="font-display text-2xl font-semibold mb-2">No saved articles yet</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Start exploring and save articles that interest you. They'll appear here for easy access later.
            </p>

            <Link to="/">
              <Button variant="hero" size="lg">
                Explore News
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* saved cards would render here */}
          </div>
        )}
      </div>
    </main>
  )
}
