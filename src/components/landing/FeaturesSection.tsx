"use client";

import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Car, Users, Shield, DollarSign } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      icon: MapPin,
      title: "Transferts rapides",
      desc: "Réservez un taxi en quelques secondes et partez sans attendre.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Clock,
      title: "Disponible 24h/24",
      desc: "Nos chauffeurs sont prêts à tout moment, jour et nuit.",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: Car,
      title: "Confort & sécurité",
      desc: "Voyagez dans des véhicules modernes et bien entretenus.",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: Users,
      title: "Groupes & familles",
      desc: "Réservez des taxis spacieux pour vos déplacements à plusieurs.",
      color: "from-pink-400 to-fuchsia-500",
    },
    {
      icon: Shield,
      title: "Chauffeurs vérifiés",
      desc: "Nos chauffeurs sont certifiés et évalués par nos clients.",
      color: "from-cyan-400 to-sky-500",
    },
    {
      icon: DollarSign,
      title: "Prix transparents",
      desc: "Aucun frais caché, un tarif juste et connu à l’avance.",
      color: "from-amber-500 to-red-500",
    },
  ];

  return (
    <section className="relative py-24  from-background via-blue-50/20 to-background overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-chart-3/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-3">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos options de transport conçues pour votre confort, votre sécurité et votre rapidité.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Tilt glareEnable={true} glareMaxOpacity={0.15} glareColor="#fff" tiltMaxAngleX={8} tiltMaxAngleY={8}>
                <Card className="rounded-2xl shadow-md border-border hover:shadow-xl transition-all duration-300 bg-card/70 backdrop-blur-sm">
                  <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                    <div
                      className={`p-4 rounded-full bg-gradient-to-br ${service.color} shadow-md`}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground">{service.desc}</p>
                  </CardContent>
                </Card>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
