/**
 * ONESETU FARMER SALES POINT — Product Image Resolver
 * 
 * Guarantees zero random photo selection.
 * Priority:
 * 1. User/Farmer Uploaded Real Photo (primaryImageUrl / imageUrls[0])
 * 2. Specific Commodity Product Image Asset (Tomato -> tomato photo, Onion -> onion photo, Banana -> banana photo, etc.)
 * 3. Category High-Resolution Fallback Asset
 */

const PRODUCT_EXACT_IMAGES: Record<string, string> = {
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  paddy: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600&auto=format&fit=crop&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
  carrot: 'https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=600&auto=format&fit=crop&q=80',
  cabbage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
  garlic: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
  ginger: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
  coconut: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80',
  turmeric: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  Fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  Grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  Pulses: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=600&auto=format&fit=crop&q=80',
  Spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
  'Other Farm Products': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80'
};

export class FarmerProductImageResolver {
  public static resolve(
    productName: string,
    category: string,
    primaryImageUrl?: string,
    imageUrls?: string[]
  ): string {
    // Priority 1: User/Farmer uploaded photo
    if (primaryImageUrl && primaryImageUrl.trim().length > 0) {
      return primaryImageUrl;
    }
    if (imageUrls && imageUrls.length > 0 && imageUrls[0]?.trim().length > 0) {
      return imageUrls[0];
    }

    // Priority 2: Commodity-specific exact asset
    const normalizedName = productName.toLowerCase();
    for (const key of Object.keys(PRODUCT_EXACT_IMAGES)) {
      if (normalizedName.includes(key)) {
        return PRODUCT_EXACT_IMAGES[key];
      }
    }

    // Priority 3: Category fallback
    if (CATEGORY_FALLBACK_IMAGES[category]) {
      return CATEGORY_FALLBACK_IMAGES[category];
    }

    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80';
  }
}
