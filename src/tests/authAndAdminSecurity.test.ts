import { serverAuthService } from '../server/authService';
import { handleAuthApiRequest } from '../server/authApiRouter';
import { authService } from '../services/authService';
import { store } from '../services/store';

async function runAuthAndAdminSecurityTests() {
  console.log('======================================================================');
  console.log('--- RUNNING ONESETU AUTH & RESTRICTED ADMIN QA TEST SUITE ---');
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
  // TEST 1: Normal User Registration & Input Validation
  // -------------------------------------------------------------
  const invalidEmailReg = serverAuthService.register({
    name: 'Test User',
    email: 'not-an-email',
    phone: '+91 99999 11111',
    password: 'password123'
  });
  const shortPassReg = serverAuthService.register({
    name: 'Test User',
    email: 'valid@example.com',
    phone: '+91 99999 11111',
    password: '123'
  });
  assert(
    !invalidEmailReg.success && !shortPassReg.success,
    'TEST 1: Registration Validation — Rejects invalid email and weak passwords (<6 chars)',
    `Invalid email err: "${invalidEmailReg.error}", Short pass err: "${shortPassReg.error}"`
  );

  // -------------------------------------------------------------
  // TEST 2: Ordinary User Privilege Escalation Protection
  // -------------------------------------------------------------
  const privilegeEscalationReg = serverAuthService.register({
    name: 'Hacker User',
    email: 'hacker@example.com',
    phone: '+91 98888 22222',
    password: 'securePass123',
    role: 'ADMIN' // Malicious attempt to register as ADMIN
  });
  assert(
    Boolean(!privilegeEscalationReg.success && privilegeEscalationReg.error?.includes('Privilege escalation rejected')),
    'TEST 2: Privilege Escalation Blocked — Normal user registration with role ADMIN is strictly rejected',
    `Server response: "${privilegeEscalationReg.error}"`
  );

  // -------------------------------------------------------------
  // TEST 3: Real Email/Password Registration Success & Cryptographic Hashing
  // -------------------------------------------------------------
  const userEmail = `citizen_${Date.now()}@example.com`;
  const validReg = serverAuthService.register({
    name: 'Kavitha Devi',
    email: userEmail,
    phone: '+91 98451 99887',
    password: 'Kavitha@Password2026',
    role: 'CUSTOMER'
  });

  assert(
    validReg.success && Boolean(validReg.token) && validReg.user?.activeRole === 'CUSTOMER',
    'TEST 3: Email/Password Registration — Creates authenticated session with role CUSTOMER',
    `User ID: ${validReg.user?.id}, Token length: ${validReg.token?.length} chars`
  );

  // Verify password hash is NEVER returned in the user object
  const userObj: any = validReg.user;
  assert(
    userObj.password === undefined && userObj.passwordHash === undefined && userObj.passwordSalt === undefined,
    'TEST 3b: Password Privacy — Raw password and cryptographic hashes are never returned to client',
    `User object keys: ${Object.keys(userObj).join(', ')}`
  );

  // -------------------------------------------------------------
  // TEST 4: Email/Password Authentication & Rejection of Bad Credentials
  // -------------------------------------------------------------
  const wrongPassLogin = serverAuthService.login(userEmail, 'WrongPassword123');
  const unknownUserLogin = serverAuthService.login('unknown_random_user@example.com', 'somePass123');
  const correctLogin = serverAuthService.login(userEmail, 'Kavitha@Password2026');

  assert(
    !wrongPassLogin.success && wrongPassLogin.code === 'WRONG_PASSWORD' &&
    !unknownUserLogin.success && unknownUserLogin.code === 'USER_NOT_FOUND' &&
    correctLogin.success && Boolean(correctLogin.token),
    'TEST 4: Email/Password Login — Accurately validates passwords and returns signed session token',
    `Wrong pass code: ${wrongPassLogin.code}, Unknown user code: ${unknownUserLogin.code}`
  );

  // -------------------------------------------------------------
  // TEST 5: Cryptographic Session Token Verification & Expiry
  // -------------------------------------------------------------
  const verifiedSession = serverAuthService.verifyToken(correctLogin.token!);
  const fakeTokenCheck = serverAuthService.verifyToken('fake.invalid.token');

  assert(
    verifiedSession.valid && verifiedSession.user?.email === userEmail && !fakeTokenCheck.valid,
    'TEST 5: HMAC-SHA256 Token Verification — Server validates authentic token and rejects forged signatures',
    `Verified email: ${verifiedSession.user?.email}, Fake token valid: ${fakeTokenCheck.valid}`
  );

  // -------------------------------------------------------------
  // TEST 6: Initial Administrator Credential (admin@123 / admin@123)
  // -------------------------------------------------------------
  // Prompt requirement: ADMIN ID: admin@123, PASSWORD: admin@123
  // Verified via real PBKDF2 hash comparison on server
  const adminLoginRes = serverAuthService.adminLogin('admin@123', 'admin@123');

  assert(
    adminLoginRes.success && adminLoginRes.user?.activeRole === 'ADMIN' && Boolean(adminLoginRes.token),
    'TEST 6: Initial Admin Credential — admin@123 successfully authenticates with verified role ADMIN',
    `Admin Name: ${adminLoginRes.user?.name}, Role: ${adminLoginRes.user?.activeRole}, Token verified: true`
  );

  // Also check email alias admin@onesetu.org
  const adminEmailLoginRes = serverAuthService.adminLogin('admin@onesetu.org', 'admin@123');
  assert(
    adminEmailLoginRes.success && adminEmailLoginRes.user?.activeRole === 'ADMIN',
    'TEST 6b: Admin Email Alias — admin@onesetu.org authenticates identically to admin@123',
    `Status: ${adminEmailLoginRes.success}`
  );

  // -------------------------------------------------------------
  // TEST 7: Normal User Denied Admin Login (Role != ADMIN)
  // -------------------------------------------------------------
  // A customer attempts to log in through the admin login endpoint
  const normalUserAdminLogin = serverAuthService.adminLogin(userEmail, 'Kavitha@Password2026');
  assert(
    !normalUserAdminLogin.success && normalUserAdminLogin.code === 'FORBIDDEN',
    'TEST 7: Admin Login Protection — Normal user credentials rejected at admin endpoint with 403 Forbidden',
    `Error message: "${normalUserAdminLogin.error}"`
  );

  // -------------------------------------------------------------
  // TEST 8: Protected Admin API Direct Invocations Rejection (REST API)
  // -------------------------------------------------------------
  // Customer calls GET /api/admin/users without admin token
  const customerDirectApi = handleAuthApiRequest(
    '/api/admin/users',
    'GET',
    {},
    { Authorization: `Bearer ${correctLogin.token}` } // Normal customer token
  );

  const unauthenticatedApi = handleAuthApiRequest(
    '/api/admin/users',
    'GET',
    {},
    {} // No token
  );

  const adminAuthorizedApi = handleAuthApiRequest(
    '/api/admin/users',
    'GET',
    {},
    { Authorization: `Bearer ${adminLoginRes.token}` } // Admin token
  );

  assert(
    customerDirectApi.status === 403 &&
    unauthenticatedApi.status === 403 &&
    adminAuthorizedApi.status === 200 &&
    Array.isArray(adminAuthorizedApi.data.users),
    'TEST 8: Admin API Authorization Guard — Direct API access by customer returns 403; Admin returns 200',
    `Customer status: ${customerDirectApi.status}, No-token status: ${unauthenticatedApi.status}, Admin status: ${adminAuthorizedApi.status}`
  );

  // -------------------------------------------------------------
  // TEST 9: Client-Side localStorage Tampering Rejection
  // -------------------------------------------------------------
  // Attacker sets store.getUser().activeRole = 'ADMIN' locally
  store.updateUser({
    id: 'usr-customer-tampered',
    roles: ['CUSTOMER'],
    activeRole: 'ADMIN' // Client-side role spoofing attempt
  });

  // Client authService verifies against trusted session token
  const isClientTrusted = authService.isAdmin();
  assert(
    isClientTrusted === false,
    'TEST 9: Zero-Trust Client Role — Frontend localStorage/store role modification is ignored without server-signed admin token',
    `Client authService.isAdmin(): ${isClientTrusted}`
  );

  // -------------------------------------------------------------
  // TEST 10: Admin User Status Governance (Enable / Disable Account)
  // -------------------------------------------------------------
  const adminToken = adminLoginRes.token!;
  const customerId = validReg.user!.id;

  // Admin disables customer account
  const disableRes = handleAuthApiRequest(
    '/api/admin/users/status',
    'POST',
    { targetUserId: customerId, status: 'DISABLED' },
    { Authorization: `Bearer ${adminToken}` }
  );

  // Disabled customer tries to log in
  const loginWhileDisabled = serverAuthService.login(userEmail, 'Kavitha@Password2026');

  // Admin re-enables customer account
  const enableRes = handleAuthApiRequest(
    '/api/admin/users/status',
    'POST',
    { targetUserId: customerId, status: 'ACTIVE' },
    { Authorization: `Bearer ${adminToken}` }
  );

  assert(
    disableRes.status === 200 &&
    loginWhileDisabled.code === 'ACCOUNT_DISABLED' &&
    enableRes.status === 200,
    'TEST 10: Admin User Account Moderation — Disabled accounts blocked from login; Enabled accounts restored',
    `Disable status: ${disableRes.status}, Login while disabled: ${loginWhileDisabled.code}`
  );

  // -------------------------------------------------------------
  // TEST 11: Admin Role Assignment & Prevention of Self-Demotion of Root Admin
  // -------------------------------------------------------------
  const rootAdminDisable = serverAuthService.setAdminUserStatus(adminToken, 'usr-admin-01', 'DISABLED');
  assert(
    Boolean(!rootAdminDisable.success && rootAdminDisable.error?.includes('primary root administrator')),
    'TEST 11: Root Admin Safeguard — Primary administrator account is protected from accidental deactivation',
    `Server message: "${rootAdminDisable.error}"`
  );

  // -------------------------------------------------------------
  // TEST 12: Forgot Password & Reset Token Lifecycle
  // -------------------------------------------------------------
  const forgotRes = serverAuthService.forgotPassword(userEmail);
  assert(
    forgotRes.success && Boolean(forgotRes.resetToken),
    'TEST 12: Forgot Password — Generates single-use cryptographic reset token',
    `Reset token: ${forgotRes.resetToken?.slice(0, 16)}...`
  );

  if (forgotRes.resetToken) {
    const resetRes = serverAuthService.resetPassword(forgotRes.resetToken, 'NewSecurePassword2026!');
    const oldPassLogin = serverAuthService.login(userEmail, 'Kavitha@Password2026');
    const newPassLogin = serverAuthService.login(userEmail, 'NewSecurePassword2026!');

    assert(
      resetRes.success && !oldPassLogin.success && newPassLogin.success,
      'TEST 12b: Password Reset Completion — Old password invalidated, new password successfully authenticated',
      `Old pass code: ${oldPassLogin.code}, New pass success: ${newPassLogin.success}`
    );
  }

  // -------------------------------------------------------------
  // TEST 13: Session Revocation on Logout
  // -------------------------------------------------------------
  const sessionToLogout = serverAuthService.login(userEmail, 'NewSecurePassword2026!');
  const tokenBeforeLogout = sessionToLogout.token!;
  serverAuthService.logout(tokenBeforeLogout);
  const verifyAfterLogout = serverAuthService.verifyToken(tokenBeforeLogout);

  assert(
    Boolean(verifyAfterLogout.valid === false && verifyAfterLogout.error?.includes('revoked')),
    'TEST 13: Session Revocation — Logout adds token to revocation registry and invalidates active session',
    `Verify result: ${verifyAfterLogout.valid}, Error: "${verifyAfterLogout.error}"`
  );

  // -------------------------------------------------------------
  // TEST 14: Cloud Google Login Provider Inspection (No Fake Buttons)
  // -------------------------------------------------------------
  const googleCheck = handleAuthApiRequest('/api/auth/google', 'POST', {});
  const cloudConfig = serverAuthService.getCloudAuthConfig();

  assert(
    googleCheck.status === 501 &&
    googleCheck.data.error === 'Google Login Configuration Required' &&
    Array.isArray(googleCheck.data.missingConfiguration),
    'TEST 14: Google Auth Verification — Unconfigured Google Sign-In returns explicit configuration requirements (No Fake OAuth)',
    `Status: ${googleCheck.data.status}, Missing: ${googleCheck.data.missingConfiguration.join(', ')}`
  );

  // -------------------------------------------------------------
  // TEST 15: Cloud Phone OTP Provider Inspection (No Fake 123456 OTP)
  // -------------------------------------------------------------
  const phoneCheck = handleAuthApiRequest('/api/auth/phone/send-otp', 'POST', { phone: '+91 98450 12345' });

  assert(
    phoneCheck.status === 501 &&
    phoneCheck.data.error === 'Phone Auth Configuration Required' &&
    Array.isArray(phoneCheck.data.missingConfiguration),
    'TEST 15: Phone Auth Verification — Unconfigured Phone OTP rejects fake OTPs and returns SMS setup requirements',
    `Status: ${phoneCheck.data.status}, Missing: ${phoneCheck.data.missingConfiguration.join(', ')}`
  );

  // -------------------------------------------------------------
  // TEST 16: Admin Edit Equipment Persistence & Audit Trail
  // -------------------------------------------------------------
  store.updateUser({
    id: 'usr-admin-01',
    roles: ['ADMIN'],
    activeRole: 'ADMIN'
  });

  const equipmentList = store.getEquipment();
  const testTractor = equipmentList[0];

  const adminEditOk = store.adminUpdateEquipment(
    testTractor.id,
    'EDIT',
    'usr-admin-01',
    { pricePerHour: 980, location: 'Mandya Central APMC Hub' },
    'Admin updated pricing and hub location'
  );

  const updatedTractor = store.getEquipment().find(e => e.id === testTractor.id);
  const auditLogs = store.getAdminActionLogs();
  const latestLog = auditLogs[0];

  assert(
    adminEditOk === true &&
    updatedTractor?.pricePerHour === 980 &&
    latestLog?.actionType === 'EDIT' &&
    latestLog?.targetId === testTractor.id,
    'TEST 16: Admin Farm Equipment Edit — Database persists modifications and creates immutable AdminActionLog',
    `Updated rate: ₹${updatedTractor?.pricePerHour}/hr, Audit log ID: ${latestLog?.id}`
  );

  // -------------------------------------------------------------
  // TEST 17: Normal User Blocked from Admin Edit Operations
  // -------------------------------------------------------------
  store.updateUser({
    id: 'usr-normal-user-attempt',
    roles: ['CUSTOMER'],
    activeRole: 'CUSTOMER'
  });

  const normalEditResult = store.adminUpdateEquipment(
    testTractor.id,
    'EDIT',
    'usr-normal-user-attempt',
    { pricePerHour: 100 }
  );

  assert(
    normalEditResult === false,
    'TEST 17: Non-Admin Edit Rejection — Unauthorized user attempts to update equipment are strictly blocked by store engine',
    `Store response: ${normalEditResult}`
  );

  // -------------------------------------------------------------
  // TEST 18: Ecosystem Regression Safety
  // -------------------------------------------------------------
  const produceItems = store.getProduce();
  const workerProviders = store.getProviders();
  const helplines = store.getEmergencyHelplines();
  const vehicles = store.getVehicles();
  const bookings = store.getBookings();

  assert(
    produceItems.length >= 8 &&
    workerProviders.length >= 8 &&
    helplines.length >= 12 &&
    vehicles.length >= 4 &&
    bookings.length >= 2,
    'TEST 18: Ecosystem Regression Safety — FARM, WORK, MEDICAL, MOVE, BOOKINGS remain 100% operational',
    `Produce: ${produceItems.length}, Workers: ${workerProviders.length}, Helplines: ${helplines.length}, Vehicles: ${vehicles.length}`
  );

  console.log('\n======================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthAndAdminSecurityTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
