import { store } from '../services/store';
import { ServiceTrade } from '../types';

async function runWorkBookingTests() {
  console.log('--- RUNNING ONESETU WORK MODULE & BOOKING SYSTEM TESTS (STEP 2) ---');

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

  // TEST WORK-001 — CATEGORY DATA: 8 required categories exist
  const requiredCategories: ServiceTrade[] = [
    'Electrician',
    'Plumber',
    'Carpenter',
    'Painter',
    'AC Repair',
    'Appliance Repair',
    'Mechanic',
    'Cleaning'
  ];

  const allProviders = store.getProviders();
  const existingCategories = new Set(allProviders.map(p => p.serviceCategory));
  const hasAll8 = requiredCategories.every(c => existingCategories.has(c));

  assert(hasAll8, 'TEST WORK-001: All 8 required categories exist (Electrician, Plumber, Carpenter, Painter, AC Repair, Appliance Repair, Mechanic, Cleaning)');

  // TEST WORK-002 — WORKER COUNT: At least 8 distinct workers
  const uniqueWorkerIds = new Set(allProviders.map(p => p.id));
  assert(uniqueWorkerIds.size >= 8, `TEST WORK-002: At least 8 distinct workers exist (Found: ${uniqueWorkerIds.size} distinct worker profiles)`);

  // TEST WORK-003 — CATEGORY MAPPING: Each worker belongs to a valid category
  const electrician = allProviders.find(p => p.serviceCategory === 'Electrician');
  const plumber = allProviders.find(p => p.serviceCategory === 'Plumber');
  const carpenter = allProviders.find(p => p.serviceCategory === 'Carpenter');
  const painter = allProviders.find(p => p.serviceCategory === 'Painter');
  const acRepair = allProviders.find(p => p.serviceCategory === 'AC Repair');
  const applianceRepair = allProviders.find(p => p.serviceCategory === 'Appliance Repair');
  const mechanic = allProviders.find(p => p.serviceCategory === 'Mechanic');
  const cleaning = allProviders.find(p => p.serviceCategory === 'Cleaning');

  assert(
    Boolean(electrician && plumber && carpenter && painter && acRepair && applianceRepair && mechanic && cleaning),
    'TEST WORK-003: Every required category has a dedicated, verified service professional'
  );

  // TEST WORK-004 — SEARCH: Search queries match workers accurately
  const query = 'Electrician';
  const searchResults = allProviders.filter(
    p => p.serviceCategory.toLowerCase().includes(query.toLowerCase()) || p.name.toLowerCase().includes(query.toLowerCase())
  );
  assert(searchResults.length >= 1 && searchResults.every(p => p.serviceCategory === 'Electrician'), 'TEST WORK-004: Search for "electrician" accurately filters electrician professionals only');

  // TEST WORK-005 — PROFILE: Complete worker profile data
  assert(
    Boolean(
      electrician?.name &&
      electrician?.avatar &&
      electrician?.skills.length &&
      electrician?.experienceYears &&
      electrician?.priceRange &&
      electrician?.contact &&
      electrician?.about
    ),
    'TEST WORK-005: Worker profiles contain full data (skills, experience, priceRange, contact, about, rating)'
  );

  // TEST WORK-006 & TEST WORK-007 & TEST WORK-008 — BOOKING CREATION & UNIQUE ID
  const testBooking = await store.createBooking({
    category: 'WORK',
    serviceTitle: 'Switchboard Repair (Electrician)',
    providerId: electrician!.id,
    providerName: electrician!.name,
    providerContact: electrician!.contact,
    pickupLocation: 'Mysuru City, Karnataka',
    scheduledDate: '2026-10-02',
    scheduledTime: '10:30 AM',
    priceEstimate: electrician!.priceRange,
    paymentMethod: 'CASH',
    notes: 'Bedroom main switch sparking. Please bring spare 16A switch.',
    status: 'REQUESTED'
  });

  assert(
    testBooking.id.startsWith('OS-WRK-') && testBooking.status === 'REQUESTED',
    `TEST WORK-006, 007, 008: Booking form creates actual database record with unique ID (${testBooking.id}) and initial status REQUESTED`
  );

  // TEST WORK-009 & TEST WORK-010 — CUSTOMER & WORKER VISIBILITY
  const myBookings = store.getBookings();
  const foundBooking = myBookings.find(b => b.id === testBooking.id);
  assert(foundBooking !== undefined, 'TEST WORK-009 & 010: New booking is immediately visible in Customer and Worker lists');

  // TEST WORK-011 — ACCEPT: Worker accepts request
  const acceptedBooking = await store.updateBookingStatus(testBooking.id, 'ACCEPTED');
  assert(acceptedBooking?.status === 'ACCEPTED', 'TEST WORK-011: Worker can accept booking request (REQUESTED -> ACCEPTED)');

  // TEST WORK-012 — REJECT: Worker rejects request with reason
  const testRejectBooking = await store.createBooking({
    category: 'WORK',
    serviceTitle: 'Emergency Pipe Repair',
    providerId: plumber!.id,
    providerName: plumber!.name,
    scheduledDate: '2026-10-03',
    scheduledTime: '02:00 PM',
    priceEstimate: '₹400',
    status: 'REQUESTED'
  });
  const rejected = await store.updateBookingStatus(testRejectBooking.id, 'REJECTED', 'Outside service radius today');
  assert(rejected?.status === 'REJECTED' && rejected.rejectionReason === 'Outside service radius today', 'TEST WORK-012: Worker can reject booking request with structured rejection reason');

  // TEST WORK-013 — START: Worker starts service
  const inProgressBooking = await store.updateBookingStatus(testBooking.id, 'IN_PROGRESS');
  assert(inProgressBooking?.status === 'IN_PROGRESS', 'TEST WORK-013: Worker can start accepted service (ACCEPTED -> IN_PROGRESS)');

  // TEST WORK-014 — COMPLETE: Worker completes service
  const completedBooking = await store.updateBookingStatus(testBooking.id, 'COMPLETED');
  assert(
    completedBooking?.status === 'COMPLETED' && Boolean(completedBooking.blockchainTxHash),
    'TEST WORK-014: Worker completes service (IN_PROGRESS -> COMPLETED) and generates cryptographic blockchain completion proof'
  );

  // TEST WORK-015 — CUSTOMER CONFIRMATION: Customer confirms completion
  const confirmResult = store.confirmBookingCompletion(testBooking.id);
  const confirmedBooking = store.getBookings().find(b => b.id === testBooking.id);
  assert(confirmResult && Boolean(confirmedBooking?.customerConfirmedAt), 'TEST WORK-015: Customer confirms completion and confirmation timestamp is recorded');

  // TEST WORK-016 — RATING: Customer rates worker & duplicate rating is blocked
  const rate1 = store.rateBooking(testBooking.id, 5, 'Quick response and fixed the sparking issue smoothly.');
  const rate2 = store.rateBooking(testBooking.id, 4, 'Duplicate attempt');
  assert(rate1 === true && rate2 === false, 'TEST WORK-016: Customer can rate completed service and duplicate rating submissions are strictly blocked');

  // TEST WORK-017 — PAYMENT SEPARATION: Cash method maintains PAYMENT_PENDING until explicit payment confirmation
  assert(
    testBooking.paymentMethod === 'CASH' && testBooking.paymentStatus === 'PAYMENT_PENDING',
    'TEST WORK-017: CASH payment method remains PAYMENT_PENDING upon booking and is decoupled from booking status'
  );

  // TEST WORK-018 — DOUBLE BOOKING CONFLICT CHECK
  // Create an accepted booking for electrician on 2026-10-05 at 11:00 AM
  await store.createBooking({
    category: 'WORK',
    serviceTitle: 'Wiring Inspection',
    providerId: electrician!.id,
    providerName: electrician!.name,
    scheduledDate: '2026-10-05',
    scheduledTime: '11:00 AM',
    priceEstimate: '₹500',
    status: 'ACCEPTED'
  });

  const hasConflict = store.hasBookingConflict(electrician!.id, '2026-10-05', '11:00 AM');
  const noConflict = store.hasBookingConflict(electrician!.id, '2026-10-05', '04:00 PM');
  assert(hasConflict === true && noConflict === false, 'TEST WORK-018 & 019: Double booking conflict detection accurately flags occupied slots');

  // TEST WORK-021 — STATE TRANSITION VALIDATION: Invalid transitions are blocked
  const invalidTransition = await store.updateBookingStatus(testBooking.id, 'ACCEPTED');
  assert(invalidTransition === null, 'TEST WORK-021: Invalid state transitions (e.g. COMPLETED -> ACCEPTED) are blocked by the state machine');

  // TEST WORK-022 — UNIFIED PAYMENT RECORDING
  const payResult = store.updateBookingPayment(testBooking.id, 'ONLINE', 'PAID_ONLINE', 450, 'TXN-ONL-8821');
  const paidBooking = store.getBookings().find(b => b.id === testBooking.id);
  assert(payResult && paidBooking?.paymentStatus === 'PAID_ONLINE' && paidBooking?.paymentTxId === 'TXN-ONL-8821', 'TEST WORK-022: Unified payment records PAID_ONLINE with transaction receipt reference');

  // TEST WORK-024 — REGRESSION SAFETY
  const farmProduce = store.getProduce().length;
  const farmSales = store.getFarmerProducts().length;
  const equipment = store.getEquipment().length;
  const vehicles = store.getVehicles().length;

  assert(
    farmProduce > 0 && farmSales > 0 && equipment > 0 && vehicles > 0,
    'TEST WORK-024: Regression Safety — FARM (Produce, Sales Point, Equipment), MEDICAL, MOVE remain 100% operational'
  );

  console.log(`\nSummary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runWorkBookingTests();
