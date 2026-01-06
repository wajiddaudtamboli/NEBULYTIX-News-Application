import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2, FileText, Layout, GripVertical } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface PageSection {
  _id?: string
  type: string
  title?: string
  content?: string
  image?: string
  buttonText?: string
  buttonLink?: string
  order: number
}

interface Page {
  _id: string
  title: string
  slug: string
  description?: string
  sections: PageSection[]
  isPublished: boolean
  showInNav: boolean
  createdAt: string
}

const sectionTypes = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'text', label: 'Text Block' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video Embed' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'features', label: 'Features Grid' },
  { value: 'stats', label: 'Stats Section' },
]

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPageModal, setShowPageModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [editingSection, setEditingSection] = useState<PageSection | null>(null)
  
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    description: '',
    isPublished: false,
    showInNav: false,
  })

  const [sectionForm, setSectionForm] = useState<PageSection>({
    type: 'text',
    title: '',
    content: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/v1/pages/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setPages(data.data)
      }
    } catch (error) {
      toast({ title: 'Failed to fetch pages', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePageSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingPage ? `/api/v1/pages/${editingPage._id}` : '/api/v1/pages'
      const method = editingPage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pageForm),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: `Page ${editingPage ? 'updated' : 'created'} successfully` })
        fetchPages()
        closePageModal()
      } else {
        toast({ title: data.message || 'Operation failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' })
    }
  }

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/v1/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Page deleted successfully' })
        fetchPages()
      }
    } catch (error) {
      toast({ title: 'Failed to delete page', variant: 'destructive' })
    }
  }

  const handleSectionSubmit = async () => {
    if (!selectedPage) return

    try {
      const token = localStorage.getItem('adminToken')
      const url = editingSection
        ? `/api/v1/pages/${selectedPage._id}/sections/${editingSection._id}`
        : `/api/v1/pages/${selectedPage._id}/sections`
      const method = editingSection ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sectionForm),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: `Section ${editingSection ? 'updated' : 'added'} successfully` })
        fetchPages()
        closeSectionModal()
      } else {
        toast({ title: data.message || 'Operation failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' })
    }
  }

  const handleDeleteSection = async (pageId: string, sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/v1/pages/${pageId}/sections/${sectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Section deleted successfully' })
        fetchPages()
      }
    } catch (error) {
      toast({ title: 'Failed to delete section', variant: 'destructive' })
    }
  }

  const togglePublish = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const page = pages.find((p) => p._id === id)
      const response = await fetch(`/api/v1/pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !page?.isPublished }),
      })
      const data = await response.json()
      if (data.success) {
        setPages(pages.map((p) => (p._id === id ? { ...p, isPublished: !p.isPublished } : p)))
        toast({ title: 'Publish status updated' })
      }
    } catch (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const openPageModal = (page?: Page) => {
    if (page) {
      setEditingPage(page)
      setPageForm({
        title: page.title,
        slug: page.slug,
        description: page.description || '',
        isPublished: page.isPublished,
        showInNav: page.showInNav,
      })
    } else {
      setEditingPage(null)
      setPageForm({
        title: '',
        slug: '',
        description: '',
        isPublished: false,
        showInNav: false,
      })
    }
    setShowPageModal(true)
  }

  const closePageModal = () => {
    setShowPageModal(false)
    setEditingPage(null)
  }

  const openSectionModal = (page: Page, section?: PageSection) => {
    setSelectedPage(page)
    if (section) {
      setEditingSection(section)
      setSectionForm({
        type: section.type,
        title: section.title || '',
        content: section.content || '',
        image: section.image || '',
        buttonText: section.buttonText || '',
        buttonLink: section.buttonLink || '',
        order: section.order,
      })
    } else {
      setEditingSection(null)
      setSectionForm({
        type: 'text',
        title: '',
        content: '',
        image: '',
        buttonText: '',
        buttonLink: '',
        order: page.sections.length,
      })
    }
    setShowSectionModal(true)
  }

  const closeSectionModal = () => {
    setShowSectionModal(false)
    setEditingSection(null)
    setSelectedPage(null)
  }

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout title="Page Management" subtitle="Create and manage dynamic pages">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => openPageModal()}>
            <Plus className="w-4 h-4 mr-2" /> New Page
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{pages.length}</p>
              <p className="text-sm text-muted-foreground">Total Pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {pages.filter((p) => p.isPublished).length}
              </p>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {pages.filter((p) => p.showInNav).length}
              </p>
              <p className="text-sm text-muted-foreground">In Navigation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">
                {pages.reduce((acc, p) => acc + p.sections.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Sections</p>
            </CardContent>
          </Card>
        </div>

        {/* Pages List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredPages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No pages found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {page.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(page._id)}
                          title={page.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {page.isPublished ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openPageModal(page)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePage(page._id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      {!page.isPublished && <Badge variant="secondary">Draft</Badge>}
                      {page.showInNav && <Badge variant="outline">In Nav</Badge>}
                      <Badge variant="outline">{page.sections.length} sections</Badge>
                    </div>

                    {/* Sections */}
                    <div className="space-y-2">
                      {page.sections.map((section) => (
                        <div
                          key={section._id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <Layout className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-medium">
                                {sectionTypes.find((t) => t.value === section.type)?.label ||
                                  section.type}
                              </p>
                              {section.title && (
                                <p className="text-xs text-muted-foreground">{section.title}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openSectionModal(page, section)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSection(page._id, section._id!)}
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => openSectionModal(page)}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Section
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Page Modal */}
      <Dialog open={showPageModal} onOpenChange={setShowPageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Page Title *</Label>
              <Input
                value={pageForm.title}
                onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                placeholder="About Us"
              />
            </div>

            <div>
              <Label>Slug *</Label>
              <Input
                value={pageForm.slug}
                onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                placeholder="about-us"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={pageForm.description}
                onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                placeholder="Page description for SEO"
                rows={2}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={pageForm.isPublished}
                  onCheckedChange={(checked) => setPageForm({ ...pageForm, isPublished: checked })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={pageForm.showInNav}
                  onCheckedChange={(checked) => setPageForm({ ...pageForm, showInNav: checked })}
                />
                <Label>Show in Navigation</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closePageModal}>
              Cancel
            </Button>
            <Button onClick={handlePageSubmit}>{editingPage ? 'Update' : 'Create'} Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Modal */}
      <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Section Type</Label>
              <Select
                value={sectionForm.type}
                onValueChange={(value) => setSectionForm({ ...sectionForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={sectionForm.title}
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                placeholder="Section title"
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={sectionForm.content}
                onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                placeholder="Section content (HTML supported)"
                rows={4}
              />
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={sectionForm.image}
                onChange={(e) => setSectionForm({ ...sectionForm, image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Button Text</Label>
                <Input
                  value={sectionForm.buttonText}
                  onChange={(e) => setSectionForm({ ...sectionForm, buttonText: e.target.value })}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label>Button Link</Label>
                <Input
                  value={sectionForm.buttonLink}
                  onChange={(e) => setSectionForm({ ...sectionForm, buttonLink: e.target.value })}
                  placeholder="/contact"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeSectionModal}>
              Cancel
            </Button>
            <Button onClick={handleSectionSubmit}>
              {editingSection ? 'Update' : 'Add'} Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
