import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserLocation } from '../types';
import { X, MapPin, Navigation, Compass } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS: UserLocation[] = [
  { name: 'North Campus Library', lat: 12.9716, lng: 77.5946 },
  { name: 'Tech Park East Hub', lat: 12.9740, lng: 77.5990 },
  { name: 'South Avenue Market', lat: 12.9690, lng: 77.5890 },
  { name: 'Downtown Central Square', lat: 12.9800, lng: 77.6000 }
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { userLocation, setUserLocation, showToast } = useAuth();

  if (!isOpen) return null;

  const handleSelectLocation = (loc: UserLocation) => {
    setUserLocation(loc);
    showToast(`Location set to: ${loc.name}. Distances updated!`, 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-heading">Choose Your Location</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            Select your current simulated neighborhood or campus gate to see exact walking times and distances to each food rescue point:
          </p>

          <div className="space-y-2">
            {PRESET_LOCATIONS.map((loc) => {
              const isCurrent = userLocation.name === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="block font-bold">{loc.name}</span>
                      <span className="text-[10px] text-slate-500">
                        GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Marketplace automatically recalculates walking and travel estimates.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
