import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store'
import Transactions from '@/pages/Transactions'
import Charts from '@/pages/Charts'
import Add from '@/pages/Add'
import TagManagement from '@/pages/TagManagement'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import TransactionDetail from '@/pages/TransactionDetail'
import BottomNav from '@/components/BottomNav'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAppStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Layout() {
  const location = useLocation()
  const hideNav = location.pathname === '/add' || location.pathname === '/login' || location.pathname.startsWith('/transaction/')

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/charts" element={<ProtectedRoute><Charts /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><Add /></ProtectedRoute>} />
        <Route path="/tags" element={<ProtectedRoute><TagManagement /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/transaction/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}
