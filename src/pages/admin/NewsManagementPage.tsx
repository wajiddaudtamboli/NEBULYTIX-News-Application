import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CreateNewsModal } from '@/components/admin/CreateNewsModal'
import { EditNewsModal } from '@/components/admin/EditNewsModal'
import {
  adminGetAllNews,
  adminToggleFeatured,
  adminToggleTrending,
  adminDeleteNews,
} from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

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
  isActive?: boolean
}

const categories = ['All', 'Technology', 'Business', 'Science', 'World', 'Health']

export default function NewsManagementPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'trending'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const result = await adminGetAllNews(page, 20)
      if (result.success) {
        setNews(result.data || [])
        setTotalPages(result.pagination?.pages || 1)
      }
    } catch (error) {
      toast({ title: 'Failed to load news', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [page])

  const handleToggleFeatured = async (id: string) => {
    const result = await adminToggleFeatured(id)
    if (result.success) {
      setNews(prev =>
        prev.map(n => (n._id === id ? { ...n, isFeatured: !n.isFeatured } : n))
      )
      toast({ title: result.message || 'Featured status updated' })
    } else {
      toast({ title: 'Failed to update', variant: 'destructive' })
    }
  }

  const handleToggleTrending = async (id: string) => {
    const result = await adminToggleTrending(id)
    if (result.success) {
      setNews(prev =>
        prev.map(n => (n._id === id ? { ...n, isTrending: !n.isTrending } : n))
      )
      toast({ title: result.message || 'Trending status updated' })
    } else {
      toast({ title: 'Failed to update', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    
    const result = await adminDeleteNews(deletingId)
    if (result.success) {
      setNews(prev => prev.filter(n => n._id !== deletingId))
      toast({ title: 'News deleted successfully' })
    } else {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
    setDeletingId(null)
  }

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesFilter = filterType === 'all' ||
      (filterType === 'featured' && item.isFeatured) ||
      (filterType === 'trending' && item.isTrending)
    
    return matchesSearch && matchesCategory && matchesFilter
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      Business: 'bg-green-500/10 text-green-600 border-green-500/20',
      Science: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      World: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      Health: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    }
    return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }

  return (
    <AdminLayout title="News Management" subtitle="Create, edit, and manage your news articles">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              {(['all', 'featured', 'trending'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add News
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-xl font-bold">{news.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <p className="text-xl font-bold">{news.filter(n => n.isFeatured).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <TrendingUp className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trending</p>
                <p className="text-xl font-bold">{news.filter(n => n.isTrending).length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Loading news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No news found</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first article
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <AnimatePresence mode="popLayout">
                  {filteredNews.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x64?text=No+Image'
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.summary}
                              </p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="flex-shrink-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingNews(item)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleFeatured(item._id)}>
                                  <Star className={`w-4 h-4 mr-2 ${item.isFeatured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  {item.isFeatured ? 'Unfeature' : 'Feature'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleTrending(item._id)}>
                                  <TrendingUp className={`w-4 h-4 mr-2 ${item.isTrending ? 'text-pink-500' : ''}`} />
                                  {item.isTrending ? 'Remove Trending' : 'Mark Trending'}
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={`/article/${item._id}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-2" /> View
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeletingId(item._id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            {item.isFeatured && (
                              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                                <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                              </Badge>
                            )}
                            {item.isTrending && (
                              <Badge variant="secondary" className="bg-pink-500/10 text-pink-600">
                                <TrendingUp className="w-3 h-3 mr-1" /> Trending
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {format(new Date(item.publishedAt), 'MMM d, yyyy')} • {item.views.toLocaleString()} views
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateNewsModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          fetchNews()
        }}
      />

      {/* Edit Modal */}
      {editingNews && (
        <EditNewsModal
          news={editingNews}
          open={!!editingNews}
          onClose={() => setEditingNews(null)}
          onSuccess={() => {
            setEditingNews(null)
            fetchNews()
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
