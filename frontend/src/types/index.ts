// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  profile_photo?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Trip types
export interface Trip {
  trip_id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  description?: string;
  is_public: boolean;
  user_id?: string;
  stops?: TripStop[];
  expenses?: Expense[];
}

export interface TripStop {
  stop_id: string;
  city?: City;
  stopping_place?: string;
  start_date: string;
  end_date: string;
  order_index: number;
  activities?: TripActivity[];
}

export interface TripActivity {
  trip_activity_id: string;
  activity_id: string;
  name: string;
  scheduled_date: string;
  custom_cost?: number;
  notes?: string;
}

// City types
export interface City {
  city_id: string;
  name: string;
  country: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

// Activity types
export interface Activity {
  activity_id: string;
  name: string;
  description?: string;
  category?: string;
  estimated_cost?: number;
  city_id: string;
}

// Expense types
export interface Expense {
  expense_id: string;
  category: string;
  estimated_cost: number;
  description?: string;
}

// Trip Summary types
export interface TripSummary {
  total_cost: number;
  categories: Record<string, number>;
  avg_per_day: number;
  days: number;
}

// Map types
export interface MapPoint {
  lat: number;
  lng: number;
  name: string;
  order: number;
  city_id?: string;
}

// Budget types
export interface BudgetBreakdown {
  total_cost: number;
  avg_per_day: number;
  by_category: Record<string, number>;
  by_day: Record<string, number>;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
