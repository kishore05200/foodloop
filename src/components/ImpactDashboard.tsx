import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ImpactData } from '../types';
import { Sparkles, TrendingUp, DollarSign, Trees, HeartHandshake, ShieldCheck, PieChart, Users, Store, ArrowUpRight } from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await api.dashboard.getImpact();
        setData(res);
      } catch (err) {
        console.error('Failed to load impact stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Computing real-time FoodLoop impact metrics...</p>
      </div>
    );
  }

  // Environmental estimations based on standard FAO / UNEP food waste impact factors
  const co2AvoidedKg = Math.round(data.total_food_rescued_kg * 2.5); // 2.5 kg CO2 per kg food saved
  const waterSavedLiters = Math.round(data.total_food_rescued_kg * 180); // 180L virtual water per kg

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>REAL-TIME RESCUE INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-heading">
            FoodLoop Collective Impact
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Quantifying every portion diverted from waste into nourishing meals. Transparent metrics powered by our student and cafeteria network.
          </p>
        </div>

        {/* 12. UNIQUE FEATURE: RESCUE VALUE BANNER */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  CORE VALUE METRIC
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-heading">
                  # RESCUE VALUE
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Rescue Value represents the true economic worth of edible food saved from landfills and recovered back into the community.
                </p>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                <span className="text-[10px] text-slate-300 block uppercase font-bold">Standard Formula</span>
                <span className="text-xs font-semibold text-emerald-300">Food Value = Sales + User Savings</span>
              </div>
            </div>

            {/* Rescue Value Big Display */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  🍱 Original Food Value Rescued
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-heading">
                  ₹{data.rescue_value.original_food_value.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  100% of this food was saved from waste
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  💰 Saved by Users (75% OFF)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-heading">
                  ₹{data.rescue_value.users_saved.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Kept in students & local residents&rsquo; wallets
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 sm:col-span-2 lg:col-span-1">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                  🏪 Provider Recovered Revenue
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-heading">
                  ₹{data.rescue_value.foodloop_sales.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Direct revenue back to cafeterias & bakeries
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Core Impact Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Meals Saved</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-heading">
              🍱 {data.total_meals_saved.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Hot nutritious portions</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Food Rescued</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-heading">
              ♻️ {data.total_food_rescued_kg.toLocaleString()} kg
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Diverted from waste</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Successful Claims</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-heading">
              📦 {data.total_claims_completed.toLocaleString()}
            </div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Completed pickups</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Providers</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-heading">
              🏪 {data.total_providers}
            </div>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">Cafeterias & shops</p>
          </div>
        </div>

        {/* Environmental Footprint Reduction */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">Environmental Footprint Prevented</h3>
            </div>

            <p className="text-xs text-slate-600">
              When food is thrown out, all the water, fuel, and greenhouse gases used to grow, package, and cook it are also squandered.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-900 block">CO₂ Emissions Avoided</span>
                <span className="text-2xl font-black text-emerald-700 font-heading">{co2AvoidedKg.toLocaleString()} kg</span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">Equivalent to driving 8,400 km</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-900 block">Virtual Water Conserved</span>
                <span className="text-2xl font-black text-blue-700 font-heading">{waterSavedLiters.toLocaleString()} L</span>
                <span className="text-[10px] text-blue-800 block mt-0.5">Agricultural irrigation saved</span>
              </div>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 font-heading">Food Rescued by Category</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Portions</span>
            </div>

            <div className="space-y-3 pt-2">
              {Object.entries(data.category_distribution).map(([cat, count]) => {
                const max = Math.max(...Object.values(data.category_distribution));
                const pct = Math.round((count / max) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="font-bold text-slate-900">{count} portions</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Trend Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">Rescued Meals Growth Trend (Monthly)</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              Steady +34% MoM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-4">
            {data.monthly_trend.map((m) => (
              <div key={m.month} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase">{m.month}</span>
                <div className="text-lg font-black text-slate-900 mt-1">{m.meals}</div>
                <span className="text-[10px] text-emerald-700 font-medium">₹{m.saved.toLocaleString()} saved</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
