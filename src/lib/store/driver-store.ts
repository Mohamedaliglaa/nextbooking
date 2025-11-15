// lib/store/driver-store.ts
import { create } from 'zustand';
import type { Ride } from '@/types/booking';
import type { DriverProfile, EarningsSummary } from '@/lib/api/driver-service';

type DriverState = {
  online: boolean;
  profile: DriverProfile | null;
  activeRide: Ride | null;
  earnings: EarningsSummary | null;

  setOnline: (v: boolean) => void;
  setProfile: (p: DriverProfile | null) => void;
  setActiveRide: (r: Ride | null) => void;
  setEarnings: (e: EarningsSummary | null) => void;
};

export const useDriverStore = create<DriverState>((set) => ({
  online: false,
  profile: null,
  activeRide: null,
  earnings: null,
  setOnline: (v) => set({ online: v }),
  setProfile: (p) => set({ profile: p }),
  setActiveRide: (r) => set({ activeRide: r }),
  setEarnings: (e) => set({ earnings: e }),
}));
