import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Hop as Home, Clock, ChartBar as BarChart3, MessageCircle, User } from 'lucide-react'

const tabs = [
  { path: '/', icon: Home, label: 'Tableau' },
  { path: '/history', icon: Clock, label: 'Historique' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/coach', icon: MessageCircle, label: 'Coach' },
  { path: '/profile', icon: User, label: 'Profil' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col bg-surface">
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-brand'
                    : 'text-on-surface-secondary hover:text-on-surface'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
