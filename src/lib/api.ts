// API configuration
const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Mock data for offline/fallback mode
const MOCK_NEWS = [
  {
    _id: '1',
    id: '1',
    title: 'Revolutionary AI Breakthrough Changes How We Process Data',
    summary: 'Scientists at leading tech institutions have unveiled a new approach to machine learning that promises to reshape data analysis across industries.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    source: 'Tech Weekly',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'Technology',
    views: 5400,
    isTrending: true,
    isFeatured: true,
    tags: ['AI', 'Technology', 'Innovation']
  },
  {
    _id: '2',
    id: '2',
    title: 'Global Markets Rally as Economic Indicators Show Positive Growth',
    summary: 'Stock markets worldwide experienced significant gains following the release of encouraging economic data from major economies.',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    category: 'Business',
    views: 3200,
    isTrending: false,
    isFeatured: true,
    tags: ['Markets', 'Economy', 'Finance']
  },
  {
    _id: '3',
    id: '3',
    title: 'SpaceX Successfully Launches New Satellite Constellation',
    summary: 'The latest mission marks a significant step toward global internet coverage, with 60 new satellites now orbiting Earth.',
    coverImage: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=450&fit=crop',
    source: 'Space News',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'Science',
    views: 4100,
    isTrending: true,
    isFeatured: false,
    tags: ['SpaceX', 'Satellite', 'Internet']
  },
  {
    _id: '4',
    id: '4',
    title: 'Climate Summit Reaches Historic Agreement on Carbon Reduction',
    summary: 'World leaders have committed to ambitious new targets that could reshape global environmental policy for decades.',
    coverImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&h=450&fit=crop',
    source: 'Green Tribune',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'World',
    views: 2800,
    isTrending: false,
    isFeatured: false,
    tags: ['Climate', 'Environment', 'Policy']
  },
  {
    _id: '5',
    id: '5',
    title: 'New Study Reveals Benefits of Intermittent Fasting',
    summary: 'Researchers have found compelling evidence linking periodic fasting to improved metabolic health and longevity.',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
    source: 'Health Today',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    category: 'Health',
    views: 1900,
    isTrending: false,
    isFeatured: false,
    tags: ['Health', 'Fasting', 'Wellness']
  },
  {
    _id: '6',
    id: '6',
    title: 'Major Cybersecurity Firm Discovers Critical Infrastructure Vulnerability',
    summary: 'A newly identified exploit could affect millions of industrial systems worldwide, prompting urgent security updates.',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    source: 'Cyber Defense',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'Technology',
    views: 6200,
    isTrending: true,
    isFeatured: true,
    tags: ['Cybersecurity', 'Infrastructure', 'Security']
  }
]

// Types
export interface NewsItem {
  _id: string
  id?: string
  title: string
  summary: string
  category: string
  source: string
  publishedAt: string
  coverImage: string
  isFeatured: boolean
  isTrending: boolean
  views: number
  tags: string[]
}

export interface NewsResponse {
  success: boolean
  data: NewsItem[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message?: string
  error?: string
}

export interface SingleNewsResponse {
  success: boolean
  data: NewsItem | null
  message?: string
  error?: string
}

interface FetchOptions {
  category?: string
  date?: string
  page?: number
  limit?: number
  featured?: boolean
  trending?: boolean
}

// Helper to normalize news items (add id field from _id)
const normalizeNews = (news: NewsItem[]): NewsItem[] => {
  return news.map(item => ({ ...item, id: item._id }))
}

// Fetch news with filters
export async function fetchNews(options: FetchOptions = {}): Promise<NewsResponse> {
  const params = new URLSearchParams()

  if (options.category && options.category !== 'All') {
    params.append('category', options.category)
  }
  if (options.date) params.append('date', options.date)
  if (options.page) params.append('page', String(options.page))
  if (options.limit) params.append('limit', String(options.limit))
  if (options.featured) params.append('featured', 'true')
  if (options.trending) params.append('trending', 'true')

  try {
    const response = await fetch(`${API_URL}/news?${params}`)
    const data = await response.json()
    
    if (data.success && data.data) {
      return { ...data, data: normalizeNews(data.data) }
    }
    return data
  } catch (error) {
    console.error('Failed to fetch news, using mock data:', error)
    // Return mock data as fallback
    let filteredNews = [...MOCK_NEWS]
    if (options.category && options.category !== 'All') {
      filteredNews = filteredNews.filter(n => n.category === options.category)
    }
    return { 
      success: true, 
      data: filteredNews as NewsItem[], 
      pagination: { page: 1, limit: 20, total: filteredNews.length, pages: 1 }
    }
  }
}

// Fetch featured news - using correct endpoint
export async function fetchFeaturedNews(): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_URL}/news/featured`)
    if (!response.ok) {
      // Fallback to convenience route
      const fallbackResponse = await fetch(`${API_URL}/featured`)
      const data = await fallbackResponse.json()
      return data.success ? { ...data, data: normalizeNews(data.data) } : data
    }
    const data = await response.json()
    return data.success ? { ...data, data: normalizeNews(data.data) } : data
  } catch (error) {
    console.error('Failed to fetch featured news, using mock data:', error)
    const featured = MOCK_NEWS.filter(n => n.isFeatured)
    return { success: true, data: featured as NewsItem[] }
  }
}

// Fetch trending news - using correct endpoint
export async function fetchTrendingNews(): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_URL}/news/trending`)
    if (!response.ok) {
      // Fallback to convenience route
      const fallbackResponse = await fetch(`${API_URL}/trending`)
      const data = await fallbackResponse.json()
      return data.success ? { ...data, data: normalizeNews(data.data) } : data
    }
    const data = await response.json()
    return data.success ? { ...data, data: normalizeNews(data.data) } : data
  } catch (error) {
    console.error('Failed to fetch trending news, using mock data:', error)
    const trending = MOCK_NEWS.filter(n => n.isTrending)
    return { success: true, data: trending as NewsItem[] }
  }
}

