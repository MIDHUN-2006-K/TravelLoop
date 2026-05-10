// ============================================
// USER
// ============================================
export interface User {
  id: string;
  email: string;
  name?: string;
  profile_photo?: string;
  avatar_url?: string;
  language?: string;
  preferences?: Record<string, unknown>;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// TRIP
// ============================================
export interface Trip {
  trip_id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  description?: string;
  cover_image?: string;
  cover_image_url?: string;
  tags?: string[];
  status?: "DRAFT" | "PLANNED" | "ACTIVE" | "COMPLETED";
  is_public: boolean;
  created_at?: string;
  stops?: TripStop[];
  expenses?: Expense[];
}

export interface TripStop {
  stop_id: string;
  city?: City;
  stopping_place?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  start_date: string;
  end_date: string;
  order_index: number;
  activities?: TripActivity[];
}

export interface TripActivity {
  trip_activity_id: string;
  activity_id: string;
  name: string;
  category?: string;
  description?: string;
  scheduled_date: string;
  custom_cost?: number;
  notes?: string;
  duration_minutes?: number;
}

// ============================================
// CITY
// ============================================
export interface City {
  city_id: string;
  name: string;
  country: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  description?: string;
  cost_index?: number;
  popularity_score?: number;
}

// ============================================
// ACTIVITY (catalog)
// ============================================
export interface Activity {
  activity_id: string;
  name: string;
  description?: string;
  category?: string;
  default_cost?: number;
  duration?: number;
  image_url?: string;
  rating?: number;
  city_id: string;
}

// ============================================
// EXPENSE
// ============================================
export interface Expense {
  expense_id: string;
  category: string;
  estimated_cost: number;
  actual_cost?: number;
  description?: string;
  expense_date?: string;
  created_at?: string;
}

// ============================================
// PACKING ITEM
// ============================================
export interface PackingItem {
  packing_item_id: string;
  name: string;
  category: string;
  is_packed: boolean;
  quantity: number;
}

// ============================================
// NOTE / JOURNAL
// ============================================
export interface Note {
  note_id: string;
  title: string;
  content: string;
  stop_id?: string;
  day_date?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// SHARED TRIP
// ============================================
export interface SharedTrip {
  share_id: string;
  share_token: string;
  share_url: string;
  created_at: string;
}

export interface PublicTrip extends Omit<Trip, "cover_image"> {
  author?: { name?: string; avatar_url?: string };
}

// ============================================
// SAVED DESTINATION
// ============================================
export interface SavedDestination {
  saved_id: string;
  notes?: string;
  created_at: string;
  city: City;
}

// ============================================
// TRIP SUMMARY
// ============================================
export interface TripSummary {
  total_cost: number;
  categories: Record<string, number>;
  avg_per_day: number;
  days: number;
  stops_count?: number;
  activities_count?: number;
}

// ============================================
// MAP
// ============================================
export interface MapPoint {
  lat: number;
  lng: number;
  name: string;
  order: number;
  city_id?: string;
}

// ============================================
// BUDGET
// ============================================
export interface BudgetBreakdown {
  total_cost: number;
  avg_per_day: number;
  by_category: Record<string, number>;
  by_day: Record<string, number>;
}

// ============================================
// API
// ============================================
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
