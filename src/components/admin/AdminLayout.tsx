import { ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AdminSidebar } from './AdminSidebar'
import { verifyAdminToken, getAdminToken, clearAdminToken } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState<any>(null)
  const [enquiryCount, setEnquiryCount] = useState(0)

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
          // Fetch enquiry count for badge
          fetchEnquiryCount()
        } else {
          clearAdminToken()
          navigate('/admin/login')
        }
      } catch (error) {
        clearAdminToken()
        navigate('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  const fetchEnquiryCount = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch('/api/v1/enquiries/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setEnquiryCount(data.data.byStatus?.new || 0)
      }
    } catch (err) {
      // Ignore - badge just won't show
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar enquiryCount={enquiryCount} />
      
      {/* Main Content */}
      <div className="lg:pl-[260px] transition-all duration-300">
        <main className="min-h-screen">
          {/* Header */}
          {(title || subtitle) && (
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <motion.h1
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold"
                    >
                      {title}
                    </motion.h1>
                  )}
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-muted-foreground mt-1"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Welcome, <span className="font-medium text-foreground">{admin.name || admin.email}</span>
                  </span>
                </div>
              </div>
            </header>
          )}
          
          {/* Page Content */}
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
