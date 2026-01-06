import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  FileText,
  BookOpen,
  MessageSquare,
  Image,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { clearAdminToken } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

interface SidebarItem {
  icon: React.ElementType
  label: string
  path: string
  badge?: number
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Newspaper, label: 'News', path: '/admin/news' },
  { icon: FolderOpen, label: 'Categories', path: '/admin/categories' },
  { icon: BookOpen, label: 'Blogs', path: '/admin/blogs' },
  { icon: FileText, label: 'Pages', path: '/admin/pages' },
  { icon: MessageSquare, label: 'Enquiries', path: '/admin/enquiries' },
  { icon: Image, label: 'Media', path: '/admin/media' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

interface AdminSidebarProps {
  enquiryCount?: number
}

export function AdminSidebar({ enquiryCount = 0 }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAdminToken()
    navigate('/admin/login')
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">N</span>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg">NEBULYTIX</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          const showBadge = item.label === 'Enquiries' && enquiryCount > 0

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-accent/50 group relative',
                active && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', active ? '' : 'text-muted-foreground group-hover:text-foreground')} />
              {!collapsed && (
                <span className="flex-1 font-medium">{item.label}</span>
              )}
              {showBadge && !collapsed && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                  {enquiryCount}
                </span>
              )}
              {showBadge && collapsed && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                  {enquiryCount > 9 ? '9+' : enquiryCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-2">
        <Button
          variant="ghost"
          className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full hidden lg:flex justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border z-50 lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-card border-r border-border z-30"
      >
        <SidebarContent />
      </motion.aside>
    </>
  )
}
