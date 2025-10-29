// components/BookingForm.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Plus, X, ArrowDownUp, Clock, Calendar, Car, DollarSign, AlertCircle } from 'lucide-react';
import { VehicleOption } from '@/types/booking';
import { calculateEstimatedFare } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

// Déclaration du type pour Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// Définir les véhicules avec les bonnes images
const vehicles: VehicleOption[] = [
  { 
    id: 'berline', 
    name: 'Berline', 
    icon: "/Berline-taxi-commande.png", 
    capacity: 4, 
    basePrice: 15,
    type: 'berline'
  },
  { 
    id: 'break', 
    name: 'Break', 
    icon: "/Break-taxi-commande.png", 
    capacity: 4, 
    basePrice: 20,
    type: 'break'
  },
  { 
    id: 'van', 
    name: 'Van', 
    icon: "/Van-taxi-commande.png", 
    capacity: 7, 
    basePrice: 25,
    type: 'van'
  },
];

interface EstimationResult {
  price: number;
  distance: number;
  duration: number;
  vehicle: VehicleOption;
}

export default function BookingForm() {
  const { toast } = useToast();
  
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [stops, setStops] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicleType, setVehicleType] = useState<string>('berline');
  const [timeOption, setTimeOption] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [estimation, setEstimation] = useState<EstimationResult | null>(null);
  const [showEstimation, setShowEstimation] = useState<boolean>(false);

  // Références pour les inputs
  const departureRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const stopsRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Condition pour désactiver le Van
  const isVanDisabled = true;

  // Initialiser Google Maps Autocomplete
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = initializeAutocomplete;
    } else {
      initializeAutocomplete();
    }

    return () => {
      stopsRefs.current = [];
    };
  }, [stops]);

  const initializeAutocomplete = () => {
    if (!window.google) return;

    const options = {
      types: ['address'],
      componentRestrictions: { country: 'fr' }
    };

    // Autocomplete pour le départ
    if (departureRef.current) {
      const departureAutocomplete = new window.google.maps.places.Autocomplete(departureRef.current, options);
      departureAutocomplete.addListener('place_changed', () => {
        const place = departureAutocomplete.getPlace();
        if (place.formatted_address) {
          setDeparture(place.formatted_address);
          // Reset estimation when address changes
          setEstimation(null);
          setShowEstimation(false);
        }
      });
    }

    // Autocomplete pour la destination
    if (destinationRef.current) {
      const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationRef.current, options);
      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
          // Reset estimation when address changes
          setEstimation(null);
          setShowEstimation(false);
        }
      });
    }

    // Autocomplete pour les arrêts
    stopsRefs.current.forEach((ref, index) => {
      if (ref) {
        const stopAutocomplete = new window.google.maps.places.Autocomplete(ref, options);
        stopAutocomplete.addListener('place_changed', () => {
          const place = stopAutocomplete.getPlace();
          if (place.formatted_address) {
            updateStop(index, place.formatted_address);
            // Reset estimation when stops change
            setEstimation(null);
            setShowEstimation(false);
          }
        });
      }
    });
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              setDeparture(data.results[0].formatted_address);
            } else {
              setDeparture(`${latitude}, ${longitude}`);
            }
          } catch (error) {
            setDeparture(`${latitude}, ${longitude}`);
          }
          setLoading(false);
          // Reset estimation when location changes
          setEstimation(null);
          setShowEstimation(false);
        },
        (error) => {
          // Use toast methods correctly
          toast.error('Erreur de géolocalisation', 'Impossible d\'obtenir votre position actuelle');
          setLoading(false);
        }
      );
    } else {
      toast.error('Géolocalisation non supportée', 'Votre navigateur ne supporte pas la géolocalisation');
      setLoading(false);
    }
  };

  const switchAddresses = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
    // Reset estimation when addresses are switched
    setEstimation(null);
    setShowEstimation(false);
  };

  const addStop = () => {
    setStops([...stops, '']);
    setTimeout(initializeAutocomplete, 100);
    // Reset estimation when stops are added
    setEstimation(null);
    setShowEstimation(false);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
    stopsRefs.current.splice(index, 1);
    // Reset estimation when stops are removed
    setEstimation(null);
    setShowEstimation(false);
  };

  const updateStop = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
    // Reset estimation when stops are updated
    setEstimation(null);
    setShowEstimation(false);
  };

  const handleVehicleSelection = (vehicleId: string) => {
    if (vehicleId === 'van' && isVanDisabled) {
      return;
    }
    setVehicleType(vehicleId);
    // Recalculate estimation if we already have one
    if (estimation) {
      calculateEstimation();
    }
  };

  const calculateEstimation = async () => {
    if (!departure || !destination) {
      toast.error('Champs manquants', 'Veuillez remplir l\'adresse de départ et de destination');
      return;
    }

    setLoading(true);
    setEstimation(null);
    setShowEstimation(false);

    try {
      // Utiliser Google Distance Matrix pour une estimation précise
      const service = new window.google.maps.DistanceMatrixService();
      
      const origins = [departure, ...stops.filter(stop => stop.trim() !== '')];
      const destinations = [...stops.filter(stop => stop.trim() !== ''), destination];

      service.getDistanceMatrix({
        origins: origins,
        destinations: destinations,
        travelMode: 'DRIVING',
        unitSystem: window.google.maps.UnitSystem.METRIC,
      }, (response: any, status: string) => {
        if (status === 'OK') {
          let totalDistance = 0;
          let totalDuration = 0;

          // Calculer la distance et durée totale
          response.rows.forEach((row: any, i: number) => {
            if (row.elements[i] && row.elements[i].status === 'OK') {
              totalDistance += row.elements[i].distance.value / 1000; // Convertir en km
              totalDuration += row.elements[i].duration.value / 60; // Convertir en minutes
            }
          });

          const vehicle = vehicles.find(v => v.id === vehicleType);
          const basePrices = vehicles.reduce((acc, vehicle) => {
            acc[vehicle.id] = vehicle.basePrice;
            return acc;
          }, {} as { [key: string]: number });

          const estimatedPrice = calculateEstimatedFare(
            totalDistance,
            totalDuration,
            vehicleType,
            basePrices
          );

          const result: EstimationResult = {
            price: estimatedPrice,
            distance: Math.round(totalDistance * 10) / 10,
            duration: Math.round(totalDuration),
            vehicle: vehicle!
          };

          setEstimation(result);
          setShowEstimation(true);
          
          toast.success('Estimation calculée', `Prix estimé: ${estimatedPrice.toFixed(2)}€`);

        } else {
          // Fallback si l'API échoue
          calculateFallbackEstimation();
        }
        setLoading(false);
      });
    } catch (error) {
      // Fallback en cas d'erreur
      calculateFallbackEstimation();
      setLoading(false);
    }
  };

  const calculateFallbackEstimation = () => {
    const vehicle = vehicles.find(v => v.id === vehicleType);
    const baseDistance = 10 + stops.length * 5;
    const basePrices = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.id] = vehicle.basePrice;
      return acc;
    }, {} as { [key: string]: number });

    const estimatedPrice = calculateEstimatedFare(
      baseDistance,
      baseDistance * 2,
      vehicleType,
      basePrices
    );

    const result: EstimationResult = {
      price: estimatedPrice,
      distance: baseDistance,
      duration: baseDistance * 2,
      vehicle: vehicle!
    };

    setEstimation(result);
    setShowEstimation(true);
    
    toast.info('Estimation approximative', `Prix estimé: ${estimatedPrice.toFixed(2)}€ (calcul approximatif)`);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="flex flex-col gap-2 p-6">
            {/* Estimation Result */}
            {showEstimation && estimation && (
              <div className="mb-6 p-4 bg-gradient-to-r from-chart-1/10 to-chart-2/10 border border-chart-1/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-card-foreground">
                      {estimation.price.toFixed(2)}€
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {estimation.distance} km • {formatDuration(estimation.duration)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {estimation.vehicle.name} • Estimation indicative
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 relative">
                      <Image
                        src={estimation.vehicle.icon}
                        alt={estimation.vehicle.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Sections */}
            <div className="space-y-4">
              {/* Adresse de départ */}
              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  <MapPin className="inline h-4 w-4 mr-2 text-chart-3" />
                  Adresse de départ
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={departureRef}
                      type="text"
                      value={departure}
                      onChange={(e) => {
                        setDeparture(e.target.value);
                        setEstimation(null);
                        setShowEstimation(false);
                      }}
                      placeholder="Adresse de départ"
                      autoComplete="street-address"
                      className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loading}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:bg-muted flex items-center shadow"
                    title="Ma position actuelle"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Switch Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={switchAddresses}
                  className="p-2 bg-gradient-to-r from-chart-4 to-chart-5 text-primary-foreground rounded-full hover:from-chart-4/90 hover:to-chart-5/90 transition-all shadow"
                  title="Inverser les adresses"
                >
                  <ArrowDownUp className="h-4 w-4" />
                </button>
              </div>

              {/* Adresse de destination */}
              <div>
                <label className="block text-sm font-semibold text-card-foreground mb-2">
                  <MapPin className="inline h-4 w-4 mr-2 text-chart-2" />
                  Adresse de destination
                </label>
                <input
                  ref={destinationRef}
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setEstimation(null);
                    setShowEstimation(false);
                  }}
                  placeholder="Adresse de destination"
                  autoComplete="street-address"
                  className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              {/* Arrêts intermédiaires */}
              {stops.map((stop, index) => (
                <div key={index}>
                  <label className="block text-sm font-semibold text-card-foreground mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-chart-1" />
                    Arrêt {index + 1}
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={el => { stopsRefs.current[index] = el }}
                      type="text"
                      value={stop}
                      onChange={(e) => {
                        updateStop(index, e.target.value);
                        setEstimation(null);
                        setShowEstimation(false);
                      }}
                      placeholder="Adresse de l'arrêt"
                      autoComplete="street-address"
                      className="flex-1 px-4 py-3 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      className="px-4 py-3 bg-destructive text-primary-foreground rounded-lg hover:bg-destructive/90 transition-all shadow"
                      title="Supprimer l'arrêt"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Bouton ajouter arrêt */}
              <button
                type="button"
                onClick={addStop}
                className="w-full py-3 text-sm border border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="h-4 w-4" />
                Ajouter un arrêt
              </button>
            </div>

            {/* Type de véhicule */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-3">
                <Car className="inline h-4 w-4 mr-2 text-chart-4" />
                Type de véhicule
              </label>
              <div className="grid grid-cols-3 gap-3">
                {vehicles.map((vehicle) => {
                  const isDisabled = vehicle.id === 'van' && isVanDisabled;
                  return (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => handleVehicleSelection(vehicle.id)}
                      className={`p-4 rounded-lg border transition-all flex flex-col items-center relative ${
                        vehicleType === vehicle.id && !isDisabled
                          ? 'border-primary bg-accent shadow'
                          : isDisabled
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                      disabled={isDisabled}
                    >
                      {isDisabled && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                          <AlertCircle className="h-4 w-4" />
                        </div>
                      )}
                      <div className="relative w-16 h-12 mb-2">
                        <Image
                          src={vehicle.icon}
                          alt={vehicle.name}
                          fill
                          className={`object-contain ${isDisabled ? 'grayscale' : ''}`}
                        />
                      </div>
                      <div className={`text-sm font-semibold text-center ${
                        isDisabled ? 'text-gray-500' : 'text-card-foreground'
                      }`}>
                        {vehicle.name}
                      </div>
                      <div className={`text-xs mt-1 text-center ${
                        isDisabled ? 'text-gray-400' : 'text-muted-foreground'
                      }`}>
                        Jusqu'à {vehicle.capacity} passagers
                      </div>
                      {isDisabled && (
                        <div className="text-xs text-yellow-600 font-medium mt-1 text-center">
                          Indisponible
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Maintenant ou Planifier */}
            <div>
              <label className="block text-sm font-semibold text-card-foreground mb-3">
                <Clock className="inline h-4 w-4 mr-2 text-chart-5" />
                Quand souhaitez-vous partir ?
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setTimeOption('now')}
                  className={`p-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    timeOption === 'now'
                      ? 'border-primary bg-accent text-primary shadow'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">Maintenant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeOption('scheduled')}
                  className={`p-4 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                    timeOption === 'scheduled'
                      ? 'border-primary bg-accent text-primary shadow'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-semibold">Planifier</span>
                </button>
              </div>

              {timeOption === 'scheduled' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      autoComplete="off"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Heure</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      autoComplete="off"
                      className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Estimation Button */}
              <button
                type="button"
                onClick={calculateEstimation}
                disabled={loading || !departure || !destination}
                className="w-full py-4 bg-gradient-to-r from-chart-2 to-chart-1 text-primary-foreground font-bold rounded-lg hover:from-chart-2/90 hover:to-chart-1/90 transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-5 w-5" />
                    Calculer le prix
                  </>
                )}
              </button>

              {/* Information Text */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  💡 Cette estimation est indicative. Le prix final peut varier selon le trafic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}