import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Trip Store
interface TripStore {
  trips: any[];
  selectedTrip: any | null;
  isLoading: boolean;
  error: string | null;

  setTrips: (trips: any[]) => void;
  setSelectedTrip: (trip: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  selectedTrip: null,
  isLoading: false,
  error: null,

  setTrips: (trips) => set({ trips }),
  setSelectedTrip: (selectedTrip) => set({ selectedTrip }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
