import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminDashboardData } from '../types';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Store, ListOrdered, ShoppingBag, RotateCcw, RefreshCw, Trash2, CheckCircle2, Clock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'claims' | 'users' | 'providers'>('listings');

  const fetchAdminData = async () => {
    try {
      const res = await api.dashboard.getAdmin();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResetDb = async () => {
    if (!confirm('Reset database to clean initial state with pre-populated sample listings and users?')) return;
    try {
      await api.dashboard.resetAdminDb();
      showToast('Database reset to clean sample demo data!', 'success');
      fetchAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      showToast(msg, 'error');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Admin: delete this listing?')) return;
    try {
      await api.listings.delete(id);
      showToast('Listing removed by Admin.', 'info');
      fetchAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      showToast(msg, 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading Admin Management Console...</p>
      </div>
    );
  }

  const { metrics, users, food_listings, claims } = data;
  const providers = users.filter(u => u.role === 'PROVIDER');

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
              SYSTEM OVERVIEW & AUDIT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading mt-1">
              FoodLoop Administration
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Full visibility across accounts, surplus inventories, claims, and regulatory rescue records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="Refresh tables"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetDb}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>

        {/* 17. SYSTEM METRICS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Users</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-heading">{metrics.total_users}</div>
            <span className="text-[10px] text-slate-400">Registered</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Providers</span>
            <div className="text-2xl font-black text-amber-600 mt-1 font-heading">{metrics.total_providers}</div>
            <span className="text-[10px] text-slate-400">Active kitchens</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Listings</span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-heading">{metrics.total_listings}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">{metrics.active_listings} active live</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Claims</span>
            <div className="text-2xl font-black text-blue-600 mt-1 font-heading">{metrics.total_claims}</div>
            <span className="text-[10px] text-blue-700">{metrics.completed_claims} picked up</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Food Rescued</span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-heading">{metrics.total_food_rescued_kg} kg</div>
            <span className="text-[10px] text-emerald-700 font-medium">₹{metrics.total_money_saved} saved</span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveSubTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'listings'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Food Listings ({food_listings.length})
          </button>

          <button
            onClick={() => setActiveSubTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'claims'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Customer Claims ({claims.length})
          </button>

          <button
            onClick={() => setActiveSubTab('providers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'providers'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Food Providers ({providers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeSubTab === 'users'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Users ({users.length})
          </button>
        </div>

        {/* Tab 1: Food Listings Table */}
        {activeSubTab === 'listings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {food_listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-slate-600">{item.provider_name}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹{item.foodloop_price} <span className="line-through text-slate-400 font-normal">₹{item.original_price}</span>
                    </td>
                    <td className="py-3 px-4">{item.available_quantity}/{item.quantity}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.expiry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Claims Table */}
        {activeSubTab === 'claims' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Claim ID & Code</th>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Qty & Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {claim.claim_code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{claim.food_name}</td>
                    <td className="py-3 px-4 text-slate-700">{claim.user_name}</td>
                    <td className="py-3 px-4 text-slate-600">{claim.provider_name}</td>
                    <td className="py-3 px-4">
                      {claim.quantity} portion(s) · <strong className="text-emerald-700">₹{claim.total_price}</strong>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        claim.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Providers Table */}
        {activeSubTab === 'providers' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Provider Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-slate-600">{p.email}</td>
                    <td className="py-3 px-4 text-slate-600">{p.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: All Users Table */}
        {activeSubTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-600">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-900' : u.role === 'PROVIDER' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
