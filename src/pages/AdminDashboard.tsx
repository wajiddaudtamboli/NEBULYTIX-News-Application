import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Newspaper, 
  Star, 
  TrendingUp,
  Eye,
  Plus,
  LogOut,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminNewsTable } from '@/components/admin/AdminNewsTable'
import { CreateNewsModal } from '@/components/admin/CreateNewsModal'
import { verifyAdminToken, adminGetStats, clearAdminToken, getAdminToken } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { useLanguage } from '@/lib/LanguageContext'

interface Stats {
  totalNews: number
  featuredNews: number
  trendingNews: number
  totalViews: number
  newsByCategory: Array<{ _id: string; count: number }>
}

interface AdminData {
  id: string
  email: string
  name: string
  role: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [admin, setAdmin] = useState<AdminData | null>(null)

  // Check if admin is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAdminToken()
      
      if (!token) {
        navigate('/admin/login')
        return
      }

      try {
        const result = await verifyAdminToken()
        
        if (result.success && result.data) {
          setAdmin(result.data)
          fetchStats()
        } else {
          clearAdminToken()
          navigate('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        clearAdminToken()
        navigate('/admin/login')
      }
    }

    checkAuth()
  }, [navigate])

  const fetchStats = useCallback(async () => {
    try {
      const result = await adminGetStats()
      
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      toast({
        title: 'Failed to load stats',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  const handleLogout = () => {
    clearAdminToken()
    toast({ title: t('admin.logoutSuccess') })
    navigate('/admin/login')
  }

  const statCards = [
    {
      title: t('admin.totalNews'),
      value: stats?.totalNews || 0,
      icon: Newspaper,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: t('admin.featured'),
      value: stats?.featuredNews || 0,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: t('admin.trending'),
      value: stats?.trendingNews || 0,
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: t('admin.totalViews'),
      value: stats?.totalViews?.toLocaleString() || '0',
      icon: Eye,
      color: 'from-purple-500 to-indigo-500',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t('admin.accessDenied')}</h1>
          <p className="text-muted-foreground">{t('admin.pleaseLogin')}</p>
          <Button onClick={() => navigate('/admin/login')}>
            {t('admin.goToLogin')}
          </Button>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">{t('admin.dashboard')}</h1>
              <p className="text-muted-foreground">
                {t('admin.welcomeBack')}, <span className="text-foreground font-medium">{admin.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('admin.addNews')}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                title={t('nav.logout')}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
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
        {stats?.newsByCategory && stats.newsByCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('admin.categoryDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stats.newsByCategory.map((cat) => (
                    <div
                      key={cat._id}
                      className="p-4 rounded-lg bg-muted/50 border border-border/30 text-center hover:bg-muted transition-colors"
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
