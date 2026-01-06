import type { NewsItem } from '@/components/NewsCard'

export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Revolutionary AI Breakthrough Changes How We Process Data',
    description: 'Scientists at leading tech institutions have unveiled a new approach to machine learning that promises to reshape data analysis across industries.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    source: 'Tech Weekly',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Technology'
  },
  {
    id: '2',
    title: 'Global Markets Rally as Economic Indicators Show Positive Growth',
    description: 'Stock markets worldwide experienced significant gains following the release of encouraging economic data from major economies.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Business'
  },
  {
    id: '3',
    title: 'SpaceX Successfully Launches New Satellite Constellation',
    description: 'The latest mission marks a significant step toward global internet coverage, with 60 new satellites now orbiting Earth.',
    imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=450&fit=crop',
    source: 'Space News',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Science'
  },
  {
    id: '4',
    title: 'Climate Summit Reaches Historic Agreement on Carbon Reduction',
    description: 'World leaders have committed to ambitious new targets that could reshape global environmental policy for decades.',
    imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&h=450&fit=crop',
    source: 'Green Tribune',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'World'
  },
  {
    id: '5',
    title: 'New Study Reveals Benefits of Intermittent Fasting',
    description: 'Researchers have found compelling evidence linking periodic fasting to improved metabolic health and longevity.',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop',
    source: 'Health Today',
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Health'
  },
  {
    id: '6',
    title: 'Major Cybersecurity Firm Discovers Critical Infrastructure Vulnerability',
    description: 'A newly identified exploit could affect millions of industrial systems worldwide, prompting urgent security updates.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop',
    source: 'Cyber Defense',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Technology'
  },
  {
    id: '7',
    title: 'Electric Vehicle Sales Surge Past Traditional Cars in Key Markets',
    description: 'For the first time, electric vehicles have outsold combustion engine cars in several European countries.',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=450&fit=crop',
    source: 'Auto World',
    publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Business'
  },
  {
    id: '8',
    title: 'Quantum Computing Milestone: First Error-Corrected Calculations',
    description: 'Engineers have achieved a crucial breakthrough in quantum error correction, bringing practical quantum computers closer to reality.',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    source: 'Science Daily',
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    url: '#',
    category: 'Science'
  }
]

export const categories = ['All', 'Technology', 'Business', 'Science', 'World', 'Health']
