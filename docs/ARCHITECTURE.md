# ONESETU — System Architecture & Technical Design

**Project Tagline:** One Platform. Every Local Need.  
**Architecture Paradigm:** Modular Local Needs Platform with Verified Provenance & Trust Anchoring  
**Version:** 2.0 (Hardened Production Release)  

---

## 1. High-Level Architecture Overview

ONESETU is engineered around a single unified multi-module architecture serving four core local domains (FARM, WORK, MEDICAL, MOVE) underpinned by shared cryptographic trust, data provenance, and unified booking engines:

```
+-------------------------------------------------------------------------------+
|                               ONESETU HUB UI                                  |
|  +--------------------+ +--------------------+ +------------+ +------------+  |
|  |     1. FARM        | |     2. WORK        | | 3. MEDICAL | |  4. MOVE   |  |
|  | (Market Rate, Sale | |  (8+ Trades,       | | (24x7 SOS, | | (10+ Cargo |  |
|  | Point, Rent, Used) | |  Booking Engine)   | | Hospitals) | |  Vehicles) |  |
|  +--------------------+ +--------------------+ +------------+ +------------+  |
+-------------------------------------------------------------------------------+
|                              CORE ENGINE LAYER                                |
|  +-----------------------------+  +----------------------------------------+  |
|  | Market Data & AI Engine     |  | Unified Booking & State Machine        |  |
|  | - Official OGD/AGMARKNET    |  | - Double Booking Detection             |  |
|  | - Provenance Verification   |  | - Decoupled Payment Flow               |  |
|  | - Factual AI Intelligence   |  | - Customer Confirmation & Ratings      |  |
|  +-----------------------------+  +----------------------------------------+  |
+-------------------------------------------------------------------------------+
|                         STORAGE, AUDIT & TRUST LAYER                          |
|  +-----------------------+ +------------------------+ +--------------------+  |
|  | AppStore State Engine | | Audit Logs & Governance| | Blockchain Ledger  |  |
|  | - Multi-role Profile  | | - MarketDataAudit      | | - SHA-256 Hashes   |  |
|  | - Persistent Storage  | | - AdminActionLog       | | - Explorer Proofs  |  |
|  +-----------------------+ +------------------------+ +--------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 2. AUTHENTICATION & RESTRICTED ADMIN SYSTEM

ONESETU implements a zero-trust authentication and authorization architecture with real server-side cryptographic credentials, strict role governance, and restricted administrative login:

```
+-------------------------------------------------------------------------------+
|                       AUTHENTICATION INTERFACES                               |
|  +--------------------------------+  +-------------------------------------+  |
|  | Normal User Auth Screen        |  | Restricted Admin Screen (/admin)    |  |
|  | - Email + Password (PBKDF2)    |  | - Title: "ONESETU ADMIN"            |  |
|  | - Registration (Role Guard)    |  | - Admin ID & Password               |  |
|  | - Single-Use Password Reset    |  | - Server-Side Hash Verification     |  |
|  | - Google OAuth (Cloud Check)   |  | - Strict Role == ADMIN Gate         |  |
|  | - Phone OTP (SMS Gate Check)   |  | - Access Denied for Normal Users    |  |
|  +--------------------------------+  +-------------------------------------+  |
+-------------------------------------------------------------------------------+
|                      BACKEND AUTHENTICATION & REST API                        |
|  +--------------------------------+  +-------------------------------------+  |
|  | ServerAuthService              |  | AuthApiRouter (/api/auth & /admin)  |  |
|  | - PBKDF2 (10,000 Rounds + Salt)|  | - POST /api/auth/register           |  |
|  | - HMAC-SHA256 Bearer Tokens    |  | - POST /api/auth/login              |  |
|  | - Protected 'ADMIN' Role Store |  | - POST /api/auth/admin-login        |  |
|  | - Session Revocation Registry  |  | - GET  /api/auth/session            |  |
|  | - Account Enable/Disable State |  | - GET  /api/admin/users (403 Guard) |  |
|  +--------------------------------+  +-------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### Core Architecture Principles:
1. **Server-Side Cryptographic Security:**
   - User passwords are never stored in plaintext. Passwords are salted with 16 bytes of cryptographically random salt and hashed using PBKDF2 with 10,000 iterations of SHA-512.
   - Plaintext passwords and cryptographic salts/hashes are never exposed or returned in client payloads.
2. **Initial Administrator Provisioning:**
   - Administrator identity is configured as a real authenticated account on the server (`admin@123` with standard alias `admin@onesetu.org`).
   - The credential `admin@123` is never hardcoded into frontend UI source code. Authentication is strictly executed through backend hash comparison.
3. **Restricted Admin Login & Route Guard:**
   - Dedicated restricted login screen at `/admin/login` ("ONESETU ADMIN").
   - Normal users who navigate to `/admin` or attempt direct API calls receive `403 Access Denied: Administrator privileges required`.
   - Client-side `localStorage` or store `activeRole` manipulation is completely disregarded by backend authorization gates without a server-signed bearer token with trusted role `ADMIN`.
