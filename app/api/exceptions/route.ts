import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExceptionStatus, ExceptionSeverity, EscalationLevel } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const assignedTo = searchParams.get('assignedTo')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    const where: any = {}

    if (status) {
      where.status = status as ExceptionStatus
    }
    if (severity) {
      where.severity = severity as ExceptionSeverity
    }
    if (assignedTo) {
      where.assignedToId = assignedTo
    }

    // Role-based filtering
    if (userRole === 'OPERATIONAL' && userId) {
      where.assignedToId = userId
    } else if (userRole === 'SUPERVISOR') {
      // Supervisors see escalated items
      where.OR = [
        { escalationLevel: { in: [EscalationLevel.LEVEL_2, EscalationLevel.LEVEL_3] } },
        { escalationLevel: EscalationLevel.LEVEL_1 }
      ]
    }

    const exceptions = await prisma.exception.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        escalations: {
          orderBy: {
            escalatedAt: 'desc'
          }
        },
        _count: {
          select: {
            activities: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ exceptions })
  } catch (error) {
    console.error('Exceptions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      severity,
      impactLevel,
      assignedToId,
      slaDeadline,
      createdById
    } = body

    if (!title || !description || !category || !severity || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate SLA deadline if not provided
    const deadline = slaDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Set initial escalation level based on severity
    let initialLevel = EscalationLevel.LEVEL_1
    if (severity === ExceptionSeverity.CRITICAL) {
      initialLevel = EscalationLevel.LEVEL_2
    }

    const exception = await prisma.exception.create({
      data: {
        title,
        description,
        category,
        severity: severity as ExceptionSeverity,
        impactLevel: impactLevel || 3,
        status: ExceptionStatus.OPEN,
        slaDeadline: deadline,
        escalationLevel: initialLevel,
        assignedToId,
        createdById
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // Create activity log
    await prisma.activityLog.create({
      data: {
        exceptionId: exception.id,
        userId: createdById,
        action: 'CREATED',
        description: `Exception created: ${title}`,
        metadata: { severity, category }
      }
    })

    return NextResponse.json({ exception }, { status: 201 })
  } catch (error) {
    console.error('Exception creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
