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
import Index from "./pages/Index"
import SavedNews from "./pages/SavedNews"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import AdminDashboard from "./pages/AdminDashboard"
import ArticleDetail from "./pages/ArticleDetail"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not set");
}

function AnimatedRoutes() {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/saved" element={<SavedNews />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

const App = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background">
              <Navbar theme={theme} onToggleTheme={toggleTheme} />
              <div className="flex-1">
                <AnimatedRoutes />
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export default App
