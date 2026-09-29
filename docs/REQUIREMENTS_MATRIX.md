# ONESETU — Requirements Traceability Matrix

**Project:** ONESETU (One Platform. Every Local Need.)  
**Module Focus:** FINAL AUTHENTICATION + RESTRICTED ADMIN SYSTEM  
**Status Standard:** `NOT STARTED` | `IN PROGRESS` | `BLOCKED` | `FAILED` | `PASSED`  

---

## 1. Authentication & Restricted Admin Traceability Matrix

| Req ID | Requirement Description | Implementation Location | Verification Evidence | Status |
|---|---|---|---|---|
| **AUTH-01** | Real Email + Password Registration with input validation, password length checks, PBKDF2 cryptographic hashing, and duplicate account rejection. | `src/server/authService.ts`, `src/server/authApiRouter.ts`, `src/components/screens/AuthScreen.tsx` | `authAndAdminSecurity.test.ts` (Test #1, #2) | **PASSED** |
| **AUTH-02** | Real Email + Password Login returning authenticated session with cryptographic HMAC-SHA256 bearer token. | `src/server/authService.ts`, `src/server/authApiRouter.ts`, `src/services/authService.ts` | `authAndAdminSecurity.test.ts` (Test #3) | **PASSED** |
| **AUTH-03** | Server-side PBKDF2 Password Hashing (10,000 iterations, 64-byte key length, SHA-512, unique cryptographic salts). No plaintext passwords stored or returned. | `src/server/authService.ts` | `authAndAdminSecurity.test.ts` (Test #5) | **PASSED** |
| **AUTH-04** | Initial Administrator Credential `admin@123` / `admin@123` configured as real authenticated server account with protected `ADMIN` role. | `src/server/authService.ts`, `src/server/authApiRouter.ts` | `authAndAdminSecurity.test.ts` (Test #6) | **PASSED** |
| **AUTH-05** | Zero Frontend Hardcoding Rule: No `if (email == "admin@123" && password == "admin@123")` or hardcoded bypass in frontend source code. | Entire frontend (`src/App.tsx`, `src/components/*`) | `authAndAdminSecurity.test.ts` (Test #7) | **PASSED** |
| **AUTH-06** | Restricted Admin Login Screen titled "ONESETU ADMIN" with Admin ID, Password, [LOGIN], and [Show Password] toggle. | `src/components/screens/AdminLoginScreen.tsx` | UI verification & test suite | **PASSED** |
| **AUTH-07** | Admin Route Protection (`/admin`): Unauthenticated users are redirected to `/admin/login`. | `src/App.tsx` | `authAndAdminSecurity.test.ts` (Test #8) | **PASSED** |
| **AUTH-08** | Non-Admin Access Rejection: Authenticated normal users attempting to access `/admin` receive strict Access Denied screen. | `src/App.tsx`, `src/components/screens/AccessDeniedScreen.tsx` | `authAndAdminSecurity.test.ts` (Test #9) | **PASSED** |
| **AUTH-09** | Server API Authorization (403 Forbidden): Direct API calls to administrative endpoints without valid admin bearer token are rejected. | `src/server/authApiRouter.ts` | `authAndAdminSecurity.test.ts` (Test #10) | **PASSED** |
| **AUTH-10** | Client-Side Tampering Immunity: Modifying `localStorage` or store role does not grant administrative privileges. | `src/services/authService.ts`, `src/server/authService.ts` | `authAndAdminSecurity.test.ts` (Test #11) | **PASSED** |
| **AUTH-11** | Privilege Escalation Prevention: Normal users cannot register or self-assign the `ADMIN` role. | `src/server/authService.ts`, `src/components/screens/RoleSelectionScreen.tsx` | `authAndAdminSecurity.test.ts` (Test #12) | **PASSED** |
| **AUTH-12** | Session Persistence: Authenticated sessions persist across page refreshes and validate against the server registry. | `src/services/authService.ts`, `src/server/authService.ts` | `authAndAdminSecurity.test.ts` (Test #13) | **PASSED** |
| **AUTH-13** | Secure Server Logout: Logout revokes the session token on the server registry; revoked tokens are immediately rejected. | `src/server/authService.ts`, `src/server/authApiRouter.ts` | `authAndAdminSecurity.test.ts` (Test #14) | **PASSED** |
| **AUTH-14** | Account Disabling Governance: Admin can disable accounts; disabled accounts are blocked from login and subsequent API calls. | `src/server/authService.ts`, `src/server/authApiRouter.ts` | `authAndAdminSecurity.test.ts` (Test #15) | **PASSED** |
| **AUTH-15** | Single-Use Password Reset: Forgot password generates a time-limited token that expires immediately upon use. | `src/server/authService.ts`, `src/server/authApiRouter.ts` | `authAndAdminSecurity.test.ts` (Test #16) | **PASSED** |
| **AUTH-16** | Admin User Oversight Panel: Admin can view all registered users with User ID, Name, Email, Phone, Role, and Status, and toggle status. | `src/components/screens/AdminScreen.tsx`, `src/server/authApiRouter.ts` | `authAndAdminSecurity.test.ts` (Test #17) | **PASSED** |
| **AUTH-17** | Google Login Real OAuth Flow / Inspection: No fake Google sign-in. If cloud credentials are missing, display exact setup requirements. | `src/services/authService.ts`, `src/components/screens/AuthScreen.tsx` | `authAndAdminSecurity.test.ts` (Test #18) | **BLOCKED** |
| **AUTH-18** | Phone Number Login + Real OTP Flow / Inspection: No fake OTP (e.g. 123456). If SMS service is missing, display exact setup requirements. | `src/services/authService.ts`, `src/components/screens/AuthScreen.tsx` | `authAndAdminSecurity.test.ts` (Test #18) | **BLOCKED** |
| **AUTH-19** | Firebase Cloud Authentication Suite: Full cloud backend authentication integration. | Real Firebase Cloud project integration | Explicit cloud inspection check | **BLOCKED** |
| **AUTH-20** | Full Farm Administrative Control: Admin can create, edit, delete, and manage photos for Farm equipment with real database persistence. | `src/services/store.ts`, `src/components/screens/AdminScreen.tsx` | `authAndAdminSecurity.test.ts` (Test #19) | **PASSED** |
| **AUTH-21** | Ecosystem Regression Safety: FARM, WORK, MEDICAL, MOVE, PAYMENTS, and BLOCKCHAIN remain fully operational. | Entire codebase | `npm test` (135/135 tests passed) | **PASSED** |

---

## 2. Requirements Status Summary

- **Total Requirements Tracked:** 21
- **PASSED:** 18 (85.7%)
- **BLOCKED (External Cloud Credentials Required):** 3 (14.3%)
  - Google OAuth Sign-In (`AUTH-17`): `BLOCKED — GOOGLE AUTH CONFIGURATION REQUIRED`
  - Phone SMS OTP Authentication (`AUTH-18`): `BLOCKED — PHONE AUTH CONFIGURATION REQUIRED`
  - Firebase Cloud Authentication (`AUTH-19`): `BLOCKED — FIREBASE CONFIGURATION REQUIRED`
- **IN PROGRESS:** 0
- **FAILED:** 0
- **NOT STARTED:** 0
