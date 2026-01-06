import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Newspaper, 
  Star, 
  TrendingUp,
  Eye,
  Plus,
  Settings,
  Users
} from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminNewsTable } from '@/components/admin/AdminNewsTable'
import { CreateNewsModal } from '@/components/admin/CreateNewsModal'

interface Stats {
  totalNews: number
  featuredNews: number
  trendingNews: number
  totalViews: number
  newsByCategory: Array<{ _id: string; count: number }>
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/login')
    }
  }, [isLoaded, user, navigate])

  useEffect(() => {
    if (user) {
      verifyAdmin()
    }
  }, [user])

  const verifyAdmin = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': 'admin123',
        },
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
          name: user?.fullName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setIsAdmin(true)
        fetchStats()
      } else {
        setIsAdmin(false)
        setLoading(false)
      }
    } catch (error) {
      console.error('Admin verification failed:', error)
      setIsAdmin(false)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/stats`, {
        headers: {
          'x-clerk-id': user?.id || '',
          'x-admin-role': 'admin',
        },
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total News',
      value: stats?.totalNews || 0,
      icon: Newspaper,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Featured',
      value: stats?.featuredNews || 0,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Trending',
      value: stats?.trendingNews || 0,
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews.toLocaleString() || '0',
      icon: Eye,
      color: 'from-purple-500 to-indigo-500',
    },
  ]

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage news content and analytics</p>
            </div>
            <Button 
              variant="hero" 
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add News
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-panel border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Category Breakdown */}
        {stats?.newsByCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stats.newsByCategory.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 rounded-lg bg-background/50 border border-border/30 text-center"
                    >
                      <p className="font-medium text-sm text-muted-foreground">{cat._id}</p>
                      <p className="text-2xl font-bold">{cat.count}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* News Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AdminNewsTable onRefresh={fetchStats} />
        </motion.div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateNewsModal 
            onClose={() => setShowCreateModal(false)} 
            onSuccess={() => {
              setShowCreateModal(false)
              fetchStats()
            }} 
          />
        )}
      </div>
    </main>
  )
}
