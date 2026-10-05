import React from 'react';
import { Heart, Sparkles, Store, ShieldCheck, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAddModal }) => {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Callout: Main Competitor Differentiator Message */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-8 border border-emerald-800/40 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              THE FOODLOOP MISSION
            </span>
            <h3 className="text-2xl font-black font-heading text-white">
              &ldquo;Don&rsquo;t waste it. Discount it. Rescue it.&rdquo;
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every day, wholesome meals from campus canteens and local restaurants go unconsumed. FoodLoop enables providers to list at ~1/4 price (75% OFF) so students and neighbors rescue it in minutes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider transition-colors shadow-md"
            >
              FIND SURPLUS FOOD
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs tracking-wider transition-colors"
            >
              BECOME A PROVIDER
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-slate-400">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold font-heading">
                FL
              </div>
              <span className="text-lg font-black text-white font-heading tracking-tight">
                FOOD<span className="text-emerald-500">LOOP</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Turning Surplus Food Into Opportunity. Real-time surplus marketplace for college campuses, caterers, and neighborhoods.
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Marketplace
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-emerald-400 transition-colors">
                  All Surplus Food
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('expiring')} className="hover:text-rose-400 transition-colors">
                  Expiring Soon (Last Hour)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-emerald-400 transition-colors">
                  College Cafeteria Meals
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Bakery Combos & Snacks
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Impact & Platform
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActiveTab('impact')} className="hover:text-emerald-400 transition-colors">
                  Rescue Value Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('how-it-works')} className="hover:text-emerald-400 transition-colors">
                  How FoodLoop Works
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('impact')} className="hover:text-emerald-400 transition-colors">
                  Environmental CO₂ Savings
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('impact')} className="hover:text-emerald-400 transition-colors">
                  Provider Rating Leaderboard
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Provider Hub
            </span>
            <p className="text-[11px] text-slate-400">
              Run a campus canteen, bakery, or catering business? Reduce food waste today.
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <Store className="w-3.5 h-3.5" />
              <span>List Surplus Portions</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 FoodLoop. Turning Surplus Food Into Opportunity. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              FSSAI Hygiene Inspected
            </span>
            <span>·</span>
            <span>Zero Food Waste Movement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
