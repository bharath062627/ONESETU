/**
 * CommodityNormalizationService
 * Normalizes commodity variations (case, plurals, vernacular/Hindi/regional terms)
 * into canonical English commodity categories while preserving the original name.
 */

const CANONICAL_MAP: Record<string, string> = {
  // Tomato
  'tomato': 'Tomato',
  'tomatoes': 'Tomato',
  'tamatar': 'Tomato',
  'tomato (hybrid)': 'Tomato',
  'tomato (local)': 'Tomato',

  // Onion
  'onion': 'Onion',
  'onions': 'Onion',
  'pyaz': 'Onion',
  'onion (red)': 'Onion',
  'onion (white)': 'Onion',

  // Potato
  'potato': 'Potato',
  'potatoes': 'Potato',
  'aloo': 'Potato',
  'potato (jyoti)': 'Potato',

  // Carrot
  'carrot': 'Carrot',
  'carrots': 'Carrot',
  'gajar': 'Carrot',

  // Banana
  'banana': 'Banana',
  'bananas': 'Banana',
  'kela': 'Banana',
  'banana (yelakki)': 'Banana',
  'banana (robusta)': 'Banana',

  // Mango
  'mango': 'Mango',
  'mangoes': 'Mango',
  'aam': 'Mango',
  'alphonso': 'Mango',
  'badami': 'Mango',

  // Paddy / Rice
  'paddy': 'Paddy',
  'rice': 'Paddy',
  'dhan': 'Paddy',
  'paddy (dhan)': 'Paddy',
  'paddy (sona masoori)': 'Paddy',

  // Wheat
  'wheat': 'Wheat',
  'gehun': 'Wheat',

  // Maize
  'maize': 'Maize',
  'corn': 'Maize',
  'makka': 'Maize',

  // Green Chilli
  'green chilli': 'Green Chilli',
  'chilli (green)': 'Green Chilli',
  'mirchi': 'Green Chilli'
};

export class CommodityNormalizationService {
  /**
   * Returns canonical normalized commodity name.
   */
  public static normalize(rawName: string): string {
    if (!rawName) return '';
    const cleaned = rawName.trim().toLowerCase();

    // Direct dictionary match
    if (CANONICAL_MAP[cleaned]) {
      return CANONICAL_MAP[cleaned];
    }

    // Substring / keyword match
    for (const [key, canonical] of Object.entries(CANONICAL_MAP)) {
      if (cleaned.includes(key)) {
        return canonical;
      }
    }

    // Fallback: Title case first letter of each word
    return rawName
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Checks if user search matches commodity (canonical or alias).
   */
  public static matches(rawCommodity: string, searchQuery: string): boolean {
    if (!searchQuery) return true;
    const normalizedCommodity = this.normalize(rawCommodity).toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    if (normalizedCommodity.includes(query) || rawCommodity.toLowerCase().includes(query)) {
      return true;
    }

    // Check alias
    const normalizedQuery = this.normalize(query).toLowerCase();
    return normalizedCommodity === normalizedQuery;
  }
}
