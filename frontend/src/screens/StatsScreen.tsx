import { useState, useEffect } from 'react'
import { supabase, type Drink } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { Beer, Trophy, Calendar, Coins } from 'lucide-react'

export default function StatsScreen() {
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [profile, setProfile] = useState<{ xp_total: number; level: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [drinksResult, profileResult] = await Promise.all([
      supabase.from('drinks').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('xp_total, level').eq('id', user.id).single()
    ])

    if (drinksResult.data) setDrinks(drinksResult.data)
    if (profileResult.data) setProfile(profileResult.data)
    setLoading(false)
  }

  const getWeekData = () => {
    const today = new Date()
    const weekData: { day: string; drinks: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayStr = date.toDateString()
      const dayDrinks = drinks.filter((d) => new Date(d.created_at).toDateString() === dayStr)
      weekData.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        drinks: dayDrinks.filter((d) => d.type !== 'water').length
      })
    }

    return weekData
  }

  const todayDrinks = drinks.filter(
    (d) => new Date(d.created_at).toDateString() === new Date().toDateString()
  )
  const totalDrinks = drinks.filter((d) => d.type !== 'water').length
  const waterCount = drinks.filter((d) => d.type === 'water').length

  const stats = [
    { label: 'Aujourd\'hui', value: todayDrinks.length, icon: Beer, color: 'text-brand' },
    { label: 'Total boissons', value: totalDrinks, icon: Beer, color: 'text-success' },
    { label: 'Verres d\'eau', value: waterCount, icon: Beer, color: 'text-cyan-400' },
    { label: 'Niveau', value: profile?.level || 1, icon: Trophy, color: 'text-warning' }
  ]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Statistiques</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="p-4 rounded-lg bg-surface-secondary border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-on-surface-secondary">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* XP Progress */}
      {profile && (
        <div className="mb-8 p-4 rounded-lg bg-brand-tertiary border border-brand/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-on-brand-tertiary">Experience</span>
            <span className="text-sm font-medium text-on-brand-tertiary">
              {profile.xp_total} XP
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all"
              style={{ width: `${(profile.xp_total % 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-on-brand-tertiary text-center">
            Niveau {profile.level} - {100 - (profile.xp_total % 100)} XP pour le niveau suivant
          </p>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Cette semaine</h2>
        <div className="p-4 rounded-lg bg-surface-secondary border border-border">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getWeekData()}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="drinks" radius={[4, 4, 0, 0]}>
                {getWeekData().map((_, index) => (
                  <Cell key={index} fill="#d4af37" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Badges</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
          {[
            { name: 'Premier verre', icon: '🍺', unlocked: totalDrinks >= 1 },
            { name: 'Hydratation', icon: '💧', unlocked: waterCount >= 5 },
            { name: 'Moderation', icon: '🎯', unlocked: totalDrinks >= 10 },
            { name: 'Expert', icon: '🏆', unlocked: totalDrinks >= 50 },
            { name: 'Legende', icon: '⭐', unlocked: totalDrinks >= 100 }
          ].map((badge) => (
            <div
              key={badge.name}
              className={`flex-shrink-0 w-24 p-4 rounded-lg border ${
                badge.unlocked
                  ? 'bg-brand-tertiary border-brand/30'
                  : 'bg-surface-secondary border-border opacity-50'
              }`}
            >
              <div className="text-3xl text-center mb-2">{badge.icon}</div>
              <p className="text-xs text-center">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
