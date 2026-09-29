import React, { useState, useEffect, useMemo } from 'react';
import { store } from '../../services/store';
import {
  EmergencyHelpline,
  MedicalFacility,
  EmergencyCategoryType,
  AiEmergencyResponse
} from '../../types';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Shield,
  Flame,
  HeartHandshake,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  ShieldAlert,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Share2,
  Navigation,
  Activity,
  Heart,
  Baby,
  Brain,
  Wind,
  Droplet,
  Skull,
  Zap,
  Users,
  Eye,
  Wifi,
  WifiOff,
  Filter,
  ArrowUpDown,
  Stethoscope,
  Pill,
  Hospital
} from 'lucide-react';

export const MedicalScreen: React.FC = () => {
  // Store subscriptions & data
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const helplines = store.getEmergencyHelplines();
  const allFacilities = store.getMedicalFacilities();
  const user = store.getUser();

  // State: Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState<string>('EMERGENCY_NOW');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'NEAREST' | 'EMERGENCY_FIRST' | 'NAME'>('NEAREST');

  // State: Modals & Dialogs
  const [confirmCallTarget, setConfirmCallTarget] = useState<{
    title: string;
    number: string;
    category?: string;
    notes?: string;
  } | null>(null);
  const [callBanner, setCallBanner] = useState<string | null>(null);

  const [selectedFacilityDetail, setSelectedFacilityDetail] = useState<MedicalFacility | null>(null);
  const [selectedRoutingCategory, setSelectedRoutingCategory] = useState<EmergencyCategoryType | null>(null);

  // State: AI Emergency Assistant
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [aiResponse, setAiResponse] = useState<AiEmergencyResponse | null>(null);
  const [isAiSimulatedFailure, setIsAiSimulatedFailure] = useState(false);

  // State: Offline Mode & Network
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // State: Location
  const [selectedLocation, setSelectedLocation] = useState<string>(user.location || 'Mysuru, Karnataka');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Handle Online/Offline browser events
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Immediate Emergency Call Dispatcher
  const triggerCall = (title: string, number: string) => {
    setCallBanner(`Calling ${title} (${number})...`);
    window.location.href = `tel:${number.replace(/[^0-9+]/g, '')}`;
    setConfirmCallTarget(null);
    setTimeout(() => setCallBanner(null), 5000);
  };

  const openCallConfirm = (title: string, number: string, category?: string, notes?: string) => {
    setConfirmCallTarget({ title, number, category, notes });
  };

  // Run AI Emergency Assistant
  const handleRunAiAssistant = (promptText?: string) => {
    const textToQuery = promptText || aiInputText;
    if (!textToQuery.trim()) return;

    if (isAiSimulatedFailure) {
      // Simulate API failure gracefully
      setAiResponse(null);
      return;
    }

    const response = store.queryAiEmergencyAssistant(textToQuery);
    setAiResponse(response);
  };

  // Filter facilities based on current view/search
  const filteredFacilities = useMemo(() => {
    let effectiveQuery = searchQuery;
    let effectiveFilter = facilityTypeFilter;

    // Map quick chips to filter criteria if active
    if (selectedChip === 'HOSPITALS') effectiveFilter = 'Hospital';
    else if (selectedChip === 'AMBULANCE') effectiveFilter = 'Ambulance';
    else if (selectedChip === 'CLINICS') effectiveFilter = 'Clinic';
    else if (selectedChip === 'PHARMACIES') effectiveFilter = 'Pharmacy';
    else if (selectedChip === 'BLOOD_BANK') effectiveFilter = 'Blood Bank';
    else if (selectedChip === 'MATERNITY') effectiveFilter = 'Maternity';
    else if (selectedChip === 'HEART_EMERGENCY') effectiveQuery = effectiveQuery || 'heart hospital';
    else if (selectedChip === 'POISONING') effectiveQuery = effectiveQuery || 'poison';
    else if (selectedChip === 'MENTAL_HEALTH') effectiveQuery = effectiveQuery || 'mental health';

    return store.searchMedicalFacilities({
      query: effectiveQuery,
      categoryFilter: effectiveFilter,
      sortBy: sortBy,
      userDistrict: selectedLocation
    });
  }, [searchQuery, facilityTypeFilter, selectedChip, sortBy, selectedLocation]);

  // Emergency Categories configuration
  const emergencyCategoryList: {
    type: EmergencyCategoryType;
    label: string;
    icon: any;
    color: string;
  }[] = [
    { type: 'HEART_CHEST_PAIN', label: 'Heart / Chest Pain', icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { type: 'PREGNANCY_MATERNITY', label: 'Pregnancy Emergency', icon: Baby, color: 'text-pink-600 bg-pink-50' },
    { type: 'STROKE_NEURO', label: 'Stroke / Speech Loss', icon: Brain, color: 'text-purple-600 bg-purple-50' },
    { type: 'BREATHING_DIFFICULTY', label: 'Breathing Difficulty', icon: Wind, color: 'text-sky-600 bg-sky-50' },
    { type: 'ACCIDENT_TRAUMA', label: 'Accident / Trauma', icon: Ambulance, color: 'text-amber-600 bg-amber-50' },
    { type: 'SEVERE_BLEEDING', label: 'Severe Bleeding', icon: Droplet, color: 'text-red-600 bg-red-50' },
    { type: 'CHILD_EMERGENCY', label: 'Child Emergency', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { type: 'POISONING', label: 'Poisoning / Toxin', icon: Skull, color: 'text-indigo-600 bg-indigo-50' },
    { type: 'BURNS_FIRE', label: 'Burns / Fire', icon: Flame, color: 'text-orange-600 bg-orange-50' },
    { type: 'UNCONSCIOUS_FAINTING', label: 'Unconscious / Fainting', icon: AlertCircle, color: 'text-slate-700 bg-slate-100' },
    { type: 'SEIZURE', label: 'Seizure / Convulsions', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
    { type: 'MENTAL_HEALTH', label: 'Mental Health Crisis', icon: Activity, color: 'text-teal-600 bg-teal-50' },
    { type: 'ANIMAL_SNAKE_BITE', label: 'Snake / Animal Bite', icon: AlertTriangle, color: 'text-emerald-700 bg-emerald-50' }
  ];

  // Chips configuration
  const categoryChips = [
    { id: 'EMERGENCY_NOW', label: '🚨 EMERGENCY NOW' },
    { id: 'HOSPITALS', label: '🏥 HOSPITALS' },
    { id: 'AMBULANCE', label: '🚑 AMBULANCE' },
    { id: 'CLINICS', label: '🏨 CLINICS' },
    { id: 'PHARMACIES', label: '💊 PHARMACIES' },
    { id: 'BLOOD_BANK', label: '🩸 BLOOD & DONATION' },
    { id: 'MENTAL_HEALTH', label: '🧠 MENTAL HEALTH' },
    { id: 'MATERNITY', label: '🤰 MATERNITY' },
    { id: 'HEART_EMERGENCY', label: '🫀 HEART EMERGENCY' },
    { id: 'POISONING', label: '☠️ POISONING' },
    { id: 'WOMEN_HELP', label: '👩 WOMEN\'S HELP' },
    { id: 'CHILD_HELP', label: '👶 CHILD HELP' },
    { id: 'FIRE_RESCUE', label: '🔥 FIRE / RESCUE' },
    { id: 'POLICE', label: '👮 POLICE' },
    { id: 'ALL_HELPLINES', label: '📞 ALL HELPLINES' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none overflow-hidden">
      {/* Top Banner Header */}
      <div className="relative bg-gradient-to-br from-rose-900 via-rose-800 to-red-900 text-white px-5 pt-7 pb-5 rounded-b-[32px] shadow-md flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-rose-100">
                Medical & Emergency
              </span>
              {isOfflineMode ? (
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5" /> Offline Mode
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5" /> Live
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">MEDICAL</h1>
            <p className="text-xs text-rose-100 font-medium">Find medical help when you need it.</p>
          </div>

          {/* Quick Simulation & Location Buttons */}
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="text-[11px] bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/20 backdrop-blur-xs transition-colors"
            >
              <MapPin className="w-3 h-3 text-rose-200" />
              <span className="truncate max-w-[100px]">{selectedLocation.split(',')[0]}</span>
            </button>
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className="text-[9px] text-rose-200 hover:text-white underline cursor-pointer"
              title="Toggle simulated offline state"
            >
              {isOfflineMode ? 'Switch to Online' : 'Simulate Offline'}
            </button>
          </div>
        </div>

        {/* Global Medical Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, clinics, pharmacies, ambulances, emergency help, symptoms..."
            className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-xs font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Location Notice */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-rose-100/90 font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-300" />
            <span>Using your location: <strong>{selectedLocation}</strong></span>
          </div>
          <button
            onClick={() => setIsLocationPickerOpen(true)}
            className="text-white underline hover:text-rose-200 font-bold"
          >
            Change
          </button>
        </div>
      </div>

      {/* Live Call Banner */}
      {callBanner && (
        <div className="mx-4 mt-2 bg-emerald-600 text-white text-xs font-bold py-2.5 px-3.5 rounded-2xl shadow-lg flex items-center gap-2 animate-pulse flex-shrink-0 z-30">
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>{callBanner}</span>
        </div>
      )}

      {/* Offline Alert Banner */}
      {isOfflineMode && (
        <div className="mx-4 mt-2 bg-amber-500/15 border border-amber-300 text-amber-900 text-xs py-2 px-3 rounded-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-[11px]">
              Offline emergency information. Direct dialer functions remain 100% operational.
            </span>
          </div>
          <button
            onClick={() => triggerCall('Unified Emergency', '112')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] px-2.5 py-1 rounded-xl"
          >
            DIAL 112
          </button>
        </div>
      )}

      {/* Horizontal Category Chips */}
      <div className="flex-shrink-0 border-b border-slate-200/80 bg-white shadow-2xs py-2.5 px-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {categoryChips.map((chip) => {
            const isActive = selectedChip === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setSelectedChip(chip.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs scale-102'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-4">
        {/* 1. HERO EMERGENCY NOW SECTION */}
        {(selectedChip === 'EMERGENCY_NOW' || !selectedChip) && (
          <div className="space-y-4">
            {/* Primary Action Button: CALL 112 */}
            <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-4 text-white shadow-lg relative overflow-hidden border border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-100">
                      Emergency Now
                    </span>
                  </div>
                  <h3 className="text-xl font-black mt-0.5">India Unified Emergency</h3>
                  <p className="text-xs text-rose-100 mt-0.5">
                    Single nationwide number for Police, Fire, Medical & Disaster
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <ShieldAlert className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* The Big Accessible Call Button */}
              <button
                onClick={() => openCallConfirm('India Unified Emergency Number', '112', 'Unified Emergency', 'National single emergency response number')}
                className="mt-3.5 w-full bg-white hover:bg-rose-50 text-red-700 font-black text-base py-3 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2.5 active:scale-98 transition-all cursor-pointer"
                aria-label="Call 112 India Unified Emergency Number"
              >
                <PhoneCall className="w-5 h-5 text-red-600" />
                <span>CALL 112</span>
              </button>
            </div>

            {/* AI Emergency Assistant Hero Callout */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-4 text-white shadow-md border border-indigo-700/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">
                      Need Help For A Specific Situation?
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">AI Emergency Assistant</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Describe symptoms to receive instant safety routing & verified contact guidance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(true)}
                className="mt-3 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🤖 ASK AI EMERGENCY ASSISTANT</span>
              </button>
            </div>

            {/* Quick Emergency Type Routing Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Quick Emergency Categories
                </h4>
                <span className="text-[11px] text-slate-500">Tap for instant guidance</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {emergencyCategoryList.map((cat) => {
                  const IconComp = cat.icon;
                  const isSelected = selectedRoutingCategory === cat.type;
                  return (
                    <button
                      key={cat.type}
                      onClick={() =>
                        setSelectedRoutingCategory(isSelected ? null : cat.type)
                      }
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all active:scale-97 ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-rose-200 shadow-2xs'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {cat.label}
                        </div>
                        <div className="text-[10px] text-rose-600 font-extrabold mt-0.5">
                          Tap to Route
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Targeted Emergency Routing Guidance Card (Visible when category selected) */}
            {selectedRoutingCategory && (
              <div className="bg-white border-2 border-rose-400 rounded-3xl p-4 shadow-md space-y-3">
                {(() => {
                  const routing = store.getEmergencyRouting(selectedRoutingCategory);
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{routing.icon}</span>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-rose-700">
                              {routing.label} Routing
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Verified emergency protocol
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRoutingCategory(null)}
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>

                      {/* First Aid & Safety Guidance */}
                      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 text-xs text-rose-900 leading-relaxed font-medium">
                        <strong>First Aid Guidance:</strong> {routing.guidance}
                      </div>

                      {/* Call Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            openCallConfirm(
                              'Primary Emergency',
                              routing.primaryNumber,
                              routing.label
                            )
                          }
                          className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{routing.primaryAction}</span>
                        </button>

                        {routing.secondaryAction && routing.secondaryNumber && (
                          <button
                            onClick={() =>
                              openCallConfirm(
                                routing.specializedService || 'Ambulance',
                                routing.secondaryNumber!,
                                routing.label
                              )
                            }
                            className="py-2.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Ambulance className="w-3.5 h-3.5" />
                            <span className="truncate">{routing.secondaryAction}</span>
                          </button>
                        )}
                      </div>

                      {/* Special Resource Notice */}
                      {routing.specializedService && (
                        <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl flex items-center justify-between">
                          <span>Specialized Service: <strong>{routing.specializedService}</strong></span>
                          <span className="font-bold text-rose-600">{routing.specializedNumber}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 2. VERIFIED HELPLINES DIRECTORY SECTION */}
        {(selectedChip === 'ALL_HELPLINES' || selectedChip === 'POLICE' || selectedChip === 'FIRE_RESCUE' || selectedChip === 'WOMEN_HELP' || selectedChip === 'CHILD_HELP') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Verified Emergency Helplines
                </h3>
                <p className="text-[11px] text-slate-500">
                  Government of India & Karnataka State Authoritative Registry
                </p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                {helplines.length} Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {helplines
                .filter((h) => {
                  if (selectedChip === 'POLICE') return h.category === 'Police';
                  if (selectedChip === 'FIRE_RESCUE') return h.category === 'Fire' || h.category === 'Disaster';
                  if (selectedChip === 'WOMEN_HELP') return h.category === 'Women';
                  if (selectedChip === 'CHILD_HELP') return h.category === 'Child';
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900">{item.service_name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                            {item.scope}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                              item.verification_status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {item.verification_status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {item.description}
                        </p>
                      </div>

                      {/* Direct Call Button */}
                      <button
                        onClick={() => openCallConfirm(item.service_name, item.number, item.category, item.description)}
                        className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs flex-shrink-0 active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{item.number}</span>
                      </button>
                    </div>

                    {/* Metadata & Source Verification Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1 truncate max-w-[200px]">
                        <span>Source: <strong>{item.source}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Verified: {item.verified_at}</span>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rose-600 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            Source <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 3. MEDICAL FACILITIES DIRECTORY SECTION */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Nearby Verified Medical Facilities
              </h3>
              <p className="text-[11px] text-slate-500">
                Hospitals, Clinics, Pharmacies, Blood Banks ({filteredFacilities.length} found)
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold py-1 px-2 rounded-xl focus:outline-none"
              >
                <option value="NEAREST">Nearest</option>
                <option value="EMERGENCY_FIRST">Emergency First</option>
                <option value="NAME">Name</option>
              </select>
            </div>
          </div>

          {/* Filter Sub-Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              'All',
              'Hospital',
              'Clinic',
              'Pharmacy',
              'Ambulance',
              'Blood Bank',
              'Emergency Department',
              'Maternity'
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setFacilityTypeFilter(tab)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors ${
                  facilityTypeFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Facilities List */}
          {filteredFacilities.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-2">
              <Hospital className="w-8 h-8 text-slate-300 mx-auto" />
              <h5 className="text-xs font-bold text-slate-700">No medical resources found</h5>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                No verified medical facilities matched your query "{searchQuery}". For urgent emergencies, immediately dial 112 or 108.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFacilityTypeFilter('All');
                }}
                className="mt-2 text-xs font-bold text-rose-600 hover:underline"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.id}
                  className="bg-white border border-slate-200/90 hover:border-rose-300 rounded-2xl p-3.5 shadow-2xs space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                          {fac.type}
                        </span>
                        {fac.hasEmergencyDepartment && (
                          <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            🚨 24x7 Emergency Dept
                          </span>
                        )}
                        {fac.is24x7 && !fac.hasEmergencyDepartment && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">
                            24x7 Open
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-slate-900 mt-1 leading-snug">
                        {fac.name}
                      </h4>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{fac.address}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 mt-1">
                        <span className="text-emerald-700">📍 {fac.distanceKm} km away</span>
                        <span>•</span>
                        <span className="text-slate-500">{fac.openingHours || (fac.is24x7 ? '24 Hours' : 'Open')}</span>
                      </div>
                    </div>

                    {/* Primary Call Action */}
                    <button
                      onClick={() => openCallConfirm(fac.name, fac.phone, fac.type, fac.address)}
                      className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs active:scale-90 transition-all flex-shrink-0"
                      title={`Call ${fac.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Specialties Pills */}
                  {fac.specialties && fac.specialties.length > 0 && (
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {fac.specialties.slice(0, 4).map((spec) => (
                        <span
                          key={spec}
                          className="text-[9px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                          {spec}
                        </span>
                      ))}
                      {fac.specialties.length > 4 && (
                        <span className="text-[9px] text-slate-400 font-bold">
                          +{fac.specialties.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Actions: Details, Directions, Share */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedFacilityDetail(fac)}
                        className="text-rose-700 hover:underline font-bold text-[11px]"
                      >
                        View Details & Verification
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${fac.name} ${fac.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3 text-slate-500" />
                        <span>Directions</span>
                      </a>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: fac.name,
                              text: `${fac.name}\n${fac.address}\nPhone: ${fac.phone}`
                            }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(`${fac.name}\n${fac.address}\nPhone: ${fac.phone}`);
                            setCallBanner(`Copied ${fac.name} details to clipboard!`);
                            setTimeout(() => setCallBanner(null), 3000);
                          }
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1"
                        title="Share facility details"
                      >
                        <Share2 className="w-3 h-3 text-slate-500" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-slate-100 rounded-2xl p-3.5 text-[10px] text-slate-600 leading-relaxed text-center space-y-1">
          <p className="font-bold text-slate-700">ONESETU Emergency Disclaimer</p>
          <p>
            ONESETU is an emergency discovery and verified resource directory. It does not provide medical diagnoses or clinical prescriptions. In life-threatening emergencies, immediately dial India Unified Emergency 112 or Ambulance 108.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: AI EMERGENCY ASSISTANT                          */}
      {/* ======================================================== */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    AI Emergency Assistant
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Emergency-routing recommendation only
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  Describe what is happening:
                </label>
                <textarea
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  placeholder="e.g. My mother has severe chest pain and is sweating."
                  rows={3}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              {/* Sample Prompt Chips for Testing / Demo */}
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-1.5">
                  Try standard emergency test scenarios:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'My mother has severe chest pain and is sweating.',
                    'My wife is pregnant and is having heavy bleeding.',
                    'My father suddenly cannot speak properly and one side is weak.',
                    'My child swallowed an unknown chemical.',
                    'I need a pharmacy near me.'
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => {
                        setAiInputText(sample);
                        handleRunAiAssistant(sample);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 font-semibold px-2 py-1 rounded-lg text-left transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunAiAssistant()}
                  disabled={!aiInputText.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Analyze Situation</span>
                </button>
                <button
                  onClick={() => setIsAiSimulatedFailure(!isAiSimulatedFailure)}
                  className={`px-2.5 py-2.5 rounded-xl text-[10px] font-bold border transition-colors ${
                    isAiSimulatedFailure
                      ? 'bg-rose-100 border-rose-300 text-rose-800'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                  title="Toggle simulated AI API network failure"
                >
                  {isAiSimulatedFailure ? 'AI Error Active' : 'Simulate Fail'}
                </button>
              </div>

              {/* AI Failure Fallback Output */}
              {isAiSimulatedFailure && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="text-xs font-bold">AI assistance is currently unavailable.</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-snug">
                    Do not wait for AI. If you are facing an emergency, contact verified medical services immediately:
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => openCallConfirm('Unified Emergency', '112')}
                      className="py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>CALL 112</span>
                    </button>
                    <button
                      onClick={() => openCallConfirm('Ambulance Dispatch', '108')}
                      className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Ambulance className="w-3.5 h-3.5" />
                      <span>CALL 108</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STRUCTURED AI OUTPUT (Section 4 & 5 Compliant) */}
              {aiResponse && !isAiSimulatedFailure && (
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5 space-y-3 animate-fadeIn">
                  {/* Urgency Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        aiResponse.urgency === 'HIGH PRIORITY EMERGENCY'
                          ? 'bg-red-600 text-white animate-pulse'
                          : aiResponse.urgency === 'NON-EMERGENCY RESOURCE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {aiResponse.urgency}
                    </span>
                    {aiResponse.isDeterministicSafetyTriggered && (
                      <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                        Safety Layer Triggered
                      </span>
                    )}
                  </div>

                  {/* Assessment */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      ASSESSMENT:
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {aiResponse.assessment}
                    </p>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      RECOMMENDED ACTION:
                    </span>
                    <p className="text-xs font-extrabold text-rose-700 mt-0.5">
                      {aiResponse.recommendedAction}
                    </p>
                  </div>

                  {/* Immediate Call Action Buttons (No Delay) */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() =>
                        openCallConfirm(
                          aiResponse.primaryContact.label,
                          aiResponse.primaryContact.number,
                          aiResponse.urgency
                        )
                      }
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{aiResponse.primaryContact.label}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() =>
                          openCallConfirm(
                            'Ambulance',
                            aiResponse.ambulanceContact.number,
                            'Ambulance Dispatch'
                          )
                        }
                        className="py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xs rounded-xl flex items-center justify-center gap-1"
                      >
                        <Ambulance className="w-3.5 h-3.5" />
                        <span>{aiResponse.ambulanceContact.label}</span>
                      </button>

                      {aiResponse.specializedContact && (
                        <button
                          onClick={() =>
                            openCallConfirm(
                              aiResponse.specializedContact!.service,
                              aiResponse.specializedContact!.number,
                              'Specialized Support'
                            )
                          }
                          className="py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-black text-xs rounded-xl flex items-center justify-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span className="truncate">{aiResponse.specializedContact.label}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* WHY Explanation */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      WHY:
                    </span>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-snug">
                      {aiResponse.why}
                    </p>
                  </div>

                  {/* Useful Triage Questions (AFTER call buttons) */}
                  {aiResponse.usefulQuestions && aiResponse.usefulQuestions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-500">
                        Helpful Emergency Details (Share with responders):
                      </span>
                      <ul className="text-[10px] text-slate-600 list-disc list-inside space-y-0.5">
                        {aiResponse.usefulQuestions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nearby Emergency Facilities */}
                  {aiResponse.nearbyFacilities && aiResponse.nearbyFacilities.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        NEARBY HELP:
                      </span>
                      <div className="space-y-1.5 mt-1">
                        {aiResponse.nearbyFacilities.map((fac) => (
                          <div
                            key={fac.id}
                            className="bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-slate-900 truncate">{fac.name}</div>
                              <div className="text-[10px] text-slate-500">{fac.distanceKm} km away • {fac.type}</div>
                            </div>
                            <button
                              onClick={() => openCallConfirm(fac.name, fac.phone, fac.type)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 flex-shrink-0"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Safety Disclaimer */}
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 font-semibold leading-relaxed">
                    ⚠️ {aiResponse.disclaimer}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EMERGENCY CALL CONFIRMATION UX (Section 15)     */}
      {/* ======================================================== */}
      {confirmCallTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl border border-rose-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-2">
                Call Emergency Service?
              </h3>
              <p className="text-xs font-extrabold text-rose-600">
                {confirmCallTarget.title}
              </p>
              <div className="text-base font-black text-slate-900 bg-slate-100 py-1 px-3 rounded-xl inline-block mt-1">
                {confirmCallTarget.number}
              </div>
              {confirmCallTarget.notes && (
                <p className="text-[10px] text-slate-500 pt-1 leading-snug">
                  {confirmCallTarget.notes}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => triggerCall(confirmCallTarget.title, confirmCallTarget.number)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>CALL NOW</span>
              </button>
              <button
                onClick={() => setConfirmCallTarget(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: MEDICAL FACILITY DETAILS & VERIFICATION        */}
      {/* ======================================================== */}
      {selectedFacilityDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-2 border-b border-slate-100">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {selectedFacilityDetail.type}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">
                  {selectedFacilityDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFacilityDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs flex-shrink-0"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-700">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Address & Distance:</span>
                <p className="font-semibold text-slate-900">{selectedFacilityDetail.address}</p>
                <p className="text-emerald-700 font-bold">📍 {selectedFacilityDetail.distanceKm} km from your current location</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500">Operating Hours & Emergency Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900">{selectedFacilityDetail.openingHours || '24 Hours'}</span>
                  {selectedFacilityDetail.hasEmergencyDepartment && (
                    <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      🚨 Dedicated Trauma / Emergency ICU
                    </span>
                  )}
                </div>
              </div>

              {selectedFacilityDetail.specialties && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500">Medical Specialties & Departments:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFacilityDetail.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provenance & Verification Metadata */}
              <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 border border-slate-100 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="text-emerald-700 font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedFacilityDetail.verificationStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Official Source: </span>
                  <span className="font-bold text-slate-900">{selectedFacilityDetail.source}</span>
                </div>
                <div>
                  <span className="text-slate-500">Last Verified Date: </span>
                  <span className="font-bold text-slate-900">{selectedFacilityDetail.verifiedAt}</span>
                </div>
                {selectedFacilityDetail.notes && (
                  <p className="text-[10px] text-slate-500 italic pt-1">{selectedFacilityDetail.notes}</p>
                )}
              </div>
            </div>

            {/* Primary Actions: Call & Directions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  openCallConfirm(
                    selectedFacilityDetail.name,
                    selectedFacilityDetail.phone,
                    selectedFacilityDetail.type
                  )
                }
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Facility</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${selectedFacilityDetail.name} ${selectedFacilityDetail.city}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-rose-300" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: MANUAL LOCATION PICKER (Section 7 Fallback)     */}
      {/* ======================================================== */}
      {isLocationPickerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Select Medical Location</h3>
            <p className="text-xs text-slate-500">
              Emergency numbers remain nationwide (112), while ambulance and hospital facilities match your chosen district.
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
                    setSelectedLocation(loc);
                    store.setLocation(loc);
                    setIsLocationPickerOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-between ${
                    selectedLocation === loc
                      ? 'bg-rose-50 border-rose-300 text-rose-900'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>📍 {loc}</span>
                  {selectedLocation === loc && (
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsLocationPickerOpen(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
