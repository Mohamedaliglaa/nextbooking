"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Car } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      icon: MapPin,
      title: "Entrez vos détails",
      desc: "Indiquez votre point de départ, votre destination et vos arrêts optionnels.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      step: "2",
      icon: Clock,
      title: "Choisissez véhicule & horaire",
      desc: "Sélectionnez le type de voiture et l’heure qui vous conviennent le mieux.",
      color: "from-yellow-400 to-orange-500",
    },
    {
      step: "3",
      icon: Car,
      title: "Confirmez & voyagez",
      desc: "Réservez instantanément et profitez d’un trajet agréable et sécurisé.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-blue-50/30 to-background overflow-hidden">
      {/* Decorative circles for consistency with hero section */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-chart-2/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold mb-12 text-foreground"
        >
          Comment <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-3">ça marche</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connecting line (appears only on desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-chart-2/30 via-chart-3/30 to-chart-4/30 -translate-y-1/2"></div>

          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="relative"
            >
              <Card className="bg-card/70 backdrop-blur-sm border-border hover:shadow-xl rounded-2xl transition-all duration-300 z-10">
                <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                  <div
                    className={`p-5 rounded-full bg-gradient-to-br ${s.color} shadow-lg`}
                  >
                    <s.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>

              {/* Step number (floating circle) */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md">
                {s.step}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
