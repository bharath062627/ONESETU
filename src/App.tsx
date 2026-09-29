import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { ScreenId, EquipmentItem } from './types';
import { ScreenNavigatorBar } from './components/layout/ScreenNavigatorBar';
import { MobileShell } from './components/layout/MobileShell';
import { BottomNavBar } from './components/layout/BottomNavBar';

// 12 Interface Screens matching user provided photo
import { SplashScreen } from './components/screens/SplashScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { RoleSelectionScreen } from './components/screens/RoleSelectionScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { FarmScreen } from './components/screens/FarmScreen';
import { Top10MarketsScreen } from './components/screens/Top10MarketsScreen';
import { MarketComparisonScreen } from './components/screens/MarketComparisonScreen';
import { WorkScreen } from './components/screens/WorkScreen';
import { ProviderDetailScreen } from './components/screens/ProviderDetailScreen';
import { MedicalScreen } from './components/screens/MedicalScreen';
import { MoveScreen } from './components/screens/MoveScreen';

// Supporting Operational Screens
import { BookingsScreen } from './components/screens/BookingsScreen';
import { TrustScreen } from './components/screens/TrustScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { AdminLoginScreen } from './components/screens/AdminLoginScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { NotificationCenterScreen } from './components/screens/NotificationCenterScreen';
import { authService } from './services/authService';
import { ShieldAlert } from 'lucide-react';

// Modals
import { CreateProduceModal } from './components/modals/CreateProduceModal';
import { CreateRentalEquipmentModal } from './components/modals/CreateRentalEquipmentModal';
import { CreateUsedEquipmentModal } from './components/modals/CreateUsedEquipmentModal';
import { BookServiceModal } from './components/modals/BookServiceModal';
import { BlockchainExplorerModal } from './components/modals/BlockchainExplorerModal';
import { ChatModal } from './components/modals/ChatModal';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>(store.getScreen());
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');

  // Modal States
  const [isProduceModalOpen, setIsProduceModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isUsedModalOpen, setIsUsedModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [bookingEquipment, setBookingEquipment] = useState<EquipmentItem | undefined>(undefined);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    // Initial Route sync (/admin or #/admin)
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#/admin' || hash === '#admin') {
        if (!authService.isAuthenticated()) {
          store.navigateTo('admin-login');
        } else {
          store.navigateTo('admin');
        }
      }
    }

    const unsubscribe = store.subscribe(() => {
      const current = store.getScreen();
      setScreen(current);
      if (typeof window !== 'undefined') {
        if (current === 'admin') {
          window.location.hash = '#/admin';
        } else if (current === 'admin-login') {
          window.location.hash = '#/admin/login';
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSelectEquipment = (item: EquipmentItem) => {
    setBookingEquipment(item);
    setIsBookingModalOpen(true);
  };

  const showBottomNav =
    screen !== 'splash' &&
    screen !== 'onboarding' &&
    screen !== 'auth' &&
    screen !== 'admin-login' &&
    screen !== 'admin' &&
    screen !== 'roles' &&
    screen !== 'market-comparison';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col font-sans">
      {/* Top Navigator & Screen Switcher Bar */}
      <ScreenNavigatorBar
        currentScreen={screen}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'mobile' ? 'responsive' : 'mobile')}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-0 sm:p-4 overflow-x-hidden">
        <MobileShell viewMode={viewMode}>
          {/* Active Screen Renderer */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {screen === 'splash' && <SplashScreen />}
            {screen === 'onboarding' && <OnboardingScreen />}
            {screen === 'auth' && <AuthScreen />}
            {screen === 'admin-login' && <AdminLoginScreen />}
            {screen === 'roles' && <RoleSelectionScreen />}
            {screen === 'home' && (
              <HomeScreen onOpenLocationSelector={() => setIsLocationModalOpen(true)} />
            )}
            {screen === 'search' && (
              <SearchScreen onSelectEquipment={handleSelectEquipment} />
            )}
            {screen === 'farm' && (
              <FarmScreen
                onOpenCreateProduce={() => setIsProduceModalOpen(true)}
                onOpenCreateRentalEquipment={() => setIsRentalModalOpen(true)}
                onOpenCreateUsedEquipment={() => setIsUsedModalOpen(true)}
                onSelectEquipment={handleSelectEquipment}
              />
            )}
            {screen === 'top10-markets' && <Top10MarketsScreen />}
            {screen === 'market-comparison' && <MarketComparisonScreen />}
            {screen === 'work' && <WorkScreen />}
            {screen === 'provider-detail' && (
              <ProviderDetailScreen
                onOpenBookingModal={() => {
                  setBookingEquipment(undefined);
                  setIsBookingModalOpen(true);
                }}
                onOpenChatModal={() => setIsChatModalOpen(true)}
              />
            )}
            {screen === 'medical' && <MedicalScreen />}
            {screen === 'move' && <MoveScreen />}
            {screen === 'bookings' && (
              <BookingsScreen onOpenExplorer={(tx) => setSelectedTxHash(tx)} />
            )}
            {screen === 'trust' && (
              <TrustScreen onOpenExplorer={(tx) => setSelectedTxHash(tx)} />
            )}
            {screen === 'admin' && (
              !authService.isAuthenticated() ? (
                <AdminLoginScreen />
              ) : !authService.isAdmin() ? (
                <div className="flex flex-col h-full bg-slate-900 text-white p-6 justify-center items-center text-center select-none animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                  </div>
                  <h2 className="text-xl font-bold font-['Outfit']">Access Denied</h2>
                  <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                    Administrator privileges required. Your authenticated role ({store.getUser().activeRole}) does not have permission to access the ONESETU Administration Console.
                  </p>
                  <div className="mt-6 space-y-2.5 w-full max-w-xs">
                    <button
                      onClick={() => store.navigateTo('admin-login')}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Sign In as Administrator
                    </button>
                    <button
                      onClick={() => store.navigateTo('home')}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                    >
                      Return to Home Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <AdminScreen />
              )
            )}
            {screen === 'profile' && <ProfileScreen />}
            {screen === 'notifications' && <NotificationCenterScreen />}

            {/* Bottom Nav Bar (Home, Explore, Bookings, Activity, Profile) */}
            {showBottomNav && <BottomNavBar currentScreen={screen} />}
          </div>
        </MobileShell>
      </main>

      {/* Modals */}
      <CreateProduceModal
        isOpen={isProduceModalOpen}
        onClose={() => setIsProduceModalOpen(false)}
      />

      <CreateRentalEquipmentModal
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
      />

      <CreateUsedEquipmentModal
        isOpen={isUsedModalOpen}
        onClose={() => setIsUsedModalOpen(false)}
      />

      <BookServiceModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        provider={!bookingEquipment ? store.getSelectedProvider() : undefined}
        equipment={bookingEquipment}
      />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      <BlockchainExplorerModal
        txHash={selectedTxHash}
        onClose={() => setSelectedTxHash(null)}
      />

      {/* Location Selector Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Select Location</h3>
            <p className="text-xs text-slate-500">
              Matching and distance calculations use your selected district.
            </p>
            <div className="space-y-1.5">
              {[
                'Mysuru, Karnataka',
                'Mandya, Karnataka',
                'Bengaluru, Karnataka',
                'Hassan, Karnataka',
                'Chamarajanagar, Karnataka'
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    store.setLocation(loc);
                    setIsLocationModalOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-900 border border-slate-100 transition-colors"
                >
                  📍 {loc}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
