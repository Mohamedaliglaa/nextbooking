import FeaturesSection from '@/components/landing/FeaturesSection'
import Hero from '@/components/landing/hero'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import Header from '@/components/layout/header'
import React from 'react'
import FAQSection from './../components/landing/FAQSection';
import ContactSection from '@/components/landing/ContactSection'

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
    </div>
  )
}
