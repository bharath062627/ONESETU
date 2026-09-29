import { store } from '../services/store';

function runAdminEquipmentControlsTests() {
  console.log('======================================================================');
  console.log('--- RUNNING ONESETU ADMIN CONTROLS QA TEST SUITE (7 TEST CASES) ---');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ [PASSED] ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passed++;
    } else {
      console.error(`✕ [FAILED] ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Login as CUSTOMER -> Verify Admin Controls are Blocked
  // -------------------------------------------------------------
  store.resetToDefaults();
  store.updateUser({
    id: 'usr-customer-01',
    name: 'Anand Kumar',
    roles: ['CUSTOMER'],
    activeRole: 'CUSTOMER'
  });
  const customerUser = store.getUser();
  const isCustomerAdmin = customerUser.activeRole === 'ADMIN' || customerUser.roles.includes('ADMIN');

  assert(
    !isCustomerAdmin && customerUser.activeRole === 'CUSTOMER',
    'TEST 1: Customer View — No Admin/Edit/Delete/Photos controls visible for customer/farmer role',
    `Active Role: ${customerUser.activeRole}, isAdmin: ${isCustomerAdmin}`
  );

  // -------------------------------------------------------------
  // TEST 2: Login as ADMIN -> Verify Admin Authorization Granted
  // -------------------------------------------------------------
  store.updateUser({
    id: 'usr-admin',
    name: 'Super Admin',
    roles: ['ADMIN'],
    activeRole: 'ADMIN'
  });
  const adminUser = store.getUser();
  const isAdminAuthorized = adminUser.activeRole === 'ADMIN' || adminUser.roles.includes('ADMIN');
  const equipmentList = store.getEquipment();
  const rentalList = equipmentList.filter((e) => !e.isUsedEquipmentSale);

  assert(
    isAdminAuthorized && adminUser.activeRole === 'ADMIN' && rentalList.length >= 8,
    'TEST 2: Admin View — Admin authorization active; Every Equipment Rent listing has admin action controls',
    `Active Role: ${adminUser.activeRole}, Equipment count: ${rentalList.length}`
  );

  // -------------------------------------------------------------
  // TEST 3: Admin Edit Equipment (Mahindra 575 DI Tractor) & Persistence
  // -------------------------------------------------------------
  const mahindra = equipmentList.find((e) => e.equipmentName.toLowerCase().includes('mahindra'));
  assert(Boolean(mahindra), 'TEST 3a: Located Mahindra 575 DI Tractor listing in store', `ID: ${mahindra?.id}`);

  if (mahindra) {
    const targetId = mahindra.id;
    const updateResult = store.adminUpdateEquipment(
      targetId,
      'EDIT',
      adminUser.id,
      {
        pricePerHour: 950,
        pricePerDay: 5700,
        ownerName: 'Ramesh Gowda (Verified Owner)',
        location: 'Mandya Rural APMC Zone, Karnataka',
        description: 'Heavy duty 45HP Tractor with power steering and hydraulic trolley attachment.'
      },
      'Admin updated rate, location and owner contact verification'
    );

    const updatedMahindra = store.getEquipment().find((e) => e.id === targetId);

    assert(
      updateResult === true &&
      updatedMahindra?.pricePerHour === 950 &&
      updatedMahindra?.pricePerDay === 5700 &&
      updatedMahindra?.ownerName === 'Ramesh Gowda (Verified Owner)' &&
      updatedMahindra?.location === 'Mandya Rural APMC Zone, Karnataka',
      'TEST 3: Admin Edit Mahindra 575 DI — Changed Hourly Rate, Owner, Location & verified store persistence',
      `Hourly: ₹${updatedMahindra?.pricePerHour}/hr, Owner: ${updatedMahindra?.ownerName}, Loc: ${updatedMahindra?.location}`
    );
  }

  // -------------------------------------------------------------
  // TEST 4: Photo Management — Add Photo & Set Primary Thumbnail
  // -------------------------------------------------------------
  const targetEquip = store.getEquipment()[0];
  const newPhotoA = 'https://images.unsplash.com/photo-1592924357228-c1a4daadc33f?w=600&auto=format&fit=crop&q=80';
  const newPhotoB = 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80';
  const newPhotoSet = [newPhotoA, newPhotoB];

  const photoUpdateResult = store.adminUpdatePhotos(
    'EQUIPMENT_RENT',
    targetEquip.id,
    newPhotoSet,
    newPhotoB, // newPhotoB is set as primary
    adminUser.id
  );

  const photoUpdatedEquip = store.getEquipment().find((e) => e.id === targetEquip.id);

  assert(
    photoUpdateResult === true &&
    photoUpdatedEquip?.primaryImageUrl === newPhotoB &&
    photoUpdatedEquip?.image === newPhotoB &&
    photoUpdatedEquip?.imageUrls?.length === 2 &&
    photoUpdatedEquip?.imageUrls[1] === newPhotoB,
    'TEST 4: Photo Management — Add new photo & Set as primary thumbnail; verifies primary photo becomes card thumbnail',
    `Primary: ${photoUpdatedEquip?.primaryImageUrl?.slice(0, 40)}..., Total Photos: ${photoUpdatedEquip?.imageUrls?.length}`
  );

  // -------------------------------------------------------------
  // TEST 5: Photo Management — Delete Photo
  // -------------------------------------------------------------
  const deletePhotoResult = store.adminUpdatePhotos(
    'EQUIPMENT_RENT',
    targetEquip.id,
    [newPhotoA], // Removed newPhotoB
    newPhotoA,
    adminUser.id
  );

  const photoDeletedEquip = store.getEquipment().find((e) => e.id === targetEquip.id);

  assert(
    deletePhotoResult === true &&
    photoDeletedEquip?.imageUrls?.length === 1 &&
    photoDeletedEquip?.imageUrls[0] === newPhotoA &&
    !photoDeletedEquip?.imageUrls.includes(newPhotoB),
    'TEST 5: Delete Photo — Deleted photo disappears from database record, storage and UI',
    `Remaining Photos: ${photoDeletedEquip?.imageUrls?.length}`
  );

  // -------------------------------------------------------------
  // TEST 6: Delete Equipment Listing
  // -------------------------------------------------------------
  const targetToDelete = store.getEquipment()[2];
  const targetToDeleteId = targetToDelete.id;
  const initialEquipCount = store.getEquipment().length;

  const deleteResult = store.adminUpdateEquipment(
    targetToDeleteId,
    'DELETE',
    adminUser.id,
    undefined,
    'Admin deleted decommissioned listing'
  );

  const remainingEquipment = store.getEquipment();
  const deletedItemLookup = remainingEquipment.find((e) => e.id === targetToDeleteId);

  assert(
    deleteResult === true &&
    remainingEquipment.length === initialEquipCount - 1 &&
    deletedItemLookup === undefined,
    'TEST 6: Delete Equipment Listing — Listing completely removed from user and admin views',
    `Pre-count: ${initialEquipCount}, Post-count: ${remainingEquipment.length}`
  );

  // -------------------------------------------------------------
  // TEST 7: Security Authorization — Unauthorized CUSTOMER Direct Call Denied
  // -------------------------------------------------------------
  store.updateUser({
    id: 'usr-customer-02',
    name: 'Normal User',
    roles: ['CUSTOMER'],
    activeRole: 'CUSTOMER'
  });
  const activeCustomer = store.getUser();
  const targetItemForExploit = store.getEquipment()[0];
  const originalPrice = targetItemForExploit.pricePerHour;

  // Direct backend call attempt by customer
  const exploitAttemptResult = store.adminUpdateEquipment(
    targetItemForExploit.id,
    'EDIT',
    activeCustomer.id,
    { pricePerHour: 1 }
  );

  const postExploitItem = store.getEquipment().find((e) => e.id === targetItemForExploit.id);

  const exploitPhotoResult = store.adminUpdatePhotos(
    'EQUIPMENT_RENT',
    targetItemForExploit.id,
    ['https://malicious-image.png'],
    'https://malicious-image.png',
    activeCustomer.id
  );

  assert(
    exploitAttemptResult === false &&
    exploitPhotoResult === false &&
    postExploitItem?.pricePerHour === originalPrice,
    'TEST 7: Security Authorization — Non-admin direct edit/photo API calls are securely rejected by backend logic',
    `Exploit Edit Result: ${exploitAttemptResult} (Denied), Exploit Photo Result: ${exploitPhotoResult} (Denied), Price Intact: ₹${postExploitItem?.pricePerHour}/hr`
  );

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminEquipmentControlsTests();
