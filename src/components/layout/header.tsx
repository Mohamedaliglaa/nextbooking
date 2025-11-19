'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/container'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { routeForUser } from '@/lib/role-routing'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { isAuthenticated, user, isLoading, logout } = useAuth()
  const dashboardHref = routeForUser(user)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Services', href: '#services' },
    { name: 'Devenir chauffeur', href: '/auth/signup' },
    { name: 'À propos', href: '#apropos' },
    { name: 'Contact', href: '#contact' },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      setMenuOpen(false)
    }
  }

  return (
    <header
      className={`
        fixed top-0 w-full z-50 transition-all duration-300 
        backdrop-blur-xl border-b 
        ${scrolled ? 'bg-background/70 shadow-lg border-border/40' : 'bg-background/30 border-transparent'}
      `}
    >
      <Container className="max-w-full px-4">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <Link
            href="/"
            className="font-brand text-2xl text-foreground font-semibold select-none transition-transform hover:scale-105"
          >
            TaxiPro
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-6 ml-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="
                  relative px-1 py-2 text-sm font-medium
                  text-muted-foreground hover:text-primary transition-all 
                  group
                "
              >
                {item.name}
                <span className="
                  absolute bottom-0 left-0 h-[2px] w-0 bg-primary 
                  group-hover:w-full transition-all rounded-full
                "></span>
              </Link>
            ))}

            <div className="ml-6 flex items-center gap-3">
              {!isLoading && !isAuthenticated && (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Se connecter</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Créer un compte</Link>
                  </Button>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Button variant="outline" asChild>
                    <Link href={dashboardHref}>Tableau de bord</Link>
                  </Button>
                  <Button onClick={handleLogout}>Déconnexion</Button>
                </>
              )}
            </div>
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-foreground hover:text-primary transition"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </Container>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/40"
          >
            <div className="px-4 py-6 flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="
                    block w-full px-4 py-3 rounded-lg 
                    text-muted-foreground hover:text-primary hover:bg-accent/60 
                    transition
                  "
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-2 flex flex-col gap-3">
                {!isLoading && !isAuthenticated && (
                  <>
                    <Button variant="outline" onClick={() => setMenuOpen(false)} asChild>
                      <Link href="/auth/login">Se connecter</Link>
                    </Button>

                    <Button onClick={() => setMenuOpen(false)} asChild>
                      <Link href="/auth/signup">Créer un compte</Link>
                    </Button>
                  </>
                )}

                {isAuthenticated && (
                  <>
                    <Button variant="outline" asChild onClick={() => setMenuOpen(false)}>
                      <Link href={dashboardHref}>Tableau de bord</Link>
                    </Button>
                    <Button onClick={handleLogout}>Déconnexion</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}


// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import { Menu, X } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Container } from '@/components/shared/container'
// import Link from 'next/link'
// import { useAuth } from '@/hooks/use-auth'
// import { routeForRole, routeForUser } from '@/lib/role-routing'

// export default function Header() {
//   const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)
//   const [estDefile, setEstDefile] = useState(false)
//   const observerRef = useRef<IntersectionObserver | null>(null)
//   const mutationObserverRef = useRef<MutationObserver | null>(null)

//   const { isAuthenticated, user, isLoading, logout } = useAuth()

//   // Scroll shadow
//   useEffect(() => {
//     const handleScroll = () => setEstDefile(window.scrollY > 20)
//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   // Appear animations (unchanged)
//   useEffect(() => {
//     let observer: IntersectionObserver | null = null

//     function initAnimation() {
//       if (observer) observer.disconnect()
//       const elements = document.querySelectorAll('.a-animer')
//       if (elements.length === 0) return

//       observer = new IntersectionObserver(
//         (entries) => {
//           entries.forEach((entry) => {
//             if (entry.isIntersecting) {
//               entry.target.classList.remove('a-animer')
//               entry.target.classList.add('animate-fade-in')
//               observer?.unobserve(entry.target)
//             }
//           })
//         },
//         { threshold: 0, rootMargin: '0px 0px -30px 0px' }
//       )

//       elements.forEach((el) => observer?.observe(el))
//       observerRef.current = observer
//     }

//     function domReady() {
//       initAnimation()
//       const main = document.getElementById('root')
//       if (main) {
//         const mutationObserver = new MutationObserver((mutations) => {
//           let doitReinit = false
//           mutations.forEach((mutation) => {
//             mutation.addedNodes.forEach((node: any) => {
//               if (
//                 node.nodeType === Node.ELEMENT_NODE &&
//                 (node.classList?.contains('a-animer') ||
//                   node.querySelector?.('.a-animer'))
//               ) {
//                 doitReinit = true
//               }
//             })
//           })
//           if (doitReinit) setTimeout(initAnimation, 50)
//         })
//         mutationObserver.observe(main, { childList: true, subtree: true })
//         mutationObserverRef.current = mutationObserver
//       }
//     }

//     if (document.readyState === 'loading') {
//       document.addEventListener('DOMContentLoaded', domReady)
//     } else {
//       domReady()
//     }

//     return () => {
//       observerRef.current?.disconnect()
//       mutationObserverRef.current?.disconnect()
//       document.removeEventListener('DOMContentLoaded', domReady)
//     }
//   }, [])

//   const navigation = [
//     { nom: 'Services', href: '#services' },
//     { nom: 'Devenir chauffeur', href: '/signup' },    
//     { nom: 'À propos', href: '#apropos' },
//     { nom: 'Contact', href: '#contact' },
//   ]

//   const dashboardHref = routeForUser(user)

//   const handleLogout = async () => {
//     try {
//       await logout()
//     } finally {
//       setMenuMobileOuvert(false)
//     }
//   }

//   return (
//     <header
//       className={`fixed w-full z-50 transition-all duration-500 border-b backdrop-blur-md bg-background/80 ${
//         estDefile ? 'shadow-md' : ''
//       }`}
//     >
//       <Container className="max-w-full">
//         <div className="flex items-center justify-between h-20">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-3 pl-4 cursor-pointer">
//             <span className="font-brand text-2xl text-foreground">TaxiPro</span>
//           </Link>

//           {/* Navigation desktop */}
//           <nav className="hidden md:flex items-center w-full ml-10">
//             {navigation.map((item) => (
//               <Link
//                 key={item.nom}
//                 href={item.href}
//                 className="relative px-6 py-4 text-muted-foreground hover:text-foreground transition-all font-medium group"
//               >
//                 {item.nom}
//                 <span className="absolute left-0 bottom-0 w-0 h-1 bg-primary group-hover:w-full transition-all"></span>
//               </Link>
//             ))}

//             {/* Right side buttons */}
//             <div className="ml-auto flex items-center gap-3">
//               {/* Show login/signup when not authenticated (or while loading show nothing) */}
//               {!isLoading && !isAuthenticated && (
//                 <>
//                   <Button variant="outline" asChild>
//                     <Link href="/auth/login">Se connecter</Link>
//                   </Button>
//                   <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
//                     <Link href="/auth/signup">Créer un compte</Link>
//                   </Button>
//                 </>
//               )}

//               {/* When authenticated, show Dashboard + Logout */}
//               {!isLoading && isAuthenticated && (
//                 <>
//                   <Button variant="outline" asChild>
//                     <Link href={dashboardHref}>Tableau de bord</Link>
//                   </Button>
//                   <Button onClick={handleLogout} className="bg-primary text-primary-foreground hover:bg-primary/90">
//                     Déconnexion
//                   </Button>
//                 </>
//               )}
//             </div>
//           </nav>

//           {/* Mobile toggle */}
//           <button
//             onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
//             className="md:hidden text-foreground hover:text-primary transition-colors"
//             aria-label="Ouvrir le menu"
//           >
//             {menuMobileOuvert ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>

//         {/* Mobile menu */}
//         {menuMobileOuvert && (
//           <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50">
//             <div className="py-6 flex flex-col space-y-3">
//               {navigation.map((item) => (
//                 <a
//                   key={item.nom}
//                   href={item.href}
//                   className="block px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
//                   onClick={() => setMenuMobileOuvert(false)}
//                 >
//                   {item.nom}
//                 </a>
//               ))}

//               <div className="px-4 pt-2 flex flex-col gap-2">
//                 {/* Guest actions */}
//                 {!isLoading && !isAuthenticated && (
//                   <>
//                     <Button
//                       variant="outline"
//                       className="w-full"
//                       asChild
//                       onClick={() => setMenuMobileOuvert(false)}
//                     >
//                       <Link href="/auth/login">Se connecter</Link>
//                     </Button>
//                     <Button
//                       className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
//                       asChild
//                       onClick={() => setMenuMobileOuvert(false)}
//                     >
//                       <Link href="/auth/signup">Créer un compte</Link>
//                     </Button>
//                   </>
//                 )}

//                 {/* Authenticated actions */}
//                 {!isLoading && isAuthenticated && (
//                   <>
//                     <Button
//                       variant="outline"
//                       className="w-full"
//                       asChild
//                       onClick={() => setMenuMobileOuvert(false)}
//                     >
//                       <Link href={dashboardHref}>Tableau de bord</Link>
//                     </Button>
//                     <Button
//                       className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
//                       onClick={handleLogout}
//                     >
//                       Déconnexion
//                     </Button>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </Container>
//     </header>
//   )
// }
