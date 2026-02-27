# 🎯 ROLE

You are a senior product engineer and UX-focused system architect.

Build a **Digital Operations Monitoring System** that helps management monitor:

* Operational exceptions
* Performance KPI
* Incident management
* Structured escalation workflow

This is an enterprise internal web application.

---

## 🧠 BUSINESS CONTEXT

Current Problems:

* Data scattered across multiple sources
* Management cannot get real-time insight
* No structured exception follow-up
* No escalation management model

Goal:
Create a centralized monitoring & operational control center.

---

## 👥 USER ROLES

### 1️⃣ Management

Needs:

* Quick KPI summary
* Critical exceptions visibility
* Escalation overview
* Trend analysis

### 2️⃣ Operational Team

Needs:

* Exception list
* Follow-up workflow
* SLA tracking
* Comment & activity log

### 3️⃣ Supervisor

Needs:

* Escalation monitoring
* SLA breach alerts
* Workload overview
* Performance metrics

Implement role-based access control.

---

## 🏗 CORE FEATURES

### 1️⃣ Dashboard (Role-Based)

Management View:

* KPI Cards (Open Exceptions, SLA Compliance %, Escalation Rate, Avg Resolution Time)
* Trend chart (line chart)
* Critical exceptions widget
* Escalation summary panel

Operational View:

* Assigned exceptions
* SLA countdown timer
* Status filter (Open, In Progress, Escalated, Closed)

Supervisor View:

* Escalated incidents list
* SLA breach alert
* Team workload chart

---

### 2️⃣ Exception Management Module

Fields:

* Exception ID
* Title
* Description
* Category
* Severity (Low, Medium, High, Critical)
* Impact level
* Assigned To
* Status
* SLA deadline
* Created at
* Escalation level

Statuses:

* Open
* In Progress
* Waiting
* Escalated
* Resolved
* Closed

---

### 3️⃣ Escalation Logic

Implement automatic escalation logic:

* If SLA breached → escalate to Supervisor
* If Severity = Critical → immediate Level 2 escalation
* If unresolved after 24h → escalate to Level 3

Escalation Levels:

* Level 1 → Operational
* Level 2 → Supervisor
* Level 3 → Department Head

Show:

* Escalation badge
* Escalation timeline
* Escalation history log

---

### 4️⃣ Incident Activity Log

Each exception must have:

* Comment system
* Activity timeline
* Status change log
* Escalation history
* Resolution notes

---

## 📊 DATA MODEL

Design normalized database schema including:

Tables:

* users
* roles
* exceptions
* escalations
* kpi_metrics
* activity_logs

Include foreign key relationships.

---

## 🎨 UI/UX REQUIREMENTS

Design a clean enterprise-style UI:

* Minimalist layout
* Sidebar navigation
* Top summary KPI cards
* Data-heavy but readable
* High contrast alerts

Color logic:

* Red → Critical
* Yellow → Warning
* Green → Normal
* Blue → Informational

Use:

* Responsive layout
* Modern dashboard design
* Clear visual hierarchy
* Table with filtering & sorting
* Drawer or modal for detail view

---

## 🛠 TECH STACK

Use:

Frontend:

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Shadcn UI
* Recharts (for charts)

Backend:

* Next.js API routes OR Express
* PostgreSQL
* Prisma ORM

Authentication:

* Role-based authentication

Include:

* Dummy seed data
* Realistic mock data
* API endpoints
* Clean folder structure

---

## 🔄 WORKFLOW

Exception lifecycle:

Detected → Assigned → In Progress → Resolved → Closed
↓
Escalated (if SLA breach or critical)

---

## 🧪 ADDITIONAL

Add:

* Search & filter
* Sort by SLA deadline
* KPI auto recalculation
* Real-time SLA countdown
* Simple analytics page

---

## 🧩 DELIVERABLE

Generate:

* Full project structure
* Database schema
* API routes
* UI pages
* Seed script
* Dummy users for each role
* README setup instructions

---

> Generate full production-ready code.
> No explanation needed.
> Provide working runnable application.
> Prioritize clean architecture and scalability.
