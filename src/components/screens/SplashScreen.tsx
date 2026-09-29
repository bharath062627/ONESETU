import React from 'react';
import { store } from '../../services/store';

export const SplashScreen: React.FC = () => {
  return (
    <div
      onClick={() => store.navigateTo('onboarding')}
      className="flex flex-col h-full justify-between bg-gradient-to-b from-white via-emerald-50/30 to-emerald-100/50 cursor-pointer select-none relative overflow-hidden"
    >
      {/* Decorative ambient glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-48 h-48 bg-amber-100/60 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header & Logo */}
      <div className="pt-20 px-6 text-center z-10">
        {/* Brand Icon (Bridge + Connected People) */}
        <div className="mx-auto w-24 h-24 mb-4 relative flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
            {/* Sun/Aura */}
            <circle cx="60" cy="55" r="28" fill="#FEF3C7" opacity="0.6" />
            {/* Colorful People in Circle over Bridge */}
            {/* Person 1 (Orange - Left) */}
            <circle cx="36" cy="42" r="7" fill="#F97316" />
            <path d="M26 62 C26 50, 46 50, 46 62 Z" fill="#F97316" />
            {/* Person 2 (Yellow - Center Left) */}
            <circle cx="50" cy="34" r="7.5" fill="#EAB308" />
            <path d="M40 56 C40 44, 60 44, 60 56 Z" fill="#EAB308" />
            {/* Person 3 (Teal/Green - Center Right) */}
            <circle cx="68" cy="34" r="7.5" fill="#10B981" />
            <path d="M58 56 C58 44, 78 44, 78 56 Z" fill="#10B981" />
            {/* Person 4 (Blue - Right) */}
            <circle cx="82" cy="42" r="7" fill="#0EA5E9" />
            <path d="M72 62 C72 50, 92 50, 92 62 Z" fill="#0EA5E9" />
            {/* Bridge Arch (Setu) */}
            <path
              d="M18 84 Q60 58 102 84"
              stroke="#065F46"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Bridge Pillars */}
            <line x1="38" y1="73" x2="38" y2="88" stroke="#047857" strokeWidth="3" />
            <line x1="60" y1="69" x2="60" y2="88" stroke="#047857" strokeWidth="3" />
            <line x1="82" y1="73" x2="82" y2="88" stroke="#047857" strokeWidth="3" />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-extrabold tracking-wider text-emerald-950 font-['Outfit']">
          ONESETU
        </h1>
        <p className="text-sm font-medium text-emerald-800/80 mt-1">
          One Platform. Every Local Need.
        </p>
      </div>

      {/* Scenic Agrarian Bridge Landscape Illustration */}
      <div className="relative px-4 flex-1 flex items-center justify-center my-2">
        <div className="w-full max-w-xs h-64 rounded-3xl overflow-hidden shadow-lg border-2 border-white relative bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-600">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&auto=format&fit=crop&q=80"
            alt="Scenic countryside with lush fields and bridge"
            className="w-full h-full object-cover mix-blend-multiply opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-center">
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">
              Connecting People
            </span>
            <span className="text-white text-xs mt-0.5 opacity-90">
              Services • Resources • Opportunities
            </span>
          </div>
        </div>
      </div>

      {/* Bottom dots & Tap prompt */}
      <div className="pb-10 px-6 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-2 rounded-full bg-emerald-700 transition-all" />
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            store.navigateTo('onboarding');
          }}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xs border border-emerald-100 active:scale-95 transition-all"
        >
          Tap anywhere to explore →
        </button>
      </div>
    </div>
  );
};
