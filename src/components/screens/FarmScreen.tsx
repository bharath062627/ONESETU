import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { marketDataService } from '../../services/marketDataService';
import { EquipmentImageResolver } from '../../services/equipmentImages';
import { FarmerProductImageResolver } from '../../services/productImages';
import { MarketAiService } from '../../services/marketAiService';
import {
  EquipmentItem,
  FarmerProduct,
  MandiRecord,
  HistoricalPriceObservation,
  AiMarketInsight
} from '../../types';
import { CreateFarmerSalesProductModal } from '../modals/CreateFarmerSalesProductModal';
import { FarmerProductDetailModal } from '../modals/FarmerProductDetailModal';
import { CreateRentalEquipmentModal } from '../modals/CreateRentalEquipmentModal';
import { CreateUsedEquipmentModal } from '../modals/CreateUsedEquipmentModal';
import { BookServiceModal } from '../modals/BookServiceModal';
import { AdminEditEquipmentModal } from '../modals/AdminEditEquipmentModal';
import { AdminManagePhotosModal } from '../modals/AdminManagePhotosModal';
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Wheat,
  Star,
  MapPin,
  CheckCircle2,
  Award,
  Wrench,
  Tag,
  ArrowRight,
  Phone,
  MessageSquare,
  ShoppingCart,
  Trash2,
  ShieldCheck,
  CreditCard,
  Filter,
  BarChart3,
  Calendar,
  Clock,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Edit3,
  MoreVertical,
  Camera,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';

interface FarmScreenProps {
  onOpenCreateProduce?: () => void;
  onOpenCreateRentalEquipment?: () => void;
  onOpenCreateUsedEquipment?: () => void;
  onSelectEquipment?: (item: EquipmentItem) => void;
  onOpenChat?: () => void;
}

export type FarmTabId = 'market-rate' | 'sale-point' | 'rent' | 'used';

