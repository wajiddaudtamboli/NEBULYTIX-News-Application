import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Newspaper,
  Star,
  TrendingUp,
  Eye,
  FolderOpen,
  MessageSquare,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminGetStats, getAdminToken } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface Stats {
  totalNews: number
  featuredNews: number
  trendingNews: number
  totalViews: number
  newsByCategory: Array<{ _id: string; count: number }>
}

interface RecentActivity {
  type: string
  message: string
  time: string
}

const statCards = [
  { key: 'totalNews', title: 'Total News', icon: Newspaper, color: 'from-blue-500 to-cyan-500', link: '/admin/news' },
  { key: 'featuredNews', title: 'Featured', icon: Star, color: 'from-yellow-500 to-orange-500', link: '/admin/news?filter=featured' },
  { key: 'trendingNews', title: 'Trending', icon: TrendingUp, color: 'from-pink-500 to-rose-500', link: '/admin/news?filter=trending' },
  { key: 'totalViews', title: 'Total Views', icon: Eye, color: 'from-purple-500 to-indigo-500', link: '/admin/news' },
]

const quickActions = [
  { label: 'Add News', path: '/admin/news', icon: Newspaper },
  { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
  { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [enquiryStats, setEnquiryStats] = useState({ total: 0, new: 0 })
  const [categoryCount, setCategoryCount] = useState(0)

  const fetchStats = useCallback(async () => {
    try {
      const result = await adminGetStats()
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  const fetchEnquiryStats = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch('/api/v1/enquiries/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setEnquiryStats({
          total: data.data.total || 0,
          new: data.data.byStatus?.new || 0
        })
      }
    } catch (err) {
      // Silent fail
    }
  }

  const fetchCategoryCount = async () => {
    try {
      const response = await fetch('/api/v1/categories?includeInactive=true')
      const data = await response.json()
      if (data.success) {
        setCategoryCount(data.data.length)
      }
    } catch (err) {
      // Silent fail
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([fetchStats(), fetchEnquiryStats(), fetchCategoryCount()])
    setLoading(false)
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
    toast({ title: 'Dashboard refreshed' })
  }

  const getStatValue = (key: string) => {
    if (!stats) return '0'
    const value = stats[key as keyof Stats]
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return '0'
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of your news platform">
      <div className="space-y-6">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={card.link}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{card.title}</p>
                          <p className="text-3xl font-bold mt-1">
                            {loading ? '...' : getStatValue(card.key)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" /> Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{categoryCount}</p>
                <Link to="/admin/categories" className="text-sm text-primary hover:underline">
                  Manage categories →
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Enquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{enquiryStats.total}</p>
                  {enquiryStats.new > 0 && (
                    <span className="text-sm px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">
                      {enquiryStats.new} new
                    </span>
                  )}
                </div>
                <Link to="/admin/enquiries" className="text-sm text-primary hover:underline">
                  View enquiries →
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">MongoDB Atlas</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Category Distribution */}
        {stats?.newsByCategory && stats.newsByCategory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardHeader>
                <CardTitle>News by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {stats.newsByCategory.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 rounded-lg bg-muted/50 text-center hover:bg-muted transition-colors"
                    >
                      <p className="text-2xl font-bold">{cat.count}</p>
                      <p className="text-sm text-muted-foreground">{cat._id}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.path} to={action.path}>
                      <Button variant="outline" className="gap-2">
                        <Icon className="w-4 h-4" />
                        {action.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
