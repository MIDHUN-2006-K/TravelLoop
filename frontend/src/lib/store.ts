import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Trip } from "@/types";

// ============================================
// AUTH STORE
// ============================================
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
      name: "traveloop-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// ============================================
// TRIP STORE
// ============================================
interface TripStore {
  trips: Trip[];
  selectedTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterStatus: string;
  sortBy: string;
  viewMode: "grid" | "list";

  setTrips: (trips: Trip[]) => void;
  setSelectedTrip: (trip: Trip | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string) => void;
  setSortBy: (sort: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  selectedTrip: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  filterStatus: "",
  sortBy: "",
  viewMode: "grid",

  setTrips: (trips) => set({ trips }),
  setSelectedTrip: (selectedTrip) => set({ selectedTrip }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSortBy: (sortBy) => set({ sortBy }),
  setViewMode: (viewMode) => set({ viewMode }),
}));

// ============================================
// UI STORE
// ============================================
interface UIStore {
  activeTab: string;
  sidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "overview",
  sidebarOpen: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
