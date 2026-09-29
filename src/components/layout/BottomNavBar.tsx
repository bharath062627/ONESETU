import React from 'react';
import { store } from '../../services/store';
import { ScreenId } from '../../types';
import {
  Home,
  Compass,
  Calendar,
  Zap,
  User
} from 'lucide-react';

interface BottomNavBarProps {
  currentScreen: ScreenId;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen }) => {
  const bookings = store.getBookings();
  const activeBookingsCount = bookings.filter(
    (b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
  ).length;

  const tabs: { id: ScreenId; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'search',
      label: 'Explore',
      icon: <Compass className="w-5 h-5" />
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <Calendar className="w-5 h-5" />,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined
    },
    {
      id: 'trust',
      label: 'Activity',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-30 select-none shadow-lg">
      {tabs.map((tab) => {
        const isActive =
          currentScreen === tab.id ||
          (tab.id === 'search' && (currentScreen === 'farm' || currentScreen === 'work' || currentScreen === 'move'));
        return (
          <button
            key={tab.label}
            onClick={() => store.navigateTo(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
              isActive ? 'text-emerald-800 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-emerald-700 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
