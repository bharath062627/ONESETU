export type UserRole =
  | 'CUSTOMER'
  | 'FARMER'
  | 'WORKER'
  | 'DRIVER'
  | 'EQUIPMENT_OWNER'
  | 'VEHICLE_OWNER'
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  roles: UserRole[];
  activeRole: UserRole;
  location: string;
  coordinates?: { lat: number; lng: number };
  verified: boolean;
  createdAt: string;
  updatedAt?: string;
  status?: 'ACTIVE' | 'DISABLED';
  auth_provider?: 'email' | 'google' | 'phone';
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
  serverVerified: boolean;
}

export interface CloudAuthConfig {
  firebaseConfigured: boolean;
  googleConfigured: boolean;
  phoneConfigured: boolean;
  missingFirebaseKeys: string[];
  missingGoogleKeys: string[];
  missingPhoneKeys: string[];
}

export type ProduceCategory = 'All' | 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Spices' | 'Other';

export interface ProduceItem {
  id: string;
  productName: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Spices' | 'Other';
  quantity: number;
  unit: string; // 'kg', 'quintal', 'crates', 'bags'
  expectedPrice: number;
  sellingPrice?: number;
  location: string;
  farmerName: string;
  farmerId: string;
  farmerPhone?: string;
  harvestDate: string;
  description: string;
  image: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  paymentMethods?: 'CASH' | 'ONLINE' | 'BOTH';
  availability: 'Available' | 'Sold Out' | 'Harvesting Soon';
  verified: boolean;
  createdAt: string;
}

export interface MarketPriceRecord {
  marketName: string;
  pricePerKg: number;
  color: string;
}

export interface CropMarketComparison {
  cropName: string;
  category: string;
  currentLocation: string;
  image: string;
  prices: MarketPriceRecord[];
  disclaimer: string;
}

export type EquipmentCategory =
  | 'Tractor'
  | 'Sprayer'
  | 'Harvester'
  | 'Cultivator'
  | 'Rotavator'
  | 'Seeder'
  | 'Plough'
  | 'Power Tiller'
  | 'Other';

export interface EquipmentItem {
  id: string;
  equipmentName: string;
  type: EquipmentCategory;
  isUsedEquipmentSale: boolean;
  pricePerHour?: number;
  pricePerDay?: number;
  priceToBuy?: number;
  ownerName: string;
  ownerId: string;
  ownerPhone: string;
  location: string;
  distanceKm: number;
  availability: 'Available' | 'In Use' | 'Booked';
  condition: 'Brand New' | 'Excellent' | 'Good' | 'Fair';
  rating: number;
  reviewCount: number;
  verified: boolean;
  image: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  brand?: string;
  model?: string;
  year?: number;
  description: string;
}

export type ServiceTrade =
  | 'Electrician'
  | 'Plumber'
  | 'Carpenter'
  | 'Painter'
  | 'AC Repair'
  | 'Appliance Repair'
  | 'Mechanic'
  | 'Cleaning'
  | 'Pest Control'
  | 'Computer / IT Repair'
  | 'Mobile Repair'
  | 'Water / Pipe Repair'
  | 'Installation'
  | 'Maintenance'
  | 'Other';

export interface ServiceProvider {
  id: string;
  name: string;
  avatar: string;
  serviceCategory: ServiceTrade;
  skills: string[];
  experienceYears: number;
  completedJobs: number;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  distanceKm: number;
  verified: boolean;
  contact: string;
  about: string;
  servicesList: string[];
  blockchainTxHash?: string;
}

export interface EmergencyContact {
  id: string;
  title: string;
  category: 'Ambulance' | 'Hospital' | 'Police' | 'Fire' | 'Other Help';
  dialNumber: string;
  subtitle: string;
  iconName: string;
  is24x7?: boolean;
  distanceKm?: number;
  address?: string;
}

export type VehicleCategory =
  | 'Mini Truck'
  | 'Pickup'
  | 'Tempo'
  | 'Truck'
  | 'Lorry'
  | 'Tractor'
  | 'Goods Auto'
  | 'Other Goods Vehicle'
  | 'Other';

