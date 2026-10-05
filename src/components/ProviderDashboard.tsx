import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ProviderDashboardData, FoodListing, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Store, Flame, Edit, Trash2, CheckCircle2, Clock, MapPin, Star, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface ProviderDashboardProps {
  onOpenAddModal: () => void;
  onEditListing: (listing: FoodListing) => void;
  onViewListing: (listing: FoodListing) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onOpenAddModal,
  onEditListing,
  onViewListing
}) => {
  const { user, showToast } = useAuth();
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProviderData = async () => {
    try {
      const res = await api.dashboard.getProvider();
      setData(res);
    } catch (err) {
      console.error('Failed to load provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleDeleteListing = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete listing "${name}"?`)) return;
    try {
      await api.listings.delete(id);
      showToast(`Listing "${name}" deleted.`, 'info');
      fetchProviderData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      showToast(msg, 'error');
    }
  };

  const handleMarkClaimComplete = async (claimId: string) => {
    try {
      await api.claims.complete(claimId);
      showToast('Pickup verified and marked completed!', 'success');
      fetchProviderData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete claim';
      showToast(msg, 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading provider kitchen console...</p>
      </div>
    );
  }

  const { metrics, all_listings, recent_claims, reviews } = data;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              FOOD PROVIDER CONSOLE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading mt-1">
              {user?.name || 'Kitchen Hub'} Dashboard
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Manage surplus food listings, track customer claims, and review revenue recovered.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProviderData}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Refresh console"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>List New Surplus Food</span>
            </button>
          </div>
        </div>

        {/* 10. PROVIDER METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Food Listed</span>
            <div className="text-xl font-black text-slate-900 mt-1">{metrics.total_food_listed}</div>
            <span className="text-[10px] text-slate-400">Total portions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Claimed / Rescued</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{metrics.total_food_sold}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Safe pickups</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Food Rescued</span>
            <div className="text-xl font-black text-amber-600 mt-1">{metrics.total_food_rescued_kg} kg</div>
            <span className="text-[10px] text-slate-400">Kept from landfill</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Revenue</span>
            <div className="text-xl font-black text-teal-600 mt-1">₹{metrics.total_revenue}</div>
            <span className="text-[10px] text-teal-700 font-medium">Recovered funds</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Discount Given</span>
            <div className="text-xl font-black text-rose-600 mt-1">₹{metrics.total_discount_given}</div>
            <span className="text-[10px] text-slate-400">75% subsidy value</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Listings</span>
            <div className="text-xl font-black text-blue-600 mt-1">{metrics.active_listings_count}</div>
            <span className="text-[10px] text-slate-400">Available live</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Provider Rating</span>
            <div className="text-xl font-black text-amber-500 mt-1 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{metrics.average_rating}</span>
            </div>
            <span className="text-[10px] text-slate-400">{metrics.reviews_count} reviews</span>
          </div>
        </div>

        {/* Listings Management Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              My Surplus Food Listings ({all_listings.length})
            </h2>
            <button
              onClick={onOpenAddModal}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-4">Original vs FoodLoop Price</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Available Qty</th>
                  <th className="py-3 px-4">Expiry Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {all_listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-xs">{item.name}</span>
                          <span className="text-[11px] text-slate-400">{item.category}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      <span className="line-through text-slate-400 mr-1.5">₹{item.original_price}</span>
                      <strong className="text-slate-900 font-bold">₹{item.foodloop_price}</strong>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {item.discount_percentage}% OFF
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {item.available_quantity} / {item.quantity} {item.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(item.expiry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'LOW_STOCK'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'FULLY_CLAIMED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => onEditListing(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-block"
                        title="Edit listing"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item.id, item.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors inline-block"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claims & Pickups Verification Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-heading">
            Recent Incoming Customer Claims ({recent_claims.length})
          </h2>

          {recent_claims.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recent_claims.map((claim) => (
                <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{claim.food_name}</span>
                      <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        CODE: {claim.claim_code}
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Claimed by <strong>{claim.user_name}</strong> · {claim.quantity} portion(s) · Paid ₹{claim.total_price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {claim.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleMarkClaimComplete(claim.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify Pickup</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg">
                        ✓ Pickup Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">No claims received yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
