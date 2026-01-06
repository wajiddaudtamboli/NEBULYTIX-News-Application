import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bookmark, Home, LogIn } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/button'
import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/saved', label: 'Saved', icon: Bookmark },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.div 
              className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.05 }}
            >
              <span className="text-primary-foreground font-display font-bold text-lg">N</span>
            </motion.div>
            <span className="font-display font-bold text-xl text-foreground hidden sm:block">
              NEBULYTIX
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            
            <Link to="/login" className="hidden md:block">
              <Button variant="hero" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-2 overflow-hidden"
            >
              <div className="glass-panel p-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant={isActive(link.path) ? 'default' : 'ghost'}
                      className="w-full justify-start gap-2"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="hero" className="w-full gap-2 mt-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
