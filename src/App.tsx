import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import Index from "./pages/Index"
import SavedNews from "./pages/SavedNews"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

const queryClient = new QueryClient()

const App = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar theme={theme} onToggleTheme={toggleTheme} />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/saved" element={<SavedNews />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
