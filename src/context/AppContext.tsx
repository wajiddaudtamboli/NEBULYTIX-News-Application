import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/clerk-react'
import { fetchSavedArticles, toggleSaveArticle, syncUser } from '@/lib/api'
import type { NewsItem } from '@/lib/api'

interface AppContextType {
  // Saved articles
  savedIds: Set<string>
  savedArticles: NewsItem[]
  isSaved: (id: string) => boolean
  toggleSave: (id: string) => Promise<boolean>
  loadSavedArticles: () => Promise<void>
  
  // Loading states
  isLoadingSaved: boolean
  
  // User sync
  syncUserData: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser()
  
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savedArticles, setSavedArticles] = useState<NewsItem[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  // Sync user with backend on sign in
  const syncUserData = useCallback(async () => {
    if (!isSignedIn || !user) return
    
    try {
      await syncUser(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        user.fullName || user.firstName || ''
      )
    } catch (error) {
      console.error('Failed to sync user:', error)
    }
  }, [isSignedIn, user])

  // Load saved articles
  const loadSavedArticles = useCallback(async () => {
    if (!isSignedIn || !user) {
      setSavedIds(new Set())
      setSavedArticles([])
      return
    }
    
    setIsLoadingSaved(true)
    try {
      const result = await fetchSavedArticles(
        user.id,
        user.primaryEmailAddress?.emailAddress || ''
      )
      
      if (result.success && result.data) {
        setSavedArticles(result.data)
        setSavedIds(new Set(result.data.map((n: NewsItem) => n._id)))
      }
    } catch (error) {
      console.error('Failed to load saved articles:', error)
    } finally {
      setIsLoadingSaved(false)
    }
  }, [isSignedIn, user])

  // Check if article is saved
  const isSaved = useCallback((id: string) => {
    return savedIds.has(id)
  }, [savedIds])

  // Toggle save/unsave
  const toggleSave = useCallback(async (id: string): Promise<boolean> => {
    if (!isSignedIn || !user) return false
    
    const wasSaved = savedIds.has(id)
    
    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev)
      if (wasSaved) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    
    if (wasSaved) {
      setSavedArticles(prev => prev.filter(a => a._id !== id))
    }
    
    try {
      const result = await toggleSaveArticle(
        user.id,
        user.primaryEmailAddress?.emailAddress || '',
        id
      )
      
      if (!result.success) {
        // Revert on failure
        setSavedIds(prev => {
          const next = new Set(prev)
          if (wasSaved) {
            next.add(id)
          } else {
            next.delete(id)
          }
          return next
        })
        return false
      }
      
      return true
    } catch (error) {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev)
        if (wasSaved) {
          next.add(id)
        } else {
          next.delete(id)
        }
        return next
      })
      return false
    }
  }, [isSignedIn, user, savedIds])

  // Initial load
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserData()
      loadSavedArticles()
    } else {
      setSavedIds(new Set())
      setSavedArticles([])
    }
  }, [isSignedIn, user, syncUserData, loadSavedArticles])

  const value: AppContextType = {
    savedIds,
    savedArticles,
    isSaved,
    toggleSave,
    loadSavedArticles,
    isLoadingSaved,
    syncUserData,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
