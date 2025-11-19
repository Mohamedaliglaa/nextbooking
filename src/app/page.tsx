// app/page.tsx  OR pages/index.tsx
'use client'
import React from 'react'
import Header from '@/components/layout/header'
import Hero from '@/components/landing/hero'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FAQSection from '@/components/landing/FAQSection'
import ContactSection from '@/components/landing/ContactSection'
import WorldMap from '@/components/landing/WorldMap'

export default function Home() {
  return (
    <div>
      <Header />
      <main className="pt-20">
        <Hero />
        <main className="min-h-screen flex items-center justify-center p-8">
          <WorldMap className="w-full max-w-5xl h-auto text-neutral-700" />
        </main>

        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
      </main>
    </div>
  )
}
