"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Jean Dupont",
      text: "Service rapide et fiable. Très recommandé !",
      image: "/assets/clients/jean.jpg",
    },
    {
      name: "Marie Leclerc",
      text: "Réservation simple et le chauffeur très professionnel.",
      image: "/assets/clients/marie.jpg",
    },
    {
      name: "Ahmed Ben Ali",
      text: "Excellent service, ponctuel et très confortable.",
      image: "/assets/clients/ahmed.jpg",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-16 text-gray-800"
        >
          Avis de nos clients
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 mb-4 relative">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-3">“{t.text}”</p>
              <p className="font-semibold text-gray-800">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