4. **Privilege Escalation Defense:**
   - Public registration endpoints strictly forbid self-assignment of the protected `ADMIN` role.
   - User account status governance (enable/disable) and role assignments can only be executed by an authenticated administrator with a valid server session.
   - Root administrator account (`usr-admin-01`) is safeguarded against accidental self-deactivation.
5. **Cloud Provider Inspection Protocol:**
   - Federated Google OAuth and Phone SMS authentication proactively inspect cloud credentials (`GOOGLE_CLIENT_ID`, `SMS_GATEWAY_API_KEY`, `VITE_FIREBASE_API_KEY`).
   - If unconfigured, the system explicitly reports `BLOCKED — CONFIGURATION REQUIRED` and displays required cloud setup steps. Mock Google OAuth or fake OTPs (e.g. 123456) are strictly prohibited in production.

---

## 3. FARM Module Design

The FARM module contains exactly four primary sections:

1. **MARKET RATE (Hero Mandi Intelligence):**
   - **Data Ingestion:** Ingests official Open Government Data (OGD) / AGMARKNET records.
   - **Zero Fabrication Principle:** Current prices are never simulated or generated via random functions. If data is unavailable, the UI renders a graceful "Market data temporarily unavailable" notice.
   - **Labeling:** Strictly displays "Latest Available Mandi Rate" or "Daily Market Rate" for daily feeds. Intraday "Real-Time Live Price" is prohibited unless connected to a verified intraday feed.
   - **Multi-Market Comparison:** Compares up to 10 valid mandis (Mysuru, Mandya, Bengaluru Urban, Hassan, Kolar, Tumakuru, etc.) with explicit Highest and Lowest reported modal price indicators.
   - **Data Provenance:** Displays commodity, variety, market, district, state, modal/min/max prices, data date, fetched timestamp, source name, and `[VIEW SOURCE]` modal with full transparency.
   - **AI Market Intelligence:** Analysis layer only (spread calculation, anomaly detection). Projections are strictly labeled `"AI Forecast — Estimate Only"` and never overwrite official source values.
   - **Operator Role:** Controlled Market Data Operator / Admin role allows verified price corrections with immutable audit trails (`MarketDataAudit`).

2. **SALE POINT (Direct Farmer Produce):**
   - Direct marketplace allowing farmers to list produce directly to buyers with 0% middleman fees.
   - `+ ADD PRODUCE FOR SALE` FAB opens `CreateFarmerSalesProductModal`.
   - Supports camera and gallery inputs, up to 5 photos, primary photo selection, and deterministic resolution (`FarmerProductImageResolver`).
   - Seller ownership check for editing/deleting.

3. **EQUIPMENT RENT (Machinery Rental):**
   - 10+ real machinery records (Tractors, Tillers, Sprayers, Harvesters, Rotavators, Cultivators, Seeders, Ploughs).
   - Mandatory hourly rental rate + daily rate.
   - Full booking integration with `BookServiceModal`.
   - Real machinery photos (`EquipmentImageResolver`).

4. **USED EQUIPMENT (Pre-Owned Machinery):**
   - Direct purchase marketplace for second-hand agricultural machinery.
   - Displays asking price, condition, year of make, and seller contact without fake discount percentages.

---

## 4. MEDICAL & EMERGENCY RESOURCE CENTER

The MEDICAL module is transformed into a verified Emergency & Medical Resource Center designed around strict medical safety rules, deterministic emergency routing, and zero fake resources:

```
+-------------------------------------------------------------------------------+
|                         MEDICAL & EMERGENCY CENTER UI                         |
|  [Search bar: natural language, hospitals, clinics, pharmacies, ambulances]   |
|  +-------------------------------------------------------------------------+  |
|  | [CALL 112: India Unified Emergency Number (ERSS) Primary Hero Action]   |  |
|  +-------------------------------------------------------------------------+  |
|  | Quick Emergency Categories (Heart, Stroke, Poison, Maternity, etc.)     |  |
|  | AI Emergency Assistant (Modal / Triage Engine with Non-Diagnostic Guard)|  |
|  | Verified Medical Directory (Hospitals, Clinics, Pharmacies, Blood Bank)|  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
|                      DETERMINISTIC SAFETY & ROUTING LAYER                     |
|  +-----------------------------+  +----------------------------------------+  |
|  | Deterministic High-Risk Gate|  | Natural Language Search Engine         |  |
|  | - Immediate Call 112 Routing|  | - Symptom-to-Specialty Keyword Mapping |  |
|  | - Location Ambulance (108)  |  | - Haversine Distance Calculation       |  |
|  | - Non-diagnostic Language   |  | - Verified Status & Operating Hours    |  |
|  +-----------------------------+  +----------------------------------------+  |
+-------------------------------------------------------------------------------+
|                      CENTRAL HELPLINE & FACILITY REGISTRY                     |
|  +-----------------------+ +------------------------+ +--------------------+  |
|  | EmergencyHelpline DB  | | MedicalFacility DB     | | Offline Directory  |  |
|  | - Verified Metadata   | | - Real Addresses & GPS | | - Hardcoded local  |  |
|  | - Provenance URLs     | | - Emergency Capacity   | |   survival pack    |  |
|  | - Audit Governance    | | - Real Phone Numbers   | | - No network req.  |  |
|  +-----------------------+ +------------------------+ +--------------------+  |
+-------------------------------------------------------------------------------+
```

