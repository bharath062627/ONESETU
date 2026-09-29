import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import {
  ArrowLeft,
  Search,
  X,
  Star,
  MapPin,
  CheckCircle2,
  Heart,
  Wheat,
  Wrench,
  Truck,
  PlusSquare,
  Phone,
  ShieldCheck,
  TrendingUp,
  Hospital
} from 'lucide-react';
import { EquipmentItem, ServiceProvider, TransportVehicle, ProduceItem, EmergencyContact } from '../../types';
import { EquipmentImageResolver } from '../../services/equipmentImages';

interface SearchScreenProps {
  onSelectEquipment?: (item: EquipmentItem) => void;
  onSelectProvider?: (provider: ServiceProvider) => void;
  onSelectVehicle?: (vehicle: TransportVehicle) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectEquipment,
  onSelectProvider,
  onSelectVehicle
}) => {
  const [query, setQuery] = useState(store.getSearchQuery() || '');
  const [selectedTab, setSelectedTab] = useState<'all' | 'farm' | 'work' | 'medical' | 'move'>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = store.getSearchQuery();
    if (q) setQuery(q);
  }, []);

  const allEquipment = store.getEquipment();
  const allProduce = store.getProduce();
  const allVehicles = store.getVehicles();
  const allProviders = store.getProviders();
  const allEmergency = store.getEmergencyContacts();
  const allHospitals = store.getNearbyHospitals();

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const qLower = query.toLowerCase().trim();

  // Filter based on search query across all 4 categories
  const filteredEquipment = allEquipment.filter(
    (e) =>
      !qLower ||
      e.equipmentName.toLowerCase().includes(qLower) ||
      e.type.toLowerCase().includes(qLower) ||
      e.location.toLowerCase().includes(qLower) ||
      (e.brand && e.brand.toLowerCase().includes(qLower))
  );

  const filteredProduce = allProduce.filter(
    (p) =>
      !qLower ||
      p.productName.toLowerCase().includes(qLower) ||
      p.category.toLowerCase().includes(qLower) ||
      p.location.toLowerCase().includes(qLower)
  );

  const filteredProviders = allProviders.filter(
    (p) =>
      !qLower ||
      p.name.toLowerCase().includes(qLower) ||
      p.serviceCategory.toLowerCase().includes(qLower) ||
      p.skills.some((s) => s.toLowerCase().includes(qLower)) ||
      p.location.toLowerCase().includes(qLower)
  );

  const filteredVehicles = allVehicles.filter(
    (v) =>
      !qLower ||
      v.vehicleName.toLowerCase().includes(qLower) ||
      v.vehicleType.toLowerCase().includes(qLower) ||
      v.location.toLowerCase().includes(qLower)
  );

  const filteredMedical = [...allEmergency, ...allHospitals].filter(
    (m) =>
      !qLower ||
      m.title.toLowerCase().includes(qLower) ||
      m.category.toLowerCase().includes(qLower) ||
      (m.subtitle && m.subtitle.toLowerCase().includes(qLower)) ||
      (m.address && m.address.toLowerCase().includes(qLower))
  );

  const totalResults =
    (selectedTab === 'all' || selectedTab === 'farm' ? filteredEquipment.length + filteredProduce.length : 0) +
    (selectedTab === 'all' || selectedTab === 'work' ? filteredProviders.length : 0) +
    (selectedTab === 'all' || selectedTab === 'medical' ? filteredMedical.length : 0) +
    (selectedTab === 'all' || selectedTab === 'move' ? filteredVehicles.length : 0);

  const handleQuickKeyword = (kw: string) => {
    setQuery(kw);
    store.setSearchQuery(kw);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Search Bar */}
      <div className="bg-white px-4 pt-8 pb-3 border-b border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => store.goBack()}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Box */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                store.setSearchQuery(e.target.value);
              }}
              placeholder="Search farm, work, medical, move..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 text-xs font-semibold text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  store.setSearchQuery('');
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pb-0.5">
          {['tomato', 'tractor', 'electrician', 'plumber', 'hospital', 'truck', 'banana', 'sprayer'].map((kw) => (
            <button
              key={kw}
              onClick={() => handleQuickKeyword(kw)}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 whitespace-nowrap transition-colors"
            >
              #{kw}
            </button>
          ))}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setSelectedTab('farm')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              selectedTab === 'farm'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wheat className="w-3 h-3" />
            <span>Farm ({filteredEquipment.length + filteredProduce.length})</span>
          </button>
          <button
            onClick={() => setSelectedTab('work')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              selectedTab === 'work'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span>Work ({filteredProviders.length})</span>
          </button>
          <button
            onClick={() => setSelectedTab('medical')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              selectedTab === 'medical'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PlusSquare className="w-3 h-3" />
            <span>Medical ({filteredMedical.length})</span>
          </button>
          <button
            onClick={() => setSelectedTab('move')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              selectedTab === 'move'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Move ({filteredVehicles.length})</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {totalResults === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No results found</h4>
            <p className="text-[11px] text-slate-500">
              Try searching with another keyword like 'tractor', 'tomato', 'electrician' or 'hospital'.
            </p>
          </div>
        ) : (
          <>
            {/* FARM: Produce Results */}
            {(selectedTab === 'all' || selectedTab === 'farm') && filteredProduce.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 uppercase tracking-wide">
                  <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Farm Produce ({filteredProduce.length})</span>
                </div>
                {filteredProduce.map((p, idx) => (
                  <div
                    key={`${p.id}-${idx}`}
                    onClick={() => store.navigateTo('farm')}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer relative"
                  >
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={p.image} alt={p.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{p.productName}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            {p.category}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-emerald-800 mt-0.5">
                          ₹{p.expectedPrice}{' '}
                          <span className="text-[10px] font-normal text-slate-500">/ {p.unit}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>📍 {p.location} • {p.quantity} {p.unit}</span>
                        <span className="font-bold text-emerald-700">View in Farm →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FARM: Equipment Results */}
            {(selectedTab === 'all' || selectedTab === 'farm') && filteredEquipment.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 uppercase tracking-wide">
                  <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Farm Machinery & Equipment ({filteredEquipment.length})</span>
                </div>
                {filteredEquipment.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      if (onSelectEquipment) onSelectEquipment(item);
                      else store.navigateTo('farm');
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer relative"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      <img
                        src={EquipmentImageResolver.resolve(item)}
                        alt={item.equipmentName}
                        className="w-full h-full object-cover"
                      />
                      {item.imageUrls && item.imageUrls.length > 1 && (
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 py-0.2 rounded font-mono">
                          {item.imageUrls.length} photos
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                          {item.equipmentName}
                        </h4>
                        <div className="text-sm font-extrabold text-emerald-800 mt-0.5">
                          {item.isUsedEquipmentSale ? (
                            <>₹{item.priceToBuy?.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-500">Buy</span></>
                          ) : (
                            <>₹{item.pricePerHour} <span className="text-[10px] font-normal text-slate-500">/ hr</span></>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800">{item.rating}</span>
                          <span>• {item.distanceKm} km</span>
                        </div>
                        <span className="text-emerald-700 font-bold">{item.isUsedEquipmentSale ? 'Buy Machinery' : 'Book Rent →'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* WORK: Service Providers Results */}
            {(selectedTab === 'all' || selectedTab === 'work') && filteredProviders.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-blue-950 uppercase tracking-wide">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  <span>Work & Home Services ({filteredProviders.length})</span>
                </div>
                {filteredProviders.map((p, idx) => (
                  <div
                    key={`${p.id}-${idx}`}
                    onClick={() => {
                      store.setSelectedProvider(p.id);
                      if (onSelectProvider) onSelectProvider(p);
                      else store.navigateTo('provider-detail');
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer relative"
                  >
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                          {p.verified && (
                            <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          {p.serviceCategory} • {p.experienceYears}+ years exp
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800">{p.rating}</span>
                          <span>({p.completedJobs} jobs)</span>
                        </div>
                        <span className="text-blue-700 font-bold">Book Service →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MOVE: Transport Vehicles */}
            {(selectedTab === 'all' || selectedTab === 'move') && filteredVehicles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wide">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Move & Goods Transport ({filteredVehicles.length})</span>
                </div>
                {filteredVehicles.map((v, idx) => (
                  <div
                    key={`${v.id}-${idx}`}
                    onClick={() => {
                      if (onSelectVehicle) onSelectVehicle(v);
                      else store.navigateTo('move');
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer relative"
                  >
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={v.image} alt={v.vehicleName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{v.vehicleName}</h4>
                        <div className="text-xs font-extrabold text-amber-800 mt-0.5">
                          ₹{v.pricePerKm} <span className="text-[10px] font-normal text-slate-500">/ km • {v.capacityKg} kg cap</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>📍 {v.location} ({v.distanceKm} km)</span>
                        <span className="text-amber-800 font-bold">Book Transport →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEDICAL: Emergency & Hospitals */}
            {(selectedTab === 'all' || selectedTab === 'medical') && filteredMedical.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-950 uppercase tracking-wide">
                  <PlusSquare className="w-3.5 h-3.5 text-rose-600" />
                  <span>Medical & Emergency Resources ({filteredMedical.length})</span>
                </div>
                {filteredMedical.map((m, idx) => (
                  <div
                    key={`${m.id}-${idx}`}
                    onClick={() => store.navigateTo('medical')}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center flex-shrink-0">
                        <Hospital className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{m.subtitle || m.address}</p>
                        {m.distanceKm && (
                          <span className="text-[9px] text-slate-400">📍 {m.distanceKm} km away</span>
                        )}
                      </div>
                    </div>
                    <a
                      href={`tel:${m.dialNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs flex-shrink-0"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{m.dialNumber}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
