import React from 'react';
import { FoodListing } from '../types';
import { Flame, Clock, ArrowRight, AlertCircle } from 'lucide-react';

interface ExpiringSoonSectionProps {
  listings: FoodListing[];
  onSelect: (listing: FoodListing) => void;
  onClaimDirect: (listing: FoodListing) => void;
  onViewAllExpiring: () => void;
}

export const ExpiringSoonSection: React.FC<ExpiringSoonSectionProps> = ({
  listings,
  onSelect,
  onClaimDirect,
  onViewAllExpiring
}) => {
  // Filter for items expiring within next 2 hours and not fully claimed
  const now = Date.now();
  const expiringItems = listings
    .filter(item => {
      const exp = new Date(item.expiry_at).getTime();
      return (
        item.status !== 'EXPIRED' &&
        item.available_quantity > 0 &&
        exp > now &&
        exp - now <= 2.5 * 60 * 60 * 1000 // 2.5 hours
      );
    })
    .sort((a, b) => new Date(a.expiry_at).getTime() - new Date(b.expiry_at).getTime());

  if (expiringItems.length === 0) {
    return null;
  }

  const getTimeString = (expiryAt: string) => {
    const diff = new Date(expiryAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins} minutes remaining`;
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <section className="py-12 bg-rose-50/60 border-b border-rose-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Alert styling */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
              <span>URGENT RESCUE OPPORTUNITY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2 font-heading">
              <span>🚨 EXPIRING SOON</span>
            </h2>
            <p className="text-xs text-slate-600">
              These nutritious surplus meals will be discarded if not claimed in the next couple of hours. Rescue them at 75% OFF!
            </p>
          </div>

          <button
            onClick={onViewAllExpiring}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-white hover:bg-rose-100 px-4 py-2 rounded-xl border border-rose-200 shadow-2xs transition-colors"
          >
            <span>View All Expiring Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expiring Cards Carousel/Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {expiringItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white rounded-2xl border-2 border-rose-200 shadow-md hover:shadow-xl hover:border-rose-400 transition-all p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-white" />
                    <span>{item.discount_percentage}% OFF</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-rose-950/85 backdrop-blur-xs text-rose-100 text-xs font-bold px-2.5 py-1 rounded flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      {getTimeString(item.expiry_at)}
                    </span>
                    <span className="text-[10px] text-rose-300">
                      {item.available_quantity} {item.unit} left
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{item.provider_name}</span>
                    <span className="text-emerald-700 font-semibold">{item.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>

                  <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200/80 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-slate-400 line-through">₹{item.original_price}</span>
                      <span className="text-lg font-black text-rose-600">₹{item.foodloop_price}</span>
                    </div>
                    <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                      Save ₹{item.original_price - item.foodloop_price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClaimDirect(item);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider shadow-sm shadow-rose-600/20 transition-all flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>CLAIM NOW & RESCUE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
