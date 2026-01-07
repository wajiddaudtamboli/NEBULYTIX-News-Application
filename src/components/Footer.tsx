import { motion } from 'framer-motion'
import { Linkedin, Heart, Mail, MapPin, Globe, Building2 } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const LOGO_URL = 'https://drive.google.com/uc?export=view&id=1gB3bPG_ri6vfMqY5eOWR2HKqG486HzVT'

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const socialLinks = [
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      href: 'https://www.linkedin.com/search/results/companies/?keywords=Nebulytix%20Technologies' 
    },
    { 
      icon: Mail, 
      label: 'Email', 
      href: 'mailto:info@nebulytixtechnologies.com' 
    },
    { 
      icon: MapPin, 
      label: 'Location', 
      href: 'https://www.google.com/maps/search/Nebulytix+Technologies+Hyderabad' 
    },
    { 
      icon: Globe, 
      label: 'Website', 
      href: 'https://nebulytixtechnologies.com/' 
    }
  ]

  const footerLinks = [
    { label: t('footer.about'), href: '#' },
    { label: t('footer.privacy'), href: '#' },
    { label: t('footer.terms'), href: '#' }
  ]

  // Sliding text animation
  const slidingText = "NEBULYTIX NEWS • NEBULYTIX TECHNOLOGIES • REAL-TIME INSIGHTS • GLOBAL NEWS • "

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative border-t border-border/50 mt-12 bg-gradient-to-b from-transparent to-muted/30 overflow-hidden"
    >
      {/* Sliding Banner */}
      <div className="relative bg-primary/10 py-3 overflow-hidden border-b border-border/30">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ 
            x: { repeat: Infinity, duration: 20, ease: "linear" }
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-sm font-medium text-primary/80 mx-4">
              {slidingText}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="content-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Branding */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="h-12 w-12 rounded-xl overflow-hidden shadow-glow-sm"
              >
                <img 
                  src={LOGO_URL} 
                  alt="Nebulytix Logo" 
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div>
                <span className="font-display font-bold text-xl block">NEBULYTIX</span>
                <span className="text-xs text-muted-foreground">News Platform</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              {t('footer.tagline')}
            </p>

            {/* Company Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Nebulytix Technologies Pvt. Ltd.</span>
            </div>
          </div>

          {/* Center: Quick links */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col items-center gap-2">
              {footerLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ x: 4 }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="https://nebulytixtechnologies.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 4 }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Official Website
              </motion.a>
            </div>
          </div>

          {/* Right: Social links & Contact */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <h4 className="font-semibold text-foreground">Connect With Us</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                  aria-label={link.label}
                  title={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              info@nebulytixtechnologies.com
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right">
              📍 Hyderabad, India
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} Nebulytix Technologies Pvt. Ltd. {t('footer.allRightsReserved')}
          </p>
          
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {t('footer.madeWith')} 
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
            </motion.span>
            by <span className="font-medium text-primary">Wajid Daud Tamboli</span>
          </p>
        </div>
      </div>

      {/* Bottom Sliding Strip */}
      <div className="relative bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 py-2 overflow-hidden">
        <motion.div
          animate={{ x: [-500, 0] }}
          transition={{ 
            x: { repeat: Infinity, duration: 15, ease: "linear" }
          }}
          className="flex whitespace-nowrap"
        >
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-xs font-medium text-muted-foreground mx-6">
              ⚡ Breaking News • 🌍 Global Coverage • 📱 Real-time Updates • 🔒 Trusted Source • 
            </span>
          ))}
        </motion.div>
      </div>
    </motion.footer>
  )
}
