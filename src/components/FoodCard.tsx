import React, { useState, useEffect } from 'react';
import { FoodListing } from '../types';
import { MapPin, Clock, Flame, Star, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface FoodCardProps {
  listing: FoodListing;
  onSelect: (listing: FoodListing) => void;
  onClaimDirect: (listing: FoodListing) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ listing, onSelect, onClaimDirect }) => {
  const [timeLeft, setTimeLeft] = useState<{ text: string; urgentLevel: 'normal' | 'soon' | 'critical' | 'expired' }>({
    text: '',
    urgentLevel: 'normal'
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const exp = new Date(listing.expiry_at).getTime();
      const diff = exp - now;

      if (diff <= 0 || listing.status === 'EXPIRED') {
        setTimeLeft({ text: 'Expired', urgentLevel: 'expired' });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours === 0 && minutes <= 20) {
        setTimeLeft({ text: `${minutes}m remaining`, urgentLevel: 'critical' });
      } else if (hours === 0) {
        setTimeLeft({ text: `${minutes} mins left`, urgentLevel: 'soon' });
      } else if (hours < 3) {
        setTimeLeft({ text: `${hours}h ${minutes}m left`, urgentLevel: 'soon' });
      } else {
        setTimeLeft({ text: `Expires in ${hours}h`, urgentLevel: 'normal' });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [listing.expiry_at, listing.status]);

  const isExpired = listing.status === 'EXPIRED' || timeLeft.urgentLevel === 'expired';
  const isSoldOut = listing.available_quantity === 0 || listing.status === 'FULLY_CLAIMED';
  const isLowStock = !isSoldOut && listing.available_quantity <= 3;
  const savings = listing.original_price - listing.foodloop_price;

  // Status visual dot & label
  let statusBadge = (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Available
    </span>
  );

  if (isExpired) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span> Expired
      </span>
    );
  } else if (isSoldOut) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Fully Claimed
      </span>
    );
  } else if (timeLeft.urgentLevel === 'critical') {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span> Almost Expired
      </span>
    );
  } else if (timeLeft.urgentLevel === 'soon') {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Expiring Soon
      </span>
    );
  }

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      <div>
        {/* Card Image and Floating Badges */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={listing.image_url}
            alt={listing.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSoldOut || isExpired ? 'grayscale-50 opacity-75' : ''
            }`}
          />

          {/* Discount Badge */}
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>{listing.discount_percentage}% OFF</span>
          </div>

          {/* Expiry Badge */}
          <div
            className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs flex items-center gap-1 ${
              timeLeft.urgentLevel === 'critical'
                ? 'bg-rose-950/80 text-rose-100 border border-rose-500'
                : timeLeft.urgentLevel === 'soon'
                ? 'bg-amber-950/80 text-amber-100'
                : 'bg-slate-900/80 text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{timeLeft.text}</span>
          </div>

          {/* Bottom gradient on image */}
          <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-3">
            <span className="text-white text-[11px] font-medium tracking-wide">
              {listing.category} · {listing.provider_name}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Metadata Row: Status & Rating */}
          <div className="flex items-center justify-between text-xs">
            {statusBadge}
            <div className="flex items-center gap-1 text-slate-700 font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{listing.provider_rating || 4.8}</span>
              <span className="text-slate-400 font-normal">({listing.provider_reviews_count || 24})</span>
            </div>
          </div>

          {/* Food Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 font-heading">
            {listing.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          {/* Pricing Row: Strong visual contrast */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ₹{listing.original_price}
                </span>
                <span className="text-xl font-black text-slate-950">
                  ₹{listing.foodloop_price}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">per {listing.unit}</span>
            </div>

            <div className="text-right">
              <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded">
                SAVE ₹{savings}
              </span>
            </div>
          </div>

          {/* Availability and Location */}
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">
                {isSoldOut ? (
                  <span className="text-rose-600 font-bold">0 {listing.unit} left</span>
                ) : (
                  <span>
                    <strong className="text-slate-900 font-bold">{listing.available_quantity}</strong> {listing.unit} available
                  </span>
                )}
              </span>

              {isLowStock && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 animate-bounce">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Only {listing.available_quantity} left!
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{listing.pickup_location}</span>
            </div>

            {listing.travel_estimate && (
              <p className="text-[10px] text-slate-400 pl-5">
                {listing.travel_estimate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        {isSoldOut ? (
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs tracking-wider cursor-not-allowed uppercase"
          >
            Fully Claimed
          </button>
        ) : isExpired ? (
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs tracking-wider cursor-not-allowed uppercase"
          >
            Expired
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClaimDirect(listing);
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>CLAIM FOOD (₹{listing.foodloop_price})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
