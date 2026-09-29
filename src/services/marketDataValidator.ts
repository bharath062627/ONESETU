import { MandiRecord } from '../types/market';
import { CommodityNormalizationService } from './commodityNormalizationService';
import { MARKET_CONFIG } from './marketDataConfig';

export interface ValidationResult {
  validRecords: MandiRecord[];
  rejectedRecords: { rawRecord: any; reason: string }[];
  duplicateCount: number;
}

export class MarketDataValidator {
  /**
   * Generates a deterministic record key for deduplication.
   */
  public static generateRecordId(
    commodityNormalized: string,
    variety: string,
    market: string,
    arrivalDate: string
  ): string {
    const slug = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');

    return `${slug(commodityNormalized)}_${slug(variety || 'standard')}_${slug(market)}_${arrivalDate}`;
  }

  /**
   * Calculates Haversine distance in kilometers between two lat/lng coordinates.
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Validates and normalizes raw government mandi records.
   */
  public static processRawRecords(
    rawRecords: any[],
    userDistrict: string = 'Mysuru'
  ): ValidationResult {
    const validRecords: MandiRecord[] = [];
    const rejectedRecords: { rawRecord: any; reason: string }[] = [];
    const seenIds = new Set<string>();
    let duplicateCount = 0;

    const userCoords = MARKET_CONFIG.DISTRICT_COORDINATES[userDistrict] || MARKET_CONFIG.DISTRICT_COORDINATES['Mysuru'];

    for (const raw of rawRecords) {
      // 1. Required field checks
      const commodityRaw = raw.Commodity || raw.commodityName || raw.commodity || '';
      const market = raw.Market || raw.market || '';
      const state = raw.State || raw.state || 'Karnataka';
      const district = raw.District || raw.district || '';
      const arrivalDate = raw.Arrival_Date || raw.arrivalDate || raw.date || '';

      if (!commodityRaw || !market || !district || !arrivalDate) {
        rejectedRecords.push({
          rawRecord: raw,
          reason: 'Missing required field (commodity, market, district, or arrivalDate)'
        });
        continue;
      }

      // 2. Numeric price extraction (convert Quintal to kg if needed)
      // Standard AGMARKNET price is in Rupees per Quintal (1 Quintal = 100 kg)
      let minQ = Number(raw.Min_Price ?? raw.minPricePerQuintal ?? (raw.minimumPrice ? raw.minimumPrice * 100 : 0));
      let modalQ = Number(raw.Modal_Price ?? raw.modalPricePerQuintal ?? (raw.modalPrice ? raw.modalPrice * 100 : 0));
      let maxQ = Number(raw.Max_Price ?? raw.maxPricePerQuintal ?? (raw.maximumPrice ? raw.maximumPrice * 100 : 0));

      if (isNaN(minQ) || isNaN(modalQ) || isNaN(maxQ)) {
        rejectedRecords.push({
          rawRecord: raw,
          reason: 'Prices are not valid numbers'
        });
        continue;
      }

      // Rule: minimumPrice >= 0, modalPrice >= 0, maximumPrice >= 0
      if (minQ < 0 || modalQ < 0 || maxQ < 0) {
        rejectedRecords.push({
          rawRecord: raw,
          reason: 'Negative price values are prohibited'
        });
        continue;
      }

      // Rule: minimumPrice <= modalPrice && modalPrice <= maximumPrice
      if (minQ > modalQ || modalQ > maxQ) {
        rejectedRecords.push({
          rawRecord: raw,
          reason: `Invalid price hierarchy: min (${minQ}) must be <= modal (${modalQ}) <= max (${maxQ})`
        });
        continue;
      }

      const minKg = Math.round((minQ / 100) * 10) / 10;
      const modalKg = Math.round((modalQ / 100) * 10) / 10;
      const maxKg = Math.round((maxQ / 100) * 10) / 10;

      // 3. Normalization
      const commodityNormalized = CommodityNormalizationService.normalize(commodityRaw);
      const variety = (raw.Variety || raw.variety || 'Local / Hybrid').trim();
      const grade = (raw.Grade || raw.grade || 'FAQ').trim();
      const marketCode = raw.Market_Code || raw.marketCode || `MANDI-${district.slice(0, 3).toUpperCase()}`;

      // 4. Deduplication
      const recordId = this.generateRecordId(commodityNormalized, variety, market, arrivalDate);
      if (seenIds.has(recordId)) {
        duplicateCount++;
        continue; // Idempotent deduplication
      }
      seenIds.add(recordId);

      // 5. Distance calculation
      let distanceKm: number | undefined;
      const marketCoords = MARKET_CONFIG.DISTRICT_COORDINATES[district];
      if (userCoords && marketCoords) {
        distanceKm = this.calculateHaversineDistance(
          userCoords.lat,
          userCoords.lng,
          marketCoords.lat,
          marketCoords.lng
        );
      }

      const validRecord: MandiRecord = {
        id: recordId,
        commodityName: commodityRaw,
        commodityNormalized,
        variety,
        grade,
        state,
        district,
        market,
        marketCode,
        arrivalDate,
        marketDate: arrivalDate,
        minimumPrice: minKg,
        modalPrice: modalKg,
        maximumPrice: maxKg,
        minPricePerQuintal: minQ,
        modalPricePerQuintal: modalQ,
        maxPricePerQuintal: maxQ,
        priceUnit: '₹/kg',
        source: MARKET_CONFIG.SOURCE_NAME,
        sourceRecordId: raw.sourceRecordId || recordId,
        fetchedAt: raw.fetchedAt || '2026-09-28 18:30 IST',
        updatedAt: raw.updatedAt || '2026-09-28 18:30 IST',
        dataStatus: 'VALID',
        distanceKm
      };

      validRecords.push(validRecord);
    }

    return {
      validRecords,
      rejectedRecords,
      duplicateCount
    };
  }
}
