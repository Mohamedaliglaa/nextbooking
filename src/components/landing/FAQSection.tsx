"use client";

export default function FAQSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Questions fréquentes</h2>
        <div className="space-y-4 text-left">
          <div className="border rounded-xl p-4 hover:shadow-md transition">
            <h3 className="font-semibold">Puis-je ajouter plusieurs arrêts ?</h3>
            <p>Oui, vous pouvez ajouter jusqu’à 3 arrêts optionnels sur votre trajet.</p>
          </div>
          <div className="border rounded-xl p-4 hover:shadow-md transition">
            <h3 className="font-semibold">Puis-je planifier un trajet à l’avance ?</h3>
            <p>Oui, choisissez "Planifier" pour réserver votre trajet plus tard.</p>
          </div>
          <div className="border rounded-xl p-4 hover:shadow-md transition">
            <h3 className="font-semibold">Les trajets sont-ils uniquement en France ?</h3>
            <p>Oui, tous les trajets sont actuellement limités à la France.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
