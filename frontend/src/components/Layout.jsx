import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/events', label: 'Events' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-primary text-white flex flex-col">
        <div className="px-4 py-5 border-b border-primary-dark">
          <span className="font-bold text-sm leading-tight"><br/>Risk Collector</span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm hover:bg-primary-dark transition-colors ${isActive ? 'bg-primary-dark font-semibold' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-primary-dark text-xs">
          <div className="mb-1 truncate">{user?.username || user?.sub || 'User'}</div>
          <button onClick={handleLogout} className="text-gray-300 hover:text-white">Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
