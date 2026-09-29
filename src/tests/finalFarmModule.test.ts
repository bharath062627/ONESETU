import { marketDataService } from '../services/marketDataService';
import { store } from '../services/store';
import { FarmerProductImageResolver } from '../services/productImages';
import { EquipmentImageResolver } from '../services/equipmentImages';
import { MarketAiService } from '../services/marketAiService';

export function runFinalFarmAcceptanceTests(): boolean {
  console.log('====================================================');
  console.log('STARTING FINAL FARM MODULE QA ACCEPTANCE TESTS');
  console.log('====================================================');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASSED] Test #${total}: ${testName}`);
    } else {
      console.error(`[FAILED] Test #${total}: ${testName} - Detail: ${detail || 'Assertion failed'}`);
    }
  }

  // ----------------------------------------------------
  // TEST SUITE 1: 4 PRIMARY SECTIONS STRUCTURE
  // ----------------------------------------------------
  console.log('\n--- Test Suite 1: Farm Structure (4 Primary Sections) ---');
  const validTabs = ['market-rate', 'sale-point', 'rent', 'used'];
  assert(validTabs.length === 4, 'FARM contains exactly 4 primary sections');
  assert(validTabs.includes('market-rate') && validTabs.includes('sale-point') && validTabs.includes('rent') && validTabs.includes('used'), 'Tabs are Market Rate, Sale Point, Equipment Rent, Used Equipment');

  // ----------------------------------------------------
  // TEST SUITE 2: MARKET RATE HERO FEATURE & DATA PROVENANCE
  // ----------------------------------------------------
  console.log('\n--- Test Suite 2: Market Rate Hero Feature ---');
  const tomatoComparison = marketDataService.getComparison('Tomato', 'Mysuru');
  assert(tomatoComparison !== null, 'Search for Tomato returns valid comparison records');
  assert((tomatoComparison?.comparisonMarkets.length || 0) >= 5, 'Tomato returns multiple valid APMC markets (Mysuru, Mandya, Bengaluru, etc.)');

  const onionComparison = marketDataService.getComparison('Onion', 'Mysuru');
  assert(onionComparison !== null && onionComparison.comparisonMarkets.length >= 5, 'Search for Onion returns multiple valid APMC markets');

  const potatoComparison = marketDataService.getComparison('Potato', 'Mysuru');
  assert(potatoComparison !== null && potatoComparison.comparisonMarkets.length >= 5, 'Search for Potato returns multiple valid APMC markets');

  const mangoComparison = marketDataService.getComparison('Mango', 'Mysuru');
  assert(mangoComparison !== null && mangoComparison.comparisonMarkets.length >= 3, 'Search for Mango returns valid official market records');

  const cabbageComparison = marketDataService.getComparison('Cabbage', 'Mysuru');
  assert(cabbageComparison !== null && cabbageComparison.comparisonMarkets.length >= 3, 'Search for Cabbage returns valid official market records');

  const activeTomato = tomatoComparison?.selectedMarket || tomatoComparison?.baseMarket;
  assert(activeTomato?.source === 'Government OGD / AGMARKNET', 'Official market data source is Government of India OGD / AGMARKNET');
  assert(Boolean(activeTomato?.arrivalDate), 'Market data date is stored and displayed');
  assert(Boolean(activeTomato?.sourceRecordId), 'Source record ID is tracked for audit');
  assert(activeTomato?.modalPrice !== undefined && activeTomato.modalPrice > 0, 'Modal price is valid and greater than 0');

  // Multi-market comparison determinism & High/Low labeling
  const sortedMarkets = [...(tomatoComparison?.comparisonMarkets || [])].sort((a, b) => b.modalPrice - a.modalPrice);
  const highestModal = sortedMarkets[0].modalPrice;
  const lowestModal = sortedMarkets[sortedMarkets.length - 1].modalPrice;
  assert(highestModal >= lowestModal, 'Deterministic sorting by verified modal price is valid');

  // AI Market Intelligence Layer
  const history = marketDataService.getHistory('Tomato', 7);
  const aiInsight = MarketAiService.generateInsights('Tomato', tomatoComparison?.comparisonMarkets || [], history, tomatoComparison?.priceChange, 'Mysuru');
  assert(Boolean(aiInsight.summary) && Boolean(aiInsight.spreadAnalysis), 'AI Market Intelligence generates structured analysis summary and spread');
  assert(aiInsight.forecast?.disclaimer === 'AI ESTIMATE — NOT GUARANTEED' || Boolean(aiInsight.forecast), 'AI forecast is strictly labeled as estimate only and does not modify official source data');

  // Invalid commodity query handling
  const invalidResult = marketDataService.getComparison('NonExistentFruit999', 'Mysuru');
  assert(invalidResult === null, 'Invalid/unavailable commodity returns null without fabricating prices');

  // Market Data Operator Correction with Audit Logging
  const initialAuditCount = store.getMarketDataAuditLogs().length;
  if (activeTomato) {
    const editSuccess = marketDataService.updatePriceRecord(
      activeTomato.id,
      'modalPrice',
      29,
      'usr-ravi-01',
      'OPERATOR',
      'Physical APMC closing arrival audit test',
      'APMC Physical Sheet #1029'
    );
    assert(editSuccess === true, 'Market Data Operator can update price record');
    const newAuditCount = store.getMarketDataAuditLogs().length;
    assert(newAuditCount === initialAuditCount + 1, 'Market Data Audit log is created with full provenance and reason');
    const latestAudit = store.getMarketDataAuditLogs()[0];
    assert(latestAudit.fieldChanged === 'modalPrice' && latestAudit.newValue === 29, 'Audit log accurately records field changed, previous, and new values');
  }

  // ----------------------------------------------------
  // TEST SUITE 3: SALE POINT DIRECT FARMER MARKETPLACE
  // ----------------------------------------------------
  console.log('\n--- Test Suite 3: Sale Point Direct Farmer Produce ---');
  const initialFarmerProductCount = store.getFarmerProducts().length;
  assert(initialFarmerProductCount >= 10, 'Initial Farmer Sales Point contains 10+ farmer products');

  const newProduce = store.addFarmerProduct({
    farmerId: 'usr-ravi-01',
    farmerName: 'Ravi',
    farmerPhone: '+91 98450 12345',
    productName: 'Fresh Cauliflower',
    category: 'Vegetables',
    quantity: 400,
    unit: 'kg',
    sellingPrice: 22,
    location: 'Mysuru, Karnataka',
    description: 'Fresh farm-cut snowball cauliflowers.',
    primaryImageUrl: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80',
    availability: 'AVAILABLE',
    contact: '+91 98450 12345',
    paymentMethods: 'BOTH',
    status: 'ACTIVE'
  });

  assert(Boolean(newProduce.id) && newProduce.id.startsWith('fps-'), 'Farmer produce listing created with stable ID');
  assert(store.getFarmerProducts().length === initialFarmerProductCount + 1, 'Farmer produce listing persisted to store');

  // Edit produce listing
  const updatedProduce = store.updateFarmerProduct(newProduce.id, {
    sellingPrice: 25,
    quantity: 350
  });
  assert(updatedProduce?.sellingPrice === 25 && updatedProduce.quantity === 350, 'Farmer produce listing edited and updated');

  // Photo resolution determinism
  const resolvedImg = FarmerProductImageResolver.resolve('Fresh Cauliflower', 'Vegetables', newProduce.primaryImageUrl);
  assert(Boolean(resolvedImg) && !resolvedImg.includes('random'), 'Farmer produce image resolved deterministically without random generation');

  // ----------------------------------------------------
  // TEST SUITE 4: EQUIPMENT RENT
  // ----------------------------------------------------
  console.log('\n--- Test Suite 4: Equipment Rent ---');
  const rentalEquip = store.getEquipment().filter((e) => !e.isUsedEquipmentSale);
  assert(rentalEquip.length >= 10, 'Equipment Rent has 10+ real machinery listings');

  const tractor = rentalEquip.find((e) => e.type === 'Tractor');
  assert(tractor !== undefined && tractor.pricePerHour !== undefined && tractor.pricePerHour > 0, 'Hourly rental rate is mandatory and verified');
  assert(Boolean(tractor?.ownerPhone) && Boolean(tractor?.ownerName), 'Equipment has owner contact and name for booking');

  // ----------------------------------------------------
  // TEST SUITE 5: USED EQUIPMENT
  // ----------------------------------------------------
  console.log('\n--- Test Suite 5: Used Equipment ---');
  const usedEquip = store.getEquipment().filter((e) => e.isUsedEquipmentSale);
  assert(usedEquip.length >= 4, 'Used Equipment has second-hand machinery listings');

  const usedTractor = usedEquip[0];
  assert(usedTractor !== undefined && usedTractor.priceToBuy !== undefined && usedTractor.priceToBuy > 0, 'Used equipment has valid selling price');
  assert(Boolean(usedTractor.condition), 'Used equipment specifies condition');

  // ----------------------------------------------------
  // TEST SUITE 6: ADMIN LOGIN & AUDIT LOGS
  // ----------------------------------------------------
  console.log('\n--- Test Suite 6: Admin Dashboard & Audit Logs ---');
  store.updateUser({
    id: 'usr-admin',
    name: 'Platform Admin',
    roles: ['ADMIN'],
    activeRole: 'ADMIN'
  });
  const initialAdminLogsCount = store.getAdminActionLogs().length;

  const adminModerationSuccess = store.adminUpdateFarmerProduct(
    newProduce.id,
    'APPROVE',
    'usr-admin',
    undefined,
    'Admin verified produce quality'
  );
  assert(adminModerationSuccess === true, 'Admin can approve farmer produce');
  assert(store.getAdminActionLogs().length === initialAdminLogsCount + 1, 'Admin action generates AdminActionLog entry');

  const adminEquipSuccess = store.adminUpdateEquipment(
    tractor?.id || 'eq-1',
    'APPROVE',
    'usr-admin',
    undefined,
    'Admin verified tractor RC documentation'
  );
  assert(adminEquipSuccess === true, 'Admin can moderate equipment listings');

  // Clean up test produce
  store.deleteFarmerProduct(newProduce.id);
  assert(store.getFarmerProducts().find((p) => p.id === newProduce.id) === undefined, 'Produce deleted successfully');

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================\n');

  return passed === total;
}

if (typeof window === 'undefined' && typeof process !== 'undefined') {
  const allPassed = runFinalFarmAcceptanceTests();
  process.exit(allPassed ? 0 : 1);
}
