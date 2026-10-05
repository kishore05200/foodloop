import React, { useState } from 'react';
import { FoodListing, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, MapPin, Clock, Flame, Star, AlertTriangle, ShieldCheck, CheckCircle2, Minus, Plus } from 'lucide-react';

interface FoodDetailsModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onClaimSuccess: (claim: Claim, updatedListing: FoodListing) => void;
  onOpenAuthModal: () => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  listing,
  onClose,
  onClaimSuccess,
  onOpenAuthModal
}) => {
  const { user, showToast } = useAuth();
  const [claimQty, setClaimQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!listing) return null;

  const isSoldOut = listing.available_quantity <= 0 || listing.status === 'FULLY_CLAIMED';
  const isExpired = listing.status === 'EXPIRED' || new Date(listing.expiry_at).getTime() <= Date.now();
  const isLowStock = !isSoldOut && listing.available_quantity <= 3;

  // Pricing math
  const singleSavings = listing.original_price - listing.foodloop_price;
  const totalPrice = listing.foodloop_price * claimQty;
  const originalTotal = listing.original_price * claimQty;
  const totalSaved = originalTotal - totalPrice;

  const handleClaim = async () => {
    if (!user) {
      showToast('Please sign in or choose a demo persona to claim food.', 'warning');
      onOpenAuthModal();
      return;
    }

    if (claimQty > listing.available_quantity) {
      showToast(`Only ${listing.available_quantity} ${listing.unit} left available.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.claims.create(listing.id, claimQty);
      // Trigger festive celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast(`Claimed ${claimQty} ${listing.unit} of ${listing.name}! Saved ₹${totalSaved}.`, 'success');
      onClaimSuccess(res.claim, res.updated_listing);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to claim food';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeString = (expiryAt: string) => {
    const diff = new Date(expiryAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins} minutes left`;
    return `${hours} hours ${mins} mins left`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Food Image */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-100">
          <img
            src={listing.image_url}
            alt={listing.name}
            className="w-full h-full object-cover"
          />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-white" />
              {listing.discount_percentage}% OFF
            </span>

            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
              SAVE ₹{singleSavings} EACH
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 bg-slate-950/80 backdrop-blur-md rounded-xl p-2.5 text-white text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Expiry: <strong>{getTimeString(listing.expiry_at)}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{listing.provider_rating || 4.8} rating</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Title & Provider */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-emerald-700 uppercase tracking-wider">{listing.category}</span>
              <span>{listing.provider_name}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-950 font-heading">
              {listing.name}
            </h2>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Strong Visual Pricing Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Original Price</span>
                <span className="text-sm font-bold text-slate-400 line-through">₹{listing.original_price}</span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">FoodLoop Price</span>
                <span className="text-lg font-black text-emerald-700">₹{listing.foodloop_price}</span>
              </div>

              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">You Save</span>
                <span className="text-base font-black text-rose-600">₹{singleSavings} (75%)</span>
              </div>
            </div>

            {/* Quantity Stepper & Savings Calculator */}
            {!isSoldOut && !isExpired && (
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Select Quantity to Rescue</span>
                    <span className="text-[11px] text-slate-500">
                      {listing.available_quantity} {listing.unit} currently available
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 bg-white border border-slate-300 rounded-xl p-1">
                    <button
                      onClick={() => setClaimQty(Math.max(1, claimQty - 1))}
                      disabled={claimQty <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 font-bold transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-sm w-6 text-center text-slate-900">{claimQty}</span>
                    <button
                      onClick={() => setClaimQty(Math.min(listing.available_quantity, claimQty + 1))}
                      disabled={claimQty >= listing.available_quantity}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-700 font-bold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Savings Live Calculation Display */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Original Value: </span>
                    <span className="line-through text-slate-400 font-medium">₹{originalTotal}</span>
                    <div className="text-sm font-extrabold text-slate-900">
                      FoodLoop Price: <span className="text-emerald-600">₹{totalPrice}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      🔥 YOU SAVE ₹{totalSaved}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isLowStock && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>⚠ Only {listing.available_quantity} portions left! Grab yours before it runs out.</span>
              </div>
            )}
          </div>

          {/* Pickup & Verification Details */}
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Pickup Location:</strong> {listing.pickup_location}
                {listing.travel_estimate && (
                  <p className="text-[11px] text-slate-500">{listing.travel_estimate}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Show your digital pickup pass or 6-digit claim code at the counter.</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isSoldOut ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm tracking-wider cursor-not-allowed uppercase"
              >
                FULLY CLAIMED
              </button>
            ) : isExpired ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm tracking-wider cursor-not-allowed uppercase"
              >
                EXPIRED
              </button>
            ) : (
              <button
                onClick={handleClaim}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Reserving food...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CLAIM {claimQty} {claimQty === 1 ? listing.unit.slice(0, -1) : listing.unit} FOR ₹{totalPrice}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
