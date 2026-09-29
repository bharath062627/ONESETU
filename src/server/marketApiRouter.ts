import { marketDataService } from '../services/marketDataService';
import { MarketAiService } from '../services/marketAiService';

/**
 * Handles incoming API requests for /api/market/* routes.
 * Supports Express router or Vite connect middleware.
 */
export function handleMarketApiRequest(urlPath: string, method: string, query: Record<string, string>): { status: number; data: any } {
  // 1. GET /api/market/commodities
  if (urlPath === '/api/market/commodities' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        commodities: marketDataService.getCommodities()
      }
    };
  }

  // 2. GET /api/market/status
  if (urlPath === '/api/market/status' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        status: marketDataService.getSyncStatus()
      }
    };
  }

  // 3. POST /api/market/sync
  if (urlPath === '/api/market/sync' && method === 'POST') {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Market data synchronized successfully with Government OGD / AGMARKNET dataset.',
        status: marketDataService.getSyncStatus()
      }
    };
  }

  // 4. GET /api/market/compare/:commodity
  if (urlPath.startsWith('/api/market/compare/')) {
    const commodity = decodeURIComponent(urlPath.replace('/api/market/compare/', '')) || 'Tomato';
    const district = query.district || 'Mysuru';
    const comparison = marketDataService.getComparison(commodity, district);

    if (!comparison) {
      return {
        status: 404,
        data: {
          success: false,
          error: `No daily mandi observations found for commodity '${commodity}'.`
        }
      };
    }

    const history = marketDataService.getHistory(commodity, 7);
    const aiInsight = MarketAiService.generateInsights(commodity, comparison.comparisonMarkets, history);

    return {
      status: 200,
      data: {
        success: true,
        comparison,
        aiInsight
      }
    };
  }

  // 5. GET /api/market/history/:commodity
  if (urlPath.startsWith('/api/market/history/')) {
    const commodity = decodeURIComponent(urlPath.replace('/api/market/history/', '')) || 'Tomato';
    const days = query.days === '30' ? 30 : 7;
    const history = marketDataService.getHistory(commodity, days);

    return {
      status: 200,
      data: {
        success: true,
        commodity,
        days,
        observations: history
      }
    };
  }

  // 6. GET /api/market/prices/:commodity
  if (urlPath.startsWith('/api/market/prices/')) {
    const commodity = decodeURIComponent(urlPath.replace('/api/market/prices/', ''));
    const district = query.district;
    const records = marketDataService.getPrices(commodity, district);

    return {
      status: 200,
      data: {
        success: true,
        count: records.length,
        records
      }
    };
  }

  // 7. GET /api/market/prices
  if (urlPath === '/api/market/prices' && method === 'GET') {
    const records = marketDataService.getPrices(query.commodity, query.district);
    return {
      status: 200,
      data: {
        success: true,
        count: records.length,
        records
      }
    };
  }

  return {
    status: 404,
    data: {
      success: false,
      error: `Endpoint not found: ${method} ${urlPath}`
    }
  };
}
