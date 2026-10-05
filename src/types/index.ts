export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export type ListingStatus = 'AVAILABLE' | 'LOW_STOCK' | 'FULLY_CLAIMED' | 'EXPIRED';

export type FoodCategory =
  | 'Meals'
  | 'Rice'
  | 'Bakery'
  | 'Snacks'
  | 'Fruits'
  | 'Vegetables'
  | 'Beverages'
  | 'Desserts'
  | 'Other';

export interface FoodListing {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_rating?: number;
  provider_reviews_count?: number;
  name: string;
  category: FoodCategory;
  description: string;
  original_price: number;
  foodloop_price: number;
  discount_percentage: number;
  quantity: number;
  available_quantity: number;
  unit: string;
  pickup_location: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  travel_estimate?: string;
  expiry_at: string;
  image_url: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export type ClaimStatus = 'CLAIMED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';

export interface Claim {
  id: string;
  listing_id: string;
  user_id: string;
  user_name: string;
  provider_id: string;
  provider_name: string;
  food_name: string;
  category: FoodCategory;
  image_url: string;
  quantity: number;
  foodloop_price: number;
  original_price: number;
  total_price: number;
  total_saved: number;
  pickup_location: string;
  claim_code: string;
  status: ClaimStatus;
  claimed_at: string;
  completed_at?: string;
  has_rated?: boolean;
}

export interface Rating {
  id: string;
  claim_id: string;
  reviewer_id: string;
  reviewer_name: string;
  provider_id: string;
  provider_name: string;
  rating: number;
  review: string;
  created_at: string;
}

export interface UserDashboardData {
  metrics: {
    meals_rescued: number;
    money_saved: number;
    total_spent: number;
    food_rescued_kg: number;
    completed_pickups: number;
    active_claims_count: number;
  };
  active_claims: Claim[];
  recent_claims: Claim[];
}

export interface ProviderDashboardData {
  metrics: {
    total_food_listed: number;
    total_food_sold: number;
    total_food_rescued_kg: number;
    total_revenue: number;
    total_discount_given: number;
    active_listings_count: number;
    expired_listings_count: number;
    average_rating: number;
    reviews_count: number;
  };
  active_listings: FoodListing[];
  all_listings: FoodListing[];
  recent_claims: Claim[];
  reviews: Rating[];
}

export interface AdminDashboardData {
  metrics: {
    total_users: number;
    total_providers: number;
    total_listings: number;
    active_listings: number;
    expired_listings: number;
    total_claims: number;
    completed_claims: number;
    total_meals_saved: number;
    total_money_saved: number;
    total_food_rescued_kg: number;
  };
  users: User[];
  food_listings: FoodListing[];
  claims: Claim[];
}

export interface ImpactData {
  total_meals_saved: number;
  total_money_saved: number;
  total_food_rescued_kg: number;
  total_claims_completed: number;
  total_providers: number;
  total_users: number;
  rescue_value: {
    original_food_value: number;
    foodloop_sales: number;
    users_saved: number;
  };
  category_distribution: Record<string, number>;
  monthly_trend: Array<{ month: string; meals: number; saved: number }>;
}

export interface UserLocation {
  name: string;
  lat: number;
  lng: number;
}