export interface TransportVehicle {
  id: string;
  vehicleName: string;
  vehicleType: VehicleCategory;
  vehicleNumber: string;
  capacityKg: number;
  pricePerKm: number;
  pricePerHour?: number;
  dailyRate?: number;
  location: string;
  distanceKm: number;
  ownerName: string;
  ownerId: string;
  ownerContact: string;
  experienceYears?: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  image: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  condition: string;
  availability: 'Available' | 'On Trip' | 'Reserved';
}

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID_ONLINE'
  | 'PAID_CASH'
  | 'PAYMENT_FAILED'
  | 'REFUNDED'
  | 'NOT_REQUIRED';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  providerContact?: string;
  category: 'FARM' | 'WORK' | 'MOVE';
  serviceTitle: string;
  pickupLocation?: string;
  destinationLocation?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: BookingStatus;
  priceEstimate: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: 'ONLINE' | 'CASH';
  paymentAmount?: number;
  paymentTxId?: string;
  paymentDate?: string;
  loadDetails?: string;
  notes?: string;
  blockchainTxHash?: string;
  blockchainBlock?: number;
  rating?: number;
  reviewComment?: string;
  customerConfirmedAt?: string;
  rejectionReason?: string;
  ratedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType: 'PROVIDER_VERIFICATION' | 'BOOKING_CREATION' | 'BOOKING_COMPLETION' | 'EQUIPMENT_ESCROW';
  entityId: string;
  entityName: string;
  payloadHash: string;
  status: 'CONFIRMED' | 'MINED';
  explorerUrl?: string;
  details: Record<string, any>;
}

export type ScreenId =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'admin-login'
  | 'roles'
  | 'home'
  | 'search'
  | 'farm'
  | 'top10-markets'
  | 'market-comparison'
  | 'work'
  | 'provider-detail'
  | 'medical'
  | 'move'
  | 'bookings'
  | 'trust'
  | 'admin'
  | 'profile'
  | 'notifications';

export type NotificationCategory =
  | 'BOOKING'
  | 'MARKETPLACE'
  | 'PAYMENT'
  | 'VERIFICATION'
  | 'PRICE_ALERT';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  timestamp: string;
  createdAt?: string;
  location?: string;
  targetScreen?: ScreenId;
  targetTab?: string;
  referenceId?: string;
  actionLabel?: string;
  imageUrl?: string;
  badgeText?: string;
}

export interface NotificationPreferences {
  bookingAlerts: boolean;
  marketplaceAlerts: boolean;
  priceAlerts: boolean;
  onlyMyArea: boolean;
}

export type FarmerProductCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Pulses'
  | 'Spices'
  | 'Other Farm Products';

export type FarmerProductUnit =
  | 'kg'
  | 'quintal'
  | 'tonne'
  | 'piece'
  | 'dozen'
  | 'bundle'
  | 'other';

export type FarmerProductAvailability =
  | 'AVAILABLE'
  | 'LOW STOCK'
  | 'OUT OF STOCK'
  | 'INACTIVE';

export type FarmerProductStatus =
  | 'ACTIVE'
  | 'SOLD_OUT'
  | 'INACTIVE'
  | 'REMOVED';

export interface FarmerProduct {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  productName: string;
  category: FarmerProductCategory;
  quantity: number;
  unit: FarmerProductUnit;
  sellingPrice: number;
  currency?: string;
  location: string;
  city?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  description: string;
  primaryImageUrl?: string;
  imageUrls?: string[];
  availability: FarmerProductAvailability;
  contact: string;
  paymentMethods: 'CASH' | 'ONLINE' | 'BOTH';
  status: FarmerProductStatus;
  verified?: boolean;
  mandiReferencePrice?: number;
  createdAt: string;
  updatedAt?: string;
}

// Model aliases to ensure strict alignment with required data entities
export type FarmProduceListing = FarmerProduct;
export type RentalEquipment = EquipmentItem;
export type UsedEquipment = EquipmentItem;

export interface AdminActionLog {
  id: string;
  adminId: string;
  adminRole?: string;
  actionType:
    | 'CREATE'
    | 'EDIT'
    | 'DELETE'
    | 'APPROVE'
    | 'REJECT'
    | 'HIDE'
    | 'RESTORE'
    | 'PHOTO_UPDATE'
    | 'PRICE_UPDATE'
    | 'VERIFY'
    | 'UNVERIFY'
    | 'ENABLE'
    | 'DISABLE'
    | 'REPLACE_SOURCE'
    | 'CHANGE_SCOPE'
    | 'UPDATE_DESCRIPTION';
  targetModule:
    | 'MARKET_RATE'
    | 'SALE_POINT'
    | 'EQUIPMENT_RENT'
    | 'USED_EQUIPMENT'
    | 'USERS'
    | 'MEDICAL_HELPLINE'
    | 'MEDICAL_FACILITY';
  targetId: string;
  targetName: string;
  details: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
}

