import apiClient from "@/lib/apiClient";
import {
  User,
  AuthResponse,
  Trip,
  City,
  Activity,
  TripSummary,
  MapPoint,
  BudgetBreakdown,
} from "@/types";
import { format, parseISO } from "date-fns";

// AUTH SERVICES
export const authService = {
  signup: async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/signup", {
      email,
      password,
      name,
    });
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

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};

// TRIP SERVICES
export const tripService = {
  getTrips: async (userId?: string): Promise<Trip[]> => {
    const params = userId ? { user: "true" } : {};
    const { data } = await apiClient.get("/trips", { params });
    return data;
  },

  getTripById: async (tripId: string, expand?: string): Promise<Trip> => {
    const params = expand ? { expand } : {};
    const { data } = await apiClient.get(`/trips/${tripId}`, { params });
    return data;
  },

  getPublicTrip: async (tripId: string, expand?: string): Promise<Trip> => {
    const params = expand ? { expand } : {};
    const { data } = await apiClient.get(`/trips/${tripId}/public`, { params });
    return data;
  },

  createTrip: async (tripData: {
    trip_name: string;
    start_date: string;
    end_date: string;
    description?: string;
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

  getTripSummary: async (tripId: string): Promise<TripSummary> => {
    const { data } = await apiClient.get(`/trips/${tripId}/summary`);
    return data;
  },

  copyTrip: async (tripId: string): Promise<Trip> => {
    const { data } = await apiClient.post(`/trips/${tripId}/copy`);
    return data;
  },
};

// TRIP STOPS SERVICES
export const tripStopsService = {
  addStop: async (
    tripId: string,
    stopData: {
      city_id?: string;
      stopping_place?: string;
      start_date: string;
      end_date: string;
      order_index?: number;
    }
  ) => {
    const { data } = await apiClient.post(`/trips/${tripId}/stops`, stopData);
    return data;
  },

  updateStop: async (
    tripId: string,
    stopId: string,
    updates: {
      start_date?: string;
      end_date?: string;
      order_index?: number;
    }
  ) => {
    const { data } = await apiClient.patch(
      `/trips/${tripId}/stops/${stopId}`,
      updates
    );
    return data;
  },

  deleteStop: async (tripId: string, stopId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
  },
};

// ACTIVITIES SERVICES
export const activitiesService = {
  addActivityToTrip: async (
    tripId: string,
    stopId: string,
    activityData: {
      activity_id: string;
      scheduled_date?: string;
    }
  ) => {
    const { data } = await apiClient.post(
      `/trips/${tripId}/stops/${stopId}/activities`,
      activityData
    );
    return data;
  },

  updateActivity: async (
    tripId: string,
    activityId: string,
    updates: {
      custom_cost?: number;
      scheduled_date?: string;
      notes?: string;
    }
  ) => {
    const { data } = await apiClient.patch(
      `/trips/${tripId}/activities/${activityId}`,
      updates
    );
    return data;
  },

  deleteActivity: async (tripId: string, activityId: string): Promise<void> => {
    await apiClient.delete(`/trips/${tripId}/activities/${activityId}`);
  },
};

// CITIES SERVICES
export const citiesService = {
  getCities: async (page: number = 1, limit: number = 20) => {
    const { data } = await apiClient.get("/cities", {
      params: { page, limit },
    });
    return data;
  },

  searchCities: async (query: string) => {
    const { data } = await apiClient.get("/cities", {
      params: { search: query },
    });
    return data;
  },

  getCityById: async (cityId: string): Promise<City> => {
    const { data } = await apiClient.get(`/cities/${cityId}`);
    return data;
  },
};

// ACTIVITIES SERVICES (List)
export const allActivitiesService = {
  getActivities: async (
    cityId?: string,
    page: number = 1,
    limit: number = 20
  ) => {
    const params: any = { page, limit };
    if (cityId) params.city_id = cityId;
    const { data } = await apiClient.get("/activities", { params });
    return data;
  },

  searchActivities: async (query: string, cityId?: string) => {
    const params: any = { search: query };
    if (cityId) params.city_id = cityId;
    const { data } = await apiClient.get("/activities", { params });
    return data;
  },

  getActivityById: async (activityId: string): Promise<Activity> => {
    const { data } = await apiClient.get(`/activities/${activityId}`);
    return data;
  },
};

// HELPER SERVICES (Frontend-only logic with existing endpoints)
export const helperService = {
  // Get map points from trip stops
  getTripMapPoints: async (tripId: string): Promise<MapPoint[]> => {
    try {
      const trip = await tripService.getTripById(tripId, "stops");
      if (!trip.stops || trip.stops.length === 0) return [];

      // Extract coordinates from stops (only those with city data)
      return trip.stops
        .filter(
          (stop) => stop.city && stop.city.latitude && stop.city.longitude
        )
        .map((stop, index) => ({
          lat: stop.city!.latitude!,
          lng: stop.city!.longitude!,
          name: stop.city!.name,
          order: index + 1,
          city_id: stop.city!.city_id,
        }));
    } catch (err) {
      console.error("Failed to get map points:", err);
      return [];
    }
  },

  // Calculate budget breakdown from trip data
  getTripBudget: async (tripId: string): Promise<BudgetBreakdown> => {
    try {
      const trip = await tripService.getTripById(tripId, "stops,activities");

      if (!trip.stops) {
        return {
          total_cost: 0,
          avg_per_day: 0,
          by_category: {},
          by_day: {},
        };
      }

      const totalDays =
        Math.ceil(
          (new Date(trip.end_date).getTime() -
            new Date(trip.start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      let total_cost = 0;
      const by_category: Record<string, number> = {};
      const by_day: Record<string, number> = {};

      // Process each stop and its activities
      trip.stops.forEach((stop) => {
        if (stop.activities) {
          stop.activities.forEach((activity) => {
            const cost = activity.custom_cost || 0;
            total_cost += cost;

            // Group by category (estimate if not available)
            const category = "Activities"; // Default category
            by_category[category] = (by_category[category] || 0) + cost;

            // Group by day
            const dayKey = format(
              parseISO(activity.scheduled_date),
              "yyyy-MM-dd"
            );
            by_day[dayKey] = (by_day[dayKey] || 0) + cost;
          });
        }
      });

      // Fill in missing days with 0 cost
      const start = parseISO(trip.start_date);
      for (let i = 0; i < totalDays; i++) {
        const dayKey = format(
          new Date(start.getTime() + i * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        );
        if (!by_day[dayKey]) {
          by_day[dayKey] = 0;
        }
      }

      return {
        total_cost,
        avg_per_day: total_cost / totalDays,
        by_category,
        by_day,
      };
    } catch (err) {
      console.error("Failed to get trip budget:", err);
      return {
        total_cost: 0,
        avg_per_day: 0,
        by_category: {},
        by_day: {},
      };
    }
  },

  // Get trip with all expanded data for timeline view
  getTripForTimeline: async (tripId: string): Promise<Trip | null> => {
    try {
      const trip = await tripService.getTripById(tripId, "stops,activities");
      return trip;
    } catch (err) {
      console.error("Failed to get trip for timeline:", err);
      return null;
    }
  },
};
