import React, { useState, useMemo } from 'react';
import { FoodListing, FoodCategory } from '../types';
import { FoodCard } from './FoodCard';
import { Search, SlidersHorizontal, RotateCcw, Compass, Sparkles, Filter, X } from 'lucide-react';

interface MarketplaceProps {
  listings: FoodListing[];
  onSelectListing: (listing: FoodListing) => void;
  onClaimDirect: (listing: FoodListing) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  userLocationName: string;
  onOpenLocationModal: () => void;
}

const CATEGORIES: Array<'All' | FoodCategory> = [
  'All',
  'Meals',
  'Rice',
  'Bakery',
  'Snacks',
  'Fruits',
  'Vegetables',
  'Beverages',
  'Desserts',
  'Other'
];

export const Marketplace: React.FC<MarketplaceProps> = ({
  listings,
  onSelectListing,
  onClaimDirect,
  selectedCategory,
  setSelectedCategory,
  userLocationName,
  onOpenLocationModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'LOW_STOCK' | 'EXPIRING_SOON'>('ALL');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'nearest' | 'lowest_price' | 'highest_discount' | 'expiring_soon' | 'newest'>('nearest');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    const now = Date.now();

    return listings
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.provider_name.toLowerCase().includes(q) ||
            item.pickup_location.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Availability filter
        if (availabilityFilter === 'AVAILABLE') {
          if (item.status === 'EXPIRED' || item.available_quantity === 0) return false;
        } else if (availabilityFilter === 'LOW_STOCK') {
          if (item.available_quantity > 3 || item.available_quantity === 0 || item.status === 'EXPIRED') return false;
        } else if (availabilityFilter === 'EXPIRING_SOON') {
          const exp = new Date(item.expiry_at).getTime();
          const diff = exp - now;
          if (item.status === 'EXPIRED' || item.available_quantity === 0 || diff <= 0 || diff > 2 * 60 * 60 * 1000) {
            return false;
          }
        }

        // Price filter
        if (maxPrice !== null && item.foodloop_price > maxPrice) {
          return false;
        }

        // Min Discount filter
        if (minDiscount !== null && item.discount_percentage < minDiscount) {
          return false;
        }

        // Distance filter
        if (maxDistance !== null && item.distance_km && item.distance_km > maxDistance) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'lowest_price') return a.foodloop_price - b.foodloop_price;
        if (sortBy === 'highest_discount') return b.discount_percentage - a.discount_percentage;
        if (sortBy === 'expiring_soon') {
          return new Date(a.expiry_at).getTime() - new Date(b.expiry_at).getTime();
        }
        if (sortBy === 'nearest') {
          return (a.distance_km || 0) - (b.distance_km || 0);
        }
        // Default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [listings, searchQuery, selectedCategory, availabilityFilter, maxPrice, minDiscount, maxDistance, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setAvailabilityFilter('ALL');
    setMaxPrice(null);
    setMinDiscount(null);
    setMaxDistance(null);
    setSortBy('nearest');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    availabilityFilter !== 'ALL' ||
    maxPrice !== null ||
    minDiscount !== null ||
    maxDistance !== null ||
    sortBy !== 'nearest';

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Marketplace Title & Search bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading">
                Surplus Food Marketplace
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Discover quality surplus portions listed at ~1/4 price. Real-time availability from local kitchens.
              </p>
            </div>

            {/* Current simulated location button */}
            <button
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors self-start sm:self-auto"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Near: <strong>{userLocationName}</strong></span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-1.5 py-0.5 rounded">Change</span>
            </button>
          </div>

          {/* Search & Main Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name, cafeteria, cuisine, or campus building..."
                className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3.5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              >
                <option value="nearest">Sort: Nearest First</option>
                <option value="expiring_soon">Sort: Expiring Soon</option>
                <option value="lowest_price">Sort: Lowest Price</option>
                <option value="highest_discount">Sort: Highest Discount</option>
                <option value="newest">Sort: Recently Listed</option>
              </select>

              {/* Filters Drawer Toggle */}
              <button
                onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                className={`flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-xs font-semibold transition-colors shadow-2xs ${
                  showFiltersDrawer || hasActiveFilters
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Expanded Filters Panel */}
        {showFiltersDrawer && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Detailed Filter Criteria
                </span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all filters
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* Availability Filter */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Availability Status</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available Only</option>
                  <option value="EXPIRING_SOON">Expiring in 2h</option>
                  <option value="LOW_STOCK">Low Stock (≤ 3 left)</option>
                </select>
              </div>

              {/* Max FoodLoop Price Filter */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Max Surplus Price</label>
                <select
                  value={maxPrice === null ? '' : maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="">Any Price</option>
                  <option value="25">Under ₹25 (Super Budget)</option>
                  <option value="35">Under ₹35</option>
                  <option value="50">Under ₹50</option>
                  <option value="75">Under ₹75</option>
                </select>
              </div>

              {/* Minimum Discount Filter */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Minimum Discount</label>
                <select
                  value={minDiscount === null ? '' : minDiscount}
                  onChange={(e) => setMinDiscount(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="">Any Discount</option>
                  <option value="50">50%+ OFF</option>
                  <option value="70">70%+ OFF</option>
                  <option value="75">🔥 75%+ OFF (Standard)</option>
                  <option value="80">80%+ OFF (Deep Surplus)</option>
                </select>
              </div>

              {/* Distance Radius Filter */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Distance Radius</label>
                <select
                  value={maxDistance === null ? '' : maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="">Any Distance</option>
                  <option value="1">Within 1 km (Walking)</option>
                  <option value="2">Within 2 km</option>
                  <option value="3">Within 3 km</option>
                  <option value="5">Within 5 km (Quick Bike/Auto)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count & Quick Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900 font-bold">{filteredListings.length}</strong> available surplus food items
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <FoodCard
                key={item.id}
                listing={item}
                onSelect={onSelectListing}
                onClaimDirect={onClaimDirect}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No surplus food matching your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try widening your distance, choosing &ldquo;All&rdquo; categories, or resetting your search query.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
