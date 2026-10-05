import React, { useState } from 'react';
import { FoodListing, FoodCategory, ListingStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Flame, Save, Edit3 } from 'lucide-react';

interface EditListingModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onListingUpdated: (listing: FoodListing) => void;
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

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  onClose,
  onListingUpdated
}) => {
  const { showToast } = useAuth();

  const [name, setName] = useState(listing?.name || '');
  const [category, setCategory] = useState<FoodCategory>(listing?.category || 'Meals');
  const [description, setDescription] = useState(listing?.description || '');
  const [originalPrice, setOriginalPrice] = useState<number>(listing?.original_price || 100);
  const [foodloopPrice, setFoodloopPrice] = useState<number>(listing?.foodloop_price || 25);
  const [availableQuantity, setAvailableQuantity] = useState<number>(listing?.available_quantity || 10);
  const [unit, setUnit] = useState(listing?.unit || 'portions');
  const [pickupLocation, setPickupLocation] = useState(listing?.pickup_location || '');
  const [status, setStatus] = useState<ListingStatus>(listing?.status || 'AVAILABLE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!listing) return null;

  const discountPct = originalPrice > 0
    ? Math.round(((originalPrice - foodloopPrice) / originalPrice) * 100)
    : 75;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<FoodListing> = {
        name,
        category,
        description,
        original_price: Number(originalPrice),
        foodloop_price: Number(foodloopPrice),
        available_quantity: Number(availableQuantity),
        unit,
        pickup_location: pickupLocation,
        status
      };

      const res = await api.listings.update(listing.id, payload);
      showToast(`Updated "${res.listing.name}" successfully!`, 'success');
      onListingUpdated(res.listing);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update listing';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-heading">Edit Surplus Food Listing</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Food Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Listing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="LOW_STOCK">LOW STOCK</option>
                <option value="FULLY_CLAIMED">FULLY CLAIMED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Original Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                FoodLoop Price (₹) <span className="text-rose-600 font-extrabold">({discountPct}% OFF)</span>
              </label>
              <input
                type="number"
                value={foodloopPrice}
                onChange={(e) => setFoodloopPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Available Quantity</label>
              <input
                type="number"
                min="0"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Pickup Location</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'UPDATE LISTING'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
