'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/container'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { routeForRole, routeForUser } from '@/lib/role-routing'

export default function Header() {
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)
  const [estDefile, setEstDefile] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  const { isAuthenticated, user, isLoading, logout } = useAuth()

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setEstDefile(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Appear animations (unchanged)
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

  const dashboardHref = routeForUser(user)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setMenuMobileOuvert(false)
    }
  }

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 border-b backdrop-blur-md bg-background/80 ${
        estDefile ? 'shadow-md' : ''
      }`}
    >
      <Container className="max-w-full">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 pl-4 cursor-pointer">
            <span className="font-brand text-2xl text-foreground">TaxiPro</span>
          </Link>

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

            {/* Right side buttons */}
            <div className="ml-auto flex items-center gap-3">
              {/* Show login/signup when not authenticated (or while loading show nothing) */}
              {!isLoading && !isAuthenticated && (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/auth/signup">Créer un compte</Link>
                  </Button>
                </>
              )}

              {/* When authenticated, show Dashboard + Logout */}
              {!isLoading && isAuthenticated && (
                <>
                  <Button variant="outline" asChild>
                    <Link href={dashboardHref}>Tableau de bord</Link>
                  </Button>
                  <Button onClick={handleLogout} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Déconnexion
                  </Button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
            aria-label="Ouvrir le menu"
          >
            {menuMobileOuvert ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
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

              <div className="px-4 pt-2 flex flex-col gap-2">
                {/* Guest actions */}
                {!isLoading && !isAuthenticated && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => setMenuMobileOuvert(false)}
                    >
                      <Link href="/auth/login">Se connecter</Link>
                    </Button>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      asChild
                      onClick={() => setMenuMobileOuvert(false)}
                    >
                      <Link href="/auth/signup">Créer un compte</Link>
                    </Button>
                  </>
                )}

                {/* Authenticated actions */}
                {!isLoading && isAuthenticated && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      onClick={() => setMenuMobileOuvert(false)}
                    >
                      <Link href={dashboardHref}>Tableau de bord</Link>
                    </Button>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
}
