import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Menu, X, Bookmark, Home, LogIn, Sparkles } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 100], [0.7, 0.95])
  const blur = useTransform(scrollY, [0, 100], [12, 20])

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/saved', label: 'Saved', icon: Bookmark },
  ]

  const isActive = (path: string) => location.pathname === path

  // Hide/show navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
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
          className="relative rounded-2xl border border-border/50 px-4 sm:px-6 py-3 flex items-center justify-between overflow-hidden"
          style={{
            backgroundColor: `hsl(var(--glass-bg))`,
            backdropFilter: `blur(${blur}px)`,
          }}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          {/* Logo */}
          <Link to="/" className="relative flex items-center gap-3 group">
            <motion.div 
              className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-glow-sm overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-primary-foreground font-display font-bold text-lg relative z-10">N</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-xl text-foreground">
                NEBULYTIX
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Sparkles className="h-2.5 w-2.5 text-primary" />
                <span>News Platform</span>
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

          {/* Right section */}
          <div className="relative flex items-center gap-2 sm:gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            
            <Link to="/login" className="hidden md:block">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero" size="sm" className="gap-2 btn-depth">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </motion.div>
            </Link>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle menu"
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
                  className="pt-2 border-t border-border/50"
                >
                  <Link to="/login">
                    <Button variant="hero" className="w-full gap-2 h-12">
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  )
}
