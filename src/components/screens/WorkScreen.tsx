import React, { useState } from 'react';
import { store } from '../../services/store';
import { ServiceTrade, ServiceProvider } from '../../types';
import { BookServiceModal } from '../modals/BookServiceModal';
import {
  Search,
  Zap,
  Pipette,
  Hammer,
  Paintbrush,
  Fan,
  Wrench,
  Sparkles,
  Plug,
  Bug,
  MoreHorizontal,
  Star,
  MapPin,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const WorkScreen: React.FC = () => {
  const [selectedTrade, setSelectedTrade] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'nearest' | 'highest-rated' | 'lowest-price'>('nearest');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [bookingProvider, setBookingProvider] = useState<ServiceProvider | null>(null);

  const providers = store.getProviders();

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 8 Required Categories (Section 3) + Pest Control & All
  const trades: { name: string; category?: ServiceTrade; icon: React.ReactNode; color: string }[] = [
    { name: 'All', icon: <MoreHorizontal className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700' },
    { name: 'Electrician', category: 'Electrician', icon: <Zap className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600' },
    { name: 'Plumber', category: 'Plumber', icon: <Pipette className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Carpenter', category: 'Carpenter', icon: <Hammer className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700' },
    { name: 'Painter', category: 'Painter', icon: <Paintbrush className="w-4 h-4" />, color: 'bg-sky-50 text-sky-600' },
    { name: 'AC Repair', category: 'AC Repair', icon: <Fan className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Appliance Repair', category: 'Appliance Repair', icon: <Plug className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Mechanic', category: 'Mechanic', icon: <Wrench className="w-4 h-4" />, color: 'bg-rose-50 text-rose-600' },
    { name: 'Cleaning', category: 'Cleaning', icon: <Sparkles className="w-4 h-4" />, color: 'bg-teal-50 text-teal-600' },
    { name: 'Pest Control', category: 'Pest Control', icon: <Bug className="w-4 h-4" />, color: 'bg-purple-50 text-purple-600' }
  ];

  const filteredProviders = providers
    .filter((p) => {
      const matchesTrade = selectedTrade === 'All' || p.serviceCategory === selectedTrade;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTrade && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
      if (sortBy === 'highest-rated') return b.rating - a.rating;
      if (sortBy === 'lowest-price') {
        const getMin = (str: string) => parseInt(str.replace(/[^0-9]/g, '')) || 0;
        return getMin(a.priceRange) - getMin(b.priceRange);
      }
      return 0;
    });

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none relative">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 pt-8 pb-5 rounded-b-[28px] shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80"
            alt="Work tools"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Work</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified Home Services & Local Technicians
            </p>
          </div>
          <button
            onClick={() => store.navigateTo('bookings')}
            className="bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>My Bookings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3.5">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search electrician, plumber, AC repair, mechanic..."
              className="w-full pl-9 pr-3 py-2 bg-white text-xs font-medium text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>
        </div>

        {/* 8 Required Service Categories Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Select Category
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">8 Verified Trades</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {trades.map((item) => {
              const isSelected = selectedTrade === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedTrade(item.name)}
                  className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs scale-102'
                      : 'bg-white border border-slate-200/80 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${
                      isSelected ? 'bg-white/20 text-white' : item.color
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-tight text-center leading-tight line-clamp-1">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorting & Filter Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 pt-1">
          <h4 className="font-bold text-slate-800">
            {selectedTrade === 'All' ? 'All Verified Providers' : `${selectedTrade}s`} ({filteredProviders.length})
          </h4>
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-[10px] text-slate-700 focus:outline-none"
            >
              <option value="nearest">Sort: Nearest First</option>
              <option value="highest-rated">Sort: Highest Rated</option>
              <option value="lowest-price">Sort: Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Worker Cards List */}
        <div className="space-y-3">
          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
              No service professionals found matching your search.
            </div>
          ) : (
            filteredProviders.map((prov) => (
              <div
                key={prov.id}
                onClick={() => {
                  store.setSelectedProvider(prov.id);
                  store.navigateTo('provider-detail');
                }}
                className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer relative"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                  <img
                    src={prov.avatar}
                    alt={prov.name}
                    className="w-full h-full object-cover"
                  />
                  {prov.verified && (
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 fill-white text-emerald-600" />
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {prov.name}
                      </h4>
                    </div>
                    <span className="inline-block bg-slate-100 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                      {prov.serviceCategory}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{prov.rating}</span>
                        <span className="text-slate-400">({prov.reviewCount})</span>
                      </div>
                      <span>•</span>
                      <span>{prov.experienceYears} yrs exp</span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{prov.distanceKm} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                    <span className="text-xs font-black text-emerald-800">
                      {prov.priceRange}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingProvider(prov);
                        }}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1 rounded-xl text-[10px] transition-colors shadow-2xs"
                      >
                        BOOK SERVICE
                      </button>
                    </div>
                  </div>
                </div>

                {/* Favorite Toggle */}
                <button
                  onClick={(e) => toggleFavorite(prov.id, e)}
                  className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites[prov.id] ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingProvider && (
        <BookServiceModal
          isOpen={Boolean(bookingProvider)}
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
        />
      )}
    </div>
  );
};
