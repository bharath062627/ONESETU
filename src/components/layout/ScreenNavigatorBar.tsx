import React from 'react';
import { store } from '../../services/store';
import { ScreenId } from '../../types';
import {
  Smartphone,
  Monitor,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ScreenNavigatorBarProps {
  currentScreen: ScreenId;
  viewMode: 'mobile' | 'responsive';
  onToggleViewMode: () => void;
  onResetData: () => void;
}

export const ScreenNavigatorBar: React.FC<ScreenNavigatorBarProps> = ({
  currentScreen,
  viewMode,
  onToggleViewMode,
  onResetData
}) => {
  const screensList: { id: ScreenId; label: string; number: number }[] = [
    { id: 'splash', label: '1. Splash Screen', number: 1 },
    { id: 'onboarding', label: '2. Onboarding', number: 2 },
    { id: 'auth', label: '3. Login / Sign Up', number: 3 },
    { id: 'roles', label: '4. Role Selection', number: 4 },
    { id: 'home', label: '5. Home Dashboard', number: 5 },
    { id: 'search', label: '6. Search Results', number: 6 },
    { id: 'farm', label: '7. Farm - Produce Market', number: 7 },
    { id: 'market-comparison', label: '8. Market Comparison', number: 8 },
    { id: 'work', label: '9. Work - Service Providers', number: 9 },
    { id: 'provider-detail', label: '10. Provider Details & Booking', number: 10 },
    { id: 'medical', label: '11. Medical - Emergency', number: 11 },
    { id: 'move', label: '12. Move - Transport Request', number: 12 },
    { id: 'bookings', label: 'My Bookings', number: 13 },
    { id: 'trust', label: 'Blockchain Trust Ledger', number: 14 },
    { id: 'admin-login', label: 'Admin Login (Restricted)', number: 15 },
    { id: 'admin', label: 'Admin Panel', number: 16 },
    { id: 'notifications', label: '17. Notification Center', number: 17 }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs select-none sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-[11px] shadow-xs">
            OS
          </div>
          <span className="font-extrabold tracking-wider text-sm font-['Outfit'] text-emerald-400">
            ONESETU
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            • One Platform. Every Local Need.
          </span>
        </div>

        {/* 12 Screens Switcher Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 whitespace-nowrap">
            Photo Screens:
          </span>
          {screensList.map((item) => (
            <button
              key={item.id}
              onClick={() => store.navigateTo(item.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                currentScreen === item.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={item.label}
            >
              {item.number <= 12 ? `${item.number}. ${item.label.split('.')[1] || item.label}` : item.label}
            </button>
          ))}
        </div>

        {/* Viewport Frame Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleViewMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all"
            title="Toggle between Mobile Phone Frame and Responsive View"
          >
            {viewMode === 'mobile' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Responsive</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Mobile Frame</span>
              </>
            )}
          </button>

          <button
            onClick={onResetData}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
