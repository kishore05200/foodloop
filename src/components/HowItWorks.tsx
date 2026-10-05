import React from 'react';
import { Store, Tag, Compass, ShoppingBag, MapPin, CheckCircle2, HeartHandshake, Trees } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'PROVIDERS LIST SURPLUS',
      desc: 'College cafeterias, bakeries, event caterers, and restaurants list quality surplus food that would otherwise go unconsumed.',
      icon: Store,
      badge: 'Surplus Added'
    },
    {
      num: '02',
      title: 'FOOD IS DISCOUNTED',
      desc: 'FoodLoop automatically prices items at approximately 25% (1/4) of the original price, offering steep 75% OFF savings.',
      icon: Tag,
      badge: '75% OFF'
    },
    {
      num: '03',
      title: 'USERS DISCOVER NEARBY FOOD',
      desc: 'Nearby students, workers, and neighbors browse available listings, filtering by distance, category, and expiry window.',
      icon: Compass,
      badge: 'Location-Based'
    },
    {
      num: '04',
      title: 'USERS CLAIM FOOD',
      desc: 'Users reserve portions instantly online. The available quantity updates in real-time, preventing double booking.',
      icon: ShoppingBag,
      badge: 'Live Stock'
    },
    {
      num: '05',
      title: 'USERS PICK UP',
      desc: 'Recipients head to the pickup counter with their 6-digit claim pass code during the designated time window.',
      icon: MapPin,
      badge: 'Fast Pickup'
    },
    {
      num: '06',
      title: 'FOOD IS RESCUED',
      desc: 'Meals are safely enjoyed, money is saved, provider recovers costs, and zero food ends up wasted in landfills.',
      icon: CheckCircle2,
      badge: 'Impact Logged'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            THE FOODLOOP CYCLE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-3 font-heading">
            How FoodLoop Works
          </h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            A frictionless 6-step loop converting surplus meals into affordable nourishment before they reach their expiry timestamp.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors font-heading">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 shadow-2xs mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Win-Win Stakeholder Section */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold font-heading">The FoodLoop Win-Win Ecosystem</h3>
            <p className="text-xs text-slate-300 mt-2">
              Every rescued portion creates mutual value across all participants.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <Store className="w-4 h-4" /> PROVIDERS
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recovers ingredient costs, eliminates waste disposal fees, and introduces fresh nearby patrons.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <ShoppingBag className="w-4 h-4" /> RECIPIENTS
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enjoy hot, chef-prepared meals for 75% less, slashing monthly dining expenses dramatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm mb-2">
                <Trees className="w-4 h-4" /> ENVIRONMENT
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reduces landfill methane generation and conserves agricultural water and carbon emissions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                <HeartHandshake className="w-4 h-4" /> COMMUNITY
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dignified, stigma-free access to delicious food that brings campus and neighborhood together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
