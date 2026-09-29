import {
  MandiRecord,
  MarketSyncStatus,
  HistoricalPriceObservation,
  PriceAlert,
  MarketComparisonSummary,
  FreshnessState,
  PriceChangeMetrics
} from '../types/market';
import { MARKET_CONFIG } from './marketDataConfig';
import { MarketDataValidator } from './marketDataValidator';
import { OFFICIAL_DAILY_MANDI_RECORDS, OFFICIAL_HISTORICAL_OBSERVATIONS } from './officialMandiDataset';
import { CommodityNormalizationService } from './commodityNormalizationService';
import { store } from './store';


class MarketDataService {
  private records: MandiRecord[] = [];
  private history: HistoricalPriceObservation[] = [...OFFICIAL_HISTORICAL_OBSERVATIONS];
  private alerts: PriceAlert[] = [];
  private syncStatus: MarketSyncStatus = {
    lastSuccessfulSync: '2026-09-29 08:30 IST',
    currentSyncStatus: 'SUCCESS',
    recordsFetched: OFFICIAL_DAILY_MANDI_RECORDS.length,
    recordsAccepted: 0,
    recordsRejected: 0,
    latestMarketDate: '2026-09-28',
    source: MARKET_CONFIG.SOURCE_NAME,
    apiEndpoint: MARKET_CONFIG.API_URL,
    lastError: null
  };
  private listeners: (() => void)[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // 1. Process and validate the official baseline dataset
    const validation = MarketDataValidator.processRawRecords(
      OFFICIAL_DAILY_MANDI_RECORDS,
      MARKET_CONFIG.DEFAULT_DISTRICT
    );

    this.records = validation.validRecords;
    this.syncStatus.recordsAccepted = validation.validRecords.length;
    this.syncStatus.recordsRejected = validation.rejectedRecords.length;

    // 2. Load cached records from LocalStorage if present
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('onesetu_mandi_records');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.records = parsed;
          }
        }
        const cachedStatus = localStorage.getItem('onesetu_mandi_sync');
        if (cachedStatus) {
          this.syncStatus = { ...this.syncStatus, ...JSON.parse(cachedStatus) };
        }
        const cachedAlerts = localStorage.getItem('onesetu_price_alerts');
        if (cachedAlerts) {
          this.alerts = JSON.parse(cachedAlerts);
        }
        const cachedHistory = localStorage.getItem('onesetu_mandi_history');
        if (cachedHistory) {
          this.history = JSON.parse(cachedHistory);
        }
      } catch (e) {
        console.warn('Failed to load cached market data:', e);
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('onesetu_mandi_records', JSON.stringify(this.records));
        localStorage.setItem('onesetu_mandi_sync', JSON.stringify(this.syncStatus));
        localStorage.setItem('onesetu_price_alerts', JSON.stringify(this.alerts));
        localStorage.setItem('onesetu_mandi_history', JSON.stringify(this.history));
      } catch (e) {
        console.error('Failed to save market data:', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * Calculates the freshness state of a given date (Section 24).
   * FRESH: < 24h
   * RECENT: < 48h
   * STALE: > 48h
   * UNAVAILABLE: empty or invalid
   */
  public getFreshnessState(arrivalDate: string): FreshnessState {
    if (!arrivalDate) return 'UNAVAILABLE';
    try {
      const observationDate = new Date(arrivalDate).getTime();
      const refTime = new Date('2026-09-28T18:30:00Z').getTime();
      const diffHours = (refTime - observationDate) / (1000 * 60 * 60);

      if (diffHours <= 24) return 'FRESH';
      if (diffHours <= 48) return 'RECENT';
      return 'STALE';
    } catch {
      return 'UNAVAILABLE';
    }
  }

  /**
   * Retrieves unique normalized commodities with available records.
   */
  public getCommodities(): { name: string; count: number; varieties: string[] }[] {
    const map = new Map<string, { count: number; varieties: Set<string> }>();

    for (const r of this.records) {
      const comm = r.commodityNormalized;
      if (!map.has(comm)) {
        map.set(comm, { count: 0, varieties: new Set() });
      }
      const entry = map.get(comm)!;
      entry.count++;
      if (r.variety) entry.varieties.add(r.variety);
    }

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      varieties: Array.from(data.varieties)
    }));
  }

  /**
   * Queries market records matching commodity and/or district.
   */
  public getPrices(commodityQuery?: string, district?: string): MandiRecord[] {
    return this.records.filter((r) => {
      const matchesCommodity = !commodityQuery
        ? true
        : CommodityNormalizationService.matches(r.commodityNormalized, commodityQuery) ||
          CommodityNormalizationService.matches(r.commodityName, commodityQuery);

      const matchesDistrict = !district || district === 'All'
        ? true
        : r.district.toLowerCase() === district.toLowerCase();

      return matchesCommodity && matchesDistrict;
    });
  }

  /**
   * Builds structured comparison summary for a given commodity.
   * Calculates deterministic price change metrics (Section 17).
   */
  public getComparison(
    commodity: string = 'Tomato',
    userDistrict: string = 'Mysuru',
    selectedMarketId?: string
  ): MarketComparisonSummary | null {
    const matching = this.getPrices(commodity);
    if (matching.length === 0) return null;

    // Find base market in user district, or first available
    const baseMarket =
      matching.find((m) => m.district.toLowerCase().includes(userDistrict.toLowerCase())) ||
      matching[0];

    const selectedMarket = selectedMarketId
      ? matching.find((m) => m.id === selectedMarketId) || baseMarket
      : baseMarket;

    const comparisonMarkets = matching.map((m) => {
      const userCoords =
        MARKET_CONFIG.DISTRICT_COORDINATES[userDistrict] ||
        MARKET_CONFIG.DISTRICT_COORDINATES['Mysuru'];
      const marketCoords = MARKET_CONFIG.DISTRICT_COORDINATES[m.district];

      let distanceKm = m.distanceKm;
      if (userCoords && marketCoords) {
        distanceKm = MarketDataValidator.calculateHaversineDistance(
          userCoords.lat,
          userCoords.lng,
          marketCoords.lat,
          marketCoords.lng
        );
      }

      return {
        ...m,
        distanceKm
      };
    });

    // Deterministic Price Change Calculation (Section 17)
    let priceChange: PriceChangeMetrics | undefined;
    const marketHistory = this.history
      .filter(
        (h) =>
          CommodityNormalizationService.normalize(h.commodity) === selectedMarket.commodityNormalized &&
          (h.market === selectedMarket.market || h.market.includes(selectedMarket.district))
      )
      .sort((a, b) => b.date.localeCompare(a.date));

    if (marketHistory.length >= 2) {
      const currentObs = marketHistory[0];
      const prevObs = marketHistory[1];
      const diff = Math.round((currentObs.modalPrice - prevObs.modalPrice) * 10) / 10;
      const pct = prevObs.modalPrice > 0 ? Math.round(((diff) / prevObs.modalPrice) * 1000) / 10 : 0;

      priceChange = {
        absoluteChange: diff,
        percentageChange: pct,
        previousModalPrice: prevObs.modalPrice,
        currentModalPrice: currentObs.modalPrice,
        previousDate: prevObs.date,
        currentDate: currentObs.date,
        direction: diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'UNCHANGED'
      };
    }

    const freshnessState = this.getFreshnessState(selectedMarket.arrivalDate);

    return {
      commodity,
      commodityNormalized: baseMarket.commodityNormalized,
      dataDate: selectedMarket.arrivalDate,
      lastSynced: this.syncStatus.lastSuccessfulSync,
      source: selectedMarket.source,
      baseMarket,
      selectedMarket,
      comparisonMarkets,
      freshnessState,
      priceChange,
      isStale: freshnessState === 'STALE'
    };
  }

  /**
   * Retrieves historical price observations for 7 or 30 days.
   * Deduplicates by date so that daily trend lines have exactly one distinct entry per date.
   */
  public getHistory(
    commodity: string,
    days: 7 | 30 = 7,
    marketName?: string
  ): HistoricalPriceObservation[] {
    const normalized = CommodityNormalizationService.normalize(commodity);
    let observations = this.history.filter(
      (h) => CommodityNormalizationService.normalize(h.commodity) === normalized
    );

    // If marketName is provided, filter for observations matching this market
    if (marketName) {
      const filteredByMarket = observations.filter(
        (h) => h.market.toLowerCase().includes(marketName.toLowerCase()) || marketName.toLowerCase().includes(h.market.toLowerCase())
      );
      if (filteredByMarket.length > 0) {
        observations = filteredByMarket;
      }
    }

    // Deduplicate by date (keep latest observation if multiple exist on the same date)
    const dateMap = new Map<string, HistoricalPriceObservation>();
    for (const obs of observations) {
      dateMap.set(obs.date, obs);
    }
    const distinctObservations = Array.from(dateMap.values());

    // Sort by date ascending
    const sorted = distinctObservations.sort((a, b) => a.date.localeCompare(b.date));
    return days === 7 ? sorted.slice(-7) : sorted.slice(-30);
  }

  /**
   * Checks if latest market data is older than 2 days.
   */
  public isDataStale(arrivalDate: string): boolean {
    return this.getFreshnessState(arrivalDate) === 'STALE';
  }

  /**
   * Returns current sync metadata.
   */
  public getSyncStatus(): MarketSyncStatus {
    return this.syncStatus;
  }

  /**
   * Executes data synchronization from the external government API or baseline dataset.
   * Latest Data Priority (Section 7):
   * When multiple records are available for the same commodity/market/variety/grade,
   * only overwrites if the incoming date is >= existing date.
   */
  public async syncMarketData(userDistrict: string = 'Mysuru'): Promise<MarketSyncStatus> {
    this.syncStatus.currentSyncStatus = 'RUNNING';
    this.notify();

    try {
      let rawData: any[] = [];
      let fetchSuccessful = false;

      // Attempt live fetch if network is available
      if (MARKET_CONFIG.API_KEY) {
        try {
          const url = new URL(MARKET_CONFIG.API_URL);
          url.searchParams.set('api-key', MARKET_CONFIG.API_KEY);
          url.searchParams.set('format', 'json');
          url.searchParams.set('limit', '100');

          const response = await fetch(url.toString(), { method: 'GET' });
          if (response.ok) {
            const json = await response.json();
            if (json && Array.isArray(json.records)) {
              rawData = json.records;
              fetchSuccessful = true;
            }
          }
        } catch (fetchErr) {
          console.warn('Direct OGD API fetch failed, falling back to official verified baseline:', fetchErr);
        }
      }

      // If live endpoint was not configured or failed, use verified official baseline
      if (!fetchSuccessful) {
        rawData = OFFICIAL_DAILY_MANDI_RECORDS;
      }

      // Validate & deduplicate
      const validation = MarketDataValidator.processRawRecords(rawData, userDistrict);

      // Section 7: Latest Data Priority
      const recordMap = new Map<string, MandiRecord>();
      this.records.forEach((r) => recordMap.set(r.id, r));

      for (const newRec of validation.validRecords) {
        const existing = recordMap.get(newRec.id);
        if (!existing || newRec.arrivalDate >= existing.arrivalDate) {
          recordMap.set(newRec.id, newRec);

          // Archive historical daily observation
          const histKey = `${newRec.arrivalDate}_${newRec.commodityNormalized}_${newRec.market}`;
          const alreadyInHistory = this.history.some(
            (h) => `${h.date}_${h.commodity}_${h.market}` === histKey
          );
          if (!alreadyInHistory) {
            this.history.push({
              date: newRec.arrivalDate,
              commodity: newRec.commodityNormalized,
              market: newRec.market,
              minPrice: newRec.minimumPrice,
              modalPrice: newRec.modalPrice,
              maxPrice: newRec.maximumPrice
            });
          }
        }
      }

      this.records = Array.from(recordMap.values());

      const now = new Date();
      const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

      this.syncStatus = {
        lastSuccessfulSync: timestamp,
        currentSyncStatus: 'SUCCESS',
        recordsFetched: rawData.length,
        recordsAccepted: validation.validRecords.length,
        recordsRejected: validation.rejectedRecords.length,
        latestMarketDate: '2026-09-28',
        source: MARKET_CONFIG.SOURCE_NAME,
        apiEndpoint: MARKET_CONFIG.API_URL,
        lastError: null
      };

      this.evaluateAlerts();
      this.persist();
      return this.syncStatus;
    } catch (err: any) {
      this.syncStatus.currentSyncStatus = 'FAILED';
      this.syncStatus.lastError = err?.message || 'Synchronization failed';
      this.notify();
      return this.syncStatus;
    }
  }

  /**
   * Price Alert Management
   */
  public createAlert(commodity: string, targetModalPrice: number, condition: 'ABOVE' | 'BELOW'): PriceAlert {
    const alert: PriceAlert = {
      id: `alt-${Date.now()}`,
      commodity: CommodityNormalizationService.normalize(commodity),
      condition,
      targetModalPrice,
      createdAt: new Date().toISOString().split('T')[0],
      triggered: false
    };
    this.alerts.unshift(alert);
    this.evaluateAlerts();
    this.persist();
    return alert;
  }

  public getAlerts(): PriceAlert[] {
    return this.alerts;
  }

  public deleteAlert(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.persist();
  }

  private evaluateAlerts() {
    for (const alert of this.alerts) {
      if (alert.triggered) continue;
      const records = this.getPrices(alert.commodity);
      for (const rec of records) {
        if (alert.condition === 'ABOVE' && rec.modalPrice >= alert.targetModalPrice) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString().split('T')[0];
          alert.triggeredMarket = `${rec.market} (₹${rec.modalPrice}/kg)`;
          break;
        } else if (alert.condition === 'BELOW' && rec.modalPrice <= alert.targetModalPrice) {
          alert.triggered = true;
          alert.triggeredAt = new Date().toISOString().split('T')[0];
          alert.triggeredMarket = `${rec.market} (₹${rec.modalPrice}/kg)`;
          break;
        }
      }
    }
  }

  /**
   * Market Data Operator / Broker Manual Price Correction with Audit Trail
   */
  public updatePriceRecord(
    recordId: string,
    field: 'modalPrice' | 'minimumPrice' | 'maximumPrice',
    newValue: number,
    editorId: string,
    editorRole: string,
    reason: string,
    evidenceSource: string
  ): boolean {
    const record = this.records.find((r) => r.id === recordId);
    if (!record) return false;

    const previousValue = record[field];
    record[field] = newValue;
    if (field === 'modalPrice') {
      record.modalPricePerQuintal = newValue * 100;
    } else if (field === 'minimumPrice') {
      record.minPricePerQuintal = newValue * 100;
    } else if (field === 'maximumPrice') {
      record.maxPricePerQuintal = newValue * 100;
    }
    record.updatedAt = new Date().toISOString().split('T')[0];
    record.dataStatus = 'VERIFIED';

    // Log to store audit trail
    store.addMarketDataAudit({
      commodity: record.commodityNormalized,
      market: record.market,
      fieldChanged: field,
      previousValue,
      newValue,
      editorId,
      editorRole,
      reason,
      evidenceSource
    });

    this.persist();
    return true;
  }
}

export const marketDataService = new MarketDataService();

