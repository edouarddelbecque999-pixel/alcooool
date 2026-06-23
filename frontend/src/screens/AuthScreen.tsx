import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const handleAppleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  const handleEmailSignIn = async () => {
    // For demo purposes, use a simple email sign in
    const email = prompt('Entrez votre email:')
    if (email) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      if (!error) {
        alert('Lien magique envoyé à votre email!')
      }
    }
  }

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/7594152/pexels-photo-7594152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')`
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-surface" />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16">
          <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center mb-6">
            <span className="text-4xl font-bold text-on-brand">S</span>
          </div>
          <h1 className="text-4xl font-bold text-on-surface mb-2">SafeDrink</h1>
          <p className="text-on-surface-secondary text-center text-lg">
            Suivez votre consommation d'alcool en temps reel
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="px-6 pb-12 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-on-surface text-surface rounded-pill font-medium hover:bg-on-surface-secondary transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </button>

          <button
            onClick={handleAppleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface text-on-surface border border-border rounded-pill font-medium hover:bg-surface-secondary transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.29-1.71 2.55-3.05 2.58-1.34.03-1.77-.84-3.29-.84-1.53 0-2 .81-3.27.87-1.31.06-2.3-1.32-3.14-2.6C3.86 16.87 3 12.11 5.04 8.91c1.02-1.59 2.69-2.6 4.49-2.63 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.26-2.15 3.76.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.75c.73-.83 1.96-1.46 2.98-1.5.14 1.16-.33 2.35-1.03 3.24-.7.89-1.83 1.56-2.93 1.46-.17-1.13.47-2.36.97-3.2z" />
            </svg>
            Continuer avec Apple
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-on-surface-secondary text-sm">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleEmailSignIn}
            className="w-full px-6 py-4 bg-brand-tertiary text-on-brand-tertiary rounded-pill font-medium hover:bg-brand-tertiary/80 transition-colors"
          >
            Continuer avec Email
          </button>
        </div>

        {/* Disclaimer */}
        <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-on-surface-secondary px-4">
          Estimations indicatives. Ne remplacent jamais un ethylotest homologue.
        </p>
      </div>
    </div>
  )
}
