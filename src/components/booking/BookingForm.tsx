'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Plus, X, ArrowDownUp, Clock, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { VehicleOption, RideEstimation } from '@/types/booking';
import { calculateEstimatedFare } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useBooking } from '@/hooks/use-booking';

declare global { interface Window { google: any; } }

const vehicles: VehicleOption[] = [
  { id: 'berline', name: 'Berline', icon: '/Berline-taxi-commande.png', capacity: 4, basePrice: 15, type: 'berline' },
  { id: 'break',  name: 'Break',  icon: '/Break-taxi-commande.png',  capacity: 4, basePrice: 20, type: 'break'  },
  { id: 'van',    name: 'Van',    icon: '/Van-taxi-commande.png',    capacity: 7, basePrice: 25, type: 'van'    },
];

export default function BookingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { setRideDetails } = useBooking();

  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState<'berline' | 'break' | 'van'>('berline');
  const [timeOption, setTimeOption] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const departureRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const stopsRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isVanDisabled = true;

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
    return () => { stopsRefs.current = []; };
  }, [stops]);

  const initializeAutocomplete = () => {
    if (!window.google) return;
    const options = { types: ['address'], componentRestrictions: { country: 'fr' } };

    if (departureRef.current) {
      const ac = new window.google.maps.places.Autocomplete(departureRef.current, options);
      ac.addListener('place_changed', () => {
        const p = ac.getPlace();
        if (p.formatted_address) setDeparture(p.formatted_address);
      });
    }

    if (destinationRef.current) {
      const ac = new window.google.maps.places.Autocomplete(destinationRef.current, options);
      ac.addListener('place_changed', () => {
        const p = ac.getPlace();
        if (p.formatted_address) setDestination(p.formatted_address);
      });
    }

    stopsRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const ac = new window.google.maps.places.Autocomplete(ref, options);
      ac.addListener('place_changed', () => {
        const p = ac.getPlace();
        if (p.formatted_address) updateStop(i, p.formatted_address);
      });
    });
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
          const data = await resp.json();
          setDeparture(data.results?.[0]?.formatted_address ?? `${latitude}, ${longitude}`);
        } catch {
          setDeparture(`${latitude}, ${longitude}`);
        }
        setLoading(false);
      }, () => {
        toast.error('Erreur de géolocalisation', "Impossible d'obtenir votre position actuelle");
        setLoading(false);
      });
    } else {
      toast.error('Géolocalisation non supportée', 'Votre navigateur ne supporte pas la géolocalisation');
      setLoading(false);
    }
  };

  const switchAddresses = () => {
    setDeparture((d) => {
      const oldDest = destination;
      setDestination(d);
      return oldDest;
    });
  };

  const addStop = () => {
    setStops((s) => [...s, '']);
    setTimeout(initializeAutocomplete, 100);
  };
  const removeStop = (index: number) => {
    setStops((s) => s.filter((_, i) => i !== index));
    stopsRefs.current.splice(index, 1);
  };
  const updateStop = (index: number, value: string) => {
    setStops((s) => {
      const copy = [...s];
      copy[index] = value;
      return copy;
    });
  };

  const handleVehicleSelection = (id: 'berline' | 'break' | 'van') => {
    if (id === 'van' && isVanDisabled) return;
    setVehicleType(id);
  };

  const handleTimeOption = (opt: 'now' | 'scheduled') => {
    setTimeOption(opt);
    if (opt === 'scheduled' && !scheduledDate && !scheduledTime) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setScheduledDate(oneHourLater.toISOString().split('T')[0]);
      setScheduledTime(oneHourLater.toTimeString().split(':').slice(0, 2).join(':'));
    }
  };

  const calculateEstimation = async () => {
    if (!departure || !destination) {
      toast.error('Champs manquants', "Veuillez remplir l'adresse de départ et de destination");
      return;
    }
    setLoading(true);

    const filteredStops = stops.filter((s) => s.trim() !== '');

    try {
      const service = new window.google.maps.DistanceMatrixService();
      const origins = [departure, ...filteredStops];
      const destinations = [...filteredStops, destination];

      service.getDistanceMatrix(
        { origins, destinations, travelMode: 'DRIVING', unitSystem: window.google.maps.UnitSystem.METRIC },
        (response: any, status: string) => {
          if (status === 'OK') {
            let totalDistance = 0;
            let totalDuration = 0;

            response.rows.forEach((row: any) => {
              row.elements.forEach((el: any) => {
                if (el.status === 'OK') {
                  totalDistance += el.distance.value / 1000;
                  totalDuration += el.duration.value / 60;
                }
              });
            });

            const vehicle = vehicles.find((v) => v.id === vehicleType)!;
            const basePrices = vehicles.reduce((acc, v) => (acc[v.id] = v.basePrice, acc), {} as Record<string, number>);
            const estimatedPrice = calculateEstimatedFare(totalDistance, totalDuration, vehicleType, basePrices);

            const estimationData: RideEstimation = {
              pickup_location: departure,
              dropoff_location: destination,
              pickup_lat: 48.8566,
              pickup_lng: 2.3522,
              dropoff_lat: 48.8606,
              dropoff_lng: 2.3376,
              vehicle_type: vehicleType,
              vehicle,
              passenger_count: 1,
              is_scheduled: timeOption === 'scheduled',
              scheduled_at: timeOption === 'scheduled' ? `${scheduledDate}T${scheduledTime}` : undefined,
              stops: filteredStops, // IMPORTANT: only non-empty
              estimated_distance: Math.round(totalDistance * 10) / 10,
              estimated_duration: Math.round(totalDuration),
              estimated_fare: estimatedPrice,
            };

            setRideDetails(estimationData);
            router.push('/confirmation');
          } else {
            calculateFallbackEstimation(filteredStops);
          }
          setLoading(false);
        }
      );
    } catch {
      calculateFallbackEstimation(stops.filter((s) => s.trim() !== ''));
      setLoading(false);
    }
  };

  const calculateFallbackEstimation = (filteredStops: string[]) => {
    const vehicle = vehicles.find((v) => v.id === vehicleType)!;
    const baseDistance = 10 + filteredStops.length * 5;
    const basePrices = vehicles.reduce((acc, v) => (acc[v.id] = v.basePrice, acc), {} as Record<string, number>);
    const estimatedPrice = calculateEstimatedFare(baseDistance, baseDistance * 2, vehicleType, basePrices);

    const estimationData: RideEstimation = {
      pickup_location: departure,
      dropoff_location: destination,
      pickup_lat: 48.8566,
      pickup_lng: 2.3522,
      dropoff_lat: 48.8606,
      dropoff_lng: 2.3376,
      vehicle_type: vehicleType,
      vehicle,
      passenger_count: 1,
      is_scheduled: timeOption === 'scheduled',
      scheduled_at: timeOption === 'scheduled' ? `${scheduledDate}T${scheduledTime}` : undefined,
      stops: filteredStops, // IMPORTANT
      estimated_distance: baseDistance,
      estimated_duration: baseDistance * 2,
      estimated_fare: estimatedPrice,
    };

    setRideDetails(estimationData);
    router.push('/confirmation');
  };

  return (
    <div className="w-full">
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="flex flex-col gap-2 p-6 space-y-4 relative">
          {/* Departure */}
          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              <MapPin className="inline h-4 w-4 mr-2 text-chart-3" />
              Adresse de départ
            </label>
            <div className="flex gap-2">
              <input
                ref={departureRef}
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Adresse de départ"
                className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                title="Ma position actuelle"
              >
                <Navigation className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Switch Button */}
          <div className="absolute right-6 top-28">
            <button
              onClick={switchAddresses}
              className="p-2 bg-gradient-to-r from-chart-4 to-chart-5 text-primary-foreground rounded-full hover:opacity-90"
              title="Inverser les adresses"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-card-foreground mb-2">
              <MapPin className="inline h-4 w-4 mr-2 text-chart-2" />
              Adresse de destination
            </label>
            <input
              ref={destinationRef}
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Adresse de destination"
              className="w-full px-4 py-3 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Stops */}
          {stops.map((stop, index) => (
            <div key={index}>
              <label className="block text-sm font-semibold text-card-foreground mb-2">
                <MapPin className="inline h-4 w-4 mr-2 text-chart-1" />
                Arrêt {index + 1}
              </label>
              <div className="flex gap-2">
                <input
                  ref={(el) => {
                    stopsRefs.current[index] = el;
                  }}
                  type="text"
                  value={stop}
                  onChange={(e) => updateStop(index, e.target.value)}
                  placeholder="Adresse de l'arrêt"
                  className="flex-1 px-4 py-3 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => removeStop(index)}
                  className="px-4 py-3 bg-destructive text-primary-foreground rounded-lg hover:bg-destructive/90"
                  title="Supprimer l'arrêt"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addStop}
            className="w-full py-3 text-sm border border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Ajouter un arrêt
          </button>

          {/* Vehicle selection */}
          <div className="grid grid-cols-3 gap-3">
            {vehicles.map((vehicle) => {
              const disabled = vehicle.id === 'van' && isVanDisabled;
              return (
                <button
                  key={vehicle.id}
                  onClick={() => handleVehicleSelection(vehicle.type)}
                  disabled={disabled}
                  className={`p-4 rounded-lg border flex flex-col items-center relative ${
                    vehicleType === vehicle.id && !disabled
                      ? 'border-primary bg-accent shadow'
                      : disabled
                      ? 'border-gray-300 bg-gray-100 opacity-60'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  {disabled && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className="relative w-16 h-12 mb-2">
                    <Image
                      src={vehicle.icon}
                      alt={vehicle.name}
                      fill
                      className={`object-contain ${disabled ? 'grayscale' : ''}`}
                    />
                  </div>
                  <div className="text-sm font-semibold">{vehicle.name}</div>
                  <div className="text-xs mt-1 text-muted-foreground">
                    Jusqu'à {vehicle.capacity} passagers
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time option */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleTimeOption('now')}
                className={`p-4 rounded-lg border flex items-center justify-center gap-2 ${
                  timeOption === 'now'
                    ? 'border-primary bg-accent text-primary shadow'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Maintenant</span>
              </button>
              <button
                onClick={() => handleTimeOption('scheduled')}
                className={`p-4 rounded-lg border flex items-center justify-center gap-2 ${
                  timeOption === 'scheduled'
                    ? 'border-primary bg-accent text-primary shadow'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Planifier</span>
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
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Heure</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="space-y-4">
            <button
              onClick={calculateEstimation}
              disabled={loading || !departure || !destination}
              className="w-full py-4 bg-gradient-to-r from-chart-2 to-chart-1 text-primary-foreground font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Calcul en cours...
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5" />
                  Faire une estimation
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              💡 Cette estimation est indicative. Le prix final peut varier selon le trafic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
