import React, { useState } from 'react';
import { Claim, Rating } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Star, Sparkles, Send } from 'lucide-react';

interface RatingModalProps {
  claim: Claim | null;
  onClose: () => void;
  onRatingSubmitted: (rating: Rating) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  claim,
  onClose,
  onRatingSubmitted
}) => {
  const { showToast } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!claim) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.ratings.create(claim.id, rating, review);
      showToast('Thank you for rating! Your review supports our surplus kitchen partners.', 'success');
      onRatingSubmitted(res.rating);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit rating';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-amber-500 text-slate-950 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-900" />
            <h2 className="text-lg font-black font-heading">Rate Your Food Rescue</h2>
          </div>
          <button onClick={onClose} className="text-slate-900/70 hover:text-slate-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-slate-900">{claim.food_name}</h3>
            <p className="text-slate-500">From {claim.provider_name}</p>
          </div>

          {/* 5-star interactive picker */}
          <div className="flex justify-center items-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      active
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-center font-bold text-xs text-slate-700">
            {rating === 5 && '★★★★★ Excellent · Fresh, warm, and prompt pickup!'}
            {rating === 4 && '★★★★☆ Great · Wholesome meal and easy handoff'}
            {rating === 3 && '★★★☆☆ Good · Fair value for surplus portion'}
            {rating <= 2 && 'Needs improvement'}
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Feedback / Review Notes
            </label>
            <textarea
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="e.g. Food was fresh and pickup was easy. Definitely rescuing again!"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Review...' : 'SUBMIT REVIEW'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
