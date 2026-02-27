import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExceptionStatus, ExceptionSeverity, EscalationLevel } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exception = await prisma.exception.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            email: true
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
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ exception })
  } catch (error) {
    console.error('Exception fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, assignedToId, resolutionNotes, userId } = body

    const exception = await prisma.exception.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: true
      }
    })

    if (!exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      )
    }

    // Check for SLA breach and auto-escalate
    const now = new Date()
    const slaDeadline = new Date(exception.slaDeadline)
    const isSLABreached = now > slaDeadline

    let escalationLevel = exception.escalationLevel
    let newStatus = status || exception.status

    // Auto-escalate if SLA breached and not already at max level
    if (isSLABreached && exception.status !== ExceptionStatus.CLOSED && exception.status !== ExceptionStatus.RESOLVED) {
      if (escalationLevel === EscalationLevel.LEVEL_1) {
        escalationLevel = EscalationLevel.LEVEL_2
        if (!status) newStatus = ExceptionStatus.ESCALATED

        // Create escalation record
        await prisma.escalation.create({
          data: {
            exceptionId: params.id,
            level: EscalationLevel.LEVEL_2,
            reason: 'SLA deadline exceeded',
            escalatedTo: 'Supervisor',
            notes: 'Auto-escalated due to SLA breach'
          }
        })
      } else if (escalationLevel === EscalationLevel.LEVEL_2) {
        const created24hAgo = new Date(exception.createdAt.getTime() + 24 * 60 * 60 * 1000)
        if (now > created24hAgo) {
          escalationLevel = EscalationLevel.LEVEL_3
          if (!status) newStatus = ExceptionStatus.ESCALATED

          await prisma.escalation.create({
            data: {
              exceptionId: params.id,
              level: EscalationLevel.LEVEL_3,
              reason: 'Unresolved after 24 hours at Level 2',
              escalatedTo: 'Department Head',
              notes: 'Auto-escalated due to prolonged resolution time'
            }
          })
        }
      }
    }

    // Update exception
    const updateData: any = {}
    if (status) updateData.status = status as ExceptionStatus
    if (assignedToId) updateData.assignedToId = assignedToId
    if (escalationLevel) updateData.escalationLevel = escalationLevel

    if (status === ExceptionStatus.RESOLVED || status === ExceptionStatus.CLOSED) {
      updateData.resolvedAt = new Date()
      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes
    }

    const updatedException = await prisma.exception.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            email: true
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
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Log activity
    let action = 'UPDATED'
    let description = 'Exception updated'

    if (status) {
      action = 'STATUS_UPDATE'
      description = `Status changed to ${status}`
    }
    if (assignedToId && assignedToId !== exception.assignedToId) {
      description = `Reassigned to new user`
    }
    if (status === ExceptionStatus.RESOLVED) {
      action = 'RESOLVED'
      description = 'Exception marked as resolved'
    }
    if (status === ExceptionStatus.CLOSED) {
      action = 'CLOSED'
      description = 'Exception closed'
    }

    await prisma.activityLog.create({
      data: {
        exceptionId: params.id,
        userId: userId || exception.createdById,
        action,
        description,
        metadata: { oldStatus: exception.status, newStatus: updatedException.status }
      }
    })

    return NextResponse.json({ exception: updatedException })
  } catch (error) {
    console.error('Exception update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.exception.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Exception delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
