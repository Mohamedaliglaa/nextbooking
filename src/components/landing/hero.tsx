// components/landing/Hero.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import BookingForm from '@/components/booking/BookingForm'
import heroBackground from '../../../public/hero_background.png'
import { Star, Shield, Clock, Users } from 'lucide-react'

export default function Hero() {
  return (
    <section
      id="home"
      className="relative pt-4 min-h-screen flex items-center px-4 sm:px-6 overflow-hidden"
    >
      {/* Full desktop background (visible on lg+) */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <Image
          src={heroBackground}
          alt="Joyful city street with people and cars"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-background/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* TEXT CONTAINER */}
          <div className="relative z-20">
            {/* SMALL/MID screens: background only behind this text container */}
            <div className="relative rounded-2xl overflow-hidden lg:rounded-none lg:overflow-visible">
              <div className="absolute inset-0 lg:hidden -z-10">
                <Image
                  src={heroBackground}
                  alt="Joyful city background"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
                <div className="absolute inset-0 bg-background/65"></div>
              </div>

              <div className="relative p-6 sm:p-8 lg:p-0">
                <div className="inline-flex items-center gap-2 bg-accent border border-border px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3">
                  <Star className="h-4 w-4 text-chart-4" />
                  De confiance par 10 000+ clients
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Trouvez le Meilleur
                  <span className="block text-transparent bg-gradient-to-r from-primary to-chart-3 bg-clip-text">
                    Taxi
                  </span>
                  Près de Chez Vous
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mt-4 leading-relaxed">
                  Service de réservation de taxi rapide, pratique et abordable.
                  Votre course est à un clic avec une disponibilité 24h/24 et 7j/7.
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-3 max-w-md mt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Courses Sécurisées</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-chart-2/10">
                      <Clock className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Service 24h/24</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-chart-1/10">
                      <Users className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Véhicules Multiples</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-chart-4/10">
                      <Star className="h-5 w-5 text-chart-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Chauffeurs 5 Étoiles</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">10K+</div>
                    <div className="text-xs text-muted-foreground">Clients Satisfaits</div>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">500+</div>
                    <div className="text-xs text-muted-foreground">Véhicules</div>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold">24/7</div>
                    <div className="text-xs text-muted-foreground">Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORM (right column) - stays overlay-free on mobile (card look) */}
          <div className="relative z-30">
            <div className="p-1">
              <BookingForm />
            </div>
          </div>
        </div>
      </div>

      {/* bottom waves—kept decorative */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <svg className="w-full h-8 sm:h-12 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden>
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  )
}
