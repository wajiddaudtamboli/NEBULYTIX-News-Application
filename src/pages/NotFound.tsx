import { motion } from 'framer-motion'
import { Home, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6"
        >
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </motion.div>

        <h1 className="font-display text-6xl font-bold text-gradient mb-4">404</h1>
        <h2 className="font-display text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <Link to="/">
          <Button variant="hero" size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </main>
  )
}

export default NotFound