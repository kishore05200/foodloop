import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserDashboardData, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Sparkles, TrendingUp, CheckCircle2, Clock, MapPin, Star, AlertCircle, ChevronRight } from 'lucide-react';

interface UserDashboardProps {
  onOpenPass: (claim: Claim) => void;
  onOpenRating: (claim: Claim) => void;
  onExploreMore: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenPass,
  onOpenRating,
  onExploreMore
}) => {
  const { user, showToast } = useAuth();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const res = await api.dashboard.getUser();
      setData(res);
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleCancelClaim = async (claimId: string) => {
    try {
      await api.claims.cancel(claimId);
      showToast('Claim cancelled. Available quantity restored to listing.', 'info');
      fetchUserData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel claim';
      showToast(msg, 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading your personal FoodLoop impact...</p>
      </div>
    );
  }

  const { metrics, active_claims, recent_claims } = data;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Greeting & Impact Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              RECIPIENT PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading mt-1">
              Welcome, {user?.name || 'Food Hero'}!
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Track your rescued portions, active claim passes, and accumulated grocery savings.
            </p>
          </div>

          <button
            onClick={onExploreMore}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Find More Surplus Food</span>
          </button>
        </div>

        {/* 10. MY FOODLOOP IMPACT HERO CARDS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900 font-heading uppercase tracking-wide">
              MY FOODLOOP IMPACT
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-2xl font-black text-emerald-800 font-heading block">
                🍱 {metrics.meals_rescued}
              </span>
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mt-1">
                Meals Rescued
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5">Nutritious food saved</p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
              <span className="text-2xl font-black text-teal-800 font-heading block">
                💰 ₹{metrics.money_saved.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block mt-1">
                Money Saved
              </span>
              <p className="text-[11px] text-teal-700 mt-0.5">Average 75% discount</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-2xl font-black text-amber-800 font-heading block">
                ♻️ {metrics.food_rescued_kg} kg
              </span>
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block mt-1">
                Food Rescued
              </span>
              <p className="text-[11px] text-amber-700 mt-0.5">Diverted from waste</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <span className="text-2xl font-black text-blue-800 font-heading block">
                📦 {metrics.completed_pickups}
              </span>
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block mt-1">
                Successful Pickups
              </span>
              <p className="text-[11px] text-blue-700 mt-0.5">100% smooth pickups</p>
            </div>
          </div>
        </div>

        {/* Active Claims / Ready for Pickup Passes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Active Claim Passes ({active_claims.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Show verification code at counter</span>
          </div>

          {active_claims.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {active_claims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border-2 border-emerald-300 p-5 shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        READY FOR PICKUP
                      </span>
                      <span className="text-xs font-black text-slate-950 font-mono">
                        CODE: {claim.claim_code}
                      </span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <img
                        src={claim.image_url}
                        alt={claim.food_name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {claim.food_name}
                        </h4>
                        <p className="text-xs text-slate-500">{claim.provider_name}</p>
                        <p className="text-xs font-bold text-emerald-700">
                          {claim.quantity} portion(s) · Paid ₹{claim.total_price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{claim.pickup_location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onOpenPass(claim)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider transition-colors shadow-2xs"
                    >
                      View Pickup Pass
                    </button>
                    <button
                      onClick={() => handleCancelClaim(claim.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs transition-colors"
                      title="Cancel claim and release portions back to cafeteria"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No active pickup claims right now</h3>
              <p className="text-xs text-slate-500">
                Browse today&rsquo;s surplus items from nearby cafeterias to rescue discounted meals.
              </p>
              <button
                onClick={onExploreMore}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Browse Marketplace
              </button>
            </div>
          )}
        </div>

        {/* Claim History & Reviews */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Completed Food Rescues History
          </h3>

          {recent_claims.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recent_claims.map((claim) => (
                <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={claim.image_url}
                      alt={claim.food_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{claim.food_name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {claim.provider_name} · {claim.quantity} portion(s)
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(claim.claimed_at).toLocaleDateString()} at{' '}
                        {new Date(claim.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:self-center">
                    <div className="text-right text-xs">
                      <span className="font-bold text-emerald-700 block">Saved ₹{claim.total_saved}</span>
                      <span className="text-[11px] text-slate-500">Paid ₹{claim.total_price}</span>
                    </div>

                    {claim.status === 'COMPLETED' ? (
                      claim.has_rated ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenRating(claim)}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          Rate
                        </button>
                      )
                    ) : (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg capitalize">
                        {claim.status.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
