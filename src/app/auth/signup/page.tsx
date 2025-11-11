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

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    role: 'driver' as 'driver' | 'passenger',
  })

  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email || !form.phone_number || !form.password) {
      toast.error('Veuillez remplir tous les champs requis.')
      return
    }
    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }

    setSubmitting(true)
    try {
      await register(form)
      toast.success('Compte créé. Bienvenue !')
      if (form.role === 'driver') router.push('/driver/registration')
      else router.push('/')
    // in SignupPage onSubmit catch
} catch (err: any) {
  // err is ApiError from client.ts
  const msg = err?.errors
    ? Object.values(err.errors).flat().join(' ')
    : err?.message || 'Erreur lors de l’inscription';
  toast.error(msg);
}
finally {
      setSubmitting(false)
    }
  }

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
          {/* Left: Copy mirroring Hero */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left a-animer">
            <div className="inline-flex items-center gap-2 bg-accent/60 border border-border/60 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-muted-foreground">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-chart-4" />
              De confiance par 10 000+ clients
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Créez votre compte
              <span className="block text-transparent bg-gradient-to-r from-primary to-chart-3 bg-clip-text">
                en quelques secondes
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Rejoignez notre plateforme et profitez d’un service rapide, sécurisé et disponible 24h/24.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto lg:mx-0 pt-2">
              <Feature icon={<Shield className="h-5 w-5 text-primary" />} label="Sécurisé" tone="primary" />
              <Feature icon={<Clock className="h-5 w-5 text-chart-2" />} label="24/7" tone="chart-2" />
              <Feature icon={<Users className="h-5 w-5 text-chart-1" />} label="Pour tous" tone="chart-1" />
              <Feature icon={<Star className="h-5 w-5 text-chart-4" />} label="Fiable" tone="chart-4" />
            </div>
          </div>

          {/* Right: Sign up form card */}
          <div className="relative order-first lg:order-last a-animer">
            <div className="relative p-1">
              <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-semibold mb-6 text-foreground">Créer un compte</h2>

                <form className="space-y-5" onSubmit={onSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input id="first_name" value={form.first_name} onChange={update('first_name')} placeholder="Prénom" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Nom</Label>
                      <Input id="last_name" value={form.last_name} onChange={update('last_name')} placeholder="Nom" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={update('email')} placeholder="email@exemple.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Téléphone</Label>
                    <Input id="phone_number" value={form.phone_number} onChange={update('phone_number')} placeholder="+33 ..." required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPw ? 'text' : 'password'}
                          value={form.password}
                          onChange={update('password')}
                          placeholder="********"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute inset-y-0 right-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {showPw ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">Confirmer</Label>
                      <div className="relative">
                        <Input
                          id="password_confirmation"
                          type={showPw2 ? 'text' : 'password'}
                          value={form.password_confirmation}
                          onChange={update('password_confirmation')}
                          placeholder="********"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw2((s) => !s)}
                          className="absolute inset-y-0 right-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {showPw2 ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <select
                      id="role"
                      className="w-full border rounded-md h-10 px-3 bg-background"
                      value={form.role}
                      onChange={update('role')}
                    >
                      <option value="driver">Chauffeur</option>
                      <option value="passenger">Passager</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Création…' : 'Créer le compte'}
                  </Button>
                </form>

                <div className="mt-6 text-sm text-center text-muted-foreground">
                  Déjà un compte ?{' '}
                  <Link href="/auth/login" className="underline hover:text-foreground">
                    Se connecter
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

/* ——— tiny presentational leaf ——— */
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
