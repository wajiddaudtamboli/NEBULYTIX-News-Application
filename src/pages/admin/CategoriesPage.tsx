import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Check,
  X,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { getAdminToken } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  order: number
  newsCount: number
}

const defaultColors = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316'
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  })

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/categories?includeInactive=true')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      toast({ title: 'Failed to load categories', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Category name is required', variant: 'destructive' })
      return
    }

    try {
      const token = getAdminToken()
      const url = editingCategory
        ? `/api/v1/categories/${editingCategory._id}`
        : '/api/v1/categories'
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (data.success) {
        toast({ title: data.message || 'Category saved' })
        fetchCategories()
        handleCloseModal()
      } else {
        toast({ title: data.message || 'Failed to save', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Failed to save category', variant: 'destructive' })
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const token = getAdminToken()
      const response = await fetch(`/api/v1/categories/${category._id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setCategories(prev =>
          prev.map(c => (c._id === category._id ? { ...c, isActive: !c.isActive } : c))
        )
        toast({ title: data.message })
      }
    } catch (error) {
      toast({ title: 'Failed to toggle category', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const token = getAdminToken()
      const response = await fetch(`/api/v1/categories/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setCategories(prev => prev.filter(c => c._id !== deletingId))
        toast({ title: 'Category deleted' })
      } else {
        toast({ title: data.message || 'Failed to delete', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Failed to delete category', variant: 'destructive' })
    }
    setDeletingId(null)
  }

  const handleReorder = async (newOrder: Category[]) => {
    setCategories(newOrder)
    
    try {
      const token = getAdminToken()
      await fetch('/api/v1/categories/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderedIds: newOrder.map(c => c._id) }),
      })
    } catch (error) {
      // Silent fail - order will be saved next time
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '', color: '#3b82f6' })
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
    })
    setShowModal(true)
  }

  const systemCategories = ['Technology', 'Business', 'Science', 'World', 'Health']

  return (
    <AdminLayout title="Categories" subtitle="Manage news categories">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Drag to reorder categories. Changes reflect on frontend immediately.
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No categories found. Create your first category.
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={categories}
                onReorder={handleReorder}
                className="divide-y divide-border"
              >
                {categories.map((category) => {
                  const isSystem = systemCategories.includes(category.name)
                  
                  return (
                    <Reorder.Item
                      key={category._id}
                      value={category}
                      className="p-4 bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                        </div>

                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{category.name}</h3>
                            {isSystem && (
                              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                System
                              </span>
                            )}
                            {!category.isActive && (
                              <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                                Disabled
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {category.newsCount || 0} articles
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(category)}
                            title={category.isActive ? 'Disable' : 'Enable'}
                          >
                            {category.isActive ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {!isSystem && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeletingId(category._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      formData.color === color && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? News articles in this category will not be deleted.
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
