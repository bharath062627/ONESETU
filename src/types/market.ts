export type FreshnessState = 'FRESH' | 'RECENT' | 'STALE' | 'UNAVAILABLE';

export interface PriceChangeMetrics {
  absoluteChange: number; // e.g. +150 (₹/quintal) or +1.5 (₹/kg)
  percentageChange: number; // e.g. +5.56%
  previousModalPrice: number;
  currentModalPrice: number;
  previousDate: string;
  currentDate: string;
  direction: 'UP' | 'DOWN' | 'UNCHANGED';
}

export interface MandiRecord {
  id: string;
  commodityName: string;
  commodityNormalized: string;
  variety: string;
  grade: string;
  state: string;
  district: string;
  market: string;
  marketCode: string;
  arrivalDate: string; // YYYY-MM-DD
  marketDate: string;  // Alias as per Section 8
  minimumPrice: number; // in ₹/kg
  modalPrice: number; // in ₹/kg
  maximumPrice: number; // in ₹/kg
  minPricePerQuintal: number;
  modalPricePerQuintal: number;
  maxPricePerQuintal: number;
  priceUnit: '₹/kg' | '₹/quintal';
  source: 'Government OGD / AGMARKNET';
  sourceRecordId: string;
  fetchedAt: string;
  updatedAt: string;
  dataStatus: 'VALID' | 'STALE' | 'VERIFIED';
  distanceKm?: number;
}

export interface MarketComparisonSummary {
  commodity: string;
  commodityNormalized: string;
  dataDate: string;
  lastSynced: string;
  source: string;
  baseMarket: MandiRecord;
  selectedMarket: MandiRecord;
  comparisonMarkets: MandiRecord[];
  freshnessState: FreshnessState;
  priceChange?: PriceChangeMetrics;
  isStale?: boolean;
}

export interface HistoricalPriceObservation {
  date: string;
  commodity: string;
  market: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
}

export interface MarketSyncStatus {
  lastSuccessfulSync: string;
  currentSyncStatus: 'SUCCESS' | 'FAILED' | 'RUNNING';
  recordsFetched: number;
  recordsAccepted: number;
  recordsRejected: number;
  latestMarketDate: string;
  source: string;
  apiEndpoint: string;
  lastError?: string | null;
}

export interface PriceAlert {
  id: string;
  commodity: string;
  condition: 'ABOVE' | 'BELOW';
  targetModalPrice: number;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
  triggeredMarket?: string;
}

export interface AiMarketInsight {
  summary: string;
  spreadAnalysis: string;
  priceChangeExplanation?: string;
  anomalyDetected: boolean;
  anomalyNote?: string;
  forecast?: {
    period: string; // 'Next 3 days'
    projectedRange: string; // '₹27 – ₹30'
    disclaimer: 'AI ESTIMATE — NOT GUARANTEED';
    confidence: 'Moderate' | 'High';
  };
}
