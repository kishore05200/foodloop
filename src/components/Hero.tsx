import React from 'react';
import { ArrowRight, Sparkles, TrendingDown, Clock, ShieldCheck, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeroProps {
  onFindFood: () => void;
  onListFood: () => void;
  impactMetrics?: {
    meals: number;
    money: number;
    wasteKg: number;
    people: number;
  };
}

export const Hero: React.FC<HeroProps> = ({ onFindFood, onListFood, impactMetrics }) => {
  const { switchPersona, user } = useAuth();

  const metrics = impactMetrics || {
    meals: 2450,
    money: 86500,
    wasteKg: 1100,
    people: 1240
  };

  const handleListFoodClick = () => {
    if (user?.role !== 'PROVIDER' && user?.role !== 'ADMIN') {
      // Promptly switch to provider so they can list surplus food
      switchPersona('PROVIDER').then(() => {
        onListFood();
      });
    } else {
      onListFood();
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-10 pb-16 md:pt-16 md:pb-24 border-b border-slate-200">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-emerald-200/40 via-teal-100/30 to-amber-100/30 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>&ldquo;Don&rsquo;t waste it. Discount it. Rescue it.&rdquo;</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.08] font-heading">
                Turning Surplus Food Into <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-4">Opportunity</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed pt-2 max-w-2xl">
                Buy quality surplus meals from college cafeterias, bakeries, and restaurants at <strong className="text-slate-900 font-semibold">up to 75% off (~1/4 price)</strong> while helping prevent edible food waste.
              </p>
            </div>

            {/* Price model teaser strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-200/80 shadow-xs max-w-xl">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <Flame className="w-4 h-4 fill-rose-500 text-rose-500" /> 75% OFF
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-emerald-600" /> ₹120 meal listed at ₹30
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" /> Fast 10-minute pickup
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onFindFood}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>FIND SURPLUS FOOD</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleListFoodClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border-2 border-slate-300 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>LIST SURPLUS FOOD</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Providers</span>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Quality & Hygiene Inspected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Same-day Fresh Pickup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Surplus Food Hero Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-5 overflow-hidden">
              {/* Highlight ribbon */}
              <div className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-white" /> 75% OFF
              </div>

              {/* Food Image */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
                  alt="Chicken Rice Box with Raita"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                  📍 North Campus Block B · 1.2 km
                </div>
              </div>

              {/* Title & Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>College Central Cafeteria</span>
                  <span className="text-emerald-700 font-semibold">⭐ 4.8 (34 reviews)</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Chicken Rice Box with Fresh Raita
                </h3>

                {/* Strong Visual Pricing */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through">₹120</span>
                    <div className="text-2xl font-black text-slate-900">
                      ₹30 <span className="text-xs font-semibold text-slate-500">/ portion</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                      SAVE ₹90
                    </span>
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      ⏰ Expires in 2 hours
                    </p>
                  </div>
                </div>

                <button
                  onClick={onFindFood}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs tracking-wider transition-colors"
                >
                  CLAIM AT ₹30 (75% OFF)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Statistics Counter Strip */}
        <div className="mt-14 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-3xl font-extrabold text-emerald-600 font-heading">
                🍱 {metrics.meals.toLocaleString()}+
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
                Food Rescued
              </p>
              <p className="text-[11px] text-slate-400">Edible portions saved</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-3xl font-extrabold text-teal-600 font-heading">
                💰 ₹{metrics.money.toLocaleString()}+
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
                Money Saved
              </p>
              <p className="text-[11px] text-slate-400">By students & neighbors</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-3xl font-extrabold text-amber-600 font-heading">
                ♻️ {metrics.wasteKg.toLocaleString()} kg
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
                Food Waste Prevented
              </p>
              <p className="text-[11px] text-slate-400">Diverted from landfills</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-3xl font-extrabold text-blue-600 font-heading">
                👥 {metrics.people.toLocaleString()}+
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wider">
                People Served
              </p>
              <p className="text-[11px] text-slate-400">Happy community members</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
