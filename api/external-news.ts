import type { VercelRequest, VercelResponse } from '@vercel/node';

// GNews API configuration
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

// Available categories
const NEWS_CATEGORIES = [
  'general', 'world', 'nation', 'business', 'technology',
  'entertainment', 'sports', 'science', 'health'
] as const;

type NewsCategory = typeof NEWS_CATEGORIES[number];

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: { name: string; url: string };
}

interface TransformedNewsItem {
  _id: string;
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  source: string;
  coverImage: string;
  publishedAt: string;
  isFeatured: boolean;
  isTrending: boolean;
  views: number;
  tags: string[];
  externalLink: string;
}

const generateId = (title: string, index: number): string => {
  return `gnews-${Buffer.from(title).toString('base64').slice(0, 12)}-${index}`;
};

const getImage = (imageUrl: string | null): string => {
  if (imageUrl) return imageUrl;
  const defaults = [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
};

const mapCategory = (gnewsCategory: string): string => {
  const mapping: Record<string, string> = {
    'general': 'World', 'world': 'World', 'nation': 'Politics',
    'business': 'Business', 'technology': 'Technology',
    'entertainment': 'Entertainment', 'sports': 'Sports',
    'science': 'Science', 'health': 'Health',
  };
  return mapping[gnewsCategory] || 'World';
};

const transformGNewsData = (articles: GNewsArticle[], category: string): TransformedNewsItem[] => {
  return articles.map((article, index) => ({
    _id: generateId(article.title, index),
    id: generateId(article.title, index),
    title: article.title,
    summary: article.description || article.title,
    content: article.content || article.description || '',
    category: mapCategory(category),
    source: article.source?.name || 'GNews',
    coverImage: getImage(article.image),
    publishedAt: article.publishedAt || new Date().toISOString(),
    isFeatured: index < 3,
    isTrending: index < 5,
    views: Math.floor(Math.random() * 5000) + 100,
    tags: [mapCategory(category), article.source?.name || 'News', 'India'],
    externalLink: article.url || '',
  }));
};

const fetchFromGNews = async (
  category: NewsCategory,
  limit: number,
  country: string,
  fromDate?: string,
  toDate?: string
): Promise<GNewsArticle[]> => {
  if (!GNEWS_API_KEY) {
    throw new Error('News API key not configured. Get free key at https://gnews.io/');
  }

  let url = `${GNEWS_BASE_URL}/top-headlines?category=${category}&lang=en&country=${country}&max=${limit}&apikey=${GNEWS_API_KEY}`;
  
  // Add date filters if provided
  if (fromDate) url += `&from=${fromDate}T00:00:00Z`;
  if (toDate) url += `&to=${toDate}T23:59:59Z`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`News API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.articles || [];
};

const searchFromGNews = async (
  query: string,
  limit: number,
  fromDate?: string,
  toDate?: string
): Promise<GNewsArticle[]> => {
  if (!GNEWS_API_KEY) {
    throw new Error('News API key not configured');
  }

  let url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=${limit}&apikey=${GNEWS_API_KEY}`;
  
  if (fromDate) url += `&from=${fromDate}T00:00:00Z`;
  if (toDate) url += `&to=${toDate}T23:59:59Z`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Search API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.articles || [];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { 
      category = 'general', 
      limit = '10', 
      type = 'news', 
      country = 'in',
      from: fromDate,
      to: toDate,
      q: searchQuery
    } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string) || 10, 100);
    const categoryStr = category as NewsCategory;
    const fromStr = fromDate as string | undefined;
    const toStr = toDate as string | undefined;

    if (type === 'categories') {
      return res.json({ success: true, data: NEWS_CATEGORIES, total: NEWS_CATEGORIES.length });
    }

    // Search endpoint
    if (type === 'search' || searchQuery) {
      if (!searchQuery) {
        return res.status(400).json({ success: false, error: 'Search query is required' });
      }
      const articles = await searchFromGNews(searchQuery as string, limitNum, fromStr, toStr);
      const results = transformGNewsData(articles, 'general');
      return res.json({ 
        success: true, 
        data: results, 
        query: searchQuery,
        total: results.length,
        filters: { from: fromStr || null, to: toStr || null }
      });
    }

    if (type === 'headlines') {
      const articles = await fetchFromGNews('general', limitNum, country as string, fromStr, toStr);
      const headlines = transformGNewsData(articles, 'general');
      headlines.forEach((item, i) => { item.isFeatured = i < 3; item.isTrending = i < 5; });
      return res.json({ success: true, data: headlines, total: headlines.length });
    }

    if (type === 'featured') {
      const articles = await fetchFromGNews('general', 3, country as string);
      const featured = transformGNewsData(articles, 'general').map(item => ({ ...item, isFeatured: true }));
      return res.json({ success: true, data: featured });
    }

    if (type === 'trending') {
      const articles = await fetchFromGNews('general', 10, country as string);
      const trending = transformGNewsData(articles, 'general').map(item => ({ ...item, isTrending: true }));
      return res.json({ success: true, data: trending });
    }

    // Default: fetch by category with optional date filtering
    const articles = await fetchFromGNews(categoryStr, limitNum, country as string, fromStr, toStr);
    const news = transformGNewsData(articles, categoryStr);

    return res.json({ 
      success: true, 
      data: news, 
      category: categoryStr, 
      total: news.length,
      filters: { from: fromStr || null, to: toStr || null }
    });

  } catch (error) {
    console.error('External news API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch news',
    });
  }
}
