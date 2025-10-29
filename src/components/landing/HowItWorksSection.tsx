"use client";

import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const steps = [
    { step: "1", title: "Entrez les détails", desc: "Adresse de départ et destination, arrêts optionnels." },
    { step: "2", title: "Choisissez véhicule & horaire", desc: "Sélectionnez votre véhicule préféré et l’heure de départ." },
    { step: "3", title: "Confirmez & voyagez", desc: "Réservez et profitez d’un trajet confortable." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">Comment ça marche</h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              className="flex flex-col items-center bg-gray-50 rounded-3xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">{s.step}</div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
