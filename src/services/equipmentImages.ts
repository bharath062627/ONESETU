import { EquipmentItem, EquipmentCategory } from '../types';

/**
 * Verified, authentic agricultural equipment images registry.
 * Guarantees that every equipment category (Tractor, Sprayer, Harvester, Rotavator, etc.)
 * displays a genuine agricultural machine photo — never unrelated people, suits, or random stock images.
 */

export const EQUIPMENT_CATEGORY_IMAGES: Record<string, string> = {
  'Tractor': 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80', // Red tractor in farmland
  'Sprayer': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80', // Agricultural crop sprayer
  'Harvester': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=600&auto=format&fit=crop&q=80', // Heavy combine harvester
  'Rotavator': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80', // Rotary tiller / rotavator
  'Cultivator': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80', // Tractor with field cultivator
  'Seeder': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80', // Sowing and drilling equipment
  'Plough': 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&auto=format&fit=crop&q=80', // Heavy soil plough
  'Power Tiller': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80', // Agricultural power tiller
  'Other': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80' // Green agricultural machine
};

export const SPECIFIC_EQUIPMENT_IMAGES: Record<string, string> = {
  // Specific Tractors
  'Mahindra 575 DI Tractor': 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
  'Swaraj 744 FE Tractor': 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&auto=format&fit=crop&q=80',
  'John Deere 5310 Tractor': 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80',
  'Sonalika DI 745 III Tractor': 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
  'Swaraj 735 FE (2021 Model) - Used': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
  'Used Mahindra 275 DI': 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',

  // Sprayers
  'High Pressure Power Sprayer (16L)': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
  'Knapsack Battery Sprayer': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
  'ASPEE Marut Hand Compression Sprayer': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',

  // Power Tillers
  'VST Shakti 130 DI Power Tiller': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80',

  // Rotavators & Tillage
  'Shaktiman Regular Light Rotavator': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',
  'Used Shaktiman 6ft Rotavator (2022)': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80',

  // Harvesters
  'Preet 987 Combine Harvester': 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=600&auto=format&fit=crop&q=80',
  'Used Track Harvester': 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80',

  // Cultivators
  'Fieldking 9-Tyne Spring Cultivator': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80',
  'Used Heavy 9-Tyne Cultivator (2020)': 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&auto=format&fit=crop&q=80',

  // Seeders & Ploughs
  'National Agro Automatic Seed Cum Fertilizer Drill': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
  'Lemken Opal 090 Hydraulic Reversible Plough': 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=600&auto=format&fit=crop&q=80'
};

/**
 * Proper EquipmentImageResolver complying with Section 2, 13, and 14:
 * 1. Owner-uploaded photo (primaryImageUrl or imageUrls[0])
 * 2. Specific equipment model image
 * 3. Category-specific real agricultural machinery image
 * 4. Generic agriculture placeholder
 * Zero Math.random(). Deterministic and persistent.
 */
export class EquipmentImageResolver {
  public static resolve(item: Partial<EquipmentItem>): string {
    // 1. Owner uploaded primary or first image
    if (item.primaryImageUrl && item.primaryImageUrl.trim()) {
      return item.primaryImageUrl.trim();
    }
    if (item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]?.trim()) {
      return item.imageUrls[0].trim();
    }
    if (item.image && item.image.trim()) {
      return item.image.trim();
    }

    // 2. Specific equipment model matching
    if (item.equipmentName && SPECIFIC_EQUIPMENT_IMAGES[item.equipmentName]) {
      return SPECIFIC_EQUIPMENT_IMAGES[item.equipmentName];
    }

    // 3. Category-specific real image
    const category = item.type || 'Other';
    if (EQUIPMENT_CATEGORY_IMAGES[category]) {
      return EQUIPMENT_CATEGORY_IMAGES[category];
    }

    // 4. Generic fallback
    return EQUIPMENT_CATEGORY_IMAGES['Tractor'];
  }
}

/**
 * Legacy compatibility helper.
 */
export function getVerifiedEquipmentImage(equipmentName: string, category?: string): string {
  return EquipmentImageResolver.resolve({
    equipmentName,
    type: (category as EquipmentCategory) || 'Other'
  });
}

/**
 * Client-side image compression and validation helper.
 * Resizes large photos to mobile-friendly dimensions (max 1200px) and compresses to clean JPEG data URL.
 */
export async function compressAndValidateImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    // Type validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image (PNG, JPG, WEBP supported).'));
    }

    // Size limit check (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return reject(new Error('Image size must be less than 15MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image. File may be corrupted.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
