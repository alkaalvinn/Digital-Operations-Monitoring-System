import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function getSLAStatus(deadline: Date | string): { status: 'safe' | 'warning' | 'breached', remaining: string } {
  const now = new Date()
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const diff = deadlineDate.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  const remaining = `${hours}h ${minutes}m`

  if (diff < 0) {
    return { status: 'breached', remaining: 'SLA Breached' }
  } else if (hours < 2) {
    return { status: 'warning', remaining }
  }
  return { status: 'safe', remaining }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200'
    case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN': return 'text-gray-600 bg-gray-50 border-gray-200'
    case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'WAITING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'ESCALATED': return 'text-red-600 bg-red-50 border-red-200'
    case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200'
    case 'CLOSED': return 'text-slate-600 bg-slate-50 border-slate-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function getEscalationLevel(level: string): string {
  switch (level) {
    case 'LEVEL_1': return 'Level 1 - Operational'
    case 'LEVEL_2': return 'Level 2 - Supervisor'
    case 'LEVEL_3': return 'Level 3 - Department Head'
    default: return level
  }
}

export function getEscalationColor(level: string): string {
  switch (level) {
    case 'LEVEL_1': return 'bg-blue-500'
    case 'LEVEL_2': return 'bg-orange-500'
    case 'LEVEL_3': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}
