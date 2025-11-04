import FeaturesSection from '@/components/landing/FeaturesSection'
import Hero from '@/components/landing/hero'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import Header from '@/components/layout/header'
import React from 'react'
import FAQSection from './../components/landing/FAQSection';
import ContactSection from '@/components/landing/ContactSection'
import WorldMap from '@/components/landing/WorldMap'

export default function Home() {
  return (
    <div>
      <Hero />
      <main className="min-h-screen flex items-center justify-center p-8">
      {/* Tailwind example styling; change as you like */}
      <WorldMap className="w-full max-w-5xl h-auto text-neutral-700" />
    </main>

      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </div>
  )
}