export const FarmScreen: React.FC<FarmScreenProps> = ({
  onOpenChat
}) => {
  const [activeTab, setActiveTab] = useState<FarmTabId>('market-rate');
  const [marketSearchQuery, setMarketSearchQuery] = useState('Tomato');
  const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>(undefined);
  const [marketSortBy, setMarketSortBy] = useState<'price_desc' | 'price_asc' | 'distance'>('price_desc');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isOperatorEditModalOpen, setIsOperatorEditModalOpen] = useState(false);
  const [operatorEditRecord, setOperatorEditRecord] = useState<MandiRecord | null>(null);
  const [operatorNewPrice, setOperatorNewPrice] = useState('');
  const [operatorReason, setOperatorReason] = useState('');
  const [operatorEvidence, setOperatorEvidence] = useState('');
  const [operatorSuccessMsg, setOperatorSuccessMsg] = useState<string | null>(null);

  // Farmer Sales Point filters
  const [saleCategoryFilter, setSaleCategoryFilter] = useState<string>('All');
  const [saleSearchQuery, setSaleSearchQuery] = useState('');
  const [salePriceSort, setSalePriceSort] = useState<'default' | 'low-high' | 'high-low' | 'nearest'>('default');
  const [selectedProductDetail, setSelectedProductDetail] = useState<FarmerProduct | null>(null);
  const [isCreateSalesProductOpen, setIsCreateSalesProductOpen] = useState(false);
  const [editSalesProduct, setEditSalesProduct] = useState<FarmerProduct | null>(null);

  // Equipment filters
  const [equipSearchQuery, setEquipSearchQuery] = useState('');
  const [selectedEquipCategory, setSelectedEquipCategory] = useState<string>('All');
  const [isCreateRentalOpen, setIsCreateRentalOpen] = useState(false);
  const [isCreateUsedOpen, setIsCreateUsedOpen] = useState(false);
  const [bookingEquipment, setBookingEquipment] = useState<EquipmentItem | null>(null);

  // Admin Controls State
  const [adminEditingEquipment, setAdminEditingEquipment] = useState<EquipmentItem | null>(null);
  const [adminPhotosTarget, setAdminPhotosTarget] = useState<{
    targetModule: 'EQUIPMENT_RENT' | 'USED_EQUIPMENT' | 'SALE_POINT';
    targetId: string;
    targetTitle: string;
    initialPhotos: string[];
    initialPrimaryPhoto?: string;
  } | null>(null);
  const [activeAdminMenuId, setActiveAdminMenuId] = useState<string | null>(null);

  // Data subscriptions
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubStore = store.subscribe(() => setTick((t) => t + 1));
    const unsubMarket = marketDataService.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsubStore();
      unsubMarket();
    };
  }, []);

  const user = store.getUser();
  const isAdmin = user.activeRole === 'ADMIN' || user.roles.includes('ADMIN');
  const userDistrict = user.location.split(',')[0].trim() || 'Mysuru';
  const farmerProductList = store.getFarmerProducts();
  const equipmentList = store.getEquipment();
  const syncStatus = marketDataService.getSyncStatus();

  // ==========================================
  // 1. MARKET RATE DATA LOGIC
  // ==========================================
  const availableCommodities = marketDataService.getCommodities();
  const currentCommodityName = marketSearchQuery.trim() || 'Tomato';
  const comparison = marketDataService.getComparison(currentCommodityName, userDistrict, selectedMarketId);

  const history: HistoricalPriceObservation[] = marketDataService.getHistory(
    currentCommodityName,
    7,
    comparison?.selectedMarket?.market
  );

  const aiInsight: AiMarketInsight = comparison
    ? MarketAiService.generateInsights(
        currentCommodityName,
        comparison.comparisonMarkets,
        history,
        comparison.priceChange,
        userDistrict
      )
    : {
        summary: 'No official market observations available for this commodity.',
        spreadAnalysis: 'Price comparison temporarily unavailable.',
        anomalyDetected: false
      };

  let displayMarkets: MandiRecord[] = comparison?.comparisonMarkets || [];
  displayMarkets = [...displayMarkets].sort((a, b) => {
    if (marketSortBy === 'price_desc') return b.modalPrice - a.modalPrice;
    if (marketSortBy === 'price_asc') return a.modalPrice - b.modalPrice;
    if (marketSortBy === 'distance') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    return 0;
  });

  const activeMarket = comparison?.selectedMarket || comparison?.baseMarket;

  // Identify highest and lowest modal markets in displayed list
  let highestMarketId: string | null = null;
  let lowestMarketId: string | null = null;
  if (displayMarkets.length > 0) {
    const sortedByPrice = [...displayMarkets].sort((a, b) => b.modalPrice - a.modalPrice);
    highestMarketId = sortedByPrice[0].id;
    if (sortedByPrice.length > 1) {
      lowestMarketId = sortedByPrice[sortedByPrice.length - 1].id;
    }
  }

  // ==========================================
  // 2. SALE POINT DATA LOGIC
  // ==========================================
  const saleCategories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Other'];
  const filteredFarmerProducts = farmerProductList
    .filter((item) => {
      const matchesCat =
        saleCategoryFilter === 'All' ||
        item.category === saleCategoryFilter ||
        (saleCategoryFilter === 'Other' && item.category === 'Other Farm Products');
      const matchesSearch =
        item.productName.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(saleSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(saleSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (salePriceSort === 'low-high') return a.sellingPrice - b.sellingPrice;
      if (salePriceSort === 'high-low') return b.sellingPrice - a.sellingPrice;
      if (salePriceSort === 'nearest') return (a.distanceKm || 99) - (b.distanceKm || 99);
      return 0;
    });

  // ==========================================
  // 3. EQUIPMENT RENT & 4. USED EQUIPMENT LOGIC
  // ==========================================
  const equipCategories = ['All', 'Tractor', 'Sprayer', 'Harvester', 'Rotavator', 'Cultivator', 'Seeder', 'Plough'];

  const rentalEquipment = equipmentList
    .filter((e) => !e.isUsedEquipmentSale)
    .filter((item) => {
      const matchesCat = selectedEquipCategory === 'All' || item.type === selectedEquipCategory;
      const matchesSearch =
        item.equipmentName.toLowerCase().includes(equipSearchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(equipSearchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(equipSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

  const usedEquipment = equipmentList
    .filter((e) => e.isUsedEquipmentSale)
    .filter((item) => {
      const matchesCat = selectedEquipCategory === 'All' || item.type === selectedEquipCategory;
      const matchesSearch =
        item.equipmentName.toLowerCase().includes(equipSearchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(equipSearchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(equipSearchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

  const handleOperatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorEditRecord) return;
    const priceNum = Number(operatorNewPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    marketDataService.updatePriceRecord(
      operatorEditRecord.id,
      'modalPrice',
      priceNum,
      user.id,
      user.activeRole === 'ADMIN' ? 'ADMIN' : 'OPERATOR',
      operatorReason.trim() || 'Manual verification by Market Data Operator',
      operatorEvidence.trim() || 'APMC Physical Gate Sheet Verification'
    );

    setOperatorSuccessMsg(`Successfully updated modal price to ₹${priceNum}/kg with audit trail.`);
    setTimeout(() => {
      setOperatorSuccessMsg(null);
      setIsOperatorEditModalOpen(false);
      setOperatorEditRecord(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none relative">
      {/* Top Banner Header with Farm Theme */}
      <div className="relative bg-emerald-950 text-white px-4 pt-7 pb-3.5 rounded-b-[28px] overflow-hidden shadow-sm">
        {/* Farm Background Image with dark overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80"
            alt="Farm landscape"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Farm</span>
                <Wheat className="w-5 h-5 text-emerald-400" />
              </h2>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Official Mandi Rates & Farmer Marketplace Platform
              </p>
            </div>
            {/* Quick Benchmark Link */}
            <button
              onClick={() => store.navigateTo('top10-markets')}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-emerald-600/50 shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Top 10 Mandis</span>
            </button>
          </div>

          {/* EXACTLY 4 PRIMARY SECTIONS TAB NAVIGATOR */}
          <div className="mt-3.5 p-1 bg-emerald-900/80 rounded-2xl grid grid-cols-4 gap-1">
            <button
              onClick={() => setActiveTab('market-rate')}
              className={`py-2 px-1 text-[11px] font-black rounded-xl text-center transition-all ${
                activeTab === 'market-rate'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              1. Market Rate
            </button>
            <button
              onClick={() => setActiveTab('sale-point')}
              className={`py-2 px-1 text-[11px] font-black rounded-xl text-center transition-all ${
                activeTab === 'sale-point'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              2. Sale Point
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`py-2 px-1 text-[11px] font-black rounded-xl text-center transition-all ${
                activeTab === 'rent'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              3. Equip Rent
            </button>
            <button
              onClick={() => setActiveTab('used')}
              className={`py-2 px-1 text-[11px] font-black rounded-xl text-center transition-all ${
                activeTab === 'used'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              4. Used Equip
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MARKET RATE — HERO FEATURE */}
      {/* ========================================================================= */}
      {activeTab === 'market-rate' && (
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3.5">
          {/* Commodity Text Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-emerald-700" />
            </div>
            <input
              type="text"
              value={marketSearchQuery}
              onChange={(e) => {
                setMarketSearchQuery(e.target.value);
                setSelectedMarketId(undefined);
              }}
              placeholder="Search commodity (Tomato, Onion, Potato, Mango, Banana, Carrot...)"
              className="w-full pl-10 pr-3 py-2.5 bg-white text-xs font-bold text-slate-900 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          {/* Quick Commodity Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {['Tomato', 'Onion', 'Potato', 'Banana', 'Mango', 'Carrot', 'Cabbage', 'Cauliflower', 'Paddy', 'Wheat'].map((comm) => (
              <button
                key={comm}
                onClick={() => {
                  setMarketSearchQuery(comm);
                  setSelectedMarketId(undefined);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  marketSearchQuery.toLowerCase() === comm.toLowerCase()
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {comm}
              </button>
            ))}
          </div>

          {/* Hero Mandi Benchmark Rate Card */}
          {activeMarket ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative overflow-hidden space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider">
                      DAILY MARKET RATE
                    </span>
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>Latest Available Mandi Rate</span>
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {activeMarket.commodityNormalized}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Variety: {activeMarket.variety} • Grade: {activeMarket.grade}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Modal Price
                  </span>
                  <span className="text-2xl font-black text-emerald-800">
                    ₹{activeMarket.modalPrice}
                    <span className="text-xs font-bold text-slate-500"> / kg</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    (₹{activeMarket.modalPricePerQuintal} / quintal)
                  </span>
                </div>
              </div>

              {/* Min / Modal / Max Price Triple Box */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Minimum
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    ₹{activeMarket.minimumPrice}
                  </span>
                  <span className="text-[9px] text-slate-400 block">₹{activeMarket.minPricePerQuintal}/q</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                    Modal Price
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    ₹{activeMarket.modalPrice}
                  </span>
                  <span className="text-[9px] text-emerald-600 block">₹{activeMarket.modalPricePerQuintal}/q</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    Maximum
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">
                    ₹{activeMarket.maximumPrice}
                  </span>
                  <span className="text-[9px] text-slate-400 block">₹{activeMarket.maxPricePerQuintal}/q</span>
                </div>
              </div>

              {/* Data Provenance & Verification Details */}
              <div className="pt-1 text-[11px] text-slate-600 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Market: {activeMarket.market}</span>
                  </div>
                  <span className="text-slate-500">{activeMarket.district}, {activeMarket.state}</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[10px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Market Data Date: {activeMarket.arrivalDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Fetched: {syncStatus.lastSuccessfulSync.split(' ')[1] || '08:30'} IST</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">
                    Source: <strong className="text-slate-700">Government of India OGD / AGMARKNET</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSourceModalOpen(true)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-200"
                    >
                      <span>[VIEW SOURCE]</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    {(user.activeRole === 'ADMIN' || user.roles.includes('ADMIN')) && (
                      <button
                        onClick={() => {
                          setOperatorEditRecord(activeMarket);
                          setOperatorNewPrice(String(activeMarket.modalPrice));
                          setIsOperatorEditModalOpen(true);
                        }}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 border border-amber-200"
                        title="Market Data Operator Price Correction"
                      >
                        <Edit3 className="w-3 h-3 text-amber-700" />
                        <span>Operator Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Market data temporarily unavailable.</h4>
              <p className="text-xs text-slate-500">No official AGMARKNET records returned for &ldquo;{currentCommodityName}&rdquo;.</p>
            </div>
          )}

          {/* AI Market Intelligence Layer (Analysis & Forecast Only) */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-4 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  AI Market Intelligence
                </h4>
              </div>
              <span className="text-[9px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded font-mono">
                Analysis Layer Only
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {aiInsight.summary}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed font-normal border-t border-emerald-800/50 pt-2">
              {aiInsight.spreadAnalysis}
            </p>

            {/* AI Forecast Projection strictly labeled as "AI Forecast — Estimate Only" */}
            {aiInsight.forecast && (
              <div className="bg-white/10 rounded-2xl p-3 border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">
                    AI Forecast — Estimate Only ({aiInsight.forecast.period})
                  </span>
                  <span className="text-sm font-black text-white">
                    {aiInsight.forecast.projectedRange}
                  </span>
                </div>
                <div className="text-right max-w-[140px]">
                  <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded block text-center">
                    AI Forecast — Estimate Only
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Statistical curve projection</span>
                </div>
              </div>
            )}
          </div>

          {/* Multi-Market Comparison (Up to 10 Valid Markets) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Market Comparison ({displayMarkets.length} Mandis)
                </h4>
                <p className="text-[10px] text-slate-500">
                  Tap any market record to inspect provenance & transport distance
                </p>
              </div>
              <select
                value={marketSortBy}
                onChange={(e) => setMarketSortBy(e.target.value as any)}
                className="text-[10px] font-bold bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none"
              >
                <option value="price_desc">Highest Modal</option>
                <option value="price_asc">Lowest Modal</option>
                <option value="distance">Nearest First</option>
              </select>
            </div>

            {/* Non-misleading Market Guidance Note */}
            <div className="bg-slate-100 rounded-xl px-3 py-1.5 text-[10px] text-slate-600 flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Note:</span>
              <span>Highest modal price does not automatically guarantee higher net profit due to transit distance & mandi loading fees.</span>
            </div>

            <div className="space-y-2">
              {displayMarkets.map((item) => {
                const isSelected = activeMarket?.id === item.id;
                const isHighest = item.id === highestMarketId;
                const isLowest = item.id === lowestMarketId;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMarketId(item.id)}
                    className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30 shadow-xs'
                        : 'border-slate-200 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.market}
                          </h5>
                          {isHighest && (
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                              Highest reported modal price among displayed markets
                            </span>
                          )}
                          {isLowest && (
                            <span className="text-[9px] font-black bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded">
                              Lowest reported modal price among displayed markets
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-slate-800 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{item.district}, {item.state}</span>
                          {item.distanceKm !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-600">{item.distanceKm} km away</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          ₹{item.modalPrice}{' '}
                          <span className="text-[10px] font-normal text-slate-500">/ kg</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ₹{item.modalPricePerQuintal} / q
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SALE POINT — DIRECT FARMER PRODUCE MARKETPLACE */}
      {/* ========================================================================= */}
      {activeTab === 'sale-point' && (
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3">
          {/* Header Subtitle Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-3.5 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 flex-shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black">SALE POINT</h3>
                <p className="text-[10px] text-emerald-200">Farmers sell freshly grown produce directly to buyers • 0% middleman fees</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditSalesProduct(null);
                setIsCreateSalesProductOpen(true);
              }}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ ADD</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={saleSearchQuery}
                onChange={(e) => setSaleSearchQuery(e.target.value)}
                placeholder="Search farmer produce (Tomato, Onion, Banana...)"
                className="w-full pl-9 pr-3 py-2 bg-white text-xs font-medium text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Category Chips Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {saleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSaleCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  saleCategoryFilter === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sorting and Count Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
            <span className="font-bold text-slate-800">
              Farmer Produce ({filteredFarmerProducts.length})
            </span>
            <select
              value={salePriceSort}
              onChange={(e) => setSalePriceSort(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-semibold text-[10px] text-slate-700"
            >
              <option value="default">Sort: Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="nearest">Nearest First</option>
            </select>
          </div>

          {/* Farmer Produce Cards */}
          <div className="space-y-3">
            {filteredFarmerProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
                No farmer produce found matching your search.
              </div>
            ) : (
              filteredFarmerProducts.map((prod) => {
                const imageUrl = FarmerProductImageResolver.resolve(
                  prod.productName,
                  prod.category,
                  prod.primaryImageUrl,
                  prod.imageUrls
                );

                return (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProductDetail(prod)}
                    className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer relative group"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      <img
                        src={imageUrl}
                        alt={prod.productName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 bg-emerald-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        {prod.category}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                            {prod.productName}
                          </h4>
                          {prod.verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-extrabold text-emerald-800">
                            ₹{prod.sellingPrice}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            / {prod.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            ({prod.quantity} {prod.unit} available)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prod.location} {prod.distanceKm ? `(📍 ${prod.distanceKm} km)` : ''}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-1.5">
                        <span className="text-slate-600 font-medium truncate max-w-[120px]">
                          Farmer: {prod.farmerName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductDetail(prod);
                            }}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-2.5 py-1 rounded-xl text-[10px] transition-colors"
                          >
                            VIEW
                          </button>
                          {isAdmin && (
                            <div className="relative flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditSalesProduct(prod);
                                  setIsCreateSalesProductOpen(true);
                                }}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-amber-300"
                                title="Admin Edit Produce"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAdminPhotosTarget({
                                    targetModule: 'SALE_POINT',
                                    targetId: prod.id,
                                    targetTitle: prod.productName,
                                    initialPhotos: prod.imageUrls || (prod.primaryImageUrl ? [prod.primaryImageUrl] : []),
                                    initialPrimaryPhoto: prod.primaryImageUrl
                                  });
                                }}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-blue-300"
                                title="Manage Photos"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Photos</span>
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAdminMenuId(activeAdminMenuId === prod.id ? null : prod.id);
                                  }}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                                  title="Admin Options"
                                >
                                  <MoreVertical className="w-3 h-3" />
                                </button>

                                {activeAdminMenuId === prod.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs text-slate-700 space-y-0.5"
                                  >
                                    <button
                                      onClick={() => {
                                        setActiveAdminMenuId(null);
                                        setEditSalesProduct(prod);
                                        setIsCreateSalesProductOpen(true);
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Edit Produce</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveAdminMenuId(null);
                                        setAdminPhotosTarget({
                                          targetModule: 'SALE_POINT',
                                          targetId: prod.id,
                                          targetTitle: prod.productName,
                                          initialPhotos: prod.imageUrls || (prod.primaryImageUrl ? [prod.primaryImageUrl] : []),
                                          initialPrimaryPhoto: prod.primaryImageUrl
                                        });
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                    >
                                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Manage Photos</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveAdminMenuId(null);
                                        store.adminUpdateFarmerProduct(
                                          prod.id,
                                          prod.status === 'ACTIVE' ? 'HIDE' : 'RESTORE',
                                          user.id
                                        );
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                    >
                                      {prod.status === 'ACTIVE' ? (
                                        <>
                                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                          <span>Hide Listing</span>
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>Restore Listing</span>
                                        </>
                                      )}
                                    </button>
                                    <div className="border-t border-slate-100 my-0.5"></div>
                                    <button
                                      onClick={() => {
                                        setActiveAdminMenuId(null);
                                        if (confirm(`Delete produce "${prod.productName}"?`)) {
                                          store.adminUpdateFarmerProduct(prod.id, 'DELETE', user.id);
                                        }
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Delete Listing</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EQUIPMENT RENT */}
      {/* ========================================================================= */}
      {activeTab === 'rent' && (
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-emerald-700" />
            </div>
            <input
              type="text"
              value={equipSearchQuery}
              onChange={(e) => setEquipSearchQuery(e.target.value)}
              placeholder="Search machinery for rent (Tractor, Sprayer, Harvester, Rotavator...)"
              className="w-full pl-10 pr-3 py-2 bg-white text-xs font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {equipCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedEquipCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedEquipCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {rentalEquipment.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
                No rental machinery found matching your criteria.
              </div>
            ) : (
              rentalEquipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img
                      src={EquipmentImageResolver.resolve(item)}
                      alt={item.equipmentName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-emerald-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      {item.type}
                    </span>
                    {item.availability === 'Booked' && (
                      <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{item.equipmentName}</h4>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-sm font-extrabold text-emerald-800">
                          ₹{item.pricePerHour} / hr
                        </span>
                        {item.pricePerDay && (
                          <span className="text-[10px] text-slate-500">
                            (₹{item.pricePerDay}/day)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location} ({item.distanceKm} km away)</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="text-[10px] text-slate-600 font-medium truncate max-w-[90px]">Owner: {item.ownerName}</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <a
                          href={`tel:${item.ownerPhone}`}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-0.5"
                          title="Call Owner"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                        <button
                          onClick={() => setBookingEquipment(item)}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-2.5 py-1 rounded-lg text-[10px]"
                        >
                          BOOK
                        </button>
                        {isAdmin && (
                          <div className="relative flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdminEditingEquipment(item);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-amber-300"
                              title="Admin Edit Equipment"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdminPhotosTarget({
                                  targetModule: 'EQUIPMENT_RENT',
                                  targetId: item.id,
                                  targetTitle: item.equipmentName,
                                  initialPhotos: item.imageUrls || (item.image ? [item.image] : []),
                                  initialPrimaryPhoto: item.primaryImageUrl || item.image
                                });
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-blue-300"
                              title="Manage Photos"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Photos</span>
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAdminMenuId(activeAdminMenuId === item.id ? null : item.id);
                                }}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                                title="Admin Options"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </button>

                              {activeAdminMenuId === item.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs text-slate-700 space-y-0.5"
                                >
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      setAdminEditingEquipment(item);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Edit Equipment</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      setAdminPhotosTarget({
                                        targetModule: 'EQUIPMENT_RENT',
                                        targetId: item.id,
                                        targetTitle: item.equipmentName,
                                        initialPhotos: item.imageUrls || (item.image ? [item.image] : []),
                                        initialPrimaryPhoto: item.primaryImageUrl || item.image
                                      });
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Manage Photos</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      store.adminUpdateEquipment(
                                        item.id,
                                        item.availability === 'Booked' ? 'RESTORE' : 'HIDE',
                                        user.id
                                      );
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                  >
                                    {item.availability === 'Booked' ? (
                                      <>
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Restore Listing</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Hide Listing</span>
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t border-slate-100 my-0.5"></div>
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      if (confirm(`Delete listing "${item.equipmentName}"?`)) {
                                        store.adminUpdateEquipment(item.id, 'DELETE', user.id);
                                      }
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete Listing</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. USED EQUIPMENT */}
      {/* ========================================================================= */}
      {activeTab === 'used' && (
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-amber-700" />
            </div>
            <input
              type="text"
              value={equipSearchQuery}
              onChange={(e) => setEquipSearchQuery(e.target.value)}
              placeholder="Search pre-owned farm equipment (Tractor, Rotavator, Cultivator...)"
              className="w-full pl-10 pr-3 py-2 bg-white text-xs font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-2xs"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {equipCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedEquipCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedEquipCategory === cat
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {usedEquipment.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
                No pre-owned equipment found matching your search.
              </div>
            ) : (
              usedEquipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-3 shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img
                      src={EquipmentImageResolver.resolve(item)}
                      alt={item.equipmentName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-amber-800 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      Used {item.type}
                    </span>
                    {item.availability === 'Booked' && (
                      <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{item.equipmentName}</h4>
                      <div className="text-sm font-extrabold text-amber-900 mt-0.5">
                        ₹{item.priceToBuy?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Condition: <strong className="text-slate-700">{item.condition}</strong> {item.year ? `• Year: ${item.year}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="text-[10px] text-slate-600 font-medium truncate max-w-[90px]">Seller: {item.ownerName}</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <a
                          href={`tel:${item.ownerPhone}`}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5"
                          title="Call Seller"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                        {isAdmin && (
                          <div className="relative flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdminEditingEquipment(item);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-amber-300"
                              title="Admin Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdminPhotosTarget({
                                  targetModule: 'USED_EQUIPMENT',
                                  targetId: item.id,
                                  targetTitle: item.equipmentName,
                                  initialPhotos: item.imageUrls || (item.image ? [item.image] : []),
                                  initialPrimaryPhoto: item.primaryImageUrl || item.image
                                });
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-blue-300"
                              title="Manage Photos"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Photos</span>
                            </button>
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveAdminMenuId(activeAdminMenuId === item.id ? null : item.id);
                                }}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                                title="Admin Options"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </button>

                              {activeAdminMenuId === item.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs text-slate-700 space-y-0.5"
                                >
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      setAdminEditingEquipment(item);
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Edit Equipment</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      setAdminPhotosTarget({
                                        targetModule: 'USED_EQUIPMENT',
                                        targetId: item.id,
                                        targetTitle: item.equipmentName,
                                        initialPhotos: item.imageUrls || (item.image ? [item.image] : []),
                                        initialPrimaryPhoto: item.primaryImageUrl || item.image
                                      });
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Manage Photos</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      store.adminUpdateEquipment(
                                        item.id,
                                        item.availability === 'Booked' ? 'RESTORE' : 'HIDE',
                                        user.id
                                      );
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-bold flex items-center gap-2"
                                  >
                                    {item.availability === 'Booked' ? (
                                      <>
                                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Restore Listing</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Hide Listing</span>
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t border-slate-100 my-0.5"></div>
                                  <button
                                    onClick={() => {
                                      setActiveAdminMenuId(null);
                                      if (confirm(`Delete listing "${item.equipmentName}"?`)) {
                                        store.adminUpdateEquipment(item.id, 'DELETE', user.id);
                                      }
                                    }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Delete Listing</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-20 right-5 z-20">
        {activeTab === 'sale-point' && (
          <button
            onClick={() => {
              setEditSalesProduct(null);
              setIsCreateSalesProductOpen(true);
            }}
            className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white shadow-xl flex items-center gap-1.5 px-4 py-3 rounded-full font-bold text-xs transition-all border border-emerald-500/40"
            title="Add Produce For Sale (Farmer Sale Point)"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD PRODUCE FOR SALE</span>
          </button>
        )}

        {activeTab === 'rent' && (
          <button
            onClick={() => setIsCreateRentalOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white shadow-xl flex items-center gap-1.5 px-4 py-3 rounded-full font-bold text-xs transition-all border border-emerald-600/40"
            title="Add Equipment For Rent"
          >
            <Wrench className="w-4 h-4 text-emerald-300" />
            <Plus className="w-3.5 h-3.5" />
            <span>Add Equipment</span>
          </button>
        )}

        {activeTab === 'used' && (
          <button
            onClick={() => setIsCreateUsedOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-xl flex items-center gap-1.5 px-4 py-3 rounded-full font-bold text-xs transition-all border border-amber-400/40"
            title="Sell Used Equipment"
          >
            <Tag className="w-4 h-4 text-amber-200" />
            <Plus className="w-3.5 h-3.5" />
            <span>Sell Equipment</span>
          </button>
        )}
      </div>

      {/* Modal 1: Create / Edit Farmer Sale Point Product */}
      <CreateFarmerSalesProductModal
        isOpen={isCreateSalesProductOpen}
        editProduct={editSalesProduct}
        onClose={() => {
          setIsCreateSalesProductOpen(false);
          setEditSalesProduct(null);
        }}
        onSuccess={() => {
          setIsCreateSalesProductOpen(false);
          setEditSalesProduct(null);
        }}
      />

      {/* Modal 2: Customer Product Detail View */}
      <FarmerProductDetailModal
        isOpen={Boolean(selectedProductDetail)}
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onEdit={(prod) => {
          setEditSalesProduct(prod);
          setIsCreateSalesProductOpen(true);
        }}
        onOpenChat={onOpenChat}
      />

      {/* Modal 3: Add Equipment For Rent */}
      <CreateRentalEquipmentModal
        isOpen={isCreateRentalOpen}
        onClose={() => setIsCreateRentalOpen(false)}
        onSuccess={() => setIsCreateRentalOpen(false)}
      />

      {/* Modal 4: Sell Used Equipment */}
      <CreateUsedEquipmentModal
        isOpen={isCreateUsedOpen}
        onClose={() => setIsCreateUsedOpen(false)}
        onSuccess={() => setIsCreateUsedOpen(false)}
      />

      {/* Modal 5: Book Service / Equipment Rental */}
      <BookServiceModal
        isOpen={Boolean(bookingEquipment)}
        equipment={bookingEquipment || undefined}
        onClose={() => setBookingEquipment(null)}
      />

      {/* Modal 6: Admin Edit Equipment Modal */}
      <AdminEditEquipmentModal
        isOpen={Boolean(adminEditingEquipment)}
        equipment={adminEditingEquipment}
        onClose={() => setAdminEditingEquipment(null)}
        onSuccess={() => setAdminEditingEquipment(null)}
      />

      {/* Modal 7: Admin Manage Photos Modal */}
      <AdminManagePhotosModal
        isOpen={Boolean(adminPhotosTarget)}
        targetModule={adminPhotosTarget?.targetModule || 'EQUIPMENT_RENT'}
        targetId={adminPhotosTarget?.targetId || ''}
        targetTitle={adminPhotosTarget?.targetTitle || ''}
        initialPhotos={adminPhotosTarget?.initialPhotos || []}
        initialPrimaryPhoto={adminPhotosTarget?.initialPrimaryPhoto}
        onClose={() => setAdminPhotosTarget(null)}
        onSuccess={() => setAdminPhotosTarget(null)}
      />

      {/* Modal 6: Provenance & Transparency Source Modal */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Data Source Proof</h3>
              </div>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                <strong>Dataset:</strong> Daily Price of Agricultural Commodities from Regulated Mandis (APMC).
              </p>
              <p>
                <strong>Source:</strong> Government of India Open Data (data.gov.in) / AGMARKNET.
              </p>
              <p>
                <strong>Zero-Fabrication Principle:</strong> Official Government source data is the source of truth. AI never invents or guesses current market rates.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1">
                <div>Source URL: {syncStatus.apiEndpoint}</div>
                <div>Last Synced: {syncStatus.lastSuccessfulSync}</div>
                <div>Status: {syncStatus.currentSyncStatus}</div>
              </div>
            </div>

            <button
              onClick={() => setIsSourceModalOpen(false)}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal 7: Market Data Operator Price Correction Modal */}
      {isOperatorEditModalOpen && operatorEditRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Operator Price Correction</h3>
                  <p className="text-[10px] text-slate-500">Creates immutable audit trail record</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOperatorEditModalOpen(false);
                  setOperatorEditRecord(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {operatorSuccessMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{operatorSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleOperatorSubmit} className="space-y-3">
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                  <div><strong>Commodity:</strong> {operatorEditRecord.commodityNormalized}</div>
                  <div><strong>Market:</strong> {operatorEditRecord.market}</div>
                  <div><strong>Current Modal:</strong> ₹{operatorEditRecord.modalPrice}/kg</div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Corrected Modal Price (₹/kg) *
                  </label>
                  <input
                    type="number"
                    value={operatorNewPrice}
                    onChange={(e) => setOperatorNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reason for Correction *
                  </label>
                  <input
                    type="text"
                    value={operatorReason}
                    onChange={(e) => setOperatorReason(e.target.value)}
                    placeholder="e.g. Evening arrival physical auction tally discrepancy"
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Evidence / Physical Source Reference *
                  </label>
                  <input
                    type="text"
                    value={operatorEvidence}
                    onChange={(e) => setOperatorEvidence(e.target.value)}
                    placeholder="e.g. APMC Gate Lot Sheet #8821"
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
                >
                  Save & Log Audit Trail
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
