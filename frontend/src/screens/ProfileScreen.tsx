import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User, LogOut, ChevronRight, Bell, Palette, Trash2 } from 'lucide-react'

interface Profile {
  id: string
  weight_kg: number | null
  sex: 'male' | 'female' | null
  age: number | null
  xp_total: number
  level: number
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setProfile(data)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, ...updates })
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getInitials = () => {
    return 'S' // Placeholder until we have user name
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  const weightOptions = Array.from({ length: 150 }, (_, i) => i + 30)
  const ageOptions = Array.from({ length: 82 }, (_, i) => i + 18)

  return (
    <div className="h-full overflow-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Profil</h1>

      {/* User Header */}
      <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-surface-secondary border border-border">
        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center">
          <span className="text-2xl font-bold text-on-brand">{getInitials()}</span>
        </div>
        <div>
          <p className="font-semibold">
            Niveau {profile?.level || 1}
          </p>
          <p className="text-sm text-on-surface-secondary">
            {profile?.xp_total || 0} XP total
          </p>
        </div>
      </div>

      {/* Physical Attributes */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Attributs physiques</h2>
        <p className="text-sm text-on-surface-secondary mb-4">
          Ces informations sont necessaires pour calculer votre taux d'alcoolemie.
        </p>

        <div className="space-y-4">
          {/* Weight */}
          <div className="p-4 rounded-lg bg-surface-secondary border border-border">
            <label className="block text-sm text-on-surface-secondary mb-2">Poids</label>
            <select
              value={profile?.weight_kg || ''}
              onChange={(e) => updateProfile({ weight_kg: Number(e.target.value) })}
              disabled={saving}
              className="w-full bg-surface-tertiary rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-brand"
            >
              <option value="">Selectionnez</option>
              {weightOptions.map((kg) => (
                <option key={kg} value={kg}>
                  {kg} kg
                </option>
              ))}
            </select>
          </div>

          {/* Sex */}
          <div className="p-4 rounded-lg bg-surface-secondary border border-border">
            <label className="block text-sm text-on-surface-secondary mb-2">Sexe</label>
            <div className="flex gap-4">
              <button
                onClick={() => updateProfile({ sex: 'male' })}
                disabled={saving}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  profile?.sex === 'male'
                    ? 'bg-brand-tertiary border-brand text-on-brand-tertiary'
                    : 'bg-surface-tertiary border-border text-on-surface hover:border-brand'
                }`}
              >
                Homme
              </button>
              <button
                onClick={() => updateProfile({ sex: 'female' })}
                disabled={saving}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  profile?.sex === 'female'
                    ? 'bg-brand-tertiary border-brand text-on-brand-tertiary'
                    : 'bg-surface-tertiary border-border text-on-surface hover:border-brand'
                }`}
              >
                Femme
              </button>
            </div>
          </div>

          {/* Age */}
          <div className="p-4 rounded-lg bg-surface-secondary border border-border">
            <label className="block text-sm text-on-surface-secondary mb-2">Age</label>
            <select
              value={profile?.age || ''}
              onChange={(e) => updateProfile({ age: Number(e.target.value) })}
              disabled={saving}
              className="w-full bg-surface-tertiary rounded-lg px-4 py-3 border border-border focus:outline-none focus:border-brand"
            >
              <option value="">Selectionnez</option>
              {ageOptions.map((age) => (
                <option key={age} value={age}>
                  {age} ans
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Parametres</h2>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-4 p-4 rounded-lg bg-surface-secondary border border-border hover:bg-surface-tertiary transition-colors">
            <Bell className="w-5 h-5 text-on-surface-secondary" />
            <span className="flex-1 text-left">Notifications</span>
            <ChevronRight className="w-5 h-5 text-on-surface-secondary" />
          </button>

          <button className="w-full flex items-center gap-4 p-4 rounded-lg bg-surface-secondary border border-border hover:bg-surface-tertiary transition-colors">
            <Palette className="w-5 h-5 text-on-surface-secondary" />
            <span className="flex-1 text-left">Theme</span>
            <span className="text-sm text-on-surface-secondary">Sombre</span>
            <ChevronRight className="w-5 h-5 text-on-surface-secondary" />
          </button>
        </div>
      </section>

      {/* Account Actions */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Compte</h2>

        <div className="space-y-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-4 rounded-lg bg-surface-secondary border border-border hover:bg-surface-tertiary transition-colors"
          >
            <LogOut className="w-5 h-5 text-on-surface-secondary" />
            <span className="flex-1 text-left">Deconnexion</span>
          </button>

          <button className="w-full flex items-center gap-4 p-4 rounded-lg bg-surface-secondary border border-error/30 text-error hover:bg-error/10 transition-colors">
            <Trash2 className="w-5 h-5" />
            <span className="flex-1 text-left">Supprimer mon compte</span>
          </button>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-on-surface-secondary">
        Estimations indicatives. Ne remplacent jamais un ethylotest homologue.
      </p>
    </div>
  )
}
