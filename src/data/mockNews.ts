import type { NewsItem } from '@/components/NewsCard'

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Revolutionary AI Breakthrough Changes How We Process Data',
    summary: 'Scientists at leading tech institutions have unveiled a new approach to machine learning that promises to reshape data analysis across industries.',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    source: 'Tech Weekly',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'Technology',
    views: 5400,
    isTrending: true
  },
  {
    id: '2',
    title: 'Global Markets Rally as Economic Indicators Show Positive Growth',
    summary: 'Stock markets worldwide experienced significant gains following the release of encouraging economic data from major economies.',
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    category: 'Business',
    views: 3200,
    isTrending: false
  },
  {
    id: '3',
    title: 'SpaceX Successfully Launches New Satellite Constellation',
    summary: 'The latest mission marks a significant step toward global internet coverage, with 60 new satellites now orbiting Earth.',
    coverImage: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=450&fit=crop',
    source: 'Space News',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'Science',
    views: 4100,
    isTrending: true
  },
  {
    id: '4',
    title: 'Climate Summit Reaches Historic Agreement on Carbon Reduction',
    summary: 'World leaders have committed to ambitious new targets that could reshape global environmental policy for decades.',
    coverImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&h=450&fit=crop',
    source: 'Green Tribune',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'World',
    views: 2800,
    isTrending: false
  },
  {
    id: '5',
    title: 'New Study Reveals Benefits of Intermittent Fasting',
    summary: 'Researchers have found compelling evidence linking periodic fasting to improved metabolic health and longevity.',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
    source: 'Health Today',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    category: 'Health',
    views: 1900,
    isTrending: false
  },
  {
    id: '6',
    title: 'Major Cybersecurity Firm Discovers Critical Infrastructure Vulnerability',
    summary: 'A newly identified exploit could affect millions of industrial systems worldwide, prompting urgent security updates.',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    source: 'Cyber Defense',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    category: 'Technology',
    views: 6200,
    isTrending: true
  },
  {
    id: '7',
    title: 'Electric Vehicle Sales Surge Past Traditional Cars in Key Markets',
    summary: 'For the first time, electric vehicles have outsold combustion engine cars in several European countries.',
    coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=450&fit=crop',
    source: 'Auto World',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    category: 'Business',
    views: 2400,
    isTrending: false
  },
  {
    id: '8',
    title: 'Quantum Computing Milestone: First Error-Corrected Calculations',
    summary: 'Engineers have achieved a crucial breakthrough in quantum error correction, bringing practical quantum computers closer to reality.',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    source: 'Science Daily',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    category: 'Science',
    views: 3800,
    isTrending: true
  }
]

export const categories = ['All', 'Technology', 'Business', 'Science', 'World', 'Health']
