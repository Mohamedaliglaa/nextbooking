'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, Shield, Clock, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const router = useRouter()
  const { login, refreshUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

 
const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  try {
    await login({ email, password });
    await refreshUser();
    toast.success('Connexion réussie');
    router.replace('/');
  } catch (err: any) {
    const msg = err?.errors
      ? Object.values(err.errors).flat()[0] // first validation error if present
      : err?.message || 'Email ou mot de passe incorrect';
    toast.error(msg);
    // (optional) quick visibility while debugging:
    // console.warn('Login failed:', err);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-background via-blue-50/30 to-background px-4 sm:px-6 overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-10 sm:left-10 w-64 sm:w-80 h-64 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-10 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-chart-3/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-64 h-40 sm:h-64 bg-chart-1/10 rounded-full blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Copy matching Hero */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left a-animer">
            <div className="inline-flex items-center gap-2 bg-accent/60 border border-border/60 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-muted-foreground">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-4" />
              De confiance par 10 000+ clients
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Reprenez la route
              <span className="block text-transparent bg-gradient-to-r from-primary to-chart-3 bg-clip-text">
                en toute simplicité
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connectez-vous pour gérer vos réservations, suivre vos trajets et accéder à votre
              espace personnel 24h/24 et 7j/7.
            </p>

            {/* Features (same visual language as Hero) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto lg:mx-0 pt-2">
              <Feature icon={<Shield className="h-5 w-5 text-primary" />} label="Sécurisé" tone="primary" />
              <Feature icon={<Clock className="h-5 w-5 text-chart-2" />} label="Disponible 24/7" tone="chart-2" />
              <Feature icon={<Users className="h-5 w-5 text-chart-1" />} label="Pour tous" tone="chart-1" />
              <Feature icon={<Star className="h-5 w-5 text-chart-4" />} label="Fiable" tone="chart-4" />
            </div>
          </div>

          {/* Right: Login form card styled like your BookingForm card */}
          <div className="relative order-first lg:order-last a-animer">
            <div className="relative p-1">
              <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Se connecter</h2>

                <form className="space-y-5" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute inset-y-0 right-2 text-sm text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? 'Masquer' : 'Afficher'}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Connexion…' : 'Se connecter'}
                  </Button>
                </form>

                <div className="mt-6 text-sm text-center text-muted-foreground">
                  Pas de compte ?{' '}
                  <Link href="/auth/signup" className="underline hover:text-foreground">
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative blobs like Hero */}
            <div className="pointer-events-none absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-16 h-16 sm:w-24 sm:h-24 bg-chart-1/15 rounded-full blur-xl" />
            <div className="pointer-events-none absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 w-20 h-20 sm:w-28 sm:h-28 bg-chart-4/15 rounded-full blur-xl" />
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 text-background">
        <svg className="w-full h-8 sm:h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" />
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  )
}

/* ——— tiny presentational leafs ——— */
function Feature({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode
  label: string
  tone: 'primary' | 'chart-1' | 'chart-2' | 'chart-4'
}) {
  const bg =
    tone === 'primary'
      ? 'bg-primary/10'
      : tone === 'chart-1'
      ? 'bg-chart-1/10'
      : tone === 'chart-2'
      ? 'bg-chart-2/10'
      : 'bg-chart-4/10'

  return (
    <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
      <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      <span className="text-xs sm:text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}
