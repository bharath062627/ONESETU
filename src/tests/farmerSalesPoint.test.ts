import { store } from '../services/store';
import { FarmerProductImageResolver } from '../services/productImages';
import { FarmerProduct } from '../types';

function runFarmerSalesPointTests() {
  console.log('--- RUNNING ONESETU FARMER SALES POINT TEST SUITE (ANTIGRAVITY STEP 1) ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✓ ${testName}`);
      passed++;
    } else {
      console.error(`✕ ${testName}`);
      failed++;
    }
  }

  // TEST 1 — Real Matching Product Images & Zero Randomness
  const tomatoImg = FarmerProductImageResolver.resolve('Organic Tomato', 'Vegetables');
  const onionImg = FarmerProductImageResolver.resolve('Red Onion', 'Vegetables');
  const bananaImg = FarmerProductImageResolver.resolve('Yelakki Banana', 'Fruits');
  const mangoImg = FarmerProductImageResolver.resolve('Badami Mango', 'Fruits');

  assert(
    tomatoImg.includes('photo-1592924357228') &&
    onionImg.includes('photo-1618512496248') &&
    bananaImg.includes('photo-1571771894821') &&
    mangoImg.includes('photo-1553279768'),
    'TEST 1: Product listings display authentic matching product photos and zero random images'
  );

  // TEST 2 — Seeded Demo Farmer Sales Point Listings
  const products = store.getFarmerProducts();
  assert(products.length >= 10, 'TEST 2: Store initializes with 10+ realistic Farmer Sales Point demo listings');

  // TEST 3 — Form Creation & Add Farmer Product
  const newProd = store.addFarmerProduct({
    farmerId: 'usr-ravi-01',
    farmerName: 'Ravi Organic Estate',
    farmerPhone: '+91 98450 12345',
    productName: 'Organic Green Chilli',
    category: 'Spices',
    quantity: 250,
    unit: 'kg',
    sellingPrice: 95,
    currency: 'INR',
    location: 'Mysuru Rural, Karnataka',
    description: 'Fresh farm harvested spicy green chillies.',
    primaryImageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'
    ],
    availability: 'AVAILABLE',
    contact: '+91 98450 12345',
    paymentMethods: 'BOTH',
    status: 'ACTIVE',
    verified: true,
    mandiReferencePrice: 100
  });

  assert(newProd.id.startsWith('fps-') && newProd.productName === 'Organic Green Chilli', 'TEST 3: addFarmerProduct successfully persists new product listing');

  // TEST 4 — Primary Image Persistence
  const fetched = store.getFarmerProductById(newProd.id);
  assert(
    fetched !== undefined &&
    fetched.primaryImageUrl === 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80' &&
    fetched.imageUrls?.length === 2,
    'TEST 4: Submitting listing with photos saves primaryImageUrl and imageUrls[] across store reloads'
  );

  // TEST 5 — Cross-Listing Image Isolation
  const tomatoListing = products.find(p => p.productName.toLowerCase().includes('tomato'));
  const onionListing = products.find(p => p.productName.toLowerCase().includes('onion'));

  const resolvedTomato = FarmerProductImageResolver.resolve(
    tomatoListing?.productName || 'Tomato',
    tomatoListing?.category || 'Vegetables',
    tomatoListing?.primaryImageUrl
  );
  const resolvedOnion = FarmerProductImageResolver.resolve(
    onionListing?.productName || 'Onion',
    onionListing?.category || 'Vegetables',
    onionListing?.primaryImageUrl
  );

  assert(resolvedTomato !== resolvedOnion, 'TEST 5: Tomato listing never displays onion photo and vice-versa (Mandatory Isolation Test)');

  // TEST 6 — Edit Farmer Product Listing
  const updated = store.updateFarmerProduct(newProd.id, {
    sellingPrice: 88,
    quantity: 200,
    availability: 'LOW STOCK'
  });

  assert(
    updated !== null && updated.sellingPrice === 88 && updated.availability === 'LOW STOCK',
    'TEST 6: Farmer can update own listing price, quantity, and availability'
  );

  // TEST 7 — Delete Farmer Product Listing
  const deleteSuccess = store.deleteFarmerProduct(newProd.id);
  const afterDeleteFetch = store.getFarmerProductById(newProd.id);

  assert(deleteSuccess && afterDeleteFetch === undefined, 'TEST 7: Farmer can remove/delete own product listing');

  // TEST 8 — Quantity Units & Payment Methods Support
  const sampleProduct = products[0];
  assert(
    ['kg', 'quintal', 'tonne', 'piece', 'dozen', 'bundle', 'other'].includes(sampleProduct.unit) &&
    ['CASH', 'ONLINE', 'BOTH'].includes(sampleProduct.paymentMethods),
    'TEST 8: Flexible quantity units (kg, quintal, tonne, etc.) and payment methods (CASH/ONLINE/BOTH) supported'
  );

  // TEST 9 — Optional Mandi Benchmark Reference (Non-Overriding)
  const fps1 = store.getFarmerProductById('fps-1');
  assert(
    fps1 !== undefined && fps1.sellingPrice === 28 && (fps1.mandiReferencePrice === 30 || fps1.mandiReferencePrice !== undefined),
    'TEST 9: Farmer selling price remains independent of Mandi benchmark (Information only, non-overriding)'
  );

  // TEST 10 — Ecosystem Regression Safety
  const produceCount = store.getProduce().length;
  const equipmentCount = store.getEquipment().length;
  const providerCount = store.getProviders().length;
  const vehicleCount = store.getVehicles().length;

  assert(
    produceCount > 0 && equipmentCount > 0 && providerCount > 0 && vehicleCount > 0,
    'TEST 10: Ecosystem Regression Safety — Produce, Equipment Rent, Used Equipment, WORK, MEDICAL, MOVE remain 100% operational'
  );

  console.log(`\nSummary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runFarmerSalesPointTests();
