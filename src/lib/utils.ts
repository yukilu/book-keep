import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatDate(date: string): { day: string; weekday: string } {
  const d = new Date(date.split(' ')[0])
  return {
    day: `${d.getMonth() + 1}月${d.getDate()}日`,
    weekday: WEEKDAYS[d.getDay()],
  }
}

export function formatDateTime(date: string): string {
  if (date.includes(' ')) {
    return date
  }
  return date
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  return `${year}年${parseInt(m)}月`
}

export function getToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function getCurrentDateTime(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}
