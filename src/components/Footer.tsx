import { motion } from 'framer-motion'
import { Linkedin, Mail, MapPin, Globe, Building2, Phone, Instagram, Twitter, Zap, Earth, Smartphone, ShieldCheck, Newspaper, Cpu, Send, Radio } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { useState } from 'react'

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
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter subscription
    setEmail('')
    alert('Thank you for subscribing!')
  }

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

  // Sliding text items with Lucide icons (no emoji)
  const slidingItems = [
    { icon: Newspaper, text: 'NEBULYTIX NEWS' },
    { icon: Cpu, text: 'NEBULYTIX TECHNOLOGIES' },
    { icon: Zap, text: 'REAL-TIME INSIGHTS' },
    { icon: Earth, text: 'GLOBAL NEWS' },
  ]

  // Bottom strip items with Lucide icons
  const bottomStripItems = [
    { icon: Zap, text: 'Breaking News' },
    { icon: Earth, text: 'Global Coverage' },
    { icon: Smartphone, text: 'Real-time Updates' },
    { icon: ShieldCheck, text: 'Trusted Source' },
  ]

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
            <div key={i} className="flex items-center">
              {slidingItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2 text-sm font-medium text-primary/80 mx-4">
                  <item.icon className="h-4 w-4" />
                  {item.text}
                  <span className="text-primary/40">•</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="content-container py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Branding */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="h-14 w-14 rounded-xl overflow-hidden shadow-lg border-2 border-primary/20"
              >
                <img 
                  src={LOGO_URL} 
                  alt="Nebulytix Logo" 
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-xl tracking-tight">NEBULYTIX</span>
                  <span className="live-badge text-[9px] py-0.5 px-1.5 rounded-sm">
                    <Radio className="h-2.5 w-2.5" />
                    LIVE
                  </span>
                </div>
                <span className="text-xs text-primary font-semibold tracking-wide uppercase">NEWS PLATFORM</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your gateway to the stories that shape our world. Stay informed, stay ahead.
            </p>

            {/* Company Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{COMPANY_INFO.name}</span>
            </div>
          </div>

          {/* Column 2: Stay Informed - Newsletter */}
          <div className="flex flex-col gap-3">
            <h4 className="font-headline font-bold text-lg text-foreground">Stay Informed</h4>
            <p className="text-sm text-muted-foreground">
              Get breaking news alerts delivered straight to your inbox
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                type="submit"
                className="btn-news-primary px-6 py-3 rounded-lg shrink-0 text-base font-semibold"
              >
                <Send className="h-4 w-4" />
                <span>Subscribe</span>
              </button>
            </form>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="font-headline font-bold text-lg text-foreground">Contact</h4>
            <div className="flex flex-col gap-3">
              {contactInfo.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.label === 'Location' ? '_blank' : undefined}
                  rel={item.label === 'Location' ? 'noopener noreferrer' : undefined}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <item.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                  <span>{item.value}</span>
                </motion.a>
              ))}
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border/30">
              {footerLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 4: Follow Us */}
          <div className="flex flex-col gap-3">
            <h4 className="font-headline font-bold text-lg text-foreground">Follow Us</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-lg bg-muted/50 text-muted-foreground ${link.color} hover:bg-muted transition-all border border-border/30`}
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
              className="mt-2 px-4 py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 w-fit"
            >
              <Globe className="h-4 w-4" />
              Visit Official Website
            </motion.a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {year} {COMPANY_INFO.name}. All rights reserved.
          </p>
          
          <p className="text-sm text-muted-foreground text-center md:text-right">
            Developer - <a href="tel:9667033839" className="font-semibold text-primary hover:underline">Wajid Daud Tamboli</a> - 9667033839
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
            <div key={i} className="flex items-center">
              {bottomStripItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mx-4">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.text}
                  <span className="text-muted-foreground/40">•</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.footer>
  )
}
