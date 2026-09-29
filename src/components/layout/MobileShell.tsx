import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
  viewMode: 'mobile' | 'responsive';
}

export const MobileShell: React.FC<MobileShellProps> = ({ children, viewMode }) => {
  if (viewMode === 'responsive') {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-[820px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col relative my-4">
        {/* Responsive status indicator */}
        <div className="bg-slate-900 text-slate-300 text-[11px] px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
          <span className="font-semibold">ONESETU Cross-Platform Web & Desktop Mode</span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-mono">Status: Connected</span>
            <Wifi className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex-1 relative flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-2 sm:p-6 my-2">
      {/* Smartphone frame: iPhone/Android modern chassis with subtle shadow and bezels */}
      <div className="w-[390px] h-[844px] bg-slate-950 rounded-[52px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-white/20">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-950 rounded-full z-40 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Screen Bezel Inner Wrapper */}
        <div className="w-full h-full bg-white rounded-[40px] overflow-hidden flex flex-col relative">
          {/* Status Bar (9:41, Cellular, Wifi, Battery) */}
          <div className="h-10 pt-2 px-6 flex items-center justify-between text-xs font-bold text-slate-800 z-30 select-none bg-transparent">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 fill-slate-800" />
            </div>
          </div>

          {/* Screen Body */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
            {children}
          </div>

          {/* Home indicator bar (bottom bar) */}
          <div className="h-4 bg-transparent flex items-center justify-center select-none pointer-events-none z-30">
            <div className="w-32 h-1 bg-slate-900/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
