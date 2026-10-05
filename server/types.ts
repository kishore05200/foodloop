export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
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
  rating: number; // 1 to 5
  review: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  food_listings: FoodListing[];
  claims: Claim[];
  ratings: Rating[];
}
