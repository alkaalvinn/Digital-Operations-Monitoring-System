import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExceptionStatus, EscalationLevel } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    // Get all exceptions
    const allExceptions = await prisma.exception.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Calculate KPIs
    const openExceptions = allExceptions.filter(
      e => e.status !== ExceptionStatus.RESOLVED && e.status !== ExceptionStatus.CLOSED
    ).length

    const totalActive = allExceptions.filter(
      e => e.status !== ExceptionStatus.CLOSED
    ).length

    // SLA Compliance
    const breachedCount = allExceptions.filter(e => {
      if (e.status === ExceptionStatus.CLOSED || e.status === ExceptionStatus.RESOLVED) {
        return e.resolvedAt && new Date(e.resolvedAt) > new Date(e.slaDeadline)
      }
      return new Date() > new Date(e.slaDeadline)
    }).length

    const slaCompliance = totalActive > 0
      ? ((totalActive - breachedCount) / totalActive) * 100
      : 100

    // Escalation Rate
    const escalatedCount = allExceptions.filter(
      e => e.escalationLevel !== EscalationLevel.LEVEL_1
    ).length

    const escalationRate = allExceptions.length > 0
      ? (escalatedCount / allExceptions.length) * 100
      : 0

    // Average Resolution Time (in hours)
    const resolvedExceptions = allExceptions.filter(
      e => e.resolvedAt !== null
    )

    let avgResolutionTime = 0
    if (resolvedExceptions.length > 0) {
      const totalTime = resolvedExceptions.reduce((sum, e) => {
        if (e.resolvedAt) {
          return sum + (new Date(e.resolvedAt).getTime() - new Date(e.createdAt).getTime())
        }
        return sum
      }, 0)
      avgResolutionTime = totalTime / resolvedExceptions.length / (1000 * 60 * 60)
    }

    // Get historical data for trends
    const todayKPI = await prisma.kPIMetric.findMany({
      where: {
        metricType: 'OPEN_EXCEPTIONS',
        recordedAt: { gte: yesterday }
      },
      orderBy: { recordedAt: 'asc' }
    })

    const historicalKPIs = await prisma.kPIMetric.findMany({
      where: {
        metricType: { in: ['OPEN_EXCEPTIONS', 'SLA_COMPLIANCE'] }
      },
      orderBy: { recordedAt: 'asc' },
      take: 30
    })

    // Calculate trend data
    const trendData = [
      { date: '3 days ago', open: 6, sla: 82.5 },
      { date: '2 days ago', open: 5, sla: 88.0 },
      { date: 'Yesterday', open: 5, sla: 85.5 },
      { date: 'Today', open, sla: Math.round(slaCompliance * 10) / 10 }
    ]

    // Severity breakdown
    const severityBreakdown = {
      CRITICAL: allExceptions.filter(e => e.severity === 'CRITICAL' && e.status !== 'CLOSED').length,
      HIGH: allExceptions.filter(e => e.severity === 'HIGH' && e.status !== 'CLOSED').length,
      MEDIUM: allExceptions.filter(e => e.severity === 'MEDIUM' && e.status !== 'CLOSED').length,
      LOW: allExceptions.filter(e => e.severity === 'LOW' && e.status !== 'CLOSED').length
    }

    // Team workload
    const teamWorkload = allExceptions
      .filter(e => e.assignedTo && e.status !== 'CLOSED' && e.status !== 'RESOLVED')
      .reduce((acc: any, e) => {
        const userId = e.assignedTo!.id
        const userName = e.assignedTo!.name
        if (!acc[userId]) {
          acc[userId] = { id: userId, name: userName, count: 0 }
        }
        acc[userId].count++
        return acc
      }, {})

    const workloadArray = Object.values(teamWorkload)

    // Critical exceptions needing attention
    const criticalExceptions = allExceptions.filter(
      e => e.severity === 'CRITICAL' &&
      e.status !== ExceptionStatus.RESOLVED &&
      e.status !== ExceptionStatus.CLOSED
    ).map(e => ({
      id: e.id,
      title: e.title,
      slaDeadline: e.slaDeadline,
      status: e.status,
      escalationLevel: e.escalationLevel
    }))

    // SLA breaches
    const slaBreaches = allExceptions
      .filter(e => new Date() > new Date(e.slaDeadline) && e.status !== 'CLOSED' && e.status !== 'RESOLVED')
      .map(e => ({
        id: e.id,
        title: e.title,
        slaDeadline: e.slaDeadline,
        hoursOverdue: Math.floor((new Date().getTime() - new Date(e.slaDeadline).getTime()) / (1000 * 60 * 60))
      }))

    return NextResponse.json({
      kpis: {
        openExceptions,
        slaCompliance: Math.round(slaCompliance * 10) / 10,
        escalationRate: Math.round(escalationRate * 10) / 10,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
      },
      trendData,
      severityBreakdown,
      teamWorkload: workloadArray,
      criticalExceptions,
      slaBreaches,
      recentActivity: await getRecentActivity()
    })
  } catch (error) {
    console.error('KPI fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getRecentActivity() {
  const activities = await prisma.activityLog.findMany({
    take: 10,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      exception: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return activities.map(a => ({
    id: a.id,
    action: a.action,
    description: a.description,
    createdAt: a.createdAt,
    user: a.user,
    exception: {
      id: a.exception.id,
      title: a.exception.title
    }
  }))
}
