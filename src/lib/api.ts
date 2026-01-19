// API configuration - use relative URL in production, allow override for development
const getApiUrl = () => {
  // In production (Vercel), always use relative path
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api/v1'
  }
  // In development, use env variable or default to localhost
  return import.meta.env.VITE_API_URL || '/api/v1'
}

const API_URL = getApiUrl()

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
    console.error('Failed to fetch news:', error)
    return { success: false, data: [], error: 'Failed to fetch news' }
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
    console.error('Failed to fetch featured news:', error)
    return { success: false, data: [], error: 'Failed to fetch featured news' }
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
    console.error('Failed to fetch trending news:', error)
    return { success: false, data: [], error: 'Failed to fetch trending news' }
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
    console.error('Failed to fetch news by ID:', error)
    return { success: false, data: null, error: 'Failed to fetch news' }
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

// ============================================
// External News API (GNews - Free tier: 100 req/day)
// Get your free API key at: https://gnews.io/
// ============================================

// Available news categories from GNews API
export const EXTERNAL_NEWS_CATEGORIES = [
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health'
] as const;

export type ExternalNewsCategory = typeof EXTERNAL_NEWS_CATEGORIES[number];

export interface ExternalNewsItem extends NewsItem {
  externalLink?: string;
}

export interface ExternalNewsResponse {
  success: boolean;
  data: ExternalNewsItem[];
  category?: string;
  total?: number;
  error?: string;
  filters?: {
    from: string | null;
    to: string | null;
  };
}

// Fetch news from GNews API by category with optional date filtering
export async function fetchExternalNews(
  category: ExternalNewsCategory = 'general',
  limit: number = 10,
  fromDate?: string, // Format: YYYY-MM-DD
  toDate?: string    // Format: YYYY-MM-DD
): Promise<ExternalNewsResponse> {
  try {
    let url = `${API_URL}/external-news?category=${category}&limit=${limit}`;
    if (fromDate) url += `&from=${fromDate}`;
    if (toDate) url += `&to=${toDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`External news API returned ${response.status}`);
      return { success: false, data: [], error: `API returned status ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return { ...data, data: normalizeNews(data.data) };
    }
    
    return { success: false, data: [], error: 'No news data available' };
  } catch (error) {
    console.error('Failed to fetch external news:', error);
    return { success: false, data: [], error: 'Failed to fetch news' };
  }
}

// Fetch headlines from multiple external sources
export async function fetchExternalHeadlines(limit: number = 10): Promise<ExternalNewsResponse> {
  try {
    const response = await fetch(
      `${API_URL}/external-news?type=headlines&limit=${limit}`
    );
    const data = await response.json();
    
    if (data.success && data.data) {
      return { ...data, data: normalizeNews(data.data) };
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch headlines:', error);
    return { success: false, data: [], error: 'Failed to fetch headlines' };
  }
}

// Fetch featured news from external sources
export async function fetchExternalFeaturedNews(): Promise<ExternalNewsResponse> {
  try {
    const response = await fetch(`${API_URL}/external-news?type=featured`);
    const data = await response.json();
    
    if (data.success && data.data) {
      return { ...data, data: normalizeNews(data.data) };
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch external featured news:', error);
    return { success: false, data: [], error: 'Failed to fetch featured news' };
  }
}

// Fetch trending news from external sources
export async function fetchExternalTrendingNews(): Promise<ExternalNewsResponse> {
  try {
    const response = await fetch(`${API_URL}/external-news?type=trending`);
    const data = await response.json();
    
    if (data.success && data.data) {
      return { ...data, data: normalizeNews(data.data) };
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch external trending news:', error);
    return { success: false, data: [], error: 'Failed to fetch trending news' };
  }
}

// Get list of available news categories
export async function fetchExternalNewsCategories(): Promise<{ success: boolean; data: string[] }> {
  try {
    const response = await fetch(`${API_URL}/external-news?type=categories`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch external news categories:', error);
    return { success: false, data: EXTERNAL_NEWS_CATEGORIES as unknown as string[] };
  }
}

// Search external news with optional date filtering
export async function searchExternalNews(
  query: string,
  limit: number = 10,
  fromDate?: string, // Format: YYYY-MM-DD
  toDate?: string    // Format: YYYY-MM-DD
): Promise<ExternalNewsResponse> {
  try {
    let url = `${API_URL}/external-news?type=search&q=${encodeURIComponent(query)}&limit=${limit}`;
    if (fromDate) url += `&from=${fromDate}`;
    if (toDate) url += `&to=${toDate}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`Search API returned ${response.status}`);
      return { success: false, data: [], error: `API returned status ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      return { ...data, data: normalizeNews(data.data) };
    }
    
    return { success: false, data: [], error: 'No search results found' };
  } catch (error) {
    console.error('Failed to search external news:', error);
    return { success: false, data: [], error: 'Failed to search news' };
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
    return { success: false, message: error instanceof Error ? error.message : 'Network error - please check your connection' }
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
