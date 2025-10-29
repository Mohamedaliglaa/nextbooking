"use client";

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Avis clients</h2>
        <div className="space-y-6">
          <div className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition">
            <p>"Service rapide et fiable. Très recommandé !"</p>
            <p className="mt-2 font-semibold">— Jean Dupont</p>
          </div>
          <div className="p-6 border rounded-xl shadow-sm hover:shadow-lg transition">
            <p>"Réservation simple et le chauffeur très professionnel."</p>
            <p className="mt-2 font-semibold">— Marie Leclerc</p>
          </div>
        </div>
      </div>
    </section>
  );
}
