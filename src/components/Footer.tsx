import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Heart, Mail } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Mail, label: 'Contact', href: '#' }
  ]

  const footerLinks = [
    { label: 'About', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' }
  ]

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative border-t border-border/50 mt-12 bg-gradient-to-b from-transparent to-muted/30"
    >
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="content-container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Branding */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm"
              >
                <span className="text-primary-foreground font-display font-bold text-lg">N</span>
              </motion.div>
              <span className="font-display font-bold text-xl">NEBULYTIX</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              Your gateway to the stories that shape our world. Stay informed, stay ahead.
            </p>
          </div>

          {/* Center: Quick links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ y: -2 }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Right: Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                aria-label={link.label}
              >
                <link.icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} NEBULYTIX NEWS. All rights reserved.
          </p>
          
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Made with 
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
            </motion.span>
            for the curious minds
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
