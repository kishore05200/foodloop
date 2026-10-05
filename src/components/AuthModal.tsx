import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { X, Lock, Mail, User, Phone, Sparkles, Shield, Store } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const { login, register, switchPersona } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, phone, password, role });
      }
      onClose();
    } catch {
      // Toast handles error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPersona = async (personaRole: UserRole) => {
    await switchPersona(personaRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
              FoodLoop Network
            </span>
          </div>

          <h2 className="text-xl font-bold font-heading">
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access your food claims, active passes, and impact metrics'
              : 'Join as a recipient to rescue food or as a provider to list surplus'}
          </p>
        </div>

        {/* Quick Persona Fill Banner */}
        <div className="bg-slate-100 p-3.5 border-b border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Instant 1-Click Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPersona('USER')}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-[11px] font-bold text-slate-800 border border-slate-200 text-center transition-colors"
            >
              👤 Recipient
            </button>
            <button
              type="button"
              onClick={() => handleQuickPersona('PROVIDER')}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-[11px] font-bold text-slate-800 border border-slate-200 text-center transition-colors"
            >
              🏪 Provider
            </button>
            <button
              type="button"
              onClick={() => handleQuickPersona('ADMIN')}
              className="px-2 py-1.5 rounded-lg bg-white hover:bg-purple-50 text-[11px] font-bold text-slate-800 border border-slate-200 text-center transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Full Name / Kitchen Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Sharma or Campus Bistro"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                      role === 'USER'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="block text-xs">Recipient</span>
                      <span className="text-[10px] text-slate-400 font-normal">Claim surplus</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('PROVIDER')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${
                      role === 'PROVIDER'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="block text-xs">Provider</span>
                      <span className="text-[10px] text-slate-400 font-normal">List surplus</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-slate-800 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider transition-colors shadow-md shadow-emerald-600/20"
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'login'
                ? 'SIGN IN TO FOODLOOP'
                : 'REGISTER ACCOUNT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
