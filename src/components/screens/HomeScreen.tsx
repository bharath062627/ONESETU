import React, { useState } from 'react';
import { store } from '../../services/store';
import {
  MapPin,
  Bell,
  Search,
  Wheat,
  Wrench,
  PlusSquare,
  Truck,
  ArrowRight,
  Zap,
  Tractor,
  Hospital,
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

interface HomeScreenProps {
  onOpenNotifications?: () => void;
  onOpenLocationSelector?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenLocationSelector
}) => {
  const user = store.getUser();
  const bookings = store.getBookings();
  const unreadCount = store.getUnreadNotificationCount();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      store.setSearchQuery(searchInput);
      store.navigateTo('search');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20 select-none">
      {/* Top Header with Dark Forest Green Accent */}
      <div className="bg-emerald-900 text-white px-5 pt-8 pb-5 rounded-b-[28px] shadow-sm relative">
        <div className="flex items-center justify-between">
          {/* User Profile & Location */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => store.navigateTo('profile')}
              className="w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-400/50 cursor-pointer shadow-xs"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-[11px] font-medium text-emerald-200">Good Morning,</div>
              <div className="text-base font-bold text-white flex items-center gap-1">
                {user.name} 👋
              </div>
              <button
                onClick={onOpenLocationSelector}
                className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium hover:text-white mt-0.5"
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{user.location}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => store.navigateTo('notifications')}
            className="w-10 h-10 rounded-full bg-emerald-800/80 border border-emerald-700/50 flex items-center justify-center relative hover:bg-emerald-800 active:scale-95 transition-all"
            title="Notification Center"
          >
            <Bell className="w-4 h-4 text-emerald-100" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-emerald-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search anything... (tractor, tomato, electrician)"
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl shadow-md border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>
      </div>

      {/* Main Content Area */}
      <div className="px-5 mt-4 space-y-5">
        {/* 4 Primary Category Cards */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Farm */}
          <button
            onClick={() => store.navigateTo('farm')}
            className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center shadow-2xs hover:shadow-xs active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
              <Wheat className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Farm</span>
          </button>

          {/* Work */}
          <button
            onClick={() => store.navigateTo('work')}
            className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center shadow-2xs hover:shadow-xs active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Work</span>
          </button>

          {/* Medical */}
          <button
            onClick={() => store.navigateTo('medical')}
            className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center shadow-2xs hover:shadow-xs active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5">
              <PlusSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Medical</span>
          </button>

          {/* Move */}
          <button
            onClick={() => store.navigateTo('move')}
            className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center shadow-2xs hover:shadow-xs active:scale-95 transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Move</span>
          </button>
        </div>

        {/* Promo Hero Banner: Better Markets Happier Farmers */}
        <div
          onClick={() => store.navigateTo('farm')}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 text-white p-4 shadow-md cursor-pointer group active:scale-[0.99] transition-all"
        >
          <div className="relative z-10 max-w-[65%]">
            <h3 className="text-base font-extrabold leading-snug tracking-tight text-white drop-shadow-xs">
              Better Markets<br />Happier Farmers
            </h3>
            <p className="text-[11px] text-emerald-200 mt-1 line-clamp-2">
              Compare APMC prices & sell directly to buyers with zero brokerage.
            </p>
            <div className="mt-3 inline-flex items-center gap-1 bg-white text-emerald-900 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-xs group-hover:bg-emerald-50 transition-colors">
              <span>Explore Farm</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Farmer photo illustration badge */}
          <div className="absolute right-0 top-0 bottom-0 w-[42%] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80"
              alt="Happy Farmer"
              className="w-full h-full object-cover object-center mix-blend-luminosity opacity-85 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-transparent to-transparent" />
          </div>
        </div>

        {/* Nearby Services */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-sm font-bold text-slate-900">Nearby Services</h4>
            <button
              onClick={() => store.navigateTo('work')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => store.navigateTo('work')}
              className="bg-white border border-slate-100 p-2 rounded-xl text-center shadow-2xs hover:border-emerald-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Electricians</div>
              <div className="text-[9px] text-slate-400 mt-0.5">4 nearby</div>
            </button>

            <button
              onClick={() => {
                store.setSearchQuery('tractor');
                store.navigateTo('search');
              }}
              className="bg-white border border-slate-100 p-2 rounded-xl text-center shadow-2xs hover:border-emerald-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1">
                <Tractor className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Tractors</div>
              <div className="text-[9px] text-slate-400 mt-0.5">3 nearby</div>
            </button>

            <button
              onClick={() => store.navigateTo('move')}
              className="bg-white border border-slate-100 p-2 rounded-xl text-center shadow-2xs hover:border-emerald-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Trucks</div>
              <div className="text-[9px] text-slate-400 mt-0.5">6 nearby</div>
            </button>

            <button
              onClick={() => store.navigateTo('medical')}
              className="bg-white border border-slate-100 p-2 rounded-xl text-center shadow-2xs hover:border-emerald-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
                <Hospital className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-slate-800 leading-tight">Hospitals</div>
              <div className="text-[9px] text-slate-400 mt-0.5">5 nearby</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-sm font-bold text-slate-900">Recent Activity</h4>
            <button
              onClick={() => store.navigateTo('bookings')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {bookings.slice(0, 2).map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => store.navigateTo('bookings')}
                className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between shadow-2xs cursor-pointer hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.category === 'MOVE'
                        ? 'bg-amber-100 text-amber-700'
                        : item.category === 'WORK'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {item.category === 'MOVE' ? (
                      <Truck className="w-5 h-5" />
                    ) : item.category === 'WORK' ? (
                      <Wrench className="w-5 h-5" />
                    ) : (
                      <Wheat className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.serviceTitle}</h5>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.scheduledDate}, {item.scheduledTime}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-700'
                        : item.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                  </span>
                  {item.status === 'COMPLETED' && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
