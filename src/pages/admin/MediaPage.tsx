import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Search, Trash2, Loader2, Image, Video, FileText, Copy, Check, FolderPlus, Grid, List, Download } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'

interface MediaItem {
  _id: string
  filename: string
  originalName: string
  url: string
  type: 'image' | 'video' | 'document' | 'other'
  mimeType: string
  size: number
  dimensions?: { width: number; height: number }
  alt?: string
  caption?: string
  folder: string
  usageCount: number
  createdAt: string
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [folders, setFolders] = useState<string[]>(['general', 'news', 'blogs', 'pages'])
  const [newFolderName, setNewFolderName] = useState('')
  
  const [uploadForm, setUploadForm] = useState({
    url: '',
    alt: '',
    caption: '',
    folder: 'general',
    type: 'image' as 'image' | 'video' | 'document' | 'other',
  })

  useEffect(() => {
    fetchMedia()
    fetchFolders()
  }, [])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      let url = '/api/v1/media?'
      if (selectedFolder !== 'all') url += `folder=${selectedFolder}&`
      if (selectedType !== 'all') url += `type=${selectedType}`
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setMedia(data.data)
      }
    } catch (error) {
      toast({ title: 'Failed to fetch media', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/v1/media/folders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setFolders(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch folders')
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [selectedFolder, selectedType])

  const handleUpload = async () => {
    if (!uploadForm.url) {
      toast({ title: 'Please enter a URL', variant: 'destructive' })
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const filename = uploadForm.url.split('/').pop() || 'media'
      
      const response = await fetch('/api/v1/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename,
          originalName: filename,
          url: uploadForm.url,
          type: uploadForm.type,
          mimeType: uploadForm.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          size: 0,
          alt: uploadForm.alt,
          caption: uploadForm.caption,
          folder: uploadForm.folder,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Media added successfully' })
        fetchMedia()
        setShowUploadModal(false)
        setUploadForm({ url: '', alt: '', caption: '', folder: 'general', type: 'image' })
      } else {
        toast({ title: data.message || 'Failed to add media', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Failed to add media', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/v1/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: 'Media deleted successfully' })
        fetchMedia()
      }
    } catch (error) {
      toast({ title: 'Failed to delete media', variant: 'destructive' })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    if (!confirm(`Delete ${selectedItems.length} items?`)) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/v1/media/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedItems }),
      })
      const data = await response.json()
      if (data.success) {
        toast({ title: `${selectedItems.length} items deleted` })
        setSelectedItems([])
        fetchMedia()
      }
    } catch (error) {
      toast({ title: 'Failed to delete items', variant: 'destructive' })
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    const folderSlug = newFolderName.toLowerCase().replace(/\s+/g, '-')
    if (folders.includes(folderSlug)) {
      toast({ title: 'Folder already exists', variant: 'destructive' })
      return
    }

    setFolders([...folders, folderSlug])
    toast({ title: 'Folder created successfully' })
    setShowFolderModal(false)
    setNewFolderName('')
  }

  const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    toast({ title: 'URL copied to clipboard' })
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredMedia.map((m) => m._id))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const filteredMedia = media.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout title="Media Library" subtitle="Manage images, videos, and documents">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={() => setShowFolderModal(true)}>
              <FolderPlus className="w-4 h-4 mr-2" /> New Folder
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" /> Add Media
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <span className="text-sm">{selectedItems.length} items selected</span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedItems([])}>
              Clear Selection
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{media.length}</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {media.filter((m) => m.type === 'image').length}
              </p>
              <p className="text-sm text-muted-foreground">Images</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">
                {media.filter((m) => m.type === 'video').length}
              </p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{folders.length}</p>
              <p className="text-sm text-muted-foreground">Folders</p>
            </CardContent>
          </Card>
        </div>

        {/* Media Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No media found</p>
              <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" /> Add Media
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card
                  className={`group cursor-pointer overflow-hidden ${
                    selectedItems.includes(item._id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="relative aspect-square">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.alt || item.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => copyToClipboard(item.url)}
                      >
                        {copiedUrl === item.url ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedItems.includes(item._id)}
                        onCheckedChange={() => toggleSelectItem(item._id)}
                      />
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs truncate">{item.filename}</p>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {item.folder}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(item.size)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex items-center gap-4 p-3 bg-muted/50">
                  <Checkbox
                    checked={selectedItems.length === filteredMedia.length}
                    onCheckedChange={selectAll}
                  />
                  <span className="flex-1 font-medium">File</span>
                  <span className="w-24 font-medium">Type</span>
                  <span className="w-24 font-medium">Size</span>
                  <span className="w-24 font-medium">Folder</span>
                  <span className="w-32 font-medium">Actions</span>
                </div>
                {filteredMedia.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 hover:bg-muted/30">
                    <Checkbox
                      checked={selectedItems.includes(item._id)}
                      onCheckedChange={() => toggleSelectItem(item._id)}
                    />
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.alt || item.filename}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                          {getTypeIcon(item.type)}
                        </div>
                      )}
                      <span className="truncate">{item.filename}</span>
                    </div>
                    <span className="w-24">
                      <Badge variant="outline">{item.type}</Badge>
                    </span>
                    <span className="w-24 text-sm text-muted-foreground">
                      {formatFileSize(item.size)}
                    </span>
                    <span className="w-24 text-sm">{item.folder}</span>
                    <div className="w-32 flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.url)}>
                        {copiedUrl === item.url ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Media</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Media URL *</Label>
              <Input
                value={uploadForm.url}
                onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value: any) => setUploadForm({ ...uploadForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Folder</Label>
                <Select
                  value={uploadForm.folder}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, folder: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Alt Text</Label>
              <Input
                value={uploadForm.alt}
                onChange={(e) => setUploadForm({ ...uploadForm, alt: e.target.value })}
                placeholder="Description for accessibility"
              />
            </div>

            <div>
              <Label>Caption</Label>
              <Input
                value={uploadForm.caption}
                onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
                placeholder="Optional caption"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Add Media</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Modal */}
      <Dialog open={showFolderModal} onOpenChange={setShowFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Label>Folder Name</Label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g., blog-images"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
