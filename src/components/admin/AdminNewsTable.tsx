import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Eye,
  MoreVertical,
  Search
} from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EditNewsModal } from './EditNewsModal'
import { toast } from '@/hooks/use-toast'

interface News {
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

interface Props {
  onRefresh: () => void
}

export function AdminNewsTable({ onRefresh }: Props) {
  const { user } = useUser()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')
  const categories = ['All', 'Technology', 'Business', 'Science', 'World', 'Health']

  useEffect(() => {
    fetchNews()
  }, [category, page])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (category !== 'all') params.append('category', category)
      
      const res = await fetch(`${apiUrl}/admin/news/all?${params}`, {
        headers: {
          'x-clerk-id': user?.id || '',
          'x-admin-role': 'admin',
        },
      })
      const data = await res.json()
      if (data.success) {
        setNews(data.data)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/news/${id}/featured`, {
        method: 'PATCH',
        headers: {
          'x-clerk-id': user?.id || '',
          'x-admin-role': 'admin',
        },
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: data.message })
        fetchNews()
        onRefresh()
      }
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' })
    }
  }

  const handleToggleTrending = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/news/${id}/trending`, {
        method: 'PATCH',
        headers: {
          'x-clerk-id': user?.id || '',
          'x-admin-role': 'admin',
        },
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: data.message })
        fetchNews()
        onRefresh()
      }
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return

    try {
      const res = await fetch(`${apiUrl}/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'x-clerk-id': user?.id || '',
          'x-admin-role': 'admin',
        },
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'News deleted successfully' })
        fetchNews()
        onRefresh()
      }
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card className="glass-panel border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <CardTitle>News Management</CardTitle>
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Title</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground text-sm">Category</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground text-sm">Views</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map((item) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <span className="font-medium truncate max-w-[200px] lg:max-w-[300px]">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.isFeatured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {item.isTrending && (
                          <TrendingUp className="h-4 w-4 text-pink-500" />
                        )}
                        {!item.isFeatured && !item.isTrending && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingNews(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(item._id)}>
                            <Star className="h-4 w-4 mr-2" />
                            {item.isFeatured ? 'Remove Featured' : 'Make Featured'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleTrending(item._id)}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            {item.isTrending ? 'Remove Trending' : 'Make Trending'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {editingNews && (
          <EditNewsModal
            news={editingNews}
            onClose={() => setEditingNews(null)}
            onSuccess={() => {
              setEditingNews(null)
              fetchNews()
              onRefresh()
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
