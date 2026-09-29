/**
 * Configuration for the Government of India Open Government Data (OGD) / AGMARKNET API.
 * Values can be configured via environment variables or backend configuration.
 */

export const MARKET_CONFIG = {
  // Official OGD / AGMARKNET API URL
  API_URL:
    (typeof process !== 'undefined' && process.env?.MARKET_DATA_API_URL) ||
    'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',

  // Configurable Resource ID for the mandi price dataset on data.gov.in
  RESOURCE_ID:
    (typeof process !== 'undefined' && process.env?.MARKET_DATA_RESOURCE_ID) ||
    '9ef84268-d588-465a-a308-a864a43d0070',

  // API Key (optional for public endpoints, configurable via env)
  API_KEY:
    (typeof process !== 'undefined' && process.env?.MARKET_DATA_API_KEY) ||
    '',

  // Dataset description
  DATASET_NAME: 'Current Daily Price of Various Commodities from Various Markets (Mandi)',
  SOURCE_NAME: 'Government OGD / AGMARKNET' as const,
  PORTAL_URL: 'https://data.gov.in/',

  // Default target state & districts for localized search
  DEFAULT_STATE: 'Karnataka',
  DEFAULT_DISTRICT: 'Mysuru',

  // Coordinate reference for distance calculation (Haversine)
  DISTRICT_COORDINATES: {
    'Mysuru': { lat: 12.2958, lng: 76.6394 },
    'Mandya': { lat: 12.5244, lng: 76.8958 },
    'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 },
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'Chamarajanagar': { lat: 11.9261, lng: 76.9437 },
    'Hassan': { lat: 13.0033, lng: 76.1004 },
    'Ramanagara': { lat: 12.7209, lng: 77.2799 },
    'Kolar': { lat: 13.1378, lng: 78.1340 },
    'Tumakuru': { lat: 13.3409, lng: 77.1010 },
    'Belagavi': { lat: 15.8497, lng: 74.4977 },
    'Davanagere': { lat: 14.4644, lng: 75.9218 },
    'Dharwad': { lat: 15.4589, lng: 75.0078 },
    'Hubballi': { lat: 15.3647, lng: 75.1240 },
    'Shivamogga': { lat: 13.9299, lng: 75.5681 },
    'Chikkamagaluru': { lat: 13.3153, lng: 75.7754 }
  } as Record<string, { lat: number; lng: number }>
};
