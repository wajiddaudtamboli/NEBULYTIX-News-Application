import { motion } from 'framer-motion'
import { Linkedin, Mail, MapPin, Globe, Building2, Phone, Instagram, Twitter } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const LOGO_URL = 'https://res.cloudinary.com/duhhsnbwh/image/upload/v1767754727/WhatsApp_Image_2026-01-06_at_1.58.30_PM_gsijk5.jpg'

// Company Contact Information
const COMPANY_INFO = {
  name: 'Nebulytix Technologies Pvt. Ltd.',
  email: 'hr@nebulytixtechnologies.com',
  phone: '+91 7660999155',
  website: 'https://nebulytixtechnologies.com/',
  linkedin: 'https://www.linkedin.com/company/nebulytix-technologies/',
  twitter: 'https://nebulytixtechnologies.com/',
  instagram: 'https://nebulytixtechnologies.com/',
  maps: 'https://maps.app.goo.gl/iZoCManNKdEGLGMV7',
  location: 'Hyderabad, India'
}

export function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  const socialLinks = [
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      href: COMPANY_INFO.linkedin,
      color: 'hover:text-[#0A66C2]'
    },
    { 
      icon: Instagram, 
      label: 'Instagram', 
      href: COMPANY_INFO.instagram,
      color: 'hover:text-[#E4405F]'
    },
    { 
      icon: Twitter, 
      label: 'Twitter', 
      href: COMPANY_INFO.twitter,
      color: 'hover:text-[#1DA1F2]'
    },
    { 
      icon: Globe, 
      label: 'Website', 
      href: COMPANY_INFO.website,
      color: 'hover:text-primary'
    },
    { 
      icon: Mail, 
      label: 'Email', 
      href: `mailto:${COMPANY_INFO.email}`,
      color: 'hover:text-[#EA4335]'
    },
    { 
      icon: MapPin, 
      label: 'Location', 
      href: COMPANY_INFO.maps,
      color: 'hover:text-[#34A853]'
    }
  ]

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: COMPANY_INFO.phone,
      href: `tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`
    },
    {
      icon: Mail,
      label: 'Email',
      value: COMPANY_INFO.email,
      href: `mailto:${COMPANY_INFO.email}`
    },
    {
      icon: MapPin,
      label: 'Location',
      value: COMPANY_INFO.location,
      href: COMPANY_INFO.maps
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
              <span>{COMPANY_INFO.name}</span>
            </div>
          </div>

          {/* Center: Contact Info */}
          <div className="flex flex-col items-center gap-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="flex flex-col items-center gap-3">
              {contactInfo.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.label === 'Location' ? '_blank' : undefined}
                  rel={item.label === 'Location' ? 'noopener noreferrer' : undefined}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.value}</span>
                </motion.a>
              ))}
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {footerLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right: Social links */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <h4 className="font-semibold text-foreground">Follow Us</h4>
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-xl bg-muted/50 text-muted-foreground ${link.color} hover:bg-muted transition-all`}
                  aria-label={link.label}
                  title={link.label}
                >
                  <link.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
            
            {/* Visit Website CTA */}
            <motion.a
              href={COMPANY_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Visit Official Website
            </motion.a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {year} {COMPANY_INFO.name} {t('footer.allRightsReserved')}
          </p>
          
          <p className="text-sm text-muted-foreground text-center sm:text-right">
            Developer - <span className="font-medium text-primary">Wajid Daud Tamboli</span> - 9667033839
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