### Core Architecture Principles:
1. **Medical Safety & Non-Diagnostic Principle:**
   - Strictly prohibits diagnostic certainty (e.g. *"You have a heart attack"*).
   - Replaces with emergency routing guidance (e.g. *"These symptoms can be associated with a medical emergency. Contact emergency medical help now."*).
   - Forbids prescribing medication, altering dosages, or promising cures.
2. **Deterministic Emergency Gate:**
   - Evaluates high-risk signals (chest pain, unconsciousness, heavy bleeding, stroke symptoms, poisoning, acute respiratory distress) prior to AI processing.
   - Bypasses lengthy triage or multi-question barriers: displays emergency calling actions immediately (`CALL 112`, `CALL 108`).
3. **Verified Centralized Registry:**
   - Helplines (`EmergencyHelpline`) are never duplicated across frontend components.
   - Includes official provenance metadata: `source`, `sourceUrl`, `verifiedAt`, `scope`, `verificationStatus`, and `notes`.
   - National anchors: 112 (Unified), 108/102 (Ambulance), 104 (Health Info), 181 (Women), 1098 (Child), 14416 (Tele-MANAS Mental Health), 1800-116-117 (AIIMS NPIC Poison).
4. **Resilient Fallback Mechanisms:**
   - **Offline Mode:** Pre-cached emergency directory accessible without internet or backend connection.
   - **GPS Denied Mode:** Seamless manual district/city selector calculating actual distances from selected district centroid.
   - **AI Failure Mode:** Graceful degradation presenting direct Call 112, Call 108, and nearby facility listings.
5. **Admin Medical Governance:**
   - Dedicated Admin Medical Management tab for Helplines and Facilities.
   - Form-level Indian phone number validation (3-5 digit short codes and 1800 toll-free patterns).
   - Mandatory reason and evidence fields producing immutable `AdminActionLog` entries for every add, update, verify, or delete action.

---

## 5. Data Models & Entity Relationships

- **`User` / `StoredUser`**: Cryptographically salted and PBKDF2 hashed user records with protected roles, session status (`ACTIVE` / `DISABLED`), and authorization scopes.
- **`AuthSession`**: HMAC-SHA256 signed bearer session tokens with 7-day expiration and server-side revocation registry.
- **`EmergencyHelpline`**: Centralized emergency helpline entity with service name, category, number, country, state, scope, availability, description, source, source URL, verifiedAt date, and verification status.
- **`MedicalFacility`**: Verified health resource with name, type (Hospital, Clinic, Pharmacy, Ambulance, Blood Bank), address, state, city, pincode, coordinates, phone, emergencyServices flag, specialties, verifiedAt, source, and opening hours.
- **`FarmerProduct` / `FarmProduceListing`**: Direct farmer produce items with category, quantity, unit, price, location, photos, and payment methods.
- **`EquipmentItem` / `RentalEquipment` / `UsedEquipment`**: Machinery items with type, brand, model, condition, hourly rate, purchase price, owner details, and verified photos.
- **`MandiRecord`**: Official APMC daily market arrival record with min, modal, max prices per kg/quintal, arrival date, source URL, and record ID.
- **`MarketDataAudit`**: Permanent audit record capturing previous value, new value, field changed, editor ID, editor role, reason, timestamp, and physical evidence reference.
- **`AdminActionLog`**: Moderation log capturing admin actions (approve, reject, hide, restore, delete, photo update, medical helpline/facility management).
- **`Booking`**: Shared booking entity for WORK, FARM, and MOVE with full state machine (`REQUESTED` &rarr; `ACCEPTED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`), double booking protection, confirmation timestamps, and blockchain hash.
- **`BlockchainRecord`**: Cryptographic ledger record anchoring provider verification, booking lifecycle, and payment escrows.

---

## 6. Security & Role Governance

- **Role-Based Authorization:** User roles (`CUSTOMER`, `FARMER`, `WORKER`, `DRIVER`, `EQUIPMENT_OWNER`, `VEHICLE_OWNER`, `ADMIN`).
- **Protected Administrator Gate:** Dedicated restricted `/admin` route guard with cryptographic server token verification.
- **Privilege Escalation Defense:** Public registration endpoints strictly forbid self-assignment of `ADMIN`.
- **Zero-Trust Client Security:** Client-side role variables or localStorage modifications are rejected by backend authorization engines.
- **Zero-Trust Auditability:** All administrative changes, medical updates, and price corrections generate immutable audit logs with cryptographic timestamps.

