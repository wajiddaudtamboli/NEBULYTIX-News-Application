import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ImageIcon, Plus, Minus } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const categories = ['Technology', 'Business', 'Science', 'World', 'Health']

export function CreateNewsModal({ onClose, onSuccess }: Props) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    category: 'Technology',
    source: 'Nebulytix',
    coverImage: '',
    isFeatured: false,
    isTrending: false,
    tags: [''],
  })

  const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.summary.trim() || !form.coverImage.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/admin/news/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-clerk-id': user?.id || '',
          'x-admin-role': 'admin',
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags.filter(t => t.trim()),
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        toast({ title: 'News created successfully' })
        onSuccess()
      } else {
        toast({ title: data.error || 'Failed to create news', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Failed to create news', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    setForm(prev => ({ ...prev, tags: [...prev.tags, ''] }))
  }

  const removeTag = (index: number) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const updateTag = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.map((t, i) => (i === index ? value : t)),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel p-6 rounded-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Add News Article</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter news title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Write a brief summary..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={form.source}
                onChange={(e) => setForm(prev => ({ ...prev, source: e.target.value }))}
                placeholder="News source"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL *</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="coverImage"
                value={form.coverImage}
                onChange={(e) => setForm(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="pl-10"
                required
              />
            </div>
            {form.coverImage && (
              <img
                src={form.coverImage}
                alt="Preview"
                className="h-32 w-full object-cover rounded-lg mt-2"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-2">
              {form.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    placeholder="Tag name"
                  />
                  {form.tags.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeTag(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Tag
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.isFeatured}
                onCheckedChange={(v) => setForm(prev => ({ ...prev, isFeatured: !!v }))}
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.isTrending}
                onCheckedChange={(v) => setForm(prev => ({ ...prev, isTrending: !!v }))}
              />
              <span className="text-sm">Trending</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading} className="flex-1">
              {loading ? (
                <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                'Create News'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
