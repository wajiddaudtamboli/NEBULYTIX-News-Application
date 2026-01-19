import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Menu, X, Bookmark, Home, LogIn, Sparkles, LogOut, User, Shield } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import LanguageSelector from './LanguageSelector'
import { useLanguage } from '@/lib/LanguageContext'
import { getAdminToken } from '@/lib/api'

interface NavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const { t } = useLanguage()
  
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 100], [0.7, 0.95])
  const blur = useTransform(scrollY, [0, 100], [12, 20])

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/saved', label: t('nav.saved'), icon: Bookmark },
  ]

  const isActive = (path: string) => location.pathname === path

  // Check if user is admin
  useEffect(() => {
    const adminToken = getAdminToken()
    setIsAdmin(!!adminToken)
  }, [location])

  // Hide/show navbar on scroll with improved UX
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Add scrolled state for enhanced styling
      setIsScrolled(currentScrollY > 50)
      
      // Hide navbar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: hidden ? -100 : 0, 
        opacity: hidden ? 0 : 1 
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        style={{
          perspective: 1000
        }}
      >
        <motion.div 
          className={`relative rounded-2xl border px-4 sm:px-6 py-3 flex items-center justify-between overflow-hidden transition-all duration-300 ${
            isScrolled 
              ? 'border-border/60 shadow-lg' 
              : 'border-border/40'
          }`}
          style={{
            backgroundColor: `hsl(var(--glass-bg))`,
            backdropFilter: `blur(${blur}px)`,
          }}
        >
          {/* Background glow effect - enhanced on scroll */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isScrolled ? 'opacity-100' : 'opacity-60'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          </div>
          
          {/* Logo */}
          <Link to="/" className="relative flex items-center gap-3 group">
            <motion.div 
              className="relative h-10 w-10 rounded-lg shadow-glow-sm overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                src="https://res.cloudinary.com/duhhsnbwh/image/upload/v1767754727/WhatsApp_Image_2026-01-06_at_1.58.30_PM_gsijk5.jpg" 
                alt="Nebulytix Logo"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-xl text-foreground tracking-tight">
                  NEBULYTIX
                </span>
                <span className="live-badge text-[9px] py-0.5 px-1.5">
                  <span className="live-dot scale-75" />
                  LIVE
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Breaking News • Real-Time
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isActive(link.path) ? 'default' : 'ghost'}
                    size="sm"
                    className={`
                      gap-2 relative
                      ${isActive(link.path) ? 'shadow-glow-sm' : ''}
                    `}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      />
                    )}
                  </Button>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right section - Grouped logically */}
          <div className="relative flex items-center gap-2 sm:gap-3">
            {/* Settings group: Language + Theme */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30">
              <LanguageSelector />
              <div className="w-px h-4 bg-border/50" />
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
            
            {/* Mobile: Just icons */}
            <div className="flex sm:hidden items-center gap-1">
              <LanguageSelector />
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
            
            {/* Admin Button - Visible based on admin status */}
            <Link to={isAdmin ? '/admin' : '/admin/login'} className="hidden md:block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant={location.pathname.startsWith('/admin') ? 'default' : 'outline'} 
                  size="sm" 
                  className={`gap-2 ${isAdmin ? 'border-primary/50' : ''}`}
                  aria-label={t('nav.admin')}
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden lg:inline">{t('nav.admin')}</span>
                </Button>
              </motion.div>
            </Link>
            
            {isSignedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="User menu"
                  >
                    {user.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || 'User'} 
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/20"
                        loading="lazy"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium max-w-[100px] truncate hidden lg:inline">
                      {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/saved" className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      {t('nav.saved')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="text-red-600 cursor-pointer focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="hidden md:block">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="hero" size="sm" className="gap-2 btn-depth">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden lg:inline">{t('nav.login')}</span>
                  </Button>
                </motion.div>
              </Link>
            )}

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="md:hidden mt-2 overflow-hidden"
            >
              <div className="glass-panel-elevated p-4 flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link to={link.path}>
                      <Button
                        variant={isActive(link.path) ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 h-12"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Button>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2 border-t border-border/50 space-y-2"
                >
                  {/* Admin Button - Smart visibility in Mobile */}
                  <Link to={isAdmin ? '/admin' : '/admin/login'}>
                    <Button 
                      variant={location.pathname.startsWith('/admin') ? 'default' : 'outline'} 
                      className={`w-full gap-2 h-12 ${isAdmin ? 'border-primary/50' : ''}`}
                    >
                      <Shield className="h-5 w-5" />
                      {isAdmin ? t('admin.dashboard') : t('nav.admin')}
                    </Button>
                  </Link>
                  
                  {!isSignedIn && (
                    <Link to="/login">
                      <Button variant="hero" className="w-full gap-2 h-12">
                        <LogIn className="h-5 w-5" />
                        {t('nav.login')}
                      </Button>
                    </Link>
                  )}
                  
                  {isSignedIn && (
                    <Button 
                      variant="ghost" 
                      className="w-full gap-2 h-12 text-red-600 hover:text-red-600 hover:bg-red-600/10"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-5 w-5" />
                      {t('nav.logout')}
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  )
}
