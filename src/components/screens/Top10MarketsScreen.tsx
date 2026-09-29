import React, { useState } from 'react';
import { store } from '../../services/store';
import { marketDataService } from '../../services/marketDataService';
import { Top10MarketsService } from '../../services/top10MarketsService';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Info,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Truck
} from 'lucide-react';

export const Top10MarketsScreen: React.FC = () => {
  const user = store.getUser();
  const userDistrict = user.location.split(',')[0].trim() || 'Mysuru';

  const [selectedCommodity, setSelectedCommodity] = useState<string>('Tomato');
  const [sortBy, setSortBy] = useState<'modal_desc' | 'distance' | 'latest_date'>('modal_desc');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const commodities = marketDataService.getCommodities();
  const top10Data = Top10MarketsService.getTop10Markets(
    selectedCommodity,
    userDistrict,
    sortBy,
    selectedDistrict
  );

  const availableDistricts = [
    'All',
    ...new Set(
      marketDataService
        .getPrices(selectedCommodity)
        .map((r) => r.district)
        .filter(Boolean)
    )
  ];

  const localMarket = top10Data.localMarket;

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Header */}
      <div className="px-4 pt-8 pb-3 bg-white border-b border-slate-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <button
            onClick={() => store.goBack()}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              TOP 10 MARKET PRICES
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              Multi-City Price Opportunities
            </span>
          </div>

          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
            title="Transport & Price Disclaimer"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Commodity Selector Bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedCommodity}
              onChange={(e) => {
                setSelectedCommodity(e.target.value);
                setSelectedDistrict('All');
              }}
              className="w-full text-xs font-bold text-slate-900 bg-slate-100 pl-3 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none appearance-none cursor-pointer"
            >
              {commodities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count} reporting mandis)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-[11px] font-bold text-slate-800 bg-white px-2.5 py-2 rounded-xl border border-slate-200 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="modal_desc">Highest Modal</option>
              <option value="distance">Nearest First</option>
              <option value="latest_date">Latest Data</option>
            </select>
          </div>
        </div>

        {/* District Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {availableDistricts.map((dist) => (
            <button
              key={dist}
              onClick={() => setSelectedDistrict(dist)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                selectedDistrict === dist
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {/* Distinction Banner: Highest Price != Best Selling Option (Section 2) */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-950 shadow-2xs">
          <Truck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-extrabold block text-amber-900 text-[11px]">
              Highest Reported Price vs. Best Overall Option
            </span>
            <p className="text-[10px] text-amber-800 mt-0.5">
              A higher reported price in another city does not automatically guarantee higher net profit. Transport, toll, fuel, and perishable handling should be compared before dispatching produce.
            </p>
          </div>
        </div>

        {/* Local Market Benchmark Card (Section 4) */}
        {localMarket && (
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Your Local Market ({localMarket.district})
                </span>
                <h4 className="text-xs font-bold text-slate-900">{localMarket.market}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-slate-900">
                ₹{localMarket.modalPrice} <span className="text-[10px] font-normal text-slate-500">/ kg</span>
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">
                ₹{localMarket.modalPricePerQuintal}/q
              </span>
            </div>
          </div>
        )}

        {/* Results Header Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <span className="font-bold text-slate-800">
            {top10Data.displayedCount} {top10Data.displayedCount === 1 ? 'market' : 'markets'} available
          </span>
          <span className="text-[10px] text-slate-400">
            Source: {top10Data.source} • {top10Data.latestDataDate}
          </span>
        </div>

        {/* Ranked Market Cards List */}
        {top10Data.markets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No market data available</h4>
            <p className="text-[11px] text-slate-500">
              No reported arrivals found for {selectedCommodity} in the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {top10Data.markets.map((m, idx) => {
              const isRank1 = m.rank === 1;
              const isRank2 = m.rank === 2;
              const isRank3 = m.rank === 3;

              return (
                <div
                  key={`${m.id}-${m.rank}-${idx}`}
                  onClick={() => store.navigateTo('market-comparison')}
                  className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer hover:shadow-xs active:scale-[0.99] relative ${
                    isRank1
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs bg-emerald-50/15'
                      : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Rank Badge + Market Details */}
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${
                          isRank1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : isRank2
                            ? 'bg-slate-200 text-slate-800'
                            : isRank3
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{m.rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {m.market}
                          </h4>
                          {isRank1 && (
                            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                              Higher reported modal price
                            </span>
                          )}
                          {m.isLocalMarket && (
                            <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              Local
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span>{m.district}, {m.state}</span>
                          {m.distanceKm !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">📍 {m.distanceKm} km away</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span>Date: {m.arrivalDate}</span>
                          <span>•</span>
                          <span>Min: ₹{m.minimumPrice} • Max: ₹{m.maximumPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Modal Price + Difference Calculation */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-slate-900 block">
                        ₹{m.modalPrice}{' '}
                        <span className="text-[10px] font-normal text-slate-500">/ kg</span>
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        (₹{m.modalPricePerQuintal} / q)
                      </span>

                      {/* Actual Price Difference Arithmetic from Local Market (Section 4) */}
                      {m.priceDifferenceFromLocal !== undefined && (
                        <div className="mt-1">
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              m.priceDifferenceFromLocal > 0
                                ? 'bg-emerald-100 text-emerald-900'
                                : m.priceDifferenceFromLocal < 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.priceDifferenceFromLocal > 0 ? '+' : ''}
                            ₹{m.priceDifferenceFromLocal}/kg vs Local
                          </span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">
                            *Transport cost not included
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-4 bg-white border-t border-slate-200">
        <button
          onClick={() => store.navigateTo('farm')}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-xs rounded-xl shadow-md text-center"
        >
          Return to Produce Marketplace
        </button>
      </div>

      {/* Info & Transport Cost Disclaimer Modal */}
      {isDisclaimerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Market Price Methodology</h3>
              </div>
              <button
                onClick={() => setIsDisclaimerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                <strong>Data Source:</strong> Directorate of Marketing and Inspection (DMI), Ministry of Agriculture and Farmers Welfare (AGMARKNET).
              </p>
              <p>
                <strong>Ranking Criteria:</strong> Ordered strictly by official reported modal market price for the latest observation date.
              </p>
              <p>
                <strong>Logistics Notice:</strong> The price differences displayed are raw market rate differences (*Transport cost not included*). Farmers are advised to calculate vehicle hire and toll costs before shipping produce across districts.
              </p>
            </div>

            <button
              onClick={() => setIsDisclaimerOpen(false)}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
