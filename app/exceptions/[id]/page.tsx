"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Save,
  ArrowUpRight,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { formatDateTime, getSeverityColor, getStatusColor, getSLAStatus, getEscalationColor, getEscalationLevel } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ExceptionDetail {
  id: string
  title: string
  description: string
  category: string
  severity: string
  impactLevel: number
  status: string
  slaDeadline: string
  escalationLevel: string
  resolvedAt: string | null
  resolutionNotes: string | null
  createdAt: string
  assignedTo: {
    id: string
    name: string
    avatar?: string
    role: string
    email: string
  } | null
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  escalations: Array<{
    id: string
    level: string
    reason: string
    escalatedAt: string
    escalatedTo: string
    notes: string | null
  }>
  activities: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    metadata: any
    user: {
      id: string
      name: string
      avatar?: string
    }
  }>
}

interface UsersResponse {
  users: Array<{
    id: string
    name: string
    role: string
  }>
}

export default function ExceptionDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [exception, setException] = useState<ExceptionDetail | null>(null)
  const [users, setUsers] = useState<UsersResponse['users']>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [newComment, setNewComment] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user && id) {
      fetchException()
      fetchUsers()
    }
  }, [user, id])

  const fetchException = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/exceptions/${id}`)
      if (res.ok) {
        const data = await res.json()
        setException(data.exception)
        setSelectedAssignee(data.exception.assignedTo?.id || '')
      }
    } catch (error) {
      console.error('Error fetching exception:', error)
      toast({
        title: "Error",
        description: "Failed to load exception details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        // Filter for operational users
        setUsers(data.users.filter((u: any) => u.role === 'OPERATIONAL'))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/exceptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          userId: user?.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        setException(data.exception)
        toast({
          title: "Status updated",
          description: `Exception status changed to ${newStatus.replace('_', ' ')}`
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleReassign = async () => {
    if (!selectedAssignee) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/exceptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToId: selectedAssignee,
          userId: user?.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        setException(data.exception)
        toast({
          title: "Reassigned",
          description: "Exception has been reassigned"
        })
      }
    } catch (error) {
      console.error('Error reassigning:', error)
      toast({
        title: "Error",
        description: "Failed to reassign exception",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      toast({
        title: "Resolution notes required",
        description: "Please provide notes on how this exception was resolved",
        variant: "destructive"
      })
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(`/api/exceptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolutionNotes,
          userId: user?.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        setException(data.exception)
        setShowResolveDialog(false)
        setResolutionNotes('')
        toast({
          title: "Exception resolved",
          description: "Exception has been marked as resolved"
        })
      }
    } catch (error) {
      console.error('Error resolving:', error)
      toast({
        title: "Error",
        description: "Failed to resolve exception",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleClose = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/exceptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CLOSED',
          userId: user?.id
        })
      })

      if (res.ok) {
        const data = await res.json()
        setException(data.exception)
        toast({
          title: "Exception closed",
          description: "Exception has been closed"
        })
      }
    } catch (error) {
      console.error('Error closing:', error)
      toast({
        title: "Error",
        description: "Failed to close exception",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const res = await fetch(`/api/exceptions/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          action: 'COMMENT',
          description: newComment,
          metadata: { type: 'comment' }
        })
      })

      if (res.ok) {
        setNewComment('')
        fetchException()
        toast({
          title: "Comment added",
          description: "Your comment has been added"
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!exception) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Exception not found</h2>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const slaStatus = getSLAStatus(exception.slaDeadline)
  const canEdit = user?.role === 'MANAGEMENT' || user?.role === 'SUPERVISOR' || exception.assignedTo?.id === user?.id
  const canResolve = exception.status !== 'RESOLVED' && exception.status !== 'CLOSED'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{exception.title}</h1>
                <Badge className={getSeverityColor(exception.severity)}>{exception.severity}</Badge>
              </div>
              <p className="text-sm text-slate-500">ID: {exception.id.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {exception.status !== 'CLOSED' && canEdit && (
              <>
                {exception.status !== 'RESOLVED' && (
                  <Select value={exception.status} onValueChange={handleStatusChange} disabled={updating}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING">Waiting</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {canResolve && exception.status !== 'RESOLVED' && (
                  <Button onClick={() => setShowResolveDialog(true)} disabled={updating}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                )}
                {exception.status === 'RESOLVED' && (
                  <Button onClick={handleClose} disabled={updating}>
                    Close
                  </Button>
                )}
              </>
            )}
            <Badge className={getStatusColor(exception.status)}>{exception.status.replace('_', ' ')}</Badge>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Exception Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-500">Description</Label>
                  <p className="mt-1">{exception.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500">Category</Label>
                    <p className="mt-1 font-medium">{exception.category}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Impact Level</Label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`h-2 w-8 rounded ${
                            level <= exception.impactLevel ? 'bg-red-500' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-500">Created</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {formatDateTime(exception.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Created By</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={exception.createdBy.avatar} />
                        <AvatarFallback>{exception.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {exception.createdBy.name}
                    </p>
                  </div>
                </div>

                {exception.resolvedAt && (
                  <div>
                    <Label className="text-slate-500">Resolved At</Label>
                    <p className="mt-1 flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {formatDateTime(exception.resolvedAt)}
                    </p>
                  </div>
                )}

                {exception.resolutionNotes && (
                  <div>
                    <Label className="text-slate-500">Resolution Notes</Label>
                    <p className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                      {exception.resolutionNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SLA Status */}
            <Card className={slaStatus.status === 'breached' ? 'border-red-300 bg-red-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  SLA Status
                  {slaStatus.status === 'breached' && (
                    <Badge variant="destructive">BREACHED</Badge>
                  )}
                  {slaStatus.status === 'warning' && (
                    <Badge className="bg-yellow-500">WARNING</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Deadline</p>
                    <p className="text-lg font-semibold">{formatDateTime(exception.slaDeadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Time Remaining</p>
                    <p className={`text-lg font-semibold ${
                      slaStatus.status === 'breached' ? 'text-red-600' :
                      slaStatus.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {slaStatus.remaining}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escalation Timeline */}
            {(exception.escalations || []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Escalation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(exception.escalations || []).map((esc, idx) => (
                      <div key={esc.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-3 w-3 rounded-full ${getEscalationColor(esc.level)}`} />
                          {idx < (exception.escalations || []).length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{getEscalationLevel(esc.level)}</p>
                            <Badge variant="outline" className="text-xs">
                              {formatDateTime(esc.escalatedAt)}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{esc.reason}</p>
                          {esc.notes && (
                            <p className="text-sm text-slate-500 mt-1">{esc.notes}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">Escalated to: {esc.escalatedTo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity & Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Activity & Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment */}
                {exception.status !== 'CLOSED' && (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment or update..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Save className="h-4 w-4" />
                          </Button>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                <div className="space-y-4">
                  {(exception.activities || []).map((activity, idx) => (
                    <div key={activity.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{activity.user.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {activity.action}
                          </Badge>
                          <span className="text-xs text-slate-400">{formatDateTime(activity.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment */}
            {(user?.role === 'MANAGEMENT' || user?.role === 'SUPERVISOR') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Assigned To</Label>
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleReassign} className="w-full" disabled={updating || !selectedAssignee}>
                    Reassign
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Current Assignee */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned To
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exception.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={exception.assignedTo.avatar} />
                      <AvatarFallback>{exception.assignedTo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{exception.assignedTo.name}</p>
                      <p className="text-xs text-slate-500">{exception.assignedTo.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Unassigned</p>
                )}
              </CardContent>
            </Card>

            {/* Escalation Level */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Escalation Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${getEscalationColor(exception.escalationLevel)}`} />
                  <p className="font-medium">{getEscalationLevel(exception.escalationLevel)}</p>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    { level: 'LEVEL_1', name: 'Level 1 - Operational' },
                    { level: 'LEVEL_2', name: 'Level 2 - Supervisor' },
                    { level: 'LEVEL_3', name: 'Level 3 - Department Head' }
                  ].map(level => (
                    <div
                      key={level.level}
                      className={`flex items-center gap-2 p-2 rounded ${
                        exception.escalationLevel === level.level ? 'bg-slate-100' : ''
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${getEscalationColor(level.level)}`} />
                      <span className="text-sm">{level.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Activities</span>
                  <span className="font-medium">{(exception.activities || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Escalations</span>
                  <span className="font-medium">{(exception.escalations || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Days Open</span>
                  <span className="font-medium">
                    {Math.floor((new Date().getTime() - new Date(exception.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Exception</DialogTitle>
            <DialogDescription>
              Provide details on how this exception was resolved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Resolution Notes *</Label>
              <Textarea
                id="notes"
                placeholder="Describe the resolution steps taken..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={updating || !resolutionNotes.trim()}>
              Resolve Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
