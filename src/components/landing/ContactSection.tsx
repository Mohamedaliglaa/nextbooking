"use client";

import { Button } from "@/components/ui/button";

export default function ContactSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Contactez-nous</h2>
        <p className="mb-6">Des questions ? Contactez-nous par email ou téléphone.</p>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input type="text" placeholder="Nom" className="border rounded p-2 w-full" />
          <input type="email" placeholder="Email" className="border rounded p-2 w-full" />
          <textarea placeholder="Message" className="border rounded p-2 md:col-span-2"></textarea>
          <Button className="md:col-span-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Envoyer</Button>
        </form>
      </div>
    </section>
  );
}
