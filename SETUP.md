# Digital Operations Monitoring System

A comprehensive enterprise web application for monitoring operational exceptions, tracking KPIs, and managing incident escalation workflows.

## Features

- **Role-Based Dashboards**
  - **Management View**: KPI summaries, trend analysis, critical exceptions visibility
  - **Supervisor View**: Escalation monitoring, SLA breach alerts, team workload
  - **Operational View**: Assigned exceptions, SLA countdown, status management

- **Exception Management**
  - Create, view, and manage operational exceptions
  - Status tracking (Open, In Progress, Waiting, Escalated, Resolved, Closed)
  - Severity levels (Low, Medium, High, Critical)
  - Impact level assessment

- **Escalation Logic**
  - Automatic escalation on SLA breach
  - Critical severity immediate escalation
  - 3-level escalation hierarchy (Operational → Supervisor → Department Head)

- **Activity Logging**
  - Complete audit trail for each exception
  - Comment system for collaboration
  - Status change history

- **SLA Tracking**
  - Real-time countdown timers
  - Visual warnings for approaching deadlines
  - Breach notifications

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Charts**: Recharts
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running locally or accessible

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/monitoring_dashboard?schema=public"
```

Update the connection string to match your PostgreSQL configuration.

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma db push

# Seed with demo data
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

The seed script creates the following test accounts (password: `password123`):

| Role | Email | Access |
|------|-------|--------|
| Management | management@example.com | Full KPI dashboard, all exceptions |
| Supervisor | supervisor@example.com | Escalation monitoring, team workload |
| Operational 1 | op1@example.com | Assigned exceptions only |
| Operational 2 | op2@example.com | Assigned exceptions only |

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── exceptions/     # Exception CRUD operations
│   │   ├── kpis/           # KPI calculations
│   │   └── users/          # User management
│   ├── dashboard/          # Main dashboard (role-based)
│   ├── exceptions/[id]/    # Exception detail view
│   ├── login/              # Login page
│   └── layout.tsx          # Root layout
├── components/
│   └── ui/                 # Shadcn UI components
├── contexts/
│   └── auth-context.tsx    # Authentication context
├── hooks/
│   └── use-toast.ts        # Toast notification hook
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── public/                 # Static assets
```

## Database Schema

### Users
- id, email, name, password, role, avatar
- Roles: MANAGEMENT, OPERATIONAL, SUPERVISOR

### Exceptions
- id, title, description, category, severity, impactLevel
- status, slaDeadline, escalationLevel
- assignedTo, createdBy, resolvedAt, resolutionNotes

### Escalations
- id, exceptionId, level, reason, escalatedAt, escalatedTo, notes

### Activity Logs
- id, exceptionId, userId, action, description, metadata, createdAt

### KPI Metrics
- id, exceptionId, metricType, metricValue, recordedAt

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Exceptions
- `GET /api/exceptions` - List exceptions (with filters)
- `POST /api/exceptions` - Create new exception
- `GET /api/exceptions/[id]` - Get exception details
- `PATCH /api/exceptions/[id]` - Update exception
- `DELETE /api/exceptions/[id]` - Delete exception
- `GET /api/exceptions/[id]/activities` - Get activity log
- `POST /api/exceptions/[id]/activities` - Add activity/comment

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user

### KPIs
- `GET /api/kpis` - Get dashboard metrics

## Escalation Rules

1. **SLA Breach** → Escalate to Level 2 (Supervisor)
2. **Critical Severity** → Immediate Level 2 escalation
3. **Unresolved after 24h at Level 2** → Escalate to Level 3 (Department Head)

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
