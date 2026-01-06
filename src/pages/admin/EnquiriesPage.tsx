import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Mail,
  Star,
  Archive,
  CheckCircle,
  Trash2,
  Eye,
  Reply,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface Enquiry {
  _id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: string
  status: 'new' | 'read' | 'replied' | 'archived'
  isImportant: boolean
  reply?: string
  repliedAt?: string
  createdAt: string
}

const statusColors = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  read: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  replied: 'bg-green-500/10 text-green-600 border-green-500/20',
  archived: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [replyText, setReplyText] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0, archived: 0 })

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const token = getAdminToken()
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      const response = await fetch(`/api/v1/enquiries${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setEnquiries(data.data || [])
      }
    } catch (error) {
      toast({ title: 'Failed to load enquiries', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = getAdminToken()
      const response = await fetch('/api/v1/enquiries/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setStats({
          total: data.data.total || 0,
          ...data.data.byStatus,
        })
      }
    } catch (error) {
      // Silent fail
    }
  }

  useEffect(() => {
    fetchEnquiries()
    fetchStats()
  }, [statusFilter])

  const viewEnquiry = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry)
    setReplyText(enquiry.reply || '')
    
    // Mark as read if new
    if (enquiry.status === 'new') {
      try {
        const token = getAdminToken()
        await fetch(`/api/v1/enquiries/${enquiry._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'read' }),
        })
        setEnquiries(prev =>
          prev.map(e => (e._id === enquiry._id ? { ...e, status: 'read' } : e))
        )
        fetchStats()
      } catch (error) {
        // Silent fail
      }
    }
  }

  const handleReply = async () => {
    if (!selectedEnquiry || !replyText.trim()) return

    try {
      const token = getAdminToken()
      const response = await fetch(`/api/v1/enquiries/${selectedEnquiry._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText }),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Reply saved' })
        setEnquiries(prev =>
          prev.map(e => (e._id === selectedEnquiry._id ? { ...e, status: 'replied', reply: replyText } : e))
        )
        setSelectedEnquiry(null)
        fetchStats()
      }
    } catch (error) {
      toast({ title: 'Failed to save reply', variant: 'destructive' })
    }
  }

  const toggleImportant = async (enquiry: Enquiry) => {
    try {
      const token = getAdminToken()
      await fetch(`/api/v1/enquiries/${enquiry._id}/important`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnquiries(prev =>
        prev.map(e => (e._id === enquiry._id ? { ...e, isImportant: !e.isImportant } : e))
      )
    } catch (error) {
      toast({ title: 'Failed to update', variant: 'destructive' })
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = getAdminToken()
      await fetch(`/api/v1/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      setEnquiries(prev =>
        prev.map(e => (e._id === id ? { ...e, status: status as any } : e))
      )
      fetchStats()
      toast({ title: 'Status updated' })
    } catch (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const token = getAdminToken()
      await fetch(`/api/v1/enquiries/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnquiries(prev => prev.filter(e => e._id !== deletingId))
      fetchStats()
      toast({ title: 'Enquiry deleted' })
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
    setDeletingId(null)
  }

  return (
    <AdminLayout title="Enquiries" subtitle="Manage contact form submissions">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'New', value: stats.new || 0, color: 'text-blue-600' },
            { label: 'Read', value: stats.read || 0, color: 'text-gray-600' },
            { label: 'Replied', value: stats.replied || 0, color: 'text-green-600' },
            { label: 'Archived', value: stats.archived || 0, color: 'text-orange-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Enquiries</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchEnquiries}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Enquiries List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No enquiries found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {enquiries.map((enquiry) => (
                  <motion.div
                    key={enquiry._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                      enquiry.status === 'new' && 'bg-blue-500/5'
                    )}
                    onClick={() => viewEnquiry(enquiry)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{enquiry.subject}</h3>
                          {enquiry.isImportant && (
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                          )}
                          <Badge variant="outline" className={statusColors[enquiry.status]}>
                            {enquiry.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From: {enquiry.name} &lt;{enquiry.email}&gt;
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {enquiry.message}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(enquiry.createdAt), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(enquiry.createdAt), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View/Reply Dialog */}
      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEnquiry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedEnquiry.subject}
                  <Badge variant="outline" className={statusColors[selectedEnquiry.status]}>
                    {selectedEnquiry.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-medium">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedEnquiry.email}</p>
                  </div>
                  {selectedEnquiry.phone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedEnquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Received</p>
                    <p className="font-medium">
                      {format(new Date(selectedEnquiry.createdAt), 'PPpp')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Message:</p>
                  <p className="whitespace-pre-wrap">{selectedEnquiry.message}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Reply:</p>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleImportant(selectedEnquiry)}
                  >
                    <Star className={cn('w-4 h-4 mr-1', selectedEnquiry.isImportant && 'fill-yellow-500 text-yellow-500')} />
                    {selectedEnquiry.isImportant ? 'Unmark' : 'Important'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateStatus(selectedEnquiry._id, 'archived')
                      setSelectedEnquiry(null)
                    }}
                  >
                    <Archive className="w-4 h-4 mr-1" /> Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setDeletingId(selectedEnquiry._id)
                      setSelectedEnquiry(null)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
                <Button onClick={handleReply} disabled={!replyText.trim()}>
                  <Reply className="w-4 h-4 mr-2" /> Save Reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
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
