import { useNavigate, useLocation } from 'react-router-dom'
import { List, BarChart3, Plus, Fuel, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', label: '明细', icon: List },
  { path: '/charts', label: '图表', icon: BarChart3 },
  { path: '/add', label: '', icon: Plus, isCenter: true },
  { path: '/gas', label: '汽油', icon: Fuel },
  { path: '/profile', label: '我的', icon: User },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 px-4 relative">
        {/* 左侧：明细 + 图表 */}
        <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-0.5 py-2 w-16">
          <List className={cn('w-5 h-5 transition-colors', location.pathname === '/' ? 'text-amber-600' : 'text-gray-400')} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
          <span className={cn('text-[10px] transition-colors', location.pathname === '/' ? 'text-amber-600 font-medium' : 'text-gray-400')}>明细</span>
        </button>
        <button onClick={() => navigate('/charts')} className="flex flex-col items-center justify-center gap-0.5 py-2 w-16">
          <BarChart3 className={cn('w-5 h-5 transition-colors', location.pathname === '/charts' ? 'text-amber-600' : 'text-gray-400')} strokeWidth={location.pathname === '/charts' ? 2.5 : 2} />
          <span className={cn('text-[10px] transition-colors', location.pathname === '/charts' ? 'text-amber-600 font-medium' : 'text-gray-400')}>图表</span>
        </button>

        {/* 中间加号 */}
        <button onClick={() => navigate('/add')} className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 -top-6">
          <span className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30 active:scale-95 transition-transform">
            <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
          </span>
        </button>

        {/* 右侧：汽油 + 我的 */}
        <button onClick={() => navigate('/gas')} className="flex flex-col items-center justify-center gap-0.5 py-2 w-16">
          <Fuel className={cn('w-5 h-5 transition-colors', location.pathname === '/gas' ? 'text-amber-600' : 'text-gray-400')} strokeWidth={location.pathname === '/gas' ? 2.5 : 2} />
          <span className={cn('text-[10px] transition-colors', location.pathname === '/gas' ? 'text-amber-600 font-medium' : 'text-gray-400')}>汽油</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center gap-0.5 py-2 w-16">
          <User className={cn('w-5 h-5 transition-colors', location.pathname === '/profile' ? 'text-amber-600' : 'text-gray-400')} strokeWidth={location.pathname === '/profile' ? 2.5 : 2} />
          <span className={cn('text-[10px] transition-colors', location.pathname === '/profile' ? 'text-amber-600 font-medium' : 'text-gray-400')}>我的</span>
        </button>
      </div>
    </nav>
  )
}
