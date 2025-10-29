import BookingForm from "../booking/BookingForm";
import Image from "next/image";
import carImg from "../../../public/road-car.png";
import { Star, Shield, Clock, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background via-blue-50/30 to-background px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-4 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-chart-3/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-chart-1/10 rounded-full blur-3xl"></div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          
          {/* LEFT TEXT */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Main Heading */}
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 bg-accent border border-border px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-4">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-chart-4 fill-current" />
                De confiance par 10 000+ clients
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Trouvez le Meilleur
                <span className="block text-transparent bg-gradient-to-r from-primary to-chart-3 bg-clip-text">
                  Taxi
                </span>
                Près de Chez Vous
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Service de réservation de taxi rapide, pratique et abordable. 
                Votre course est à un clic avec une disponibilité 24h/24 et 7j/7.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Courses Sécurisées</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-chart-2/10 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Service 24h/24</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-chart-1/10 rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Véhicules Multiples</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center lg:justify-start">
                <div className="p-1 sm:p-2 bg-chart-4/10 rounded-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-chart-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground">Chauffeurs 5 Étoiles</span>
              </div>
            </div>


            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">10K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Clients Satisfaits</div>
              </div>
              <div className="w-px h-8 sm:h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">500+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Véhicules</div>
              </div>
              <div className="w-px h-8 sm:h-12 bg-border"></div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Service</div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="relative order-first lg:order-last">
            {/* Form Container */}
            <div className="p-1">
              <BookingForm />
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-24 sm:h-24 bg-chart-1/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-20 h-20 sm:w-32 sm:h-32 bg-chart-4/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-8 sm:h-12 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
}