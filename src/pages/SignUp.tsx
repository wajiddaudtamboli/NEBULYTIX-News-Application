import { SignUp, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SignUp() {
  const { isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      navigate('/')
    }
  }, [isSignedIn, navigate])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-glow-delayed" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <SignUp 
          routing="path"
          path="/signup"
          signInUrl="/login"
          appearance={{
            elements: {
              rootBox: 'w-full',
              cardBox: 'glass-panel p-8 rounded-2xl border border-border/50 shadow-xl',
              headerTitle: 'font-display text-3xl font-bold text-foreground',
              headerSubtitle: 'text-muted-foreground',
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors',
              inputField: 'border-border rounded-lg bg-background/50 text-foreground placeholder:text-muted-foreground',
              footerAction: 'text-muted-foreground',
              footerActionLink: 'text-primary hover:underline font-medium',
              dividerLine: 'bg-border/30',
              dividerText: 'text-muted-foreground text-xs',
              socialButtonsBlockButton: 'border-border bg-background hover:bg-accent text-foreground rounded-lg',
              formFieldLabel: 'text-foreground font-medium',
              formFieldLabelRequired: 'text-red-500',
              identifierField: 'border-border rounded-lg bg-background/50',
              passwordField: 'border-border rounded-lg bg-background/50',
            },
            variables: {
              colorPrimary: 'hsl(var(--primary))',
              colorBackground: 'hsl(var(--background))',
              colorText: 'hsl(var(--foreground))',
              colorTextSecondary: 'hsl(var(--muted-foreground))',
              colorBorder: 'hsl(var(--border))',
              colorInputBackground: 'hsl(var(--background))',
              borderRadius: '0.5rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            },
          }}
        />
      </motion.div>
    </main>
  )
}
