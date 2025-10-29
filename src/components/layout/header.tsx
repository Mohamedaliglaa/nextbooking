'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/container'
import Link from 'next/link'

export default function Header() {
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)
  const [estDefile, setEstDefile] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => setEstDefile(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animation à l'apparition
  useEffect(() => {
    let observer: IntersectionObserver | null = null

    function initAnimation() {
      if (observer) observer.disconnect()
      const elements = document.querySelectorAll('.a-animer')

      if (elements.length === 0) return

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove('a-animer')
              entry.target.classList.add('animate-fade-in')
              observer?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0, rootMargin: '0px 0px -30px 0px' }
      )

      elements.forEach((el) => observer?.observe(el))
      observerRef.current = observer
    }

    function domReady() {
      initAnimation()
      const main = document.getElementById('root')
      if (main) {
        const mutationObserver = new MutationObserver((mutations) => {
          let doitReinit = false
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node: any) => {
              if (
                node.nodeType === Node.ELEMENT_NODE &&
                (node.classList?.contains('a-animer') ||
                  node.querySelector?.('.a-animer'))
              ) {
                doitReinit = true
              }
            })
          })
          if (doitReinit) setTimeout(initAnimation, 50)
        })
        mutationObserver.observe(main, { childList: true, subtree: true })
        mutationObserverRef.current = mutationObserver
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', domReady)
    } else {
      domReady()
    }

    return () => {
      observerRef.current?.disconnect()
      mutationObserverRef.current?.disconnect()
      document.removeEventListener('DOMContentLoaded', domReady)
    }
  }, [])

  const navigation = [
    { nom: 'Accueil', href: '#home' },
    { nom: 'Services', href: '#services' },
    { nom: 'Tarifs', href: '#tarifs' },
    { nom: 'Réservations', href: '#reserver' },
    { nom: 'À propos', href: '#apropos' },
    { nom: 'Contact', href: '#contact' },
  ]

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 border-b backdrop-blur-md bg-background/80 ${
        estDefile ? 'shadow-md' : ''
      }`}
    >
      <Container className="max-w-full">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 pl-4 cursor-pointer">
            
            <span className="font-brand text-2xl text-foreground">TaxiPro</span>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center w-full ml-10">
            {navigation.map((item) => (
              <Link
                key={item.nom}
                href={item.href}
                className="relative px-6 py-4 text-muted-foreground hover:text-foreground transition-all font-medium group"
              >
                {item.nom}
                <span className="absolute left-0 bottom-0 w-0 h-1 bg-primary group-hover:w-full transition-all"></span>
              </Link>
            ))}
            <Button size="lg" className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Réserver maintenant
            </Button>
          </nav>

          {/* Menu mobile */}
          <button
            onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {menuMobileOuvert ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu mobile ouvert */}
        {menuMobileOuvert && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50">
            <div className="py-6 flex flex-col space-y-3">
              {navigation.map((item) => (
                <a
                  key={item.nom}
                  href={item.href}
                  className="block px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  onClick={() => setMenuMobileOuvert(false)}
                >
                  {item.nom}
                </a>
              ))}
              <Button size="lg" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Réserver maintenant
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
