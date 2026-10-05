import React, { useState } from 'react';
import { Claim } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle2, MapPin, Clock, Star, Copy, QrCode, Sparkles } from 'lucide-react';

interface ClaimPassModalProps {
  claim: Claim | null;
  onClose: () => void;
  onClaimCompleted: (claim: Claim) => void;
  onOpenRating: (claim: Claim) => void;
}

export const ClaimPassModal: React.FC<ClaimPassModalProps> = ({
  claim,
  onClose,
  onClaimCompleted,
  onOpenRating
}) => {
  const { showToast } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!claim) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(claim.claim_code);
    setCopied(true);
    showToast(`Claim code ${claim.claim_code} copied!`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompletePickup = async () => {
    setIsProcessing(true);
    try {
      const res = await api.claims.complete(claim.id);
      showToast('Pickup completed! Food rescued.', 'success');
      onClaimCompleted(res.claim);
      // Prompt user to review provider
      onOpenRating(res.claim);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to complete pickup';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isCompleted = claim.status === 'COMPLETED';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-100">
              FoodLoop Pickup Pass
            </span>
          </div>

          <h2 className="text-xl font-black font-heading leading-tight">
            {claim.food_name}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {claim.provider_name}
          </p>
        </div>

        {/* Claim Verification Code Card */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 text-center relative overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              SHOW THIS CODE TO COUNTER STAFF
            </span>

            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-slate-950 tracking-wider font-mono">
                {claim.claim_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Copy claim code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {copied && (
              <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                ✓ Copied to clipboard!
              </span>
            )}

            {/* Simulated QR Code Graphic */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-3 text-slate-400 text-xs">
              <QrCode className="w-12 h-12 text-slate-800" />
              <div className="text-left text-[11px]">
                <span className="font-semibold text-slate-700 block">Instant Verification</span>
                <span className="text-slate-400">Scan at cafeteria reader</span>
              </div>
            </div>
          </div>

          {/* Claim Summary */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block">Quantity Claimed</span>
                <strong className="text-sm font-black text-slate-900">{claim.quantity} portion(s)</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Amount Paid</span>
                <strong className="text-sm font-black text-emerald-600">₹{claim.total_price}</strong>
                <span className="text-[10px] text-slate-400 line-through block">₹{claim.original_price * claim.quantity}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
              <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-950 font-bold">Pickup Location:</strong>
                <span className="text-[11px]">{claim.pickup_location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-500 text-[11px] px-1">
              <span>Status: <strong className={isCompleted ? 'text-emerald-700' : 'text-amber-600'}>{claim.status.replace(/_/g, ' ')}</strong></span>
              <span>Claimed: {new Date(claim.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isCompleted ? (
              <button
                onClick={handleCompletePickup}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM PICKUP COMPLETED</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-center text-xs font-bold">
                ✓ Rescued & Completed on {new Date(claim.completed_at || claim.claimed_at).toLocaleDateString()}
              </div>
            )}

            {isCompleted && !claim.has_rated && (
              <button
                onClick={() => {
                  onOpenRating(claim);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Rate & Review Provider</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
