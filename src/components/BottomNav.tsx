import { useNavigate, useLocation } from 'react-router-dom'
import { List, BarChart3, Plus, Tag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    { path: '/', label: '明细', icon: List },
    { path: '/charts', label: '图表', icon: BarChart3 },
    { path: '/tags', label: '标签', icon: Tag },
    { path: '/profile', label: '我的', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {/* 明细 */}
        {items.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-amber-600' : 'text-gray-400')} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[10px] transition-colors', isActive ? 'text-amber-600 font-medium' : 'text-gray-400')}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* 中间加号 */}
        <button
          onClick={() => navigate('/add')}
          className="flex items-center justify-center"
        >
          <span className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </span>
        </button>

        {/* 标签 + 我的 */}
        {items.slice(2).map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-amber-600' : 'text-gray-400')} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[10px] transition-colors', isActive ? 'text-amber-600 font-medium' : 'text-gray-400')}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
