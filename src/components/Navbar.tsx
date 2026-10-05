import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, User, LogOut, Shield, Store, ShoppingBag, BarChart3, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAuthModal,
  onOpenLocationModal
}) => {
  const { user, logout, switchPersona, userLocation } = useAuth();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Persona Switcher Bar for Seamless Testing */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">DEMO PERSONAS:</span>
            <span className="text-slate-400 hidden sm:inline">Switch view to test different flows:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => switchPersona('USER')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                user?.role === 'USER'
                  ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              👤 Recipient User (Ananya)
            </button>

            <button
              onClick={() => switchPersona('PROVIDER')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                user?.role === 'PROVIDER'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🏪 Food Provider (Cafeteria)
            </button>

            <button
              onClick={() => switchPersona('ADMIN')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🛡️ Admin Console
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl font-bold font-heading">FL</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                    FOOD<span className="text-emerald-600">LOOP</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    Surplus
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                  Turning Surplus Food Into Opportunity
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`transition-colors pb-0.5 ${
                  activeTab === 'marketplace'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Find Surplus Food
              </button>

              <button
                onClick={() => setActiveTab('expiring')}
                className={`flex items-center gap-1.5 transition-colors pb-0.5 ${
                  activeTab === 'expiring'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Expiring Soon
              </button>

              <button
                onClick={() => setActiveTab('impact')}
                className={`transition-colors pb-0.5 ${
                  activeTab === 'impact'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Impact & Rescue Value
              </button>

              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`transition-colors pb-0.5 ${
                  activeTab === 'how-it-works'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                How It Works
              </button>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Location Selector */}
            <button
              onClick={onOpenLocationModal}
              title="Change your simulated location"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors border border-slate-200"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium truncate max-w-[130px]">{userLocation.name}</span>
            </button>

            {/* Provider Add Food Button */}
            {(user?.role === 'PROVIDER' || user?.role === 'ADMIN') && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Surplus Food</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

            {/* User Dashboard / Claims Shortcut */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        ROLE: {user.role}
                      </span>
                    </div>

                    {user.role === 'USER' && (
                      <button
                        onClick={() => {
                          setActiveTab('user-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        My Rescues & Claims
                      </button>
                    )}

                    {user.role === 'PROVIDER' && (
                      <button
                        onClick={() => {
                          setActiveTab('provider-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Store className="w-4 h-4 text-amber-600" />
                        Provider Dashboard
                      </button>
                    )}

                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin-dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Management Console
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('impact');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      Platform Impact
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-2 py-1 rounded ${activeTab === 'marketplace' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
          >
            Find Food
          </button>
          <button
            onClick={() => setActiveTab('expiring')}
            className={`px-2 py-1 rounded ${activeTab === 'expiring' ? 'text-rose-700 bg-rose-50' : 'text-slate-600'}`}
          >
            Expiring Soon
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-2 py-1 rounded ${activeTab === 'impact' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
          >
            Impact
          </button>
          <button
            onClick={() => {
              if (user?.role === 'PROVIDER') setActiveTab('provider-dashboard');
              else if (user?.role === 'ADMIN') setActiveTab('admin-dashboard');
              else setActiveTab('user-dashboard');
            }}
            className="px-2 py-1 text-slate-600"
          >
            Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};
