import apiClient from "@/lib/apiClient";
import {
  User, AuthResponse, Trip, City, Activity,
  TripSummary, MapPoint, BudgetBreakdown, Expense,
  PackingItem, Note, SharedTrip, SavedDestination, PublicTrip,
} from "@/types";
import { format, parseISO } from "date-fns";

// ============================================
// AUTH
// ============================================
export const authService = {
  signup: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/signup", { email, password, name });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  updateProfile: async (updates: { name?: string; avatar_url?: string; language?: string }): Promise<User> => {
    const { data } = await apiClient.patch("/auth/profile", updates);
    return data;
  },

  uploadAvatar: async (base64Image: string): Promise<{ profile_photo: string }> => {
    const { data } = await apiClient.post("/auth/upload-avatar", { image: base64Image });
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (email: string, otp: string, new_password: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post("/auth/reset-password", { email, otp, new_password });
    return data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/auth/account");
  },

  logout: () => {
    localStorage.removeItem("authToken");
  },
};

// ============================================
// TRIPS
// ============================================
export const tripService = {
  getTrips: async (params?: { search?: string; status?: string; sort?: string; expand?: string }): Promise<Trip[]> => {
    const { data } = await apiClient.get("/trips", { params: { expand: "stops", ...params } });
    return data;
  },

  getTripById: async (tripId: string, expand?: string): Promise<Trip> => {
    const { data } = await apiClient.get(`/trips/${tripId}`, { params: expand ? { expand } : {} });
    return data;
  },

  getPublicTrip: async (tripId: string): Promise<Trip> => {
    const { data } = await apiClient.get(`/trips/${tripId}/public`);
    return data;
  },

  createTrip: async (tripData: {
    trip_name: string; start_date: string; end_date: string;
    description?: string; tags?: string[]; status?: string;
    cover_image?: string; cover_image_url?: string;
  }): Promise<Trip> => {
    const { data } = await apiClient.post("/trips", tripData);
    return data;
  },

  updateTrip: async (tripId: string, updates: Partial<Trip>): Promise<Trip> => {
    const { data } = await apiClient.patch(`/trips/${tripId}`, updates);
    return data;
  },

  deleteTrip: async (tripId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}`);
  },

  duplicateTrip: async (tripId: string): Promise<Trip> => {
    const { data } = await apiClient.post(`/trips/${tripId}/duplicate`);
    return data;
  },

  copyPublicTrip: async (tripId: string): Promise<Trip> => {
    const { data } = await apiClient.post(`/trips/${tripId}/copy`);
    return data;
  },

  getTripSummary: async (tripId: string): Promise<TripSummary> => {
    const { data } = await apiClient.get(`/trips/${tripId}/summary`);
    return data;
  },
};

// ============================================
// STOPS
// ============================================
export const tripStopsService = {
  addStop: async (tripId: string, stopData: {
    city_id?: string; stopping_place?: string; start_date: string; end_date: string;
    order_index?: number; latitude?: number; longitude?: number; notes?: string;
  }) => {
    const { data } = await apiClient.post(`/trips/${tripId}/stops`, stopData);
    return data;
  },

  updateStop: async (tripId: string, stopId: string, updates: {
    start_date?: string; end_date?: string; order_index?: number;
    notes?: string; latitude?: number; longitude?: number;
  }) => {
    const { data } = await apiClient.patch(`/trips/${tripId}/stops/${stopId}`, updates);
    return data;
  },

  reorderStops: async (tripId: string, stops: { stop_id: string; order_index: number }[]) => {
    const { data } = await apiClient.patch(`/trips/${tripId}/stops/reorder`, { stops });
    return data;
  },

  deleteStop: async (tripId: string, stopId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
  },
};

// ============================================
// ACTIVITIES
// ============================================
export const activitiesService = {
  addActivityToTrip: async (tripId: string, stopId: string, activityData: {
    activity_id: string; scheduled_date?: string; custom_cost?: number; notes?: string;
  }) => {
    const { data } = await apiClient.post(`/trips/${tripId}/stops/${stopId}/activities`, activityData);
    return data;
  },

  updateActivity: async (tripId: string, activityId: string, updates: {
    custom_cost?: number; scheduled_date?: string; notes?: string;
  }) => {
    const { data } = await apiClient.patch(`/trips/${tripId}/activities/${activityId}`, updates);
    return data;
  },

  deleteActivity: async (tripId: string, activityId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/activities/${activityId}`);
  },
};

