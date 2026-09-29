# ONESETU

> **One Platform. Every Local Need.**
> A unified cross-platform local service, resource, agricultural marketplace, transport, and blockchain trust network.

---

## 🌟 The Core Vision

Local users in tier-2/3 cities and rural towns struggle with fragmented channels to find buyers for agricultural produce, rent farm equipment, hire reliable local technicians, access critical emergency services, or book goods transport vehicles.

**ONESETU** combines all local needs into **one unified ecosystem**:
- 🌾 **FARM**: Produce market, multi-APMC price benchmark comparison, equipment rentals & used machinery
- 🧑‍🔧 **WORK**: Verified domestic and commercial technicians (Electricians, Plumbers, Carpenters, Painters, etc.)
- 🏥 **MEDICAL**: Emergency quick dialers (108, 100, 101, 112) and 24/7 hospital discovery
- 🚚 **MOVE**: Deterministic transport matching based on capacity, distance, and goods classification
- 🔐 **TRUST & BLOCKCHAIN**: Cryptographic SHA-256 verification and immutable on-chain job completion proofs

---

## 📱 The 12 Replicated Interface Screens

The application strictly implements the 12 interface screens from the design specification:
1. **Splash Screen**: Brand identity, bridge logo motif, and countryside connectivity visual.
2. **Onboarding**: Multi-step feature presentation illustrating Farm, Work, Medical, and Move.
3. **Login / Sign Up**: Email/Phone and OAuth options with persistent session management.
4. **Role Selection**: Multi-capability assignment (Customer, Farmer, Worker, Equipment Owner, Vehicle Owner, Admin).
5. **Home Dashboard**: Location pill, category badges, promo hero banner, quick nearby services, recent activity, and bottom navigation.
6. **Search Results**: Multi-category search with tag filtering (All, Farm, Move, Work), distance, and ratings.
7. **Farm - Produce Market**: Produce listings, equipment rental, and used machinery tabs.
8. **Market Price Comparison**: APMC price benchmark (Mysuru, Mandya, Bengaluru, Chamarajanagar, Hassan) with reference labeling.
9. **Work - Service Providers**: Verified local trades with distance, pricing, and ratings.
10. **Provider Details & Booking**: Experience metrics, completed jobs, service tags, instant booking, and provider chat.
11. **Medical - Emergency**: Quick dialers (Ambulance 108, Hospital, Police 100, Fire 101, Helplines) and 24/7 emergency facilities.
12. **Move - Transport Request**: Vehicle matching based on capacity, distance, and goods classification.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Plus Jakarta Sans & Outfit fonts
- **State Management**: Reactive data store with LocalStorage persistence and event-driven updates
- **Blockchain Layer**: Deterministic SHA-256 hashing via Web Crypto API with simulated smart-contract state (`OneSetuTrust.sol`), transaction receipts, and explorer inspector
- **Location Engine**: Geolocation API with Haversine distance calculator & manual fallback

---

## 🚀 Running Instructions

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checker & linter
npm run lint

# Compile production build
npm run build
```
