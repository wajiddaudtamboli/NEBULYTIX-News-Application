import { Suspense, lazy } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { ClerkProvider } from "@clerk/clerk-react"
import { useTheme } from "@/hooks/useTheme"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { AppProvider } from "@/context/AppContext"
import { Loader2 } from "lucide-react"

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"))
const SavedNews = lazy(() => import("./pages/SavedNews"))
const Login = lazy(() => import("./pages/Login"))
const SignUp = lazy(() => import("./pages/SignUp"))
const AdminLogin = lazy(() => import("./pages/AdminLogin"))
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"))
const NotFound = lazy(() => import("./pages/NotFound"))
const Contact = lazy(() => import("./pages/Contact"))

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/DashboardPage"))
const AdminNews = lazy(() => import("./pages/admin/NewsManagementPage"))
const AdminCategories = lazy(() => import("./pages/admin/CategoriesPage"))
const AdminSettings = lazy(() => import("./pages/admin/SettingsPage"))
const AdminEnquiries = lazy(() => import("./pages/admin/EnquiriesPage"))
const AdminBlogs = lazy(() => import("./pages/admin/BlogsPage"))
const AdminPages = lazy(() => import("./pages/admin/PagesPage"))
const AdminMedia = lazy(() => import("./pages/admin/MediaPage"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

// Get Clerk key with fallback for development
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Loading component
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

// Environment error component
function EnvError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
        <p className="text-muted-foreground">
          Missing required environment variables. Please check your .env file.
        </p>
        <code className="block p-4 bg-muted rounded-lg text-sm">
          VITE_CLERK_PUBLISHABLE_KEY is not set
        </code>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/saved" element={<SavedNews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/enquiries" element={<AdminEnquiries />} />
          <Route path="/admin/blogs" element={<AdminBlogs />} />
          <Route path="/admin/pages" element={<AdminPages />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login'

  // Don't show navbar/footer on admin pages (except login)
  if (isAdminRoute) {
    return <AnimatedRoutes />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content - Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main id="main-content" className="flex-1" role="main">
        <AnimatedRoutes />
      </main>
      <Footer />
    </div>
  )
}

function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </BrowserRouter>
  )
}

const App = () => {
  // Show error if Clerk key is missing
  if (!publishableKey) {
    return <EnvError />
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={publishableKey}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppRouter />
            </TooltipProvider>
          </AppProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  )
}

export default App
