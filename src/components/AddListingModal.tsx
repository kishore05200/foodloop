import React, { useState } from 'react';
import { FoodListing, FoodCategory } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Flame, Sparkles, MapPin, Plus, Store, Image as ImageIcon } from 'lucide-react';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (listing: FoodListing) => void;
}

const CATEGORIES: FoodCategory[] = [
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

const PRESET_IMAGES: Record<FoodCategory, string> = {
  Meals: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=800&q=80',
  Rice: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  Bakery: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  Snacks: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  Fruits: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  Desserts: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
};

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated
}) => {
  const { user, showToast } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Meals');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>(120);
  const [foodloopPrice, setFoodloopPrice] = useState<number | ''>(30);
  const [quantity, setQuantity] = useState<number | ''>(20);
  const [unit, setUnit] = useState('portions');
  const [pickupLocation, setPickupLocation] = useState('College Cafeteria, North Campus Block B, Counter 4');
  
  // Default expiry 3 hours from now
  const defaultExpDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const [expiryDate, setExpiryDate] = useState(defaultExpDate.toISOString().split('T')[0]);
  const [expiryTime, setExpiryTime] = useState(
    `${String(defaultExpDate.getHours()).padStart(2, '0')}:${String(defaultExpDate.getMinutes()).padStart(2, '0')}`
  );
  
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES['Meals']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto 25% price calculation when original price changes
  const handleOriginalPriceChange = (val: string) => {
    if (val === '') {
      setOriginalPrice('');
      setFoodloopPrice('');
      return;
    }
    const op = parseFloat(val);
    setOriginalPrice(op);
    if (!isNaN(op) && op > 0) {
      // Calculate approximately 25% (1/4)
      const discounted = Math.round(op * 0.25);
      setFoodloopPrice(discounted);
    }
  };

  const handleCategoryChange = (newCat: FoodCategory) => {
    setCategory(newCat);
    // Set preset photo if user hasn't typed custom image
    setImageUrl(PRESET_IMAGES[newCat]);
  };

  // Calculate current discount percentage
  const op = typeof originalPrice === 'number' ? originalPrice : 0;
  const fp = typeof foodloopPrice === 'number' ? foodloopPrice : 0;
  const discountPct = op > 0 ? Math.round(((op - fp) / op) * 100) : 75;
  const savings = op - fp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please provide a food item name.', 'error');
      return;
    }

    if (!originalPrice || originalPrice <= 0) {
      showToast('Please provide a valid original price.', 'error');
      return;
    }

    if (!foodloopPrice || foodloopPrice <= 0) {
      showToast('Please provide a valid FoodLoop surplus price.', 'error');
      return;
    }

    if (!quantity || quantity <= 0) {
      showToast('Please specify the available quantity.', 'error');
      return;
    }

    if (!pickupLocation.trim()) {
      showToast('Please provide the pickup location / counter.', 'error');
      return;
    }

    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}:00`);
    if (isNaN(expiryDateTime.getTime()) || expiryDateTime.getTime() <= Date.now()) {
      showToast('Expiry time must be in the future today.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<FoodListing> = {
        name: name.trim(),
        category,
        description: description.trim() || `Fresh surplus ${name.trim()} available for pickup.`,
        original_price: Number(originalPrice),
        foodloop_price: Number(foodloopPrice),
        discount_percentage: discountPct,
        quantity: Number(quantity),
        available_quantity: Number(quantity),
        unit: unit.trim(),
        pickup_location: pickupLocation.trim(),
        expiry_at: expiryDateTime.toISOString(),
        image_url: imageUrl || PRESET_IMAGES[category]
      };

      const res = await api.listings.create(payload);
      showToast(`Listed "${res.listing.name}" at ₹${res.listing.foodloop_price} (${discountPct}% OFF)!`, 'success');
      onListingCreated(res.listing);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create listing';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">List Surplus Food</h2>
              <p className="text-xs text-slate-400">
                List excess portions at ~25% price to rescue food and recover revenue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form & Live Preview Grid */}
        <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left: Input Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Food Name & Category */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Food Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken Rice Box, Vegetable Meal Feast, Samosa Combo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Portion Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="portions / packs / boxes / bowls"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Price Calculations: Core 25% / 75% OFF Logic */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                  Surplus Discount Pricing
                </span>
                <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" /> {discountPct}% OFF
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Original Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={originalPrice}
                    onChange={(e) => handleOriginalPriceChange(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    FoodLoop Price (~25%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={foodloopPrice}
                    onChange={(e) => setFoodloopPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 30"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="text-[11px] text-emerald-900 flex items-center justify-between">
                <span>Calculated savings per portion: <strong>₹{savings}</strong></span>
                <span className="text-slate-500 font-medium">Default: 25% of original</span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Quantity Available <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="Number of portions (e.g. 20)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Description / Ingredients
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fresh ingredients, dietary info (vegetarian, halal, contains dairy), and packaging details..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Pickup Location & Counter <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. College Cafeteria Counter 4, Student Center Gate 2"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* Expiry Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Expiry Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            {/* Image URL Input with preset shortcuts */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Food Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs truncate"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(PRESET_IMAGES[category])}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold whitespace-nowrap"
                  title="Use standard preset photo"
                >
                  Reset Preset
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Surplus Food...' : 'PUBLISH SURPLUS LISTING'}</span>
              </button>
            </div>
          </form>

          {/* Right: Live Preview */}
          <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                Live Card Preview
              </span>

              {/* Simulated Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                <div className="relative h-44 w-full bg-slate-200">
                  <img
                    src={imageUrl || PRESET_IMAGES[category]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{discountPct}% OFF</span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded">
                    ⏰ Expires {expiryTime}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-semibold text-emerald-700 uppercase">
                    {category} · {user?.name || 'College Cafeteria'}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {name || 'Delicious Surplus Item Name'}
                  </h4>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 line-through">₹{originalPrice || 120}</span>
                      <div className="text-base font-black text-slate-950">₹{foodloopPrice || 30}</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      SAVE ₹{savings > 0 ? savings : 90}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <strong>{quantity || 20}</strong> {unit} available
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{pickupLocation || 'Pickup Counter'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">FoodLoop Guarantee:</span>
              <p>
                Surplus food will be highlighted to local rescue members instantly upon publishing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
