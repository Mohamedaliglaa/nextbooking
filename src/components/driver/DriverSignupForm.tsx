"use client";

import { useState } from "react";
import { RegisterData } from "@/types/auth";

type Props = {
  onSubmit: (data: RegisterData) => void;
};

export default function DriverSignupForm({ onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterData>>({ role: 'driver' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = () => onSubmit(formData as RegisterData);

  return (
    <div className="space-y-4">
      {step === 1 && (
        <>
          <input name="first_name" placeholder="Prénom" onChange={handleChange} className="input" />
          <input name="last_name" placeholder="Nom" onChange={handleChange} className="input" />
          <input name="email" placeholder="Email" onChange={handleChange} className="input" />
          <input name="phone_number" placeholder="Téléphone" onChange={handleChange} className="input" />
          <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} className="input" />
          <input type="password" name="password_confirmation" placeholder="Confirmer mot de passe" onChange={handleChange} className="input" />
          <button onClick={nextStep} className="btn">Suivant</button>
        </>
      )}

      {step === 2 && (
        <>
          <input name="license_number" placeholder="Numéro de permis" onChange={handleChange} className="input" />
          <input type="file" name="license_image" onChange={handleChange} className="input" />
          <input type="file" name="id_card_image" onChange={handleChange} className="input" />
          <input type="file" name="insurance_image" onChange={handleChange} className="input" />
          <button onClick={prevStep} className="btn btn-gray">Précédent</button>
          <button onClick={nextStep} className="btn btn-green">Suivant</button>
        </>
      )}

      {step === 3 && (
        <>
          <input name="vehicle_type" placeholder="Type de véhicule" onChange={handleChange} className="input" />
          <input name="vehicle_model" placeholder="Modèle" onChange={handleChange} className="input" />
          <input name="license_plate" placeholder="Plaque d'immatriculation" onChange={handleChange} className="input" />
          <div className="flex justify-between">
            <button onClick={prevStep} className="btn btn-gray">Précédent</button>
            <button onClick={handleSubmit} className="btn btn-green">S'inscrire</button>
          </div>
        </>
      )}
    </div>
  );
}