// ==========================================
// MEDICAL & EMERGENCY TYPES
// ==========================================

export type HelplineVerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED_REVIEW_REQUIRED';

export type EmergencyHelplineCategory =
  | 'Ambulance'
  | 'Hospital'
  | 'Police'
  | 'Fire'
  | 'Women'
  | 'Child'
  | 'Mental Health'
  | 'Poison'
  | 'Disaster'
  | 'Cyber Crime'
  | 'Road Accident'
  | 'Other';

export interface EmergencyHelpline {
  id: string;
  service_name: string;
  category: EmergencyHelplineCategory;
  number: string;
  country: string;
  state: string;
  city?: string;
  scope: 'NATIONAL' | 'STATE' | 'DISTRICT' | 'MUNICIPAL';
  availability: string;
  description: string;
  source: string;
  source_url?: string;
  verified_at: string;
  effective_from?: string;
  effective_until?: string;
  verification_status: HelplineVerificationStatus;
  last_checked_by: string;
  updated_at: string;
  notes?: string;
  enabled?: boolean;
}

export type MedicalFacilityType =
  | 'Hospital'
  | 'Clinic'
  | 'Pharmacy'
  | 'Ambulance'
  | 'Blood Bank'
  | 'Diagnostic Center';

export interface MedicalFacility {
  id: string;
  name: string;
  type: MedicalFacilityType;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode?: string;
  phone: string;
  altPhone?: string;
  hasEmergencyDepartment: boolean;
  is24x7: boolean;
  openingHours?: string;
  specialties: string[];
  distanceKm: number;
  latitude?: number;
  longitude?: number;
  source: string;
  sourceUrl?: string;
  verifiedAt: string;
  verificationStatus: HelplineVerificationStatus;
  notes?: string;
  enabled?: boolean;
  imageUrl?: string;
}

export type EmergencyCategoryType =
  | 'HEART_CHEST_PAIN'
  | 'PREGNANCY_MATERNITY'
  | 'STROKE_NEURO'
  | 'BREATHING_DIFFICULTY'
  | 'ACCIDENT_TRAUMA'
  | 'SEVERE_BLEEDING'
  | 'CHILD_EMERGENCY'
  | 'POISONING'
  | 'BURNS_FIRE'
  | 'UNCONSCIOUS_FAINTING'
  | 'SEIZURE'
  | 'MENTAL_HEALTH'
  | 'ANIMAL_SNAKE_BITE'
  | 'ALL_OTHER';

export interface EmergencyRoutingInfo {
  category: EmergencyCategoryType;
  label: string;
  icon: string;
  primaryAction: string;
  primaryNumber: string;
  secondaryAction?: string;
  secondaryNumber?: string;
  specializedService?: string;
  specializedNumber?: string;
  guidance: string;
  relevantSpecialties: string[];
}

export type EmergencyUrgencyClass =
  | 'HIGH PRIORITY EMERGENCY'
  | 'URGENT MEDICAL HELP'
  | 'NON-EMERGENCY RESOURCE'
  | 'UNCERTAIN — HUMAN MEDICAL HELP ADVISED';

export interface AiEmergencyResponse {
  assessment: string;
  recommendedAction: string;
  primaryContact: { label: string; number: string };
  ambulanceContact: { label: string; number: string };
  specializedContact?: { label: string; number: string; service: string };
  why: string;
  nearbyFacilities: MedicalFacility[];
  disclaimer: string;
  urgency: EmergencyUrgencyClass;
  usefulQuestions?: string[];
  isDeterministicSafetyTriggered: boolean;
}


export interface MarketDataAudit {
  id: string;
  commodity: string;
  market: string;
  fieldChanged: string;
  previousValue: number | string;
  newValue: number | string;
  editorId: string;
  editorRole: string;
  reason: string;
  evidenceSource: string;
  timestamp: string;
}

export * from './market';




