// Use relative URLs for Vercel serverless functions or fallback to localhost for dev
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'
)

interface NewsItem {
  _id: string
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

interface NewsResponse {
  success: boolean
  data: NewsItem[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
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
    return data
  } catch (error) {
    console.error('Failed to fetch news:', error)
    return { success: false, data: [], error: 'Failed to fetch news' }
  }
}

export async function fetchFeaturedNews(): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_URL}/featured`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch featured news:', error)
    return { success: false, data: [], error: 'Failed to fetch featured news' }
  }
}

export async function fetchTrendingNews(): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_URL}/trending`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch trending news:', error)
    return { success: false, data: [], error: 'Failed to fetch trending news' }
  }
}

export async function fetchNewsById(id: string): Promise<{ success: boolean; data: NewsItem | null; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/news/${id}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch news:', error)
    return { success: false, data: null, error: 'Failed to fetch news' }
  }
}

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
    return { success: false }
  }
}

export async function toggleSaveArticle(clerkId: string, email: string, newsId: string) {
  try {
    const response = await fetch(`${API_URL}/user/save/${newsId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': clerkId,
      },
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to save article:', error)
    return { success: false }
  }
}

export async function fetchSavedArticles(clerkId: string, email: string): Promise<NewsResponse> {
  try {
    const response = await fetch(`${API_URL}/user/saved`, {
      headers: {
        'x-clerk-user-id': clerkId,
      },
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch saved articles:', error)
    return { success: false, data: [], error: 'Failed to fetch saved articles' }
  }
}

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
