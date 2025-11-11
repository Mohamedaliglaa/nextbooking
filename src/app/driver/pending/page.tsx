'use client';

import { Shield } from 'lucide-react';

export default function DriverPendingPage() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded-lg text-center">
      <Shield className="mx-auto mb-4 h-10 w-10 text-primary" />
      <h1 className="text-xl font-semibold">Vérification en cours</h1>
      <p className="text-muted-foreground mt-2">
        Votre profil chauffeur a été envoyé. Vous serez notifié une fois la vérification terminée.
      </p>
    </div>
  );
}