// Fetch single news by ID
export async function fetchNewsById(id: string): Promise<SingleNewsResponse> {
  try {
    const response = await fetch(`${API_URL}/news/${id}`)
    const data = await response.json()
    
    if (data.success && data.data) {
      return { ...data, data: { ...data.data, id: data.data._id } }
    }
    return data
  } catch (error) {
    console.error('Failed to fetch news by ID, using mock data:', error)
    const mockItem = MOCK_NEWS.find(n => n._id === id || n.id === id)
    if (mockItem) {
      return { success: true, data: mockItem as NewsItem }
    }
    return { success: false, data: null, error: 'News not found' }
  }
}

// Sync user with backend (Clerk integration)
export async function syncUser(clerkId: string, email: string, name?: string) {
  try {
    const response = await fetch(`${API_URL}/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId, email, name }),
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to sync user:', error)
    return { success: false, message: 'Failed to sync user' }
  }
}

// Toggle save/unsave article
export async function toggleSaveArticle(clerkId: string, email: string, newsId: string) {
  try {
    const response = await fetch(`${API_URL}/user/save/${newsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': clerkId,
        'x-user-email': email,
      },
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to save article:', error)
    return { success: false, message: 'Failed to save article' }
  }
}

// Fetch saved articles
export async function fetchSavedArticles(clerkId: string, email: string): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_URL}/user/saved/all`, {
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': clerkId,
        'x-user-email': email,
      },
    })
    
    if (!response.ok) {
      return { success: false, data: [], error: 'Failed to fetch saved articles' }
    }
    
    const data = await response.json()
    return data.success ? { ...data, data: normalizeNews(data.data || []) } : data
  } catch (error) {
    console.error('Failed to fetch saved articles:', error)
    return { success: false, data: [], error: 'Failed to fetch saved articles' }
  }
}

// Fetch categories
export async function fetchCategories(): Promise<{ success: boolean; data: string[] }> {
  try {
    const response = await fetch(`${API_URL}/news/categories/list`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return { success: false, data: [] }
  }
}

// Admin API functions
const ADMIN_TOKEN_KEY = 'nebulytix_admin_token'

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function adminLogin(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    
    if (data.success && data.data?.token) {
      setAdminToken(data.data.token)
    }
    
    return data
  } catch (error) {
    console.error('Admin login failed:', error)
    return { success: false, message: 'Login failed' }
  }
}

export async function verifyAdminToken() {
  const token = getAdminToken()
  if (!token) return { success: false, message: 'No token' }
  
  try {
    const response = await fetch(`${API_URL}/auth/admin/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return await response.json()
  } catch (error) {
    console.error('Token verification failed:', error)
    return { success: false, message: 'Verification failed' }
  }
}

export async function adminSetup(email: string, password: string, name: string, setupKey: string) {
  try {
    const response = await fetch(`${API_URL}/auth/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, setupKey }),
    })
    const data = await response.json()
    
    if (data.success && data.data?.token) {
      setAdminToken(data.data.token)
    }
    
    return data
  } catch (error) {
    console.error('Admin setup failed:', error)
    return { success: false, message: 'Setup failed' }
  }
}

// Admin CRUD operations
async function adminFetch(url: string, options: RequestInit = {}) {
  const token = getAdminToken()
  if (!token) {
    return { success: false, message: 'Not authenticated' }
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
  
  return response.json()
}

export async function adminGetStats() {
  return adminFetch(`${API_URL}/admin/stats`)
}

export async function adminGetAllNews(page = 1, limit = 50, category?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (category) params.append('category', category)
  return adminFetch(`${API_URL}/admin/news/all?${params}`)
}

export async function adminCreateNews(newsData: Partial<NewsItem>) {
  return adminFetch(`${API_URL}/admin/news/create`, {
    method: 'POST',
    body: JSON.stringify(newsData),
  })
}

export async function adminUpdateNews(id: string, updates: Partial<NewsItem>) {
  return adminFetch(`${API_URL}/admin/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export async function adminDeleteNews(id: string) {
  return adminFetch(`${API_URL}/admin/news/${id}`, {
    method: 'DELETE',
  })
}

export async function adminToggleFeatured(id: string) {
  return adminFetch(`${API_URL}/admin/news/${id}/featured`, {
    method: 'PATCH',
  })
}

export async function adminToggleTrending(id: string) {
  return adminFetch(`${API_URL}/admin/news/${id}/trending`, {
    method: 'PATCH',
  })
}
