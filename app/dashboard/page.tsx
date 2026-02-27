"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Activity,
  LogOut,
  Bell,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { formatDateTime, getSeverityColor, getStatusColor, getSLAStatus, getEscalationColor, getEscalationLevel } from '@/lib/utils'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface KPIData {
  kpis: {
    openExceptions: number
    slaCompliance: number
    escalationRate: number
    avgResolutionTime: number
  }
  trendData: Array<{ date: string; open: number; sla: number }>
  severityBreakdown: {
    CRITICAL: number
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  teamWorkload: Array<{ id: string; name: string; count: number }>
  criticalExceptions: Array<{
    id: string
    title: string
    slaDeadline: string
    status: string
    escalationLevel: string
  }>
  slaBreaches: Array<{
    id: string
    title: string
    slaDeadline: string
    hoursOverdue: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    user: { name: string; avatar?: string }
    exception: { id: string; title: string }
  }>
}

interface Exception {
  id: string
  title: string
  description: string
  category: string
  severity: string
  impactLevel: number
  status: string
  slaDeadline: string
  escalationLevel: string
  assignedTo: { id: string; name: string; avatar?: string } | null
  createdAt: string
}

const COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6'
}

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [kpiRes, excRes] = await Promise.all([
        fetch('/api/kpis'),
        fetch(`/api/exceptions?userRole=${user?.role}&userId=${user?.id}`)
      ])

      if (kpiRes.ok) {
        const kpiJson = await kpiRes.json()
        setKpiData(kpiJson)
      }

      if (excRes.ok) {
        const excJson = await excRes.json()
        setExceptions(excJson.exceptions)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleViewException = (id: string) => {
    router.push(`/exceptions/${id}`)
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      MANAGEMENT: 'bg-purple-100 text-purple-800',
      SUPERVISOR: 'bg-orange-100 text-orange-800',
      OPERATIONAL: 'bg-blue-100 text-blue-800'
    }
    return colors[role as keyof typeof colors] || colors.OPERATIONAL
  }

  const filteredExceptions = exceptions.filter(exc => {
    if (selectedStatus === 'all') return true
    return exc.status === selectedStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Operations Monitor</h1>
              <p className="text-sm text-slate-500">Digital Operations Monitoring System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className={getRoleBadge(user.role)}>
              {user.role.replace('_', ' ')}
            </Badge>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Management Dashboard */}
        {user.role === 'MANAGEMENT' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Open Exceptions"
                value={kpiData?.kpis.openExceptions || 0}
                change="-2 from yesterday"
                changeType="negative"
                icon={<AlertTriangle className="h-5 w-5" />}
                color="red"
              />
              <KPICard
                title="SLA Compliance"
                value={`${kpiData?.kpis.slaCompliance || 0}%`}
                change="+3.2% from last week"
                changeType="positive"
                icon={<CheckCircle className="h-5 w-5" />}
                color="green"
              />
              <KPICard
                title="Escalation Rate"
                value={`${kpiData?.kpis.escalationRate || 0}%`}
                change="-1.5% from last week"
                changeType="positive"
                icon={<TrendingUp className="h-5 w-5" />}
                color="orange"
              />
              <KPICard
                title="Avg Resolution Time"
                value={`${kpiData?.kpis.avgResolutionTime || 0}h`}
                change="-0.8h from last week"
                changeType="positive"
                icon={<Clock className="h-5 w-5" />}
                color="blue"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exception Trends</CardTitle>
                  <CardDescription>Open exceptions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={kpiData?.trendData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="open" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Severity Distribution</CardTitle>
                  <CardDescription>Current exceptions by severity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: kpiData?.severityBreakdown.CRITICAL || 0, color: COLORS.CRITICAL },
                          { name: 'High', value: kpiData?.severityBreakdown.HIGH || 0, color: COLORS.HIGH },
                          { name: 'Medium', value: kpiData?.severityBreakdown.MEDIUM || 0, color: COLORS.MEDIUM },
                          { name: 'Low', value: kpiData?.severityBreakdown.LOW || 0, color: COLORS.LOW }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Critical', value: kpiData?.severityBreakdown.CRITICAL || 0, color: COLORS.CRITICAL },
                          { name: 'High', value: kpiData?.severityBreakdown.HIGH || 0, color: COLORS.HIGH },
                          { name: 'Medium', value: kpiData?.severityBreakdown.MEDIUM || 0, color: COLORS.MEDIUM },
                          { name: 'Low', value: kpiData?.severityBreakdown.LOW || 0, color: COLORS.LOW }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Critical Exceptions & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Critical Exceptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpiData?.criticalExceptions.map(exc => (
                      <div
                        key={exc.id}
                        className="p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition"
                        onClick={() => handleViewException(exc.id)}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{exc.title}</p>
                          <Badge className="bg-red-600">CRITICAL</Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          SLA: {formatDateTime(exc.slaDeadline)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpiData?.recentActivity.slice(0, 5).map(activity => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-slate-500">{formatDateTime(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SLA Breaches Warning */}
            {kpiData?.slaBreaches && kpiData.slaBreaches.length > 0 && (
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    SLA Breaches Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {kpiData.slaBreaches.map(breach => (
                      <div
                        key={breach.id}
                        className="p-3 bg-white border border-orange-200 rounded-lg cursor-pointer hover:border-orange-300 transition"
                        onClick={() => handleViewException(breach.id)}
                      >
                        <p className="font-medium text-sm">{breach.title}</p>
                        <p className="text-xs text-orange-600 mt-1">
                          {breach.hoursOverdue}h overdue
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Supervisor Dashboard */}
        {user.role === 'SUPERVISOR' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <KPICard
                title="Escalated Items"
                value={exceptions.filter(e => e.escalationLevel !== 'LEVEL_1').length}
                change="Active escalations"
                icon={<Bell className="h-5 w-5" />}
                color="orange"
              />
              <KPICard
                title="SLA Breaches"
                value={kpiData?.slaBreaches?.length || 0}
                change="Requires attention"
                changeType="negative"
                icon={<AlertTriangle className="h-5 w-5" />}
                color="red"
              />
              <KPICard
                title="Team Workload"
                value={kpiData?.teamWorkload?.length || 0}
                change="Active operators"
                icon={<Users className="h-5 w-5" />}
                color="blue"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Workload Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={kpiData?.teamWorkload || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Escalated Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exceptions
                      .filter(e => e.escalationLevel !== 'LEVEL_1')
                      .slice(0, 5)
                      .map(exc => (
                        <div
                          key={exc.id}
                          className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition"
                          onClick={() => handleViewException(exc.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{exc.title}</p>
                              <p className="text-xs text-slate-500">{exc.assignedTo?.name || 'Unassigned'}</p>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${getEscalationColor(exc.escalationLevel)}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getSeverityColor(exc.severity)}>{exc.severity}</Badge>
                            <Badge className={getStatusColor(exc.status)}>{exc.status.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Operational Dashboard */}
        {user.role === 'OPERATIONAL' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="My Assignments"
                value={exceptions.length}
                change="Active tasks"
                icon={<Activity className="h-5 w-5" />}
                color="blue"
              />
              <KPICard
                title="Critical"
                value={exceptions.filter(e => e.severity === 'CRITICAL').length}
                change="Needs immediate action"
                changeType="negative"
                icon={<AlertTriangle className="h-5 w-5" />}
                color="red"
              />
              <KPICard
                title="Due Today"
                value={exceptions.filter(e => {
                  const deadline = new Date(e.slaDeadline)
                  const today = new Date()
                  return deadline.toDateString() === today.toDateString()
                }).length}
                change="SLA deadline approaching"
                icon={<Clock className="h-5 w-5" />}
                color="orange"
              />
              <KPICard
                title="Resolved This Week"
                value={exceptions.filter(e => e.status === 'RESOLVED').length}
                change="Completed tasks"
                changeType="positive"
                icon={<CheckCircle className="h-5 w-5" />}
                color="green"
              />
            </div>
          </>
        )}

        {/* Exceptions Table - All Roles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Exceptions</CardTitle>
                <CardDescription>
                  {user.role === 'MANAGEMENT' ? 'All exceptions in the system' :
                   user.role === 'SUPERVISOR' ? 'Escalated and monitored exceptions' :
                   'Your assigned exceptions'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {['all', 'OPEN', 'IN_PROGRESS', 'ESCALATED'].map(status => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exception</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>SLA Deadline</TableHead>
                  <TableHead>Escalation</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredExceptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No exceptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExceptions.map(exc => {
                    const slaStatus = getSLAStatus(exc.slaDeadline)
                    return (
                      <TableRow key={exc.id} className="cursor-pointer hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{exc.title}</p>
                            <p className="text-xs text-slate-500">{exc.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(exc.severity)}>{exc.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(exc.status)}>{exc.status.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={exc.assignedTo?.avatar} />
                              <AvatarFallback>{exc.assignedTo?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{exc.assignedTo?.name || 'Unassigned'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{formatDateTime(exc.slaDeadline)}</span>
                            {slaStatus.status === 'breached' && (
                              <Badge variant="destructive" className="text-xs">Breached</Badge>
                            )}
                            {slaStatus.status === 'warning' && (
                              <Badge className="bg-yellow-500 text-white text-xs">Warning</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getEscalationColor(exc.escalationLevel)}`} />
                            <span className="text-xs text-slate-600">{getEscalationLevel(exc.escalationLevel)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewException(exc.id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function KPICard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: 'red' | 'green' | 'blue' | 'orange'
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                changeType === 'positive' ? 'text-green-600' :
                changeType === 'negative' ? 'text-red-600' :
                'text-slate-500'
              }`}>
                {changeType === 'positive' && <ArrowUp className="h-3 w-3" />}
                {changeType === 'negative' && <ArrowDown className="h-3 w-3" />}
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
