import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, StarOff, Loader2, Calendar, User } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

interface Blog {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: { name: string; avatar?: string }
  category: string
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
  views: number
  createdAt: string
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: '',
    tags: '',
    authorName: '',
    isPublished: false,
    isFeatured: false,
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/v1/blogs/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setBlogs(data.data)
      }
    } catch (error) {
      toast({ title: 'Failed to fetch blogs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingBlog ? `/api/v1/blogs/${editingBlog._id}` : '/api/v1/blogs'
      const method = editingBlog ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          author: { name: formData.authorName },
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: `Blog ${editingBlog ? 'updated' : 'created'} successfully` })
        fetchBlogs()
        closeModal()
      } else {
        toast({ title: data.message || 'Operation failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/v1/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Blog deleted successfully' })
        fetchBlogs()
      }
    } catch (error) {
      toast({ title: 'Failed to delete blog', variant: 'destructive' })
    }
  }

  const togglePublish = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/v1/blogs/${id}/toggle-publish`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setBlogs(blogs.map((b) => (b._id === id ? { ...b, isPublished: !b.isPublished } : b)))
        toast({ title: 'Publish status updated' })
      }
    } catch (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const toggleFeatured = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/v1/blogs/${id}/toggle-featured`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setBlogs(blogs.map((b) => (b._id === id ? { ...b, isFeatured: !b.isFeatured } : b)))
        toast({ title: 'Featured status updated' })
      }
    } catch (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const openModal = (blog?: Blog) => {
    if (blog) {
      setEditingBlog(blog)
      setFormData({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        category: blog.category,
        tags: blog.tags.join(', '),
        authorName: blog.author.name,
        isPublished: blog.isPublished,
        isFeatured: blog.isFeatured,
      })
    } else {
      setEditingBlog(null)
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        coverImage: '',
        category: '',
        tags: '',
        authorName: '',
        isPublished: false,
        isFeatured: false,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBlog(null)
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout title="Blog Management" subtitle="Create and manage blog posts">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" /> New Blog Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{blogs.length}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {blogs.filter((b) => b.isPublished).length}
              </p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {blogs.filter((b) => !b.isPublished).length}
              </p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">
                {blogs.filter((b) => b.isFeatured).length}
              </p>
              <p className="text-sm text-muted-foreground">Featured</p>
            </CardContent>
          </Card>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No blogs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {blog.coverImage && (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-24 h-24 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold truncate">{blog.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {blog.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePublish(blog._id)}
                              title={blog.isPublished ? 'Unpublish' : 'Publish'}
                            >
                              {blog.isPublished ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFeatured(blog._id)}
                              title={blog.isFeatured ? 'Remove featured' : 'Mark featured'}
                            >
                              {blog.isFeatured ? (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <StarOff className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openModal(blog)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(blog._id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {blog.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {blog.views} views
                          </span>
                          {blog.category && <Badge variant="outline">{blog.category}</Badge>}
                          {!blog.isPublished && (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Blog post title"
              />
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short description"
                rows={2}
              />
            </div>

            <div>
              <Label>Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full blog content (HTML supported)"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Tech, News"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Author Name *</Label>
                <Input
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tech, ai, news"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label>Featured</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBlog ? 'Update' : 'Create'} Blog Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
