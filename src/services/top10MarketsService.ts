import { MandiRecord } from '../types/market';
import { marketDataService } from './marketDataService';
import { CommodityNormalizationService } from './commodityNormalizationService';

export interface Top10MarketItem extends MandiRecord {
  rank: number;
  priceDifferenceFromLocal?: number; // e.g. +7 (₹/kg)
  isLocalMarket?: boolean;
}

export interface Top10MarketResponse {
  commodity: string;
  commodityNormalized: string;
  totalAvailable: number;
  displayedCount: number;
  localMarket?: MandiRecord;
  markets: Top10MarketItem[];
  latestDataDate: string;
  source: string;
  disclaimer: string;
}

export class Top10MarketsService {
  /**
   * Retrieves the Top 10 highest reported market prices for a commodity across cities.
   * Strictly based on actual valid mandi records (Section 1, 3, 5).
   * Never fabricates missing markets or random prices.
   */
  public static getTop10Markets(
    commodity: string = 'Tomato',
    userDistrict: string = 'Mysuru',
    sortBy: 'modal_desc' | 'distance' | 'latest_date' = 'modal_desc',
    districtFilter: string = 'All'
  ): Top10MarketResponse {
    const normalized = CommodityNormalizationService.normalize(commodity);
    const allRecords = marketDataService.getPrices(normalized);

    // 1. Filter out invalid or missing price records
    const validRecords = allRecords.filter(
      (r) =>
        r.modalPrice > 0 &&
        r.minimumPrice >= 0 &&
        r.maximumPrice >= r.modalPrice &&
        r.modalPrice >= r.minimumPrice &&
        r.market &&
        r.arrivalDate
    );

    // 2. Identify local market in user district if available
    const localMarket =
      validRecords.find((r) => r.district.toLowerCase().includes(userDistrict.toLowerCase())) ||
      validRecords[0];

    // 3. District filter if specified
    let filtered = validRecords;
    if (districtFilter && districtFilter !== 'All') {
      filtered = filtered.filter((r) => r.district.toLowerCase() === districtFilter.toLowerCase());
    }

    // 4. Sort records
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      }
      if (sortBy === 'latest_date') {
        return b.arrivalDate.localeCompare(a.arrivalDate);
      }
      // Default: Highest modal price descending
      if (b.modalPrice !== a.modalPrice) {
        return b.modalPrice - a.modalPrice;
      }
      // Secondary sort: nearest distance
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    });

    // 5. Take up to 10 valid records (never generate fake records to fill 10)
    const topRecords = sorted.slice(0, 10);

    // 6. Calculate actual arithmetic price difference from local market
    const rankedMarkets: Top10MarketItem[] = topRecords.map((rec, index) => {
      let diff: number | undefined;
      const isLocal = localMarket ? rec.id === localMarket.id : false;

      if (localMarket && !isLocal) {
        diff = Math.round((rec.modalPrice - localMarket.modalPrice) * 10) / 10;
      }

      return {
        ...rec,
        rank: index + 1,
        priceDifferenceFromLocal: diff,
        isLocalMarket: isLocal
      };
    });

    const latestDate =
      rankedMarkets.length > 0
        ? rankedMarkets.reduce((latest, r) => (r.arrivalDate > latest ? r.arrivalDate : latest), rankedMarkets[0].arrivalDate)
        : '2026-09-28';

    return {
      commodity,
      commodityNormalized: normalized,
      totalAvailable: validRecords.length,
      displayedCount: rankedMarkets.length,
      localMarket,
      markets: rankedMarkets,
      latestDataDate: latestDate,
      source: 'Government OGD / AGMARKNET',
      disclaimer:
        'Higher reported modal price does NOT guarantee higher net profit. Long-distance transport, fuel, vehicle rent, and perishability must be evaluated before transport.'
    };
  }
}
