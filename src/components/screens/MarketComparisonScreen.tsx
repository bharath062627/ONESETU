import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { marketDataService } from '../../services/marketDataService';
import { MarketAiService } from '../../services/marketAiService';
import { MandiRecord, HistoricalPriceObservation, AiMarketInsight, FreshnessState } from '../../types/market';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  Bell,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  X,
  Search,
  Check
} from 'lucide-react';

export const MarketComparisonScreen: React.FC = () => {
  const user = store.getUser();
  const userDistrict = user.location.split(',')[0].trim() || 'Mysuru';

  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>(undefined);
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'distance'>('price_desc');
  const [historyTab, setHistoryTab] = useState<7 | 30>(7);

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>('30');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Subscribe to market data updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = marketDataService.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const commodities = marketDataService.getCommodities();
  const comparison = marketDataService.getComparison(selectedCommodity, userDistrict, selectedMarketId);
  const syncStatus = marketDataService.getSyncStatus();

  const history: HistoricalPriceObservation[] = marketDataService.getHistory(
    selectedCommodity,
    historyTab,
    comparison?.selectedMarket?.market
  );
  const aiInsight: AiMarketInsight = comparison
    ? MarketAiService.generateInsights(
        selectedCommodity,
        comparison.comparisonMarkets,
        history,
        comparison.priceChange,
        userDistrict
      )
    : {
        summary: 'No market observations available.',
        spreadAnalysis: 'Price comparison unavailable.',
        anomalyDetected: false
      };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await marketDataService.syncMarketData(userDistrict);
    setIsSyncing(false);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(alertTargetPrice);
    if (!isNaN(target) && target > 0) {
      marketDataService.createAlert(selectedCommodity, target, alertCondition);
      setAlertFeedback(`Alert set: Notify when ${selectedCommodity} modal is ${alertCondition.toLowerCase()} ₹${target}/kg`);
      setTimeout(() => {
        setAlertFeedback(null);
        setIsAlertModalOpen(false);
      }, 1800);
    }
  };

  // Filter & sort comparison markets
  let displayMarkets: MandiRecord[] = comparison?.comparisonMarkets || [];
  if (selectedDistrictFilter !== 'All') {
    displayMarkets = displayMarkets.filter(
      (m) => m.district.toLowerCase() === selectedDistrictFilter.toLowerCase()
    );
  }

  displayMarkets = [...displayMarkets].sort((a, b) => {
    if (sortBy === 'price_desc') return b.modalPrice - a.modalPrice;
    if (sortBy === 'price_asc') return a.modalPrice - b.modalPrice;
    if (sortBy === 'distance') return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    return 0;
  });

  const activeMarket = comparison?.selectedMarket || comparison?.baseMarket;
  const maxModal = displayMarkets.length > 0 ? Math.max(...displayMarkets.map((m) => m.modalPrice)) : 30;

  // Distinct districts available in results
  const availableDistricts = ['All', ...new Set((comparison?.comparisonMarkets || []).map((m) => m.district))];

  const getFreshnessBadge = (state: FreshnessState) => {
    switch (state) {
      case 'FRESH':
        return (
          <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>FRESH (&lt;24H)</span>
          </span>
        );
      case 'RECENT':
        return (
          <span className="text-[9px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>RECENT (&lt;48H)</span>
          </span>
        );
      case 'STALE':
        return (
          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-700" />
            <span>STALE (&gt;48H)</span>
          </span>
        );
      default:
        return (
          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Navbar */}
      <div className="px-4 pt-8 pb-3 flex items-center justify-between border-b border-slate-100 bg-white shadow-2xs">
        <button
          onClick={() => store.goBack()}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Commodity Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedCommodity}
            onChange={(e) => {
              setSelectedCommodity(e.target.value);
              setSelectedMarketId(undefined);
            }}
            className="text-sm font-extrabold text-slate-900 bg-slate-100 pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            {commodities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count} mandis)
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
            title="Set Price Alert"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-700"
            title="Sync Latest Mandi Data"
          >
            <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {/* Stale Warning Banner if data is old (Section 12 & 24) */}
        {comparison?.isStale && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start justify-between gap-2 shadow-xs">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-900">DATA MAY BE STALE</h5>
                <p className="text-[11px] text-amber-800">
                  Last available mandi upload date: {comparison.dataDate}. Official AGMARKNET data updates daily.
                </p>
              </div>
            </div>
            <button
              onClick={handleManualSync}
              className="bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* Hero Official Mandi Rate Card (Section 3, 11, 16) */}
        {activeMarket ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative overflow-hidden space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider">
                    OFFICIAL MANDI DATA
                  </span>
                  {getFreshnessBadge(comparison?.freshnessState || 'FRESH')}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {activeMarket.commodityNormalized}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Variety: {activeMarket.variety} • Grade: {activeMarket.grade}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Latest Market Rate
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

            {/* Min / Modal / Max Price Triple Grid */}
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
                  Modal Rate
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

            {/* Deterministic Price Change (Section 17) */}
            {comparison?.priceChange && (
              <div className="bg-slate-50/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs border border-slate-100">
                <div className="flex items-center gap-1.5">
                  {comparison.priceChange.direction === 'UP' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : comparison.priceChange.direction === 'DOWN' ? (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                  )}
                  <span className="text-slate-600">
                    Day-over-day ({comparison.priceChange.previousDate}):
                  </span>
                </div>
                <div className="font-bold font-mono">
                  <span
                    className={
                      comparison.priceChange.direction === 'UP'
                        ? 'text-emerald-700'
                        : comparison.priceChange.direction === 'DOWN'
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }
                  >
                    {comparison.priceChange.absoluteChange > 0 ? '+' : ''}
                    ₹{comparison.priceChange.absoluteChange}/kg (
                    {comparison.priceChange.percentageChange > 0 ? '+' : ''}
                    {comparison.priceChange.percentageChange}%)
                  </span>
                </div>
              </div>
            )}

            {/* Market & Metadata Badges */}
            <div className="pt-1 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Market: {activeMarket.market}</span>
                </div>
                <span className="text-slate-500">District: {activeMarket.district}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Market Date: {activeMarket.arrivalDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Last Synced: {syncStatus.lastSuccessfulSync}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 font-medium">
                  Source: <strong className="text-slate-700">Government OGD / AGMARKNET</strong>
                </span>
                <button
                  onClick={() => setIsSourceModalOpen(true)}
                  className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                >
                  <span>VIEW DATA SOURCE</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
            <p className="text-xs text-slate-500">No market data available for {selectedCommodity}.</p>
          </div>
        )}

        {/* AI Market Intelligence Section (Sections 15-21) */}
        <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                AI Market Intelligence
              </h4>
            </div>
            <span className="text-[9px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded font-mono">
              Factual Synthesis
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            {aiInsight.summary}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed font-normal border-t border-emerald-800/50 pt-2">
            {aiInsight.spreadAnalysis}
          </p>

          {/* AI Price Change Explanation (Section 16) */}
          {aiInsight.priceChangeExplanation && (
            <div className="bg-white/10 rounded-xl p-2.5 text-[11px] text-emerald-100 leading-snug">
              <strong>Daily Trend Analysis:</strong> {aiInsight.priceChangeExplanation}
            </div>
          )}

          {/* Anomaly Callout if triggered (Section 18) */}
          {aiInsight.anomalyDetected && aiInsight.anomalyNote && (
            <div className="bg-amber-950/80 border border-amber-600/40 rounded-xl p-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200 leading-snug">
                <span className="font-bold block">⚠ Unusual Price Movement Detected</span>
                {aiInsight.anomalyNote}
              </div>
            </div>
          )}

          {/* 3-day projection if available (Section 21) - Strictly marked as AI ESTIMATE — NOT GUARANTEED */}
          {aiInsight.forecast && (
            <div className="bg-white/10 rounded-2xl p-3 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">
                  3-Day Projection ({aiInsight.forecast.period})
                </span>
                <span className="text-sm font-black text-white">
                  {aiInsight.forecast.projectedRange}
                </span>
              </div>
              <div className="text-right max-w-[130px]">
                <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded block text-center">
                  {aiInsight.forecast.disclaimer}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Based on historical curve</span>
              </div>
            </div>
          )}
        </div>

        {/* Regional Market Comparison Controls & Table (Section 13 & 14) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Regional Market Comparison
              </h4>
              <span className="text-[11px] text-slate-500">
                Tap any mandi to inspect details & transport distance
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-[10px] font-bold bg-white text-slate-700 px-2 py-1 rounded-lg border border-slate-200 focus:outline-none"
              >
                <option value="price_desc">Highest Modal</option>
                <option value="price_asc">Lowest Modal</option>
                <option value="distance">Nearest First</option>
              </select>
            </div>
          </div>

          {/* District filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2">
            {availableDistricts.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrictFilter(dist)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                  selectedDistrictFilter === dist
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>

          {/* Mandi Cards List */}
          <div className="space-y-2.5">
            {displayMarkets.map((item, idx) => {
              const isSelected = activeMarket?.id === item.id;
              const isHighest = idx === 0 && sortBy === 'price_desc';
              const barWidth = Math.round((item.modalPrice / (maxModal * 1.1)) * 100);

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => setSelectedMarketId(item.id)}
                  className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
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
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                            Highest reported modal price
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
                        <span>{item.district}</span>
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
                      <span className="text-[10px] text-slate-400 block">
                        Min: ₹{item.minimumPrice} • Max: ₹{item.maximumPrice}
                      </span>
                    </div>
                  </div>

                  {/* Relative Visual Price Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHighest ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Price Trend (Section 22) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Official Price History
              </h4>
              <p className="text-[10px] text-slate-400">Stored official daily observations</p>
            </div>

            <div className="p-0.5 bg-slate-100 rounded-xl flex">
              <button
                onClick={() => setHistoryTab(7)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  historyTab === 7 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                7 DAY
              </button>
              <button
                onClick={() => setHistoryTab(30)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  historyTab === 30 ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                30 DAY
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {history.map((hist, idx) => (
              <div
                key={`${hist.date}-${hist.market}-${idx}`}
                className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-600">{hist.date}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{hist.market}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">
                    Min: ₹{hist.minPrice} • Max: ₹{hist.maxPrice}
                  </span>
                  <span className="font-black text-slate-800 font-mono">
                    ₹{hist.modalPrice}/kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA to Return to Produce */}
      <div className="p-4 bg-white border-t border-slate-200">
        <button
          onClick={() => store.navigateTo('farm')}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-sm rounded-xl shadow-md text-center"
        >
          View Farmer Produce Listings
        </button>
      </div>

      {/* Source Information Modal (Section 28) */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Source Transparency</h3>
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
                <strong>Dataset:</strong> Current Daily Price of Various Commodities from Various Markets (Mandi).
              </p>
              <p>
                <strong>Data Provider:</strong> Open Government Data (OGD) Platform India (data.gov.in) & Directorate of Marketing and Inspection (DMI), AGMARKNET.
              </p>
              <p>
                <strong>Zero-Fabrication Commitment:</strong> Mandi prices displayed in ONESETU originate strictly from official government daily records. No randomized, simulated, or artificially generated prices are used in production.
              </p>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1">
                <div>API Endpoint: {syncStatus.apiEndpoint}</div>
                <div>Last Successful Sync: {syncStatus.lastSuccessfulSync}</div>
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

      {/* Price Alert Creation Modal (Section 23) */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Set Mandi Price Alert</h3>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {alertFeedback ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{alertFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleCreateAlert} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Receive in-app alerts whenever official daily market arrivals cross your threshold.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commodity
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedCommodity}
                    className="w-full px-3 py-2 bg-slate-100 text-xs font-bold rounded-xl text-slate-800 border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value as any)}
                      className="w-full px-2.5 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200"
                    >
                      <option value="ABOVE">Exceeds (≥)</option>
                      <option value="BELOW">Drops to (≤)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Modal Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2"
                >
                  Create Price Alert
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