// ============================================
// CITIES
// ============================================
export const citiesService = {
  getCities: async (params?: { search?: string; country?: string; popular?: boolean }) => {
    const { data } = await apiClient.get("/cities", { params });
    return data as City[];
  },

  searchCities: async (query: string): Promise<City[]> => {
    const { data } = await apiClient.get("/cities", { params: { search: query } });
    return data;
  },

  getPopularCities: async (): Promise<City[]> => {
    const { data } = await apiClient.get("/cities", { params: { popular: "true" } });
    return data;
  },
};

// ============================================
// CATALOG ACTIVITIES
// ============================================
export const catalogActivitiesService = {
  getActivities: async (params?: { cityId?: string; category?: string; maxCost?: number }): Promise<Activity[]> => {
    const { data } = await apiClient.get("/activities", { params });
    return data;
  },
};

// ============================================
// EXPENSES
// ============================================
export const expenseService = {
  getExpenses: async (tripId: string): Promise<Expense[]> => {
    const { data } = await apiClient.get(`/trips/${tripId}/expenses`);
    return data;
  },

  addExpense: async (tripId: string, expenseData: {
    category: string; estimated_cost: number; actual_cost?: number;
    description?: string; expense_date?: string;
  }): Promise<Expense> => {
    const { data } = await apiClient.post(`/trips/${tripId}/expenses`, expenseData);
    return data;
  },

  updateExpense: async (tripId: string, expenseId: string, updates: Partial<Expense>): Promise<Expense> => {
    const { data } = await apiClient.patch(`/trips/${tripId}/expenses/${expenseId}`, updates);
    return data;
  },

  deleteExpense: async (tripId: string, expenseId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/expenses/${expenseId}`);
  },
};

// ============================================
// PACKING
// ============================================
export const packingService = {
  getPackingList: async (tripId: string): Promise<PackingItem[]> => {
    const { data } = await apiClient.get(`/trips/${tripId}/packing`);
    return data;
  },

  addItem: async (tripId: string, item: { name: string; category: string; quantity?: number }): Promise<PackingItem> => {
    const { data } = await apiClient.post(`/trips/${tripId}/packing`, item);
    return data;
  },

  toggleItem: async (tripId: string, itemId: string, is_packed: boolean): Promise<PackingItem> => {
    const { data } = await apiClient.patch(`/trips/${tripId}/packing/${itemId}`, { is_packed });
    return data;
  },

  updateItem: async (tripId: string, itemId: string, updates: Partial<PackingItem>): Promise<PackingItem> => {
    const { data } = await apiClient.patch(`/trips/${tripId}/packing/${itemId}`, updates);
    return data;
  },

  deleteItem: async (tripId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/packing/${itemId}`);
  },

  resetAll: async (tripId: string): Promise<void> => {
    await apiClient.post(`/trips/${tripId}/packing/reset`);
  },
};

