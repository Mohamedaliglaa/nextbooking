import { useState, useCallback } from 'react';
import { locationService } from '@/lib/api/location-service';
import { AddressSuggestion, Coordinates } from '@/types/shared';
import { debounce } from '@/lib/utils';

export const useLocation = () => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);

  const getAddressSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await locationService.getAddressSuggestions(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to fetch address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Coordinates> => {
    try {
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setCurrentLocation(location);
              resolve(location);
            },
            (error) => {
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        });
      } else {
        throw new Error('Geolocation is not supported');
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  }, []);

  const getCoordinatesFromAddress = useCallback(async (address: string): Promise<Coordinates> => {
    try {
      return await locationService.getCoordinates(address);
    } catch (error) {
      console.error('Failed to get coordinates:', error);
      throw error;
    }
  }, []);

  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      return await locationService.getReverseGeocode(lat, lng);
    } catch (error) {
      console.error('Failed to get address:', error);
      throw error;
    }
  }, []);

  return {
    suggestions,
    isLoading,
    currentLocation,
    getAddressSuggestions,
    clearSuggestions,
    getCurrentLocation,
    getCoordinatesFromAddress,
    getAddressFromCoordinates,
  };
};
