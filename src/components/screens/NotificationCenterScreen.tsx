import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { AppNotification, NotificationCategory, NotificationPreferences } from '../../types';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle2,
  Calendar,
  Store,
  CreditCard,
  TrendingUp,
  MapPin,
  Trash2,
  SlidersHorizontal,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
  Clock,
  Filter
} from 'lucide-react';

export const NotificationCenterScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(store.getNotifications());
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | NotificationCategory>('ALL');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [onlyArea, setOnlyArea] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(store.getNotificationPreferences());
  const user = store.getUser();

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setNotifications([...store.getNotifications()]);
      setPreferences(store.getNotificationPreferences());
    });
    return unsubscribe;
  }, []);

  const unreadCount = store.getUnreadNotificationCount();

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (selectedCategory !== 'ALL' && notif.category !== selectedCategory) {
      return false;
    }
    if (onlyUnread && notif.read) {
      return false;
    }
    if (onlyArea && notif.location && !store.isLocationInUserArea(notif.location)) {
      return false;
    }
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      store.markNotificationRead(notif.id);
    }
    if (notif.targetScreen) {
      store.navigateTo(notif.targetScreen);
    }
  };

  const handleMarkAllRead = () => {
    store.markAllNotificationsRead();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.deleteNotification(id);
  };

  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key]
    };
    store.updateNotificationPreferences(updated);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'BOOKING':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'MARKETPLACE':
        return <Store className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      case 'PRICE_ALERT':
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category: NotificationCategory) => {
    switch (category) {
      case 'BOOKING':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'MARKETPLACE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PAYMENT':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'PRICE_ALERT':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'VERIFICATION':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none relative">
      {/* Top Header */}
      <div className="px-4 pt-8 pb-3 bg-white border-b border-slate-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => store.goBack()}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                  Notification Center
                </h1>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Live alerts for bookings & marketplace listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
              title="Notification Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location Scope Banner */}
        <div className="mt-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-emerald-950 block truncate">
                Active Area: {user.location}
              </span>
              <span className="text-[9px] text-emerald-700 block">
                Local produce, machinery rentals & cargo alerts
              </span>
            </div>
          </div>
          <button
            onClick={() => setOnlyArea(!onlyArea)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 ${
              onlyArea
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {onlyArea ? '✓ Area Only' : 'Filter Area'}
          </button>
        </div>

        {/* Filter Categories Horizontal Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setSelectedCategory('BOOKING')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedCategory === 'BOOKING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Bookings</span>
          </button>

          <button
            onClick={() => setSelectedCategory('MARKETPLACE')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedCategory === 'MARKETPLACE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Store className="w-3 h-3" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setSelectedCategory('PRICE_ALERT')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedCategory === 'PRICE_ALERT'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Price Alerts</span>
          </button>

          <button
            onClick={() => setOnlyUnread(!onlyUnread)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              onlyUnread
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {onlyUnread ? '● Unread' : 'Unread'}
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 pb-24">
        {/* Quick Demo Simulator Bar for Testing Live Feeds */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Real-Time Alert Feeds:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => store.simulateLiveBookingNotification()}
              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-lg text-[10px] font-bold active:scale-95 transition-all shadow-2xs"
            >
              + Booking Alert
            </button>
            <button
              onClick={() => store.simulateLiveMarketplaceListingNotification()}
              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all shadow-2xs"
            >
              + Area Listing
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3 mt-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">No notifications found</h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                {onlyUnread
                  ? 'All notifications have been read. Switch to "All" to view previous booking and marketplace history.'
                  : 'You are all caught up! New booking requests and local produce/machinery listings in your area will appear here.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setOnlyUnread(false);
                setOnlyArea(false);
              }}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => {
            const isAreaMatch = store.isLocationInUserArea(notif.location);

            return (
              <div
                key={`${notif.id}-${idx}`}
                onClick={() => handleNotificationClick(notif)}
                className={`bg-white border rounded-2xl p-3.5 shadow-2xs transition-all cursor-pointer relative hover:shadow-xs active:scale-[0.99] ${
                  !notif.read
                    ? 'border-emerald-500/80 bg-emerald-50/10 ring-1 ring-emerald-500/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {/* Category Icon Badge */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getCategoryBadgeClass(
                            notif.category
                          )}`}
                        >
                          {notif.category}
                        </span>

                        {notif.badgeText && (
                          <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{notif.badgeText}</span>
                          </span>
                        )}

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                        {notif.title}
                      </h4>
                    </div>
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {notif.timestamp}
                    </span>
                    <button
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-[11px] text-slate-600 mt-2 pl-10 leading-relaxed">
                  {notif.message}
                </p>

                {/* Bottom Row / CTA */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between pl-10 text-[10px]">
                  {notif.location ? (
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{notif.location}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">OneSetu Ecosystem</span>
                  )}

                  <span className="font-bold text-emerald-800 flex items-center gap-0.5 hover:underline">
                    <span>{notif.actionLabel || 'View Details'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Preferences Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-bold text-slate-900">Alert Preferences</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Choose which notifications you wish to receive for your registered location (
              <strong>{user.location}</strong>).
            </p>

            <div className="space-y-3">
              {/* Toggle Booking Updates */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Booking Status Updates
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Instant alerts for booking creation, operator dispatch & job completion
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.bookingAlerts}
                  onChange={() => handleTogglePreference('bookingAlerts')}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Toggle Marketplace Listings */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    New Marketplace Listings
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Fresh produce, machinery rent, and pre-owned tools in your district
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketplaceAlerts}
                  onChange={() => handleTogglePreference('marketplaceAlerts')}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Toggle Price Alerts */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Mandi Price Movements
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Alerts when benchmark APMC modal rates rise or drop significantly
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.priceAlerts}
                  onChange={() => handleTogglePreference('priceAlerts')}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
              </div>

              {/* Toggle Only My Area */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Strict Local Filtering
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Receive marketplace alerts strictly within {user.location.split(',')[0]}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.onlyMyArea}
                  onChange={() => handleTogglePreference('onlyMyArea')}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  store.clearAllNotifications();
                  setIsSettingsOpen(false);
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
