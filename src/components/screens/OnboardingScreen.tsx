import React, { useState } from 'react';
import { store } from '../../services/store';
import { Wheat, Wrench, PlusSquare, Truck, ArrowRight } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const handleNext = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      store.navigateTo('auth');
    }
  };

  return (
    <div className="flex flex-col h-full justify-between bg-white px-6 pt-12 pb-8 relative select-none">
      {/* Top Bar with Skip */}
      <div className="flex justify-end items-center">
        <button
          onClick={() => store.navigateTo('auth')}
          className="text-sm font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Copy */}
      <div className="mt-4 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
          All Your Local Needs<br />In One Place
        </h2>
        <p className="text-sm text-slate-600 mt-2 px-2 leading-relaxed">
          From farm to home, emergency to transport — ONESETU connects you with the right people.
        </p>
      </div>

      {/* Isometric/Floating Smartphone Feature Graphic */}
      <div className="my-6 relative flex items-center justify-center">
        {/* Smartphone Frame Mock */}
        <div className="w-48 h-80 rounded-[32px] border-4 border-slate-800 bg-slate-900 p-2 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
          {/* Inner screen glass */}
          <div className="w-full h-full bg-slate-100 rounded-[24px] p-2 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="w-12 h-3 bg-slate-800 rounded-full mb-3" />
            <div className="text-[10px] font-bold text-emerald-900 mb-2">ONESETU</div>
            <div className="w-28 h-1 bg-emerald-600 rounded-full mb-4" />

            {/* Central mini cards inside phone */}
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center">
                <Wheat className="w-4 h-4 text-emerald-600 mx-auto" />
                <div className="text-[8px] font-bold text-slate-800 mt-1">Farm</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 text-center">
                <Wrench className="w-4 h-4 text-blue-600 mx-auto" />
                <div className="text-[8px] font-bold text-slate-800 mt-1">Work</div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-1.5 text-center">
                <PlusSquare className="w-4 h-4 text-rose-600 mx-auto" />
                <div className="text-[8px] font-bold text-slate-800 mt-1">Medical</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5 text-center">
                <Truck className="w-4 h-4 text-amber-600 mx-auto" />
                <div className="text-[8px] font-bold text-slate-800 mt-1">Move</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card 1: Farm (Top Left) */}
        <div className="absolute -left-2 top-8 bg-white/95 backdrop-blur-md border border-emerald-100 shadow-xl rounded-2xl p-2.5 flex items-center gap-2 transform -rotate-6 hover:rotate-0 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Wheat className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">Farm</div>
            <div className="text-[10px] text-slate-500 font-medium">Sell • Rent • Buy</div>
          </div>
        </div>

        {/* Floating Card 2: Work (Top Right) */}
        <div className="absolute -right-2 top-14 bg-white/95 backdrop-blur-md border border-blue-100 shadow-xl rounded-2xl p-2.5 flex items-center gap-2 transform rotate-6 hover:rotate-0 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">Work</div>
            <div className="text-[10px] text-slate-500 font-medium">Home Services</div>
          </div>
        </div>

        {/* Floating Card 3: Medical (Bottom Left) */}
        <div className="absolute -left-3 bottom-12 bg-white/95 backdrop-blur-md border border-rose-100 shadow-xl rounded-2xl p-2.5 flex items-center gap-2 transform rotate-3 hover:rotate-0 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <PlusSquare className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">Medical</div>
            <div className="text-[10px] text-slate-500 font-medium">Emergency Help</div>
          </div>
        </div>

        {/* Floating Card 4: Move (Bottom Right) */}
        <div className="absolute -right-3 bottom-8 bg-white/95 backdrop-blur-md border border-amber-100 shadow-xl rounded-2xl p-2.5 flex items-center gap-2 transform -rotate-4 hover:rotate-0 transition-transform">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900">Move</div>
            <div className="text-[10px] text-slate-500 font-medium">Transport • Shifting</div>
          </div>
        </div>
      </div>

      {/* Dots Indicator & Next CTA */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <div className="w-6 h-2 rounded-full bg-emerald-700 transition-all" />
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-base rounded-2xl shadow-md flex items-center justify-center gap-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
