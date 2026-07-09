import { create } from 'zustand'
import type { User } from '@shared/types'

interface AppStore {
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  refreshKey: number
  triggerRefresh: () => void
  user: User | null
  token: string | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  isLoggedIn: () => boolean
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function loadUser(): User | null {
  const stored = localStorage.getItem('user')
  return stored ? JSON.parse(stored) : null
}

function loadToken(): string | null {
  return localStorage.getItem('token')
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedMonth: getCurrentMonth(),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  user: loadUser(),
  token: loadToken(),
  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
  isLoggedIn: () => get().token !== null,
}))

export { getCurrentMonth }
