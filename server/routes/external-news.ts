import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

// GNews API configuration (free tier: 100 requests/day)
// Get your free API key at: https://gnews.io/
const getGNewsConfig = () => ({
  apiKey: process.env.GNEWS_API_KEY || '',
  baseUrl: 'https://gnews.io/api/v4',
});

// Available categories
const NEWS_CATEGORIES = [
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

type NewsCategory = typeof NEWS_CATEGORIES[number];

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
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

// Helper to generate unique ID
const generateId = (title: string, index: number): string => {
  const hash = Buffer.from(title).toString('base64').slice(0, 12);
  return `gnews-${hash}-${index}`;
};

// Default image if none provided
const getImage = (imageUrl: string | null): string => {
  if (imageUrl) return imageUrl;
  const defaults = [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
};

// Map GNews category to our categories
const mapCategory = (gnewsCategory: string): string => {
  const mapping: Record<string, string> = {
    'general': 'World',
    'world': 'World',
    'nation': 'Politics',
    'business': 'Business',
    'technology': 'Technology',
    'entertainment': 'Entertainment',
    'sports': 'Sports',
    'science': 'Science',
    'health': 'Health',
  };
  return mapping[gnewsCategory] || 'World';
};

// Transform GNews response to our format
const transformGNewsData = (articles: GNewsArticle[], category: string): TransformedNewsItem[] => {
  return articles.map((article, index) => {
    const id = generateId(article.title, index);
    return {
      _id: id,
      id: id,
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
    };
  });
};

// Fetch news from GNews API
const fetchFromGNews = async (
  category: NewsCategory = 'general',
  limit: number = 10,
  country: string = 'in',
  fromDate?: string,
  toDate?: string
): Promise<GNewsArticle[]> => {
  const { apiKey, baseUrl } = getGNewsConfig();
  
  if (!apiKey) {
    console.error('GNEWS_API_KEY is not configured');
    throw new Error('News API key is not configured. Get free key at https://gnews.io/');
  }

  let url = `${baseUrl}/top-headlines?category=${category}&lang=en&country=${country}&max=${limit}&apikey=${apiKey}`;
  
  // Add date filters if provided (GNews uses ISO 8601 format)
  if (fromDate) {
    url += `&from=${fromDate}T00:00:00Z`;
  }
  if (toDate) {
    url += `&to=${toDate}T23:59:59Z`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('GNews API error:', errorText);
    throw new Error(`News API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.articles || [];
};

// Search news from GNews API
const searchFromGNews = async (
  query: string,
  limit: number = 10,
  fromDate?: string,
  toDate?: string
): Promise<GNewsArticle[]> => {
  const { apiKey, baseUrl } = getGNewsConfig();
  
  if (!apiKey) {
    throw new Error('News API key is not configured');
  }

  let url = `${baseUrl}/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=${limit}&apikey=${apiKey}`;
  
  // Add date filters if provided
  if (fromDate) {
    url += `&from=${fromDate}T00:00:00Z`;
  }
  if (toDate) {
    url += `&to=${toDate}T23:59:59Z`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Search API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.articles || [];
};

// GET /external-news - Fetch news by category with optional date filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as NewsCategory) || 'general';
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const country = (req.query.country as string) || 'in';
    const fromDate = req.query.from as string | undefined; // Format: YYYY-MM-DD
    const toDate = req.query.to as string | undefined;     // Format: YYYY-MM-DD
    
    const articles = await fetchFromGNews(category, limit, country, fromDate, toDate);
    const transformedNews = transformGNewsData(articles, category);

    res.json({
      success: true,
      data: transformedNews,
      category,
      total: transformedNews.length,
      filters: {
        from: fromDate || null,
        to: toDate || null,
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch news',
    });
  }
});

// GET /external-news/headlines - Fetch top headlines
router.get('/headlines', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    const articles = await fetchFromGNews('general', limit, 'in');
    const headlines = transformGNewsData(articles, 'general');

    // Mark as featured/trending
    headlines.forEach((item, index) => {
      item.isFeatured = index < 3;
      item.isTrending = index < 5;
    });

    res.json({
      success: true,
      data: headlines,
      total: headlines.length,
    });
  } catch (error) {
    console.error('Error fetching headlines:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch headlines',
    });
  }
});

// GET /external-news/search - Search news with optional date filtering
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const fromDate = req.query.from as string | undefined; // Format: YYYY-MM-DD
    const toDate = req.query.to as string | undefined;     // Format: YYYY-MM-DD
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const articles = await searchFromGNews(query, limit, fromDate, toDate);
    const results = transformGNewsData(articles, 'general');

    res.json({
      success: true,
      data: results,
      query,
      total: results.length,
      filters: {
        from: fromDate || null,
        to: toDate || null,
      },
    });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search news',
    });
  }
});

// GET /external-news/categories - List available categories
router.get('/categories', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: NEWS_CATEGORIES,
    total: NEWS_CATEGORIES.length,
  });
});

// GET /external-news/featured - Get featured news
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const articles = await fetchFromGNews('general', 3, 'in');
    const featured = transformGNewsData(articles, 'general').map(item => ({
      ...item,
      isFeatured: true,
    }));

    res.json({
      success: true,
      data: featured,
    });
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch featured news',
    });
  }
});

// GET /external-news/trending - Get trending news
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const articles = await fetchFromGNews('general', 10, 'in');
    const trending = transformGNewsData(articles, 'general').map(item => ({
      ...item,
      isTrending: true,
    }));

    res.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    console.error('Error fetching trending news:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trending news',
    });
  }
});

// GET /external-news/category/:category - Get news by specific category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    
    if (!NEWS_CATEGORIES.includes(category as NewsCategory)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Available: ${NEWS_CATEGORIES.join(', ')}`,
      });
    }

    const articles = await fetchFromGNews(category as NewsCategory, limit, 'in');
    const news = transformGNewsData(articles, category);

    res.json({
      success: true,
      data: news,
      category,
      total: news.length,
    });
  } catch (error) {
    console.error('Error fetching category news:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch news',
    });
  }
});

export default router;
