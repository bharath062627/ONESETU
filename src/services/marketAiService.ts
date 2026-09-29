import { MandiRecord, AiMarketInsight, HistoricalPriceObservation, PriceChangeMetrics } from '../types/market';

export class MarketAiService {
  /**
   * Generates analytical market intelligence strictly derived from actual fetched mandi records.
   * NOTE: AI is never permitted to invent current market prices (Section 2, 15, 20).
   */
  public static generateInsights(
    commodity: string,
    currentRecords: MandiRecord[],
    history: HistoricalPriceObservation[] = [],
    priceChange?: PriceChangeMetrics,
    userDistrict: string = 'Mysuru'
  ): AiMarketInsight {
    if (!currentRecords || currentRecords.length === 0) {
      return {
        summary: `No official daily mandi observations are currently available for ${commodity}.`,
        spreadAnalysis: 'Price comparison across regional markets cannot be calculated without recorded arrivals.',
        anomalyDetected: false
      };
    }

    // Sort by modal price descending
    const sortedByPrice = [...currentRecords].sort((a, b) => b.modalPrice - a.modalPrice);
    const highest = sortedByPrice[0];
    const lowest = sortedByPrice[sortedByPrice.length - 1];

    const priceDiff = Math.round((highest.modalPrice - lowest.modalPrice) * 10) / 10;
    const spreadPercent = lowest.modalPrice > 0 ? Math.round((priceDiff / lowest.modalPrice) * 100) : 0;

    // Find closest market relative to user location
    const sortedByDistance = [...currentRecords].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    const closest = sortedByDistance[0];

    // Farmer-friendly summary (Section 19)
    let summary = '';
    if (highest.id === closest.id) {
      summary = `Your nearest reporting mandi, ${closest.market} (${closest.distanceKm ?? 0} km away), also reports the highest modal rate (₹${closest.modalPrice}/kg) among displayed markets.`;
    } else {
      summary = `Among the markets currently displayed, ${highest.market} reports a higher modal ${commodity.toLowerCase()} price (₹${highest.modalPrice}/kg) than ${closest.market} (₹${closest.modalPrice}/kg), while ${closest.market} is closer to your selected location (${closest.distanceKm ?? 0} km vs ${highest.distanceKm ?? 0} km).`;
    }

    // Spread explanation with transport cost consideration (Section 14 & 22)
    let spreadAnalysis = '';
    if (highest.id === lowest.id) {
      spreadAnalysis = `${highest.market} currently reports a modal rate of ₹${highest.modalPrice}/kg (₹${highest.modalPricePerQuintal}/quintal). Additional regional market arrivals are pending daily upload.`;
    } else {
      spreadAnalysis = `${highest.market} currently reports a modal rate of ₹${highest.modalPrice}/kg, compared with ₹${lowest.modalPrice}/kg in ${lowest.market} (a spread of ₹${priceDiff}/kg or ${spreadPercent}%). When evaluating selling locations, farmers should compare this price difference with round-trip transport and handling costs before dispatch.`;
    }

    // Day-over-day price change explanation (Section 16 & 17)
    let priceChangeExplanation = '';
    if (priceChange) {
      const sign = priceChange.absoluteChange > 0 ? '+' : '';
      if (priceChange.direction === 'UP') {
        priceChangeExplanation = `Reported modal price increased by ${sign}₹${priceChange.absoluteChange}/kg (${sign}${priceChange.percentageChange}%) compared with the previous observation on ${priceChange.previousDate} (₹${priceChange.previousModalPrice}/kg).`;
      } else if (priceChange.direction === 'DOWN') {
        priceChangeExplanation = `Reported modal price decreased by ₹${Math.abs(priceChange.absoluteChange)}/kg (${priceChange.percentageChange}%) compared with the previous observation on ${priceChange.previousDate} (₹${priceChange.previousModalPrice}/kg).`;
      } else {
        priceChangeExplanation = `Reported modal price remained steady at ₹${priceChange.currentModalPrice}/kg compared with the previous observation on ${priceChange.previousDate}.`;
      }
    }

    // Anomaly detection (Section 18)
    let anomalyDetected = false;
    let anomalyNote = '';

    if (priceChange && Math.abs(priceChange.percentageChange) >= 15) {
      anomalyDetected = true;
      anomalyNote = `Unusual price movement detected: Reported modal price changed significantly (${priceChange.percentageChange > 0 ? '+' : ''}${priceChange.percentageChange}%) compared with the previous available observation on ${priceChange.previousDate}.`;
    } else if (spreadPercent >= 35 && currentRecords.length > 2) {
      anomalyDetected = true;
      anomalyNote = `Notable regional disparity: An inter-district price difference of ${spreadPercent}% is observed between ${lowest.district} and ${highest.district}.`;
    }

    // Optional 3-day projection (Section 21) - Strictly marked as AI ESTIMATE — NOT GUARANTEED
    let forecast: AiMarketInsight['forecast'] | undefined;
    if (history.length >= 3) {
      const recentObservations = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-3);
      const recentAvg = recentObservations.reduce((acc, o) => acc + o.modalPrice, 0) / recentObservations.length;
      const lower = Math.max(1, Math.round((recentAvg * 0.95) * 10) / 10);
      const upper = Math.round((recentAvg * 1.05) * 10) / 10;

      forecast = {
        period: 'Next 3 Days',
        projectedRange: `₹${lower} – ₹${upper} / kg`,
        disclaimer: 'AI ESTIMATE — NOT GUARANTEED',
        confidence: recentObservations.length >= 5 ? 'High' : 'Moderate'
      };
    }

    return {
      summary,
      spreadAnalysis,
      priceChangeExplanation: priceChangeExplanation || undefined,
      anomalyDetected,
      anomalyNote: anomalyNote || undefined,
      forecast
    };
  }
}
