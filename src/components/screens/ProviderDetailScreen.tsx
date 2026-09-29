import React from 'react';
import { store } from '../../services/store';
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Briefcase,
  IndianRupee
} from 'lucide-react';

interface ProviderDetailScreenProps {
  onOpenBookingModal?: () => void;
  onOpenChatModal?: () => void;
}

export const ProviderDetailScreen: React.FC<ProviderDetailScreenProps> = ({
  onOpenBookingModal,
  onOpenChatModal
}) => {
  const provider = store.getSelectedProvider();

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Top Navbar */}
      <div className="px-4 pt-8 pb-2 flex items-center justify-between z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100">
        <button
          onClick={() => store.goBack()}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-slate-900">Provider Details</span>
        <button
          onClick={() => store.navigateTo('trust')}
          className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Trust Proof</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-24">
        {/* Hero Photo & Verified Tag */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-md border-2 border-white ring-4 ring-emerald-50 bg-slate-100">
              <img
                src={provider.avatar}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>
            {provider.verified && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 fill-emerald-100 text-emerald-800" />
                <span>Verified</span>
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-900 mt-3">{provider.name}</h2>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800">{provider.rating}</span>
              <span>({provider.reviewCount} reviews)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{provider.distanceKm} km</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              {provider.experienceYears}+ Years
            </div>
            <div className="text-[10px] text-slate-500">Experience</div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              {provider.completedJobs}
            </div>
            <div className="text-[10px] text-slate-500">Jobs Completed</div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              {provider.priceRange}
            </div>
            <div className="text-[10px] text-slate-500">Price Range</div>
          </div>
        </div>

        {/* About */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-slate-400">
            About
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {provider.about}
          </p>
        </div>

        {/* Services Chips */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider text-slate-400">
            Services
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {provider.servicesList.map((srv) => (
              <span
                key={srv}
                className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg"
              >
                • {srv}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews snippet */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Reviews ({provider.reviewCount})
            </h4>
            <span className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer">
              See All
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Ravi K.</span>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-700">5.0</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              "Arrived promptly within 20 minutes. Very professional and polite work."
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Floating Bar: Chat & Book */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <button
          onClick={onOpenChatModal}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Chat</span>
        </button>

        <button
          onClick={onOpenBookingModal}
          className="flex-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-xs font-bold text-white shadow-md transition-all text-center"
        >
          Book Service
        </button>
      </div>
    </div>
  );
};
