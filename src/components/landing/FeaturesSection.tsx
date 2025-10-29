"use client";

import Tilt from "react-parallax-tilt";
import { Car, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function ServicesSection() {
  const features = [
    { icon: MapPin, title: "Trajets urbains", desc: "Déplacez-vous facilement en ville." },
    { icon: Clock, title: "Planification", desc: "Planifiez votre trajet à l’avance." },
    { icon: Car, title: "Véhicules", desc: "Économique, confort ou luxe." },
    { icon: Users, title: "Arrêts multiples", desc: "Ajoutez jusqu’à 3 arrêts optionnels." },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">Nos services</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <Tilt
                className="bg-white p-6 rounded-3xl shadow-lg cursor-pointer hover:shadow-2xl transition"
                glareEnable={true}
                glareMaxOpacity={0.2}
              >
                <div className="flex justify-center mb-4">
                  <f.icon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
