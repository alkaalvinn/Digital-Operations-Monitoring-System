import { PrismaClient, UserRole, ExceptionStatus, ExceptionSeverity, EscalationLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.kPIMetric.deleteMany()
  await prisma.escalation.deleteMany()
  await prisma.exception.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const management = await prisma.user.create({
    data: {
      email: 'management@example.com',
      name: 'John Manager',
      password: 'password123',
      role: UserRole.MANAGEMENT,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    }
  })

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@example.com',
      name: 'Sarah Supervisor',
      password: 'password123',
      role: UserRole.SUPERVISOR,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    }
  })

  const operational1 = await prisma.user.create({
    data: {
      email: 'op1@example.com',
      name: 'Mike Operator',
      password: 'password123',
      role: UserRole.OPERATIONAL,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    }
  })

  const operational2 = await prisma.user.create({
    data: {
      email: 'op2@example.com',
      name: 'Lisa Operator',
      password: 'password123',
      role: UserRole.OPERATIONAL,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'
    }
  })

  const departmentHead = await prisma.user.create({
    data: {
      email: 'head@example.com',
      name: 'David DepartmentHead',
      password: 'password123',
      role: UserRole.MANAGEMENT,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    }
  })

  // Create Exceptions
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

  const exceptions = [
    {
      title: 'Database Connection Timeout',
      description: 'Primary database experiencing intermittent connection timeouts affecting read operations.',
      category: 'Infrastructure',
      severity: ExceptionSeverity.CRITICAL,
      impactLevel: 5,
      status: ExceptionStatus.OPEN,
      slaDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational1.id,
      createdById: management.id
    },
    {
      title: 'Payment Gateway Integration Issue',
      description: 'Customers reporting failed payment transactions with error code 503.',
      category: 'Payment',
      severity: ExceptionSeverity.HIGH,
      impactLevel: 4,
      status: ExceptionStatus.IN_PROGRESS,
      slaDeadline: new Date(now.getTime() + 6 * 60 * 60 * 1000),
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational2.id,
      createdById: supervisor.id
    },
    {
      title: 'API Response Time Degradation',
      description: 'API endpoints showing increased response times over 2 seconds average.',
      category: 'Performance',
      severity: ExceptionSeverity.MEDIUM,
      impactLevel: 3,
      status: ExceptionStatus.ESCALATED,
      slaDeadline: yesterday,
      escalationLevel: EscalationLevel.LEVEL_2,
      assignedToId: operational1.id,
      createdById: management.id,
      resolvedAt: null,
      resolutionNotes: null
    },
    {
      title: 'Email Notification Service Down',
      description: 'Email notifications not being sent to users for password resets.',
      category: 'Communication',
      severity: ExceptionSeverity.HIGH,
      impactLevel: 4,
      status: ExceptionStatus.WAITING,
      slaDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational2.id,
      createdById: supervisor.id
    },
    {
      title: 'User Session Timeout Errors',
      description: 'Users being logged out unexpectedly due to session validation failures.',
      category: 'Authentication',
      severity: ExceptionSeverity.MEDIUM,
      impactLevel: 3,
      status: ExceptionStatus.IN_PROGRESS,
      slaDeadline: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational1.id,
      createdById: management.id
    },
    {
      title: 'Report Generation Failure',
      description: 'Scheduled monthly reports failing to generate due to data processing errors.',
      category: 'Reporting',
      severity: ExceptionSeverity.LOW,
      impactLevel: 2,
      status: ExceptionStatus.RESOLVED,
      slaDeadline: twoDaysAgo,
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational2.id,
      createdById: supervisor.id,
      resolvedAt: yesterday,
      resolutionNotes: 'Fixed data processing pipeline. Reports now generating successfully.'
    },
    {
      title: 'Mobile App Sync Issues',
      description: 'Mobile app users experiencing sync delays with backend services.',
      category: 'Mobile',
      severity: ExceptionSeverity.MEDIUM,
      impactLevel: 3,
      status: ExceptionStatus.OPEN,
      slaDeadline: new Date(now.getTime() + 10 * 60 * 60 * 1000),
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational1.id,
      createdById: management.id
    },
    {
      title: 'Data Backup Process Alert',
      description: 'Last night\'s backup process completed with warnings.',
      category: 'Infrastructure',
      severity: ExceptionSeverity.LOW,
      impactLevel: 2,
      status: ExceptionStatus.CLOSED,
      slaDeadline: threeDaysAgo,
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational2.id,
      createdById: supervisor.id,
      resolvedAt: twoDaysAgo,
      resolutionNotes: 'Investigated backup warnings. No data loss. Process optimized.'
    },
    {
      title: 'Search Functionality Broken',
      description: 'Full-text search returning no results for valid queries.',
      category: 'Feature',
      severity: ExceptionSeverity.HIGH,
      impactLevel: 4,
      status: ExceptionStatus.ESCALATED,
      slaDeadline: yesterday,
      escalationLevel: EscalationLevel.LEVEL_3,
      assignedToId: operational1.id,
      createdById: management.id,
      resolvedAt: null,
      resolutionNotes: null
    },
    {
      title: 'Third-party API Rate Limiting',
      description: 'External vendor API returning 429 errors due to rate limit exceeded.',
      category: 'Integration',
      severity: ExceptionSeverity.MEDIUM,
      impactLevel: 3,
      status: ExceptionStatus.IN_PROGRESS,
      slaDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      escalationLevel: EscalationLevel.LEVEL_1,
      assignedToId: operational2.id,
      createdById: supervisor.id
    }
  ]

  const createdExceptions = await Promise.all(
    exceptions.map(e => prisma.exception.create({ data: e }))
  )

  // Create Escalations
  await prisma.escalation.create({
    data: {
      exceptionId: createdExceptions[2].id,
      level: EscalationLevel.LEVEL_2,
      reason: 'SLA deadline exceeded without resolution',
      escalatedTo: supervisor.name,
      notes: 'Escalated to supervisor level due to SLA breach'
    }
  })

  await prisma.escalation.create({
    data: {
      exceptionId: createdExceptions[8].id,
      level: EscalationLevel.LEVEL_2,
      reason: 'Critical functionality down, no progress after 24h',
      escalatedTo: supervisor.name,
      notes: 'Escalated due to critical search functionality being unavailable'
    }
  })

  await prisma.escalation.create({
    data: {
      exceptionId: createdExceptions[8].id,
      level: EscalationLevel.LEVEL_3,
      reason: 'Critical issue unresolved after supervisor escalation',
      escalatedTo: departmentHead.name,
      notes: 'Department head intervention required'
    }
  })

  // Create Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        exceptionId: createdExceptions[0].id,
        userId: management.id,
        action: 'CREATED',
        description: 'Exception created and assigned to Mike Operator',
        metadata: { severity: 'CRITICAL' }
      },
      {
        exceptionId: createdExceptions[1].id,
        userId: supervisor.id,
        action: 'CREATED',
        description: 'Payment gateway issue logged',
        metadata: { category: 'Payment' }
      },
      {
        exceptionId: createdExceptions[2].id,
        userId: operational1.id,
        action: 'STATUS_UPDATE',
        description: 'Status changed to In Progress',
        metadata: { oldStatus: 'OPEN', newStatus: 'IN_PROGRESS' }
      },
      {
        exceptionId: createdExceptions[2].id,
        userId: supervisor.id,
        action: 'ESCALATED',
        description: 'Escalated to Level 2 due to SLA breach',
        metadata: { level: 'LEVEL_2' }
      },
      {
        exceptionId: createdExceptions[5].id,
        userId: operational2.id,
        action: 'RESOLVED',
        description: 'Report generation issue resolved',
        metadata: { resolutionTime: '4 hours' }
      },
      {
        exceptionId: createdExceptions[5].id,
        userId: supervisor.id,
        action: 'CLOSED',
        description: 'Issue verified and closed',
        metadata: {}
      }
    ]
  })

  // Create KPI Metrics
  await prisma.kPIMetric.createMany({
    data: [
      { metricType: 'OPEN_EXCEPTIONS', metricValue: 4 },
      { metricType: 'SLA_COMPLIANCE', metricValue: 85.5 },
      { metricType: 'ESCALATION_RATE', metricValue: 15.2 },
      { metricType: 'AVG_RESOLUTION_TIME', metricValue: 6.8 },
      { metricType: 'OPEN_EXCEPTIONS', metricValue: 5, recordedAt: yesterday },
      { metricType: 'OPEN_EXCEPTIONS', metricValue: 6, recordedAt: twoDaysAgo },
      { metricType: 'SLA_COMPLIANCE', metricValue: 88.0, recordedAt: yesterday },
      { metricType: 'SLA_COMPLIANCE', metricValue: 82.5, recordedAt: twoDaysAgo },
    ]
  })

  console.log('Database seeded successfully!')
  console.log('\n--- Test Users ---')
  console.log('Management: management@example.com / password123')
  console.log('Supervisor: supervisor@example.com / password123')
  console.log('Operational 1: op1@example.com / password123')
  console.log('Operational 2: op2@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
