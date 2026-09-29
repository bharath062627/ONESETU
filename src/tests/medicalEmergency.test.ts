import { store } from '../services/store';
import {
  evaluateDeterministicSafety,
  generateAiEmergencyResponse,
  searchMedicalFacilities,
  validateIndianPhoneNumber,
  INITIAL_VERIFIED_HELPLINES,
  INITIAL_VERIFIED_FACILITIES,
  OFFLINE_EMERGENCY_DIRECTORY
} from '../services/medicalEmergencyService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function runMedicalEmergencyTestSuite() {
  console.log('\n======================================================================');
  console.log('--- RUNNING ONESETU FINAL MEDICAL & EMERGENCY QA TEST SUITE ---');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      console.log(`✓ [PASSED] ${name}`);
    } catch (err: any) {
      failed++;
      console.error(`✗ [FAILED] ${name}: ${err.message}`);
    }
  }

  // 1. Navigation & Initial Load
  runTest('TEST 1: Medical module navigation & default state initialization', () => {
    store.setScreen('medical');
    assert(store.getScreen() === 'medical', 'Screen must navigate to medical');
    const helplines = store.getEmergencyHelplines();
    assert(helplines.length >= 10, `Helplines must initialize with authentic records. Found ${helplines.length}`);
    const facilities = store.getMedicalFacilities();
    assert(facilities.length >= 10, `Facilities must initialize with authentic records. Found ${facilities.length}`);
  });

  // 2. Emergency Center & 112 Unified Emergency Number
  runTest('TEST 2: India Unified Emergency Number 112 configuration & ERSS metadata', () => {
    const helplines = store.getEmergencyHelplines();
    const unified112 = helplines.find((h) => h.number === '112');
    assert(Boolean(unified112), '112 must be configured in helplines registry');
    assert(unified112!.scope === 'NATIONAL', '112 scope must be NATIONAL');
    assert(unified112!.verification_status === 'VERIFIED', '112 must have VERIFIED status');
    assert(unified112!.source.includes('Ministry of Home Affairs'), '112 source must cite Ministry of Home Affairs');
    assert(unified112!.availability.includes('24x7'), '112 must be available 24x7');
  });

  // 3. Ambulance Services (108 & 102)
  runTest('TEST 3: Verified Ambulance dispatch numbers (108 & 102) for Karnataka', () => {
    const helplines = store.getEmergencyHelplines();
    const amb108 = helplines.find((h) => h.number === '108');
    assert(Boolean(amb108), '108 must be present in helplines');
    assert(amb108!.category === 'Ambulance', '108 category must be Ambulance');
    assert(amb108!.state === 'Karnataka', '108 state must be Karnataka');

    const jssk102 = helplines.find((h) => h.number === '102');
    assert(Boolean(jssk102), '102 must be present in helplines');
    assert(jssk102!.description.toLowerCase().includes('pregnant') || jssk102!.description.toLowerCase().includes('maternity'), '102 must be designated for maternity/infant transport');
  });

  // 4. Centralized Helpline Registry Metadata Integrity
  runTest('TEST 4: Centralized EmergencyHelpline registry contains zero hardcoded duplicates and full audit metadata', () => {
    const helplines = store.getEmergencyHelplines();
    const idSet = new Set<string>();
    for (const h of helplines) {
      assert(!idSet.has(h.id), `Duplicate helpline ID detected: ${h.id}`);
      idSet.add(h.id);
      assert(Boolean(h.service_name), `Helpline ${h.id} missing service_name`);
      assert(Boolean(h.number), `Helpline ${h.id} missing number`);
      assert(Boolean(h.source), `Helpline ${h.id} missing authoritative source`);
      assert(Boolean(h.verified_at), `Helpline ${h.id} missing verified_at date`);
      assert(Boolean(h.last_checked_by), `Helpline ${h.id} missing last_checked_by`);
    }
  });

  // 5. Complete Search across categories & departments
  runTest('TEST 5: Complete Medical Search for Hospital, Clinic, Pharmacy, Ambulance, Blood Bank', () => {
    const allFac = store.getMedicalFacilities();
    const hospitals = searchMedicalFacilities(allFac, { categoryFilter: 'Hospital' });
    assert(hospitals.length >= 3, `Must find multiple hospitals (found ${hospitals.length})`);

    const clinics = searchMedicalFacilities(allFac, { categoryFilter: 'Clinic' });
    assert(clinics.length >= 1, `Must find clinics (found ${clinics.length})`);

    const pharmacies = searchMedicalFacilities(allFac, { categoryFilter: 'Pharmacy' });
    assert(pharmacies.length >= 2, `Must find 24x7 pharmacies (found ${pharmacies.length})`);

    const bloodBanks = searchMedicalFacilities(allFac, { categoryFilter: 'Blood Bank' });
    assert(bloodBanks.length >= 1, `Must find blood banks (found ${bloodBanks.length})`);
  });

  // 6. Natural Language Search Queries
  runTest('TEST 6: Natural Language Search — "hospital for chest pain", "maternity hospital", "24 hour pharmacy"', () => {
    const allFac = store.getMedicalFacilities();

    // Query 1: chest pain
    const chestResults = searchMedicalFacilities(allFac, { query: 'hospital for chest pain' });
    assert(chestResults.length > 0, 'Must match cardiac emergency hospitals');
    assert(chestResults.some((f) => f.specialties.includes('Cardiology')), 'Results must feature Cardiology specialty');

    // Query 2: maternity
    const maternityResults = searchMedicalFacilities(allFac, { query: 'maternity hospital' });
    assert(maternityResults.length > 0, 'Must match maternity hospitals');
    assert(maternityResults.some((f) => f.specialties.includes('Maternity') || f.specialties.includes('High-Risk Obstetrics')), 'Results must feature Maternity/Obstetrics');

    // Query 3: 24 hour pharmacy
    const pharmacyResults = searchMedicalFacilities(allFac, { query: '24 hour pharmacy' });
    assert(pharmacyResults.length > 0, 'Must match 24-hour pharmacies');
    assert(pharmacyResults.every((f) => f.type === 'Pharmacy'), 'All returned facilities must be Pharmacy type');

    // Query 4: poison help
    const poisonResults = searchMedicalFacilities(allFac, { query: 'poison help' });
    assert(poisonResults.length > 0, 'Must return facilities equipped for toxicology/antivenom');

    // Query 5: ambulance near me
    const ambResults = searchMedicalFacilities(allFac, { query: 'ambulance near me' });
    assert(ambResults.length > 0, 'Must return emergency ambulance providers');
  });

  // 7. Empty, Invalid and Zero Search Results Handling
  runTest('TEST 7: Empty and non-matching searches return safe fallback without fabricating results', () => {
    const allFac = store.getMedicalFacilities();
    const emptyResults = searchMedicalFacilities(allFac, { query: '' });
    assert(emptyResults.length === allFac.length, 'Empty query should return all active verified facilities');

    const gibberishResults = searchMedicalFacilities(allFac, { query: 'xyz123nonexistentfacility999' });
    assert(gibberishResults.length === 0, 'Non-existent query must return empty array without fabricating records');
  });

  // 8. Location-Based Sorting & Distance Calculations
  runTest('TEST 8: Location-based sorting calculates verified distances without random generation', () => {
    const allFac = store.getMedicalFacilities();
    const sorted = searchMedicalFacilities(allFac, { sortBy: 'NEAREST' });
    for (let i = 0; i < sorted.length - 1; i++) {
      assert(sorted[i].distanceKm <= sorted[i + 1].distanceKm, `Distances must be sorted ascending (${sorted[i].distanceKm} <= ${sorted[i + 1].distanceKm})`);
    }
  });

  // 9. Manual Location Fallback
  runTest('TEST 9: Manual location selection fallback when GPS is denied', () => {
    store.setLocation('Mandya, Karnataka');
    assert(store.getUser().location === 'Mandya, Karnataka', 'Manual location must update user store');
    store.setLocation('Mysuru, Karnataka');
    assert(store.getUser().location === 'Mysuru, Karnataka', 'Location can switch back cleanly');
  });

  // 10. CRITICAL AI TEST CASE: Heart / Chest Pain Emergency
  runTest('TEST 10: AI Emergency — "I have severe chest pain and difficulty breathing"', () => {
    const prompt = 'I have severe chest pain and difficulty breathing.';
    const safety = evaluateDeterministicSafety(prompt);
    assert(safety.detected === true, 'High-risk safety must trigger immediately');
    assert(safety.category === 'HEART_CHEST_PAIN', 'Routing category must be HEART_CHEST_PAIN');
    assert(safety.severity === 'HIGH PRIORITY EMERGENCY', 'Urgency must be HIGH PRIORITY EMERGENCY');

    const response = generateAiEmergencyResponse(prompt);
    assert(response.primaryContact.number === '112', 'Primary contact must be CALL 112');
    assert(response.ambulanceContact.number === '108', 'Ambulance contact must be CALL 108');
    assert(!response.assessment.toLowerCase().includes('you have a heart attack'), 'Must NOT diagnose definitely');
    assert(response.assessment.includes('medical emergency'), 'Must use approved safety language');
    assert(response.isDeterministicSafetyTriggered === true, 'Deterministic safety flag must be true');
    assert(response.disclaimer.includes('Do not delay emergency care'), 'Must include non-delay disclaimer');
  });

  // 11. CRITICAL AI TEST CASE: Pregnancy Emergency
  runTest('TEST 11: AI Emergency — "My wife is pregnant and is having heavy bleeding"', () => {
    const prompt = 'My wife is pregnant and is having heavy bleeding.';
    const safety = evaluateDeterministicSafety(prompt);
    assert(safety.detected === true, 'High-risk safety must trigger');
    assert(safety.category === 'PREGNANCY_MATERNITY', 'Category must be PREGNANCY_MATERNITY');

    const response = generateAiEmergencyResponse(prompt);
    assert(response.primaryContact.number === '112', 'Primary contact must be 112');
    assert(response.ambulanceContact.number === '108', 'Ambulance contact must be 108');
    assert(response.specializedContact?.number === '102', 'Must offer 102 JSSK maternity ambulance');
    assert(!response.assessment.toLowerCase().includes('miscarriage definitely'), 'Must NOT claim definitive diagnosis');
  });

  // 12. CRITICAL AI TEST CASE: Stroke Emergency
  runTest('TEST 12: AI Emergency — "My father suddenly cannot speak properly and one side is weak"', () => {
    const prompt = 'My father suddenly cannot speak properly and one side is weak.';
    const safety = evaluateDeterministicSafety(prompt);
    assert(safety.detected === true, 'High-risk safety must trigger');
    assert(safety.category === 'STROKE_NEURO', 'Category must be STROKE_NEURO');

    const response = generateAiEmergencyResponse(prompt);
    assert(response.primaryContact.number === '112', 'Must route to 112');
    assert(response.urgency === 'HIGH PRIORITY EMERGENCY', 'Urgency must be HIGH PRIORITY');
  });

  // 13. CRITICAL AI TEST CASE: Chemical Poisoning
  runTest('TEST 13: AI Emergency — "My child swallowed an unknown chemical"', () => {
    const prompt = 'My child swallowed an unknown chemical.';
    const safety = evaluateDeterministicSafety(prompt);
    assert(safety.detected === true, 'High-risk safety must trigger');
    assert(safety.category === 'POISONING', 'Category must be POISONING');

    const response = generateAiEmergencyResponse(prompt);
    assert(response.primaryContact.number === '112', 'Primary contact must be 112');
    assert(response.specializedContact?.number === '1800-116-117', 'Must provide verified AIIMS National Poisons Information Centre 1800-116-117');
    assert(!response.recommendedAction.toLowerCase().includes('induce vomiting'), 'Must NOT advise self-treatment or inducing vomiting');
  });

  // 14. CRITICAL AI TEST CASE: Non-Emergency Pharmacy Search
  runTest('TEST 14: AI Non-Emergency — "I need a pharmacy near me"', () => {
    const prompt = 'I need a pharmacy near me.';
    const safety = evaluateDeterministicSafety(prompt);
    assert(safety.detected === false, 'Non-emergency query must NOT trigger emergency alarm');
    assert(safety.severity === 'NON-EMERGENCY RESOURCE', 'Must classify as NON-EMERGENCY RESOURCE');

    const response = generateAiEmergencyResponse(prompt);
    assert(response.urgency === 'NON-EMERGENCY RESOURCE', 'Urgency must be non-emergency');
    assert(response.isDeterministicSafetyTriggered === false, 'Deterministic alarm must not trigger');
    assert(response.nearbyFacilities.some((f) => f.type === 'Pharmacy'), 'Must return nearby verified pharmacies');
  });

  // 15. Mental Health Emergency & Tele-MANAS
  runTest('TEST 15: Mental Health Emergency — Tele-MANAS 14416 / 1800-89-14416 integration', () => {
    const prompt = 'I am feeling overwhelmed with suicidal thoughts and need help.';
    const safety = evaluateDeterministicSafety(prompt);
    assert(safety.detected === true, 'Crisis signal must trigger immediately');
    assert(safety.category === 'MENTAL_HEALTH', 'Category must be MENTAL_HEALTH');

    const response = generateAiEmergencyResponse(prompt);
    assert(response.specializedContact?.number === '14416', 'Must route to Tele-MANAS 14416');
    assert(response.primaryContact.number === '112', 'Immediate danger option 112 must be present');
  });

  // 16. Offline Fallback Directory
  runTest('TEST 16: Offline fallback directory retains minimal verified numbers without network', () => {
    const offlineList = OFFLINE_EMERGENCY_DIRECTORY;
    assert(offlineList.length >= 5, 'Offline directory must retain core numbers');
    assert(offlineList.some((e) => e.number === '112'), '112 must be in offline directory');
    assert(offlineList.some((e) => e.number === '108'), '108 must be in offline directory');
    assert(offlineList.some((e) => e.number === '1800-116-117'), 'NPIC 1800-116-117 must be in offline directory');
  });

  // 17. Phone Number Format Validation
  runTest('TEST 17: Indian emergency phone number format validation', () => {
    assert(validateIndianPhoneNumber('112').isValid === true, '112 must be valid');
    assert(validateIndianPhoneNumber('108').isValid === true, '108 must be valid');
    assert(validateIndianPhoneNumber('1800-116-117').isValid === true, '1800-116-117 toll-free must be valid');
    assert(validateIndianPhoneNumber('0821-2520512').isValid === true, 'Landline 0821-2520512 must be valid');
    assert(validateIndianPhoneNumber('9845012345').isValid === true, '10-digit mobile must be valid');
    assert(validateIndianPhoneNumber('+91 98450 12345').isValid === true, '+91 mobile must be valid');
    assert(validateIndianPhoneNumber('invalid-abc-123').isValid === false, 'Gibberish phone number must be rejected');
    assert(validateIndianPhoneNumber('12').isValid === false, 'Too short number must be rejected');
  });

  // 18. Admin Medical Management: Add & Update Helpline
  runTest('TEST 18: Admin adds and updates emergency helpline with audit log generation', () => {
    const initialLogCount = store.getAdminActionLogs().length;
    const initialHelplineCount = store.getAllHelplinesAdmin().length;

    const newH = store.adminAddHelpline(
      {
        service_name: 'Mysuru District Disaster Cell',
        number: '1077',
        category: 'Disaster',
        scope: 'DISTRICT',
        availability: '24x7 During Monsoon',
        description: 'District Deputy Commissioner disaster relief desk',
        source: 'Mysuru District Administration',
        country: 'India',
        state: 'Karnataka',
        city: 'Mysuru',
        verified_at: '2026-09-29',
        verification_status: 'VERIFIED',
        last_checked_by: 'Admin / District Desk'
      },
      'usr-admin',
      'Monsoon flood preparedness deployment',
      'DC Office Circular #402'
    );

    assert(Boolean(newH), 'Admin must be able to create helpline');
    assert(store.getAllHelplinesAdmin().length === initialHelplineCount + 1, 'Helplines count must increment');
    assert(store.getAdminActionLogs().length === initialLogCount + 1, 'Admin action log must be created');

    const auditLog = store.getAdminActionLogs()[0];
    assert(auditLog.targetModule === 'MEDICAL_HELPLINE', 'Audit log targetModule must be MEDICAL_HELPLINE');
    assert(auditLog.actionType === 'CREATE', 'Audit log actionType must be CREATE');

    // Update Helpline
    const updateOk = store.adminUpdateHelpline(
      newH!.id,
      { availability: '24 Hours Year-Round' },
      'usr-admin',
      'Extended service to year-round',
      'Govt order #88'
    );
    assert(updateOk === true, 'Admin update helpline must succeed');
    const updatedRecord = store.getAllHelplinesAdmin().find((h) => h.id === newH!.id);
    assert(updatedRecord?.availability === '24 Hours Year-Round', 'Updated field must persist in store');
  });

  // 19. Admin Medical Management: Delete Helpline
  runTest('TEST 19: Admin deletes emergency helpline with provenance trail', () => {
    const helplines = store.getAllHelplinesAdmin();
    const target = helplines.find((h) => h.number === '1077');
    assert(Boolean(target), 'Target 1077 helpline must exist for deletion');

    const ok = store.adminDeleteHelpline(target!.id, 'usr-admin', 'Test decommission', 'Notice #99');
    assert(ok === true, 'Delete helpline must succeed');
    assert(!store.getAllHelplinesAdmin().some((h) => h.id === target!.id), 'Deleted helpline must disappear from registry');
  });

  // 20. Admin Medical Management: Facility Verification & Edit
  runTest('TEST 20: Admin updates facility verification status and details with audit logging', () => {
    const facilities = store.getAllFacilitiesAdmin();
    const fac = facilities[0];
    const initialStatus = fac.verificationStatus;

    const ok = store.adminUpdateMedicalFacility(
      fac.id,
      { verificationStatus: 'VERIFIED', notes: 'NABH annual inspection re-certified' },
      'usr-admin',
      'NABH recertification cycle',
      'NABH Certificate #2026-901'
    );
    assert(ok === true, 'Facility update must succeed');

    const audit = store.getAdminActionLogs()[0];
    assert(audit.targetModule === 'MEDICAL_FACILITY', 'Audit log targetModule must be MEDICAL_FACILITY');
    assert(audit.targetId === fac.id, 'Audit log targetId must match facility ID');
  });

  // 21. Security Authorization: Non-Admin Direct Edit Rejection
  runTest('TEST 21: Security check — Non-admin unauthorized edits to medical resources are strictly blocked', () => {
    // Attempt exploit as customer
    const exploitResult = store.adminAddHelpline(
      {
        service_name: 'Fake Helpline',
        number: '112',
        category: 'Police',
        scope: 'NATIONAL',
        availability: '24x7',
        description: 'Phishing attack payload',
        source: 'Fake Source',
        country: 'India',
        state: 'Karnataka',
        verified_at: '2026-09-29',
        verification_status: 'VERIFIED',
        last_checked_by: 'Attacker'
      },
      'usr-customer-02' // Not an admin
    );

    assert(exploitResult === null, 'Unauthorized helpline addition must be blocked and return null');

    const exploitFacility = store.adminUpdateMedicalFacility(
      'fac-kr-hosp',
      { phone: '9999999999' },
      'usr-customer-02' // Not an admin
    );
    assert(exploitFacility === false, 'Unauthorized facility edit must be rejected and return false');
  });

  // 22. Ecosystem Regression Safety: FARM, WORK, MOVE, PAYMENTS, BLOCKCHAIN intact
  runTest('TEST 22: Ecosystem Regression Safety — FARM, WORK, MOVE, BLOCKCHAIN remain 100% operational', () => {
    const produce = store.getProduce();
    assert(produce.length >= 3, 'Farm produce must remain intact');

    const equipment = store.getEquipment();
    assert(equipment.length >= 5, 'Farm equipment must remain intact');

    const providers = store.getProviders();
    assert(providers.length >= 5, 'Work service providers must remain intact');

    const vehicles = store.getVehicles();
    assert(vehicles.length >= 3, 'Move transport vehicles must remain intact');

    const bookings = store.getBookings();
    assert(Array.isArray(bookings), 'Bookings list must exist');

    const emergency = store.getEmergencyContacts();
    assert(emergency.length >= 3, 'Backward compatible emergencyContacts must exist');

    const hospitals = store.getNearbyHospitals();
    assert(hospitals.length >= 3, 'Backward compatible nearbyHospitals must exist');
  });

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Auto-run when executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('medicalEmergency.test')) {
  runMedicalEmergencyTestSuite();
}