// ============================================
// NOTES
// ============================================
export const notesService = {
  getNotes: async (tripId: string): Promise<Note[]> => {
    const { data } = await apiClient.get(`/trips/${tripId}/notes`);
    return data;
  },

  addNote: async (tripId: string, note: { title: string; content: string; stop_id?: string; day_date?: string }): Promise<Note> => {
    const { data } = await apiClient.post(`/trips/${tripId}/notes`, note);
    return data;
  },

  updateNote: async (tripId: string, noteId: string, updates: Partial<Note>): Promise<Note> => {
    const { data } = await apiClient.patch(`/trips/${tripId}/notes/${noteId}`, updates);
    return data;
  },

  deleteNote: async (tripId: string, noteId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/notes/${noteId}`);
  },
};

// ============================================
// SHARING
// ============================================
export const sharingService = {
  shareTrip: async (tripId: string): Promise<SharedTrip> => {
    const { data } = await apiClient.post(`/sharing/trips/${tripId}/share`);
    return data;
  },

  getSharedTrip: async (token: string): Promise<PublicTrip> => {
    const { data } = await apiClient.get(`/shared/${token}`);
    return data;
  },

  revokeShare: async (tripId: string, shareId: string): Promise<void> => {
    await apiClient.delete(`/sharing/trips/${tripId}/share/${shareId}`);
  },
};

// ============================================
// SAVED DESTINATIONS
// ============================================
export const savedService = {
  getSaved: async (): Promise<SavedDestination[]> => {
    const { data } = await apiClient.get("/saved-destinations");
    return data;
  },

  saveDestination: async (city_id: string, notes?: string): Promise<SavedDestination> => {
    const { data } = await apiClient.post("/saved-destinations", { city_id, notes });
    return data;
  },

  removeDestination: async (savedId: string): Promise<void> => {
    await apiClient.delete(`/saved-destinations/${savedId}`);
  },
};

// ============================================
// HELPERS (frontend-only derived data)
// ============================================
export const helperService = {
  getTripMapPoints: async (tripId: string): Promise<MapPoint[]> => {
    try {
      const trip = await tripService.getTripById(tripId, "stops");
      if (!trip.stops?.length) return [];
      return trip.stops
        .filter((stop) => {
          const lat = stop.city?.latitude ?? stop.latitude;
          const lng = stop.city?.longitude ?? stop.longitude;
          return lat && lng;
        })
        .map((stop, index) => ({
          lat: (stop.city?.latitude ?? stop.latitude)!,
          lng: (stop.city?.longitude ?? stop.longitude)!,
          name: stop.city?.name ?? stop.stopping_place ?? `Stop ${index + 1}`,
          order: index + 1,
          city_id: stop.city?.city_id,
        }));
    } catch {
      return [];
    }
  },

  getTripBudget: async (tripId: string): Promise<BudgetBreakdown> => {
    const empty = { total_cost: 0, avg_per_day: 0, by_category: {}, by_day: {} };
    try {
      const [trip, expenses] = await Promise.all([
        tripService.getTripById(tripId, "stops,activities"),
        expenseService.getExpenses(tripId),
      ]);
      if (!trip.stops) return empty;

      const totalDays = Math.ceil(
        (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

      let total_cost = 0;
      const by_category: Record<string, number> = {};
      const by_day: Record<string, number> = {};

      // Expenses from the expenses endpoint
      expenses.forEach((exp) => {
        const cat = exp.category.toLowerCase();
        by_category[cat] = (by_category[cat] || 0) + exp.estimated_cost;
        total_cost += exp.estimated_cost;
      });

      // Activity costs
      trip.stops.forEach((stop) => {
        stop.activities?.forEach((activity) => {
          const cost = activity.custom_cost || 0;
          total_cost += cost;
          by_category["activities"] = (by_category["activities"] || 0) + cost;
          const dayKey = format(parseISO(activity.scheduled_date), "yyyy-MM-dd");
          by_day[dayKey] = (by_day[dayKey] || 0) + cost;
        });
      });

      // Fill missing days
      const start = parseISO(trip.start_date);
      for (let i = 0; i < totalDays; i++) {
        const dayKey = format(new Date(start.getTime() + i * 86400000), "yyyy-MM-dd");
        if (!by_day[dayKey]) by_day[dayKey] = 0;
      }

      return { total_cost, avg_per_day: total_cost / totalDays, by_category, by_day };
    } catch {
      return empty;
    }
  },
};
