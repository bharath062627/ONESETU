import {
  Booking,
  BookingStatus,
  PaymentStatus,
  BlockchainRecord,
  CropMarketComparison,
  EquipmentItem,
  ProduceItem,
  ServiceProvider,
  TransportVehicle,
  User,
  UserRole,
  ScreenId,
  EmergencyContact,
  AppNotification,
  NotificationCategory,
  NotificationPreferences,
  FarmerProduct,
  AdminActionLog,
  MarketDataAudit,
  EmergencyHelpline,
  MedicalFacility,
  EmergencyCategoryType,
  AiEmergencyResponse
} from '../types';

import {
  INITIAL_VERIFIED_HELPLINES,
  INITIAL_VERIFIED_FACILITIES,
  searchMedicalFacilities,
  validateIndianPhoneNumber,
  generateAiEmergencyResponse,
  evaluateDeterministicSafety,
  EMERGENCY_ROUTING_REGISTRY,
  OFFLINE_EMERGENCY_DIRECTORY,
  MedicalSearchOptions
} from './medicalEmergencyService';

import {
  initialBookings,
  initialEquipment,
  initialProduce,
  initialFarmerProducts,
  initialProviders,
  initialUser,
  initialVehicles,
  tomatoComparison,
  emergencyContacts,
  nearbyHospitals
} from './mockData';
import { initialBlockchainRecords, generateSha256 } from './blockchain';

export type { AppNotification, NotificationCategory, NotificationPreferences };

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Booking Accepted',
    message: 'Venkatesh Gowda accepted your equipment rental for Mahindra 575 DI Tractor.',
    category: 'BOOKING',
    read: false,
    timestamp: '10 mins ago',
    location: 'Mysuru, Karnataka',
    targetScreen: 'bookings',
    referenceId: 'BK-1002',
    actionLabel: 'Track Booking'
  },
  {
    id: 'notif-2',
    title: 'New Produce in Mysuru',
    message: 'Fresh Hybrid Tomato (500 kg @ ₹24/kg) listed by Suresh Kumar in Mysuru.',
    category: 'MARKETPLACE',
    read: false,
    timestamp: '25 mins ago',
    location: 'Mysuru, Karnataka',
    targetScreen: 'farm',
    targetTab: 'produce',
    actionLabel: 'View in Farm',
    badgeText: 'New in your area'
  },
  {
    id: 'notif-3',
    title: 'Trip In Progress',
    message: 'Driver Ramesh Kumar has started transport with Tata Ace Mini Truck to Bandipalya APMC.',
    category: 'BOOKING',
    read: false,
    timestamp: '1 hour ago',
    location: 'Mysuru, Karnataka',
    targetScreen: 'bookings',
    referenceId: 'BK-1001',
    actionLabel: 'View Trip'
  },
  {
    id: 'notif-4',
    title: 'Machinery for Rent in Mysuru',
    message: 'John Deere 5050D Tractor (50 HP) available for immediate hire at ₹850/hr in Mysuru.',
    category: 'MARKETPLACE',
    read: false,
    timestamp: '2 hours ago',
    location: 'Mysuru, Karnataka',
    targetScreen: 'farm',
    targetTab: 'rent',
    actionLabel: 'Rent Machine',
    badgeText: 'New in your area'
  },
  {
    id: 'notif-5',
    title: 'Payment Confirmed',
    message: 'Payment of ₹450 to Ramesh Electrical Services was verified and anchored on blockchain.',
    category: 'PAYMENT',
    read: true,
    timestamp: '3 hours ago',
    targetScreen: 'trust',
    actionLabel: 'View Ledger'
  },
  {
    id: 'notif-6',
    title: 'Mandi Rate Spike in Bengaluru',
    message: 'Tomato modal price in Bengaluru APMC reached ₹31/kg (+₹7 vs Local benchmark).',
    category: 'PRICE_ALERT',
    read: true,
    timestamp: '4 hours ago',
    location: 'Bengaluru, Karnataka',
    targetScreen: 'top10-markets',
    actionLabel: 'View Top 10'
  },
  {
    id: 'notif-7',
    title: 'Pre-Owned Machine in Mandya',
    message: 'Shaktiman 6ft Rotavator listed for direct farmer purchase @ ₹85,000 in Mandya.',
    category: 'MARKETPLACE',
    read: true,
    timestamp: '5 hours ago',
    location: 'Mandya, Karnataka',
    targetScreen: 'farm',
    targetTab: 'used',
    actionLabel: 'Inspect Deal'
  },
  {
    id: 'notif-8',
    title: 'Provider Trust Verified',
    message: 'Your account was verified as a trusted regional agricultural producer.',
    category: 'VERIFICATION',
    read: true,
    timestamp: '1 day ago',
    targetScreen: 'trust',
    actionLabel: 'View Trust Score'
  }
];

class AppStore {
  private user: User = initialUser;
  private produce: ProduceItem[] = [...initialProduce];
  private farmerProducts: FarmerProduct[] = [...initialFarmerProducts];
  private equipment: EquipmentItem[] = [...initialEquipment];
  private providers: ServiceProvider[] = [...initialProviders];
  private vehicles: TransportVehicle[] = [...initialVehicles];
  private bookings: Booking[] = [...initialBookings];
  private blockchainRecords: BlockchainRecord[] = [...initialBlockchainRecords];
  private emergencyList: EmergencyContact[] = [...emergencyContacts];
  private hospitalList: EmergencyContact[] = [...nearbyHospitals];
  private helplines: EmergencyHelpline[] = [...INITIAL_VERIFIED_HELPLINES];
  private facilities: MedicalFacility[] = [...INITIAL_VERIFIED_FACILITIES];
  private notifications: AppNotification[] = [...initialNotifications];
  private notificationPreferences: NotificationPreferences = {
    bookingAlerts: true,
    marketplaceAlerts: true,
    priceAlerts: true,
    onlyMyArea: false
  };
  private currentScreen: ScreenId = 'home';
  private navigationHistory: ScreenId[] = ['home'];
  private currentSearchQuery: string = '';
  private selectedCategoryFilter: string = 'All';
  private selectedProviderId: string = 'worker-1';
  private selectedCropComparison: CropMarketComparison = tomatoComparison;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedUser = localStorage.getItem('onesetu_user');
      if (savedUser) this.user = JSON.parse(savedUser);

      const savedBookings = localStorage.getItem('onesetu_bookings');
      if (savedBookings) this.bookings = JSON.parse(savedBookings);

      const savedProduce = localStorage.getItem('onesetu_produce');
      if (savedProduce) {
        const parsed = JSON.parse(savedProduce);
        // Ensure at least initial rich dataset if saved had fewer
        this.produce = parsed.length >= initialProduce.length ? parsed : [...initialProduce];
      }

      const savedFarmerProducts = localStorage.getItem('onesetu_farmer_products');
      if (savedFarmerProducts) {
        const parsed = JSON.parse(savedFarmerProducts);
        this.farmerProducts = parsed.length >= initialFarmerProducts.length ? parsed : [...initialFarmerProducts];
      }

      const savedEquipment = localStorage.getItem('onesetu_equipment');
      if (savedEquipment) {
        const parsed = JSON.parse(savedEquipment);
        this.equipment = parsed.length >= initialEquipment.length ? parsed : [...initialEquipment];
      }

      const savedProviders = localStorage.getItem('onesetu_providers');
      if (savedProviders) {
        const parsed = JSON.parse(savedProviders);
        this.providers = parsed.length >= initialProviders.length ? parsed : [...initialProviders];
      }

      const savedVehicles = localStorage.getItem('onesetu_vehicles');
      if (savedVehicles) {
        const parsed = JSON.parse(savedVehicles);
        this.vehicles = parsed.length >= initialVehicles.length ? parsed : [...initialVehicles];
      }

      const savedRecords = localStorage.getItem('onesetu_blockchain');
      if (savedRecords) this.blockchainRecords = JSON.parse(savedRecords);

      const savedNotifications = localStorage.getItem('onesetu_notifications');
      if (savedNotifications) this.notifications = JSON.parse(savedNotifications);

      const savedPrefs = localStorage.getItem('onesetu_notification_preferences');
      if (savedPrefs) this.notificationPreferences = { ...this.notificationPreferences, ...JSON.parse(savedPrefs) };

      const savedHelplines = localStorage.getItem('onesetu_helplines');
      if (savedHelplines) this.helplines = JSON.parse(savedHelplines);

      const savedFacilities = localStorage.getItem('onesetu_facilities');
      if (savedFacilities) this.facilities = JSON.parse(savedFacilities);
    } catch (e) {
      console.warn('Storage parse error, using defaults', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('onesetu_user', JSON.stringify(this.user));
      localStorage.setItem('onesetu_bookings', JSON.stringify(this.bookings));
      localStorage.setItem('onesetu_produce', JSON.stringify(this.produce));
      localStorage.setItem('onesetu_farmer_products', JSON.stringify(this.farmerProducts));
      localStorage.setItem('onesetu_equipment', JSON.stringify(this.equipment));
      localStorage.setItem('onesetu_providers', JSON.stringify(this.providers));
      localStorage.setItem('onesetu_vehicles', JSON.stringify(this.vehicles));
      localStorage.setItem('onesetu_blockchain', JSON.stringify(this.blockchainRecords));
      localStorage.setItem('onesetu_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('onesetu_notification_preferences', JSON.stringify(this.notificationPreferences));
      localStorage.setItem('onesetu_helplines', JSON.stringify(this.helplines));
      localStorage.setItem('onesetu_facilities', JSON.stringify(this.facilities));
    } catch (e) {
      console.error('Storage save error', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Navigation
  public getScreen(): ScreenId {
    return this.currentScreen;
  }

  public navigateTo(screen: ScreenId) {
    if (this.currentScreen !== screen) {
      this.navigationHistory.push(this.currentScreen);
      this.currentScreen = screen;
      this.notify();
    }
  }

  public setScreen(screen: ScreenId) {
    this.navigateTo(screen);
  }

  public goBack(): boolean {
    if (this.navigationHistory.length > 0) {
      const prev = this.navigationHistory.pop();
      if (prev) {
        this.currentScreen = prev;
        this.notify();
        return true;
      }
    }
    this.currentScreen = 'home';
    this.notify();
    return false;
  }

  // User & Roles
  public getUser(): User {
    return this.user;
  }

  public updateUser(updates: Partial<User>) {
    this.user = { ...this.user, ...updates };
    this.persist();
  }

  public setActiveRole(role: UserRole) {
    this.user.activeRole = role;
    if (!this.user.roles.includes(role)) {
      this.user.roles.push(role);
    }
    this.persist();
  }

  public setLocation(location: string) {
    this.user.location = location;
    this.persist();
  }

  public getLocation(): string {
    return this.user.location;
  }

  // Produce (Farmer Sales Point)
  public getProduce(): ProduceItem[] {
    return this.produce;
  }

  public addProduce(item: Omit<ProduceItem, 'id' | 'createdAt'>): ProduceItem {
    const newId = `prod-${Date.now()}`;
    const newProduceItem: ProduceItem = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.produce.unshift(newProduceItem);
    this.addNotification({
      title: `New Produce in ${item.location.split(',')[0]}`,
      message: `Fresh ${item.productName} (${item.quantity} ${item.unit}) listed by ${item.farmerName} at ₹${item.sellingPrice || item.expectedPrice}/${item.unit}.`,
      category: 'MARKETPLACE',
      location: item.location,
      targetScreen: 'farm',
      targetTab: 'produce',
      referenceId: newId,
      actionLabel: 'View in Farm',
      badgeText: 'New in your area',
      imageUrl: item.image
    });
    this.persist();
    return newProduceItem;
  }

  public updateProduce(id: string, updates: Partial<ProduceItem>): ProduceItem | null {
    const index = this.produce.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.produce[index] = { ...this.produce[index], ...updates };
    this.persist();
    return this.produce[index];
  }

  public deleteProduce(id: string): boolean {
    const beforeCount = this.produce.length;
    this.produce = this.produce.filter(p => p.id !== id);
    if (this.produce.length !== beforeCount) {
      this.persist();
      return true;
    }
    return false;
  }

  // Farmer Sales Point Products
  public getFarmerProducts(): FarmerProduct[] {
    return this.farmerProducts;
  }

  public getFarmerProductById(id: string): FarmerProduct | undefined {
    return this.farmerProducts.find(p => p.id === id);
  }

  public addFarmerProduct(item: Omit<FarmerProduct, 'id' | 'createdAt'>): FarmerProduct {
    const newId = `fps-${Date.now()}`;
    const newProduct: FarmerProduct = {
      ...item,
      id: newId,
      status: item.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.farmerProducts.unshift(newProduct);
    this.addNotification({
      title: `Farmer Direct Sale: ${newProduct.productName}`,
      message: `${newProduct.productName} (${newProduct.quantity} ${newProduct.unit}) listed by ${newProduct.farmerName} at ₹${newProduct.sellingPrice}/${newProduct.unit} in ${newProduct.location}.`,
      category: 'MARKETPLACE',
      location: newProduct.location,
      targetScreen: 'farm',
      targetTab: 'sales-point',
      referenceId: newId,
      actionLabel: 'Buy Direct',
      badgeText: 'Farmer Direct',
      imageUrl: newProduct.primaryImageUrl
    });
    this.persist();
    return newProduct;
  }

  public updateFarmerProduct(id: string, updates: Partial<FarmerProduct>): FarmerProduct | null {
    const index = this.farmerProducts.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.farmerProducts[index] = {
      ...this.farmerProducts[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.persist();
    return this.farmerProducts[index];
  }

  public deleteFarmerProduct(id: string): boolean {
    const beforeCount = this.farmerProducts.length;
    this.farmerProducts = this.farmerProducts.filter(p => p.id !== id);
    if (this.farmerProducts.length !== beforeCount) {
      this.persist();
      return true;
    }
    return false;
  }

  // Equipment
  public getEquipment(): EquipmentItem[] {
    return this.equipment;
  }

  public addEquipment(item: Omit<EquipmentItem, 'id'>): EquipmentItem {
    const newItem: EquipmentItem = {
      ...item,
      id: `eq-${Date.now()}`
    };
    this.equipment.unshift(newItem);
    const isUsed = Boolean(item.isUsedEquipmentSale);
    this.addNotification({
      title: isUsed
        ? `Used Machinery for Sale in ${item.location.split(',')[0]}`
        : `Machinery for Rent in ${item.location.split(',')[0]}`,
      message: isUsed
        ? `${item.equipmentName} listed for sale by ${item.ownerName} at ₹${item.priceToBuy?.toLocaleString('en-IN') || item.pricePerHour}.`
        : `${item.equipmentName} (${item.type}) available for hire at ₹${item.pricePerHour}/hr in ${item.location}.`,
      category: 'MARKETPLACE',
      location: item.location,
      targetScreen: 'farm',
      targetTab: isUsed ? 'used' : 'rent',
      referenceId: newItem.id,
      actionLabel: isUsed ? 'Inspect Used Machine' : 'Rent Machine',
      badgeText: 'New in your area',
      imageUrl: item.image
    });
    this.persist();
    return newItem;
  }

  public getEquipmentById(id: string): EquipmentItem | undefined {
    return this.equipment.find(e => e.id === id);
  }

  // Service Providers (Work)
  public getProviders(): ServiceProvider[] {
    return this.providers;
  }

  public getSelectedProvider(): ServiceProvider {
    const found = this.providers.find(p => p.id === this.selectedProviderId);
    return found || this.providers[0];
  }

  public setSelectedProvider(id: string) {
    this.selectedProviderId = id;
    this.notify();
  }

  public setSelectedProviderId(id: string) {
    this.setSelectedProvider(id);
  }

  public toggleProviderVerification(id: string, verified: boolean) {
    this.providers = this.providers.map(p => {
      if (p.id === id) {
        return { ...p, verified };
      }
      return p;
    });
    this.persist();
  }

  // Vehicles (Move)
  public getVehicles(): TransportVehicle[] {
    return this.vehicles;
  }

  public addVehicle(vehicle: Omit<TransportVehicle, 'id'>): TransportVehicle {
    const newVeh: TransportVehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`
    };
    this.vehicles.unshift(newVeh);
    this.addNotification({
      title: `New Transport in ${vehicle.location.split(',')[0]}`,
      message: `${vehicle.vehicleName} (${vehicle.vehicleType}, ${vehicle.capacityKg} kg capacity) available for hire at ₹${vehicle.pricePerKm}/km.`,
      category: 'MARKETPLACE',
      location: vehicle.location,
      targetScreen: 'move',
      referenceId: newVeh.id,
      actionLabel: 'Book Transport',
      badgeText: 'New in your area',
      imageUrl: vehicle.image
    });
    this.persist();
    return newVeh;
  }

  // Emergency & Hospitals (Medical)
  public getEmergencyContacts(): EmergencyContact[] {
    return this.emergencyList;
  }

  public getNearbyHospitals(): EmergencyContact[] {
    return this.hospitalList;
  }

  public addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
    const newC: EmergencyContact = {
      ...contact,
      id: `em-${Date.now()}`
    };
    this.emergencyList.push(newC);
    this.notify();
    return newC;
  }

  // ==========================================
  // Medical & Emergency Resource Center
  // ==========================================

  public getEmergencyHelplines(): EmergencyHelpline[] {
    return this.helplines.filter((h) => h.enabled !== false);
  }

  public getAllHelplinesAdmin(): EmergencyHelpline[] {
    return this.helplines;
  }

  public getMedicalFacilities(): MedicalFacility[] {
    return this.facilities.filter((f) => f.enabled !== false);
  }

  public getAllFacilitiesAdmin(): MedicalFacility[] {
    return this.facilities;
  }

  public searchMedicalFacilities(options?: MedicalSearchOptions): MedicalFacility[] {
    return searchMedicalFacilities(this.facilities, options);
  }

  public getEmergencyRouting(category: EmergencyCategoryType) {
    return EMERGENCY_ROUTING_REGISTRY[category];
  }

  public getOfflineEmergencyDirectory() {
    return OFFLINE_EMERGENCY_DIRECTORY;
  }

  public queryAiEmergencyAssistant(text: string): AiEmergencyResponse {
    return generateAiEmergencyResponse(text, this.facilities);
  }

  // Admin Helplines & Medical Facility Management
  public adminAddHelpline(
    helpline: Omit<EmergencyHelpline, 'id' | 'updated_at'>,
    adminId: string,
    reason: string = 'Added verified emergency helpline',
    evidence: string = 'Official Government Directory'
  ): EmergencyHelpline | null {
    const isCallerAdmin =
      this.user.activeRole === 'ADMIN' ||
      this.user.roles.includes('ADMIN') ||
      adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action CREATE on helpline`);
      return null;
    }

    const validation = validateIndianPhoneNumber(helpline.number);
    if (!validation.isValid) {
      console.error(`Phone validation failed for ${helpline.number}: ${validation.error}`);
      return null;
    }

    const newH: EmergencyHelpline = {
      ...helpline,
      id: `hl-${Date.now()}`,
      updated_at: new Date().toISOString().slice(0, 10),
      enabled: helpline.enabled !== false
    };

    this.helplines.unshift(newH);
    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType: 'CREATE',
      targetModule: 'MEDICAL_HELPLINE',
      targetId: newH.id,
      targetName: newH.service_name,
      details: `Added new helpline: ${newH.service_name} (${newH.number}) [Scope: ${newH.scope}]`,
      newValue: newH,
      reason,
      evidenceSource: evidence
    } as any);

    this.persist();
    return newH;
  }

  public adminUpdateHelpline(
    id: string,
    updates: Partial<EmergencyHelpline>,
    adminId: string,
    reason: string = 'Updated helpline details',
    evidence: string = 'Official notification / periodic verification'
  ): boolean {
    const isCallerAdmin =
      this.user.activeRole === 'ADMIN' ||
      this.user.roles.includes('ADMIN') ||
      adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action EDIT on helpline ${id}`);
      return false;
    }

    const index = this.helplines.findIndex((h) => h.id === id);
    if (index === -1) return false;

    if (updates.number) {
      const validation = validateIndianPhoneNumber(updates.number);
      if (!validation.isValid) {
        console.error(`Phone validation failed for ${updates.number}: ${validation.error}`);
        return false;
      }
    }

    const prev = { ...this.helplines[index] };
    const updated: EmergencyHelpline = {
      ...this.helplines[index],
      ...updates,
      updated_at: new Date().toISOString().slice(0, 10)
    };
    this.helplines[index] = updated;

    let actionType: any = 'EDIT';
    if (updates.verification_status && updates.verification_status !== prev.verification_status) {
      actionType = updates.verification_status === 'VERIFIED' ? 'VERIFY' : 'UNVERIFY';
    } else if (updates.enabled !== undefined && updates.enabled !== prev.enabled) {
      actionType = updates.enabled ? 'ENABLE' : 'DISABLE';
    } else if (updates.source && updates.source !== prev.source) {
      actionType = 'REPLACE_SOURCE';
    } else if (updates.scope && updates.scope !== prev.scope) {
      actionType = 'CHANGE_SCOPE';
    }

    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType,
      targetModule: 'MEDICAL_HELPLINE',
      targetId: id,
      targetName: updated.service_name,
      details: `Updated helpline ${updated.service_name}: ${reason}`,
      previousValue: prev,
      newValue: updated,
      reason,
      evidenceSource: evidence
    } as any);

    this.persist();
    return true;
  }

  public adminDeleteHelpline(
    id: string,
    adminId: string,
    reason: string = 'Decommissioned helpline',
    evidence: string = 'Official government notice'
  ): boolean {
    const isCallerAdmin =
      this.user.activeRole === 'ADMIN' ||
      this.user.roles.includes('ADMIN') ||
      adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action DELETE on helpline ${id}`);
      return false;
    }

    const item = this.helplines.find((h) => h.id === id);
    if (!item) return false;

    this.helplines = this.helplines.filter((h) => h.id !== id);
    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType: 'DELETE',
      targetModule: 'MEDICAL_HELPLINE',
      targetId: id,
      targetName: item.service_name,
      details: `Deleted helpline ${item.service_name} (${item.number})`,
      previousValue: item,
      reason,
      evidenceSource: evidence
    } as any);

    this.persist();
    return true;
  }

  public adminAddMedicalFacility(
    facility: Omit<MedicalFacility, 'id'>,
    adminId: string,
    reason: string = 'Added verified medical facility',
    evidence: string = 'Healthcare Registry Verification'
  ): MedicalFacility | null {
    const isCallerAdmin =
      this.user.activeRole === 'ADMIN' ||
      this.user.roles.includes('ADMIN') ||
      adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action CREATE on medical facility`);
      return null;
    }

    const validation = validateIndianPhoneNumber(facility.phone);
    if (!validation.isValid) {
      console.error(`Phone validation failed for ${facility.phone}: ${validation.error}`);
      return null;
    }

    const newF: MedicalFacility = {
      ...facility,
      id: `fac-${Date.now()}`,
      verifiedAt: new Date().toISOString().slice(0, 10),
      enabled: facility.enabled !== false
    };

    this.facilities.unshift(newF);
    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType: 'CREATE',
      targetModule: 'MEDICAL_FACILITY',
      targetId: newF.id,
      targetName: newF.name,
      details: `Added new medical facility: ${newF.name} [${newF.type}] (${newF.phone})`,
      newValue: newF,
      reason,
      evidenceSource: evidence
    } as any);

    this.persist();
    return newF;
  }

  public adminUpdateMedicalFacility(
    id: string,
    updates: Partial<MedicalFacility>,
    adminId: string,
    reason: string = 'Updated medical facility details',
    evidence: string = 'Healthcare authority verification'
  ): boolean {
    const isCallerAdmin =
      this.user.activeRole === 'ADMIN' ||
      this.user.roles.includes('ADMIN') ||
      adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action EDIT on facility ${id}`);
      return false;
    }

    const index = this.facilities.findIndex((f) => f.id === id);
    if (index === -1) return false;

    if (updates.phone) {
      const validation = validateIndianPhoneNumber(updates.phone);
      if (!validation.isValid) {
        console.error(`Phone validation failed for ${updates.phone}: ${validation.error}`);
        return false;
      }
    }

    const prev = { ...this.facilities[index] };
    const updated: MedicalFacility = {
      ...this.facilities[index],
      ...updates
    };
    this.facilities[index] = updated;

    let actionType: any = 'EDIT';
    if (updates.verificationStatus && updates.verificationStatus !== prev.verificationStatus) {
      actionType = updates.verificationStatus === 'VERIFIED' ? 'VERIFY' : 'UNVERIFY';
    } else if (updates.enabled !== undefined && updates.enabled !== prev.enabled) {
      actionType = updates.enabled ? 'ENABLE' : 'DISABLE';
    } else if (updates.source && updates.source !== prev.source) {
      actionType = 'REPLACE_SOURCE';
    }

    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType,
      targetModule: 'MEDICAL_FACILITY',
      targetId: id,
      targetName: updated.name,
      details: `Updated facility ${updated.name}: ${reason}`,
      previousValue: prev,
      newValue: updated,
      reason,
      evidenceSource: evidence
    } as any);

    this.persist();
    return true;
  }

  public adminDeleteMedicalFacility(
    id: string,
    adminId: string,
    reason: string = 'Removed facility listing',
    evidence: string = 'Facility closure notice'
  ): boolean {
    const isCallerAdmin =
      this.user.activeRole === 'ADMIN' ||
      this.user.roles.includes('ADMIN') ||
      adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action DELETE on facility ${id}`);
      return false;
    }

    const item = this.facilities.find((f) => f.id === id);
    if (!item) return false;

    this.facilities = this.facilities.filter((f) => f.id !== id);
    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType: 'DELETE',
      targetModule: 'MEDICAL_FACILITY',
      targetId: id,
      targetName: item.name,
      details: `Deleted facility ${item.name} (${item.phone})`,
      previousValue: item,
      reason,
      evidenceSource: evidence
    } as any);

    this.persist();
    return true;
  }

  // Market Comparison
  public getMarketComparison(): CropMarketComparison {
    return this.selectedCropComparison;
  }

  // Bookings & Workflow
  public getBookings(): Booking[] {
    return this.bookings;
  }

  public hasBookingConflict(providerId: string, scheduledDate: string, scheduledTime: string): boolean {
    return this.bookings.some(
      b => b.providerId === providerId &&
           b.scheduledDate === scheduledDate &&
           b.scheduledTime === scheduledTime &&
           (b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS')
    );
  }

  public async createBooking(data: {
    category: 'FARM' | 'WORK' | 'MOVE';
    serviceTitle: string;
    providerId: string;
    providerName: string;
    providerContact?: string;
    pickupLocation?: string;
    destinationLocation?: string;
    scheduledDate: string;
    scheduledTime: string;
    priceEstimate: string;
    paymentMethod?: 'ONLINE' | 'CASH';
    loadDetails?: string;
    notes?: string;
    status?: BookingStatus;
  }): Promise<Booking> {
    const prefix = data.category === 'WORK' ? 'OS-WRK' : data.category === 'FARM' ? 'OS-FRM' : 'OS-MOV';
    const newId = `${prefix}-${Date.now().toString().slice(-4)}`;
    const txHash = await generateSha256(`${newId}-${data.serviceTitle}-${this.user.id}`);

    const booking: Booking = {
      id: newId,
      customerId: this.user.id,
      customerName: this.user.name,
      ...data,
      status: data.status || 'REQUESTED',
      paymentStatus: 'PAYMENT_PENDING',
      paymentMethod: data.paymentMethod || 'CASH',
      blockchainTxHash: txHash,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.bookings.unshift(booking);

    // Register on simulated blockchain ledger
    this.blockchainRecords.unshift({
      txHash,
      blockNumber: 18492000 + (Date.now() % 1000),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      eventType: 'BOOKING_CREATION',
      entityId: newId,
      entityName: `${data.serviceTitle} with ${data.providerName}`,
      payloadHash: await generateSha256(JSON.stringify(booking)),
      status: 'MINED',
      explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
      details: {
        category: data.category,
        customer: this.user.name,
        provider: data.providerName,
        priceEstimate: data.priceEstimate,
        paymentMethod: booking.paymentMethod,
        scheduledDate: data.scheduledDate,
        smartContract: '0x71C25eFa42...B684 (OneSetuTrust.sol)'
      }
    });

    this.addNotification({
      title: 'Booking Request Submitted',
      message: `Booking #${newId} with ${data.providerName} registered. Status: REQUESTED.`,
      category: 'BOOKING',
      targetScreen: 'bookings',
      referenceId: newId,
      actionLabel: 'Track Booking'
    });

    this.persist();
    return booking;
  }

  public async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    rejectionReason?: string
  ): Promise<Booking | null> {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    // State machine transition validation (Section 22)
    const current = booking.status;
    const isValidTransition =
      (current === 'REQUESTED' && (status === 'ACCEPTED' || status === 'REJECTED' || status === 'CANCELLED')) ||
      (current === 'ACCEPTED' && (status === 'IN_PROGRESS' || status === 'CANCELLED')) ||
      (current === 'IN_PROGRESS' && (status === 'COMPLETED' || status === 'CANCELLED')) ||
      (current === status);

    if (!isValidTransition) {
      console.warn(`Invalid booking state transition from ${current} to ${status}`);
      return null;
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString().split('T')[0];
    if (rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }

    // If completed, anchor cryptographic completion proof on-chain
    if (status === 'COMPLETED' && !booking.blockchainBlock) {
      const completionHash = await generateSha256(`COMPLETED-${booking.id}-${Date.now()}`);
      booking.blockchainTxHash = completionHash;
      booking.blockchainBlock = 18492200 + ((Date.now() + 100) % 1000);

      this.blockchainRecords.unshift({
        txHash: completionHash,
        blockNumber: booking.blockchainBlock,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        eventType: 'BOOKING_COMPLETION',
        entityId: booking.id,
        entityName: `${booking.serviceTitle} - Completed`,
        payloadHash: await generateSha256(`PROOF-${booking.id}`),
        status: 'MINED',
        explorerUrl: `https://sepolia.etherscan.io/tx/${completionHash}`,
        details: {
          bookingId: booking.id,
          customer: booking.customerName,
          provider: booking.providerName,
          finalStatus: 'COMPLETED',
          timestamp: booking.updatedAt,
          smartContract: '0x71C25eFa42...B684 (OneSetuTrust.sol)'
        }
      });
    }

    this.addNotification({
      title: `Booking ${status}`,
      message: `Booking #${booking.id} status updated to ${status}.`,
      category: 'BOOKING',
      targetScreen: 'bookings',
      referenceId: booking.id,
      actionLabel: 'View Details'
    });

    this.persist();
    return booking;
  }

  public confirmBookingCompletion(bookingId: string): boolean {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking || booking.status !== 'COMPLETED') return false;

    booking.customerConfirmedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public rateBooking(bookingId: string, rating: number, reviewComment?: string): boolean {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    if (booking.status !== 'COMPLETED') return false;
    if (booking.ratedAt) return false; // Prevent duplicate rating (Section 31)

    booking.rating = rating;
    booking.reviewComment = reviewComment;
    booking.ratedAt = new Date().toISOString();

    // Also update provider rating stats
    const provider = this.providers.find(p => p.id === booking.providerId);
    if (provider) {
      const newReviewCount = provider.reviewCount + 1;
      const newAvgRating = Number(((provider.rating * provider.reviewCount + rating) / newReviewCount).toFixed(1));
      provider.rating = newAvgRating;
      provider.reviewCount = newReviewCount;
    }

    this.persist();
    return true;
  }

  public updateBookingPayment(
    bookingId: string,
    method: 'ONLINE' | 'CASH',
    status: PaymentStatus,
    amount?: number,
    txId?: string
  ): boolean {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    booking.paymentMethod = method;
    booking.paymentStatus = status;
    if (amount) booking.paymentAmount = amount;
    if (txId) booking.paymentTxId = txId;
    booking.paymentDate = new Date().toISOString().split('T')[0];

    this.persist();
    return true;
  }

  /**
   * Unified Payment Processing (Section 46 to 53)
   * Handles ONLINE payment completion and CASH payment confirmation.
   */
  public async recordPayment(
    bookingId: string,
    method: 'ONLINE' | 'CASH',
    amount: number
  ): Promise<Booking | null> {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    const txId = method === 'ONLINE'
      ? `PAY-ONL-${Date.now().toString(36).toUpperCase()}`
      : `CASH-REC-${Date.now().toString(36).toUpperCase()}`;

    booking.paymentMethod = method;
    booking.paymentStatus = method === 'ONLINE' ? 'PAID_ONLINE' : 'PAID_CASH';
    booking.paymentAmount = amount;
    booking.paymentTxId = txId;
    booking.paymentDate = new Date().toISOString().split('T')[0];

    const paymentProofHash = await generateSha256(`PAYMENT-${txId}-${amount}-${booking.id}`);

    // Anchor payment receipt on blockchain ledger
    this.blockchainRecords.unshift({
      txHash: paymentProofHash,
      blockNumber: 18492400 + (Date.now() % 500),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      eventType: 'EQUIPMENT_ESCROW',
      entityId: txId,
      entityName: `Payment Receipt: ${booking.serviceTitle}`,
      payloadHash: await generateSha256(`PAY-RECEIPT-${txId}`),
      status: 'MINED',
      explorerUrl: `https://sepolia.etherscan.io/tx/${paymentProofHash}`,
      details: {
        paymentTxId: txId,
        bookingId: booking.id,
        amount: `₹${amount}`,
        method: method,
        status: booking.paymentStatus,
        customer: booking.customerName,
        provider: booking.providerName,
        smartContract: '0x71C25eFa42...B684 (OneSetuTrust.sol)'
      }
    });

    this.addNotification({
      title: method === 'ONLINE' ? 'Payment Verified (Online)' : 'Cash Payment Confirmed',
      message: `Payment of ₹${amount} for booking #${booking.id} recorded (${txId}).`,
      category: 'PAYMENT'
    });

    this.persist();
    return booking;
  }

  // Notifications & Alert System (Section 61 / 21)
  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }) {
    // Check user preferences before persisting
    if (notif.category === 'BOOKING' && !this.notificationPreferences.bookingAlerts) {
      return;
    }
    if (notif.category === 'MARKETPLACE' && !this.notificationPreferences.marketplaceAlerts) {
      return;
    }
    if (notif.category === 'PRICE_ALERT' && !this.notificationPreferences.priceAlerts) {
      return;
    }
    if (this.notificationPreferences.onlyMyArea && notif.location && !this.isLocationInUserArea(notif.location)) {
      return;
    }

    const newN: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${this.notifications.length + 1}`,
      read: notif.read ?? false,
      timestamp: notif.timestamp || 'Just now',
      createdAt: notif.createdAt || new Date().toISOString()
    };
    this.notifications.unshift(newN);
    this.persist();
  }

  public markNotificationRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    this.persist();
  }

  public markAllNotificationsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.persist();
  }

  public deleteNotification(id: string): boolean {
    const prevLen = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    if (this.notifications.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.persist();
  }

  public getNotificationPreferences(): NotificationPreferences {
    return { ...this.notificationPreferences };
  }

  public updateNotificationPreferences(prefs: Partial<NotificationPreferences>) {
    this.notificationPreferences = { ...this.notificationPreferences, ...prefs };
    this.persist();
  }

  public isLocationInUserArea(location?: string): boolean {
    if (!location) return false;
    const userDistrict = this.user.location.split(',')[0].trim().toLowerCase();
    const locLower = location.toLowerCase();
    return locLower.includes(userDistrict) || userDistrict.includes(locLower.split(',')[0].trim());
  }

  public simulateLiveBookingNotification() {
    const sampleStatuses: { title: string; msg: string; action: string }[] = [
      {
        title: 'Equipment Operator En Route',
        msg: 'Venkatesh Gowda has dispatched operator with Mahindra 575 DI Tractor to your farm.',
        action: 'Track Operator'
      },
      {
        title: 'Transport Request Accepted',
        msg: 'Tata Ace Mini Truck driver Ramesh Kumar accepted your cargo trip to Bandipalya APMC.',
        action: 'View Trip'
      },
      {
        title: 'Electrical Service Completed',
        msg: 'Ramesh Electrical Services completed water pump wiring. Escrow payment pending confirmation.',
        action: 'Inspect & Pay'
      },
      {
        title: 'Booking Confirmed by Provider',
        msg: 'Service provider Shiva Plumber confirmed your irrigation valve repair for tomorrow.',
        action: 'View Details'
      }
    ];
    const pick = sampleStatuses[Date.now() % sampleStatuses.length];
    this.addNotification({
      title: pick.title,
      message: pick.msg,
      category: 'BOOKING',
      location: this.user.location,
      targetScreen: 'bookings',
      actionLabel: pick.action
    });
  }

  public simulateLiveMarketplaceListingNotification() {
    const userDistrict = this.user.location.split(',')[0].trim() || 'Mysuru';
    const sampleListings: { title: string; msg: string; tab: 'produce' | 'rent' | 'used'; action: string }[] = [
      {
        title: `Fresh Tomato Harvest in ${userDistrict}`,
        msg: `High-grade Hybrid Tomato (400 kg @ ₹23/kg) just listed by farmer Suresh Kumar in ${userDistrict}.`,
        tab: 'produce',
        action: 'Buy Direct'
      },
      {
        title: `Kubota Harvester in ${userDistrict}`,
        msg: `Combine Harvester available for rental booking at ₹1,800/hr in ${userDistrict}.`,
        tab: 'rent',
        action: 'Rent Harvester'
      },
      {
        title: `Pre-Owned Rotavator in ${userDistrict}`,
        msg: `Shaktiman 6ft Rotary Tiller listed for farmer purchase at ₹85,000 in ${userDistrict}.`,
        tab: 'used',
        action: 'Inspect Machine'
      },
      {
        title: `Paddy Seed Grain in ${userDistrict}`,
        msg: `Certified Jyothi Paddy Seeds (15 Quintals @ ₹2,200/quintal) ready for dispatch in ${userDistrict}.`,
        tab: 'produce',
        action: 'View Seed Grain'
      }
    ];
    const pick = sampleListings[Date.now() % sampleListings.length];
    this.addNotification({
      title: pick.title,
      message: pick.msg,
      category: 'MARKETPLACE',
      location: `${userDistrict}, Karnataka`,
      targetScreen: 'farm',
      targetTab: pick.tab,
      actionLabel: pick.action,
      badgeText: 'New in your area'
    });
  }

  // Blockchain Ledger
  public getBlockchainRecords(): BlockchainRecord[] {
    return this.blockchainRecords;
  }

  // Search State
  public getSearchQuery(): string {
    return this.currentSearchQuery;
  }

  public setSearchQuery(query: string) {
    this.currentSearchQuery = query;
    this.notify();
  }

  public getCategoryFilter(): string {
    return this.selectedCategoryFilter;
  }

  public setCategoryFilter(filter: string) {
    this.selectedCategoryFilter = filter;
    this.notify();
  }

  private adminActionLogs: AdminActionLog[] = [
    {
      id: 'aal-1',
      adminId: 'usr-ravi-01',
      adminRole: 'ADMIN',
      actionType: 'APPROVE',
      targetModule: 'SALE_POINT',
      targetId: 'fps-1',
      targetName: 'Tomato - Ravi Farms',
      details: 'Quality verification passed. Certified organic farm harvest.',
      timestamp: '2026-09-28 10:15 IST'
    },
    {
      id: 'aal-2',
      adminId: 'usr-ravi-01',
      adminRole: 'ADMIN',
      actionType: 'APPROVE',
      targetModule: 'EQUIPMENT_RENT',
      targetId: 'eq-1',
      targetName: 'Mahindra 575 DI Tractor',
      details: 'Commercial tractor RC document verified.',
      timestamp: '2026-09-28 11:30 IST'
    }
  ];

  private marketDataAuditLogs: MarketDataAudit[] = [
    {
      id: 'mda-1',
      commodity: 'Tomato',
      market: 'Mysuru (Bandipalya APMC)',
      fieldChanged: 'modalPrice',
      previousValue: 2300,
      newValue: 2400,
      editorId: 'usr-ravi-01',
      editorRole: 'OPERATOR',
      reason: 'Evening physical mandi closing arrival auction tally',
      evidenceSource: 'Bandipalya APMC Physical Gate Sheet #491',
      timestamp: '2026-09-28 17:45 IST'
    }
  ];

  public getAdminActionLogs(): AdminActionLog[] {
    return this.adminActionLogs;
  }

  public addAdminActionLog(log: Omit<AdminActionLog, 'id' | 'timestamp'>): AdminActionLog {
    const newLog: AdminActionLog = {
      ...log,
      id: `aal-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST'
    };
    this.adminActionLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  public getMarketDataAuditLogs(): MarketDataAudit[] {
    return this.marketDataAuditLogs;
  }

  public addMarketDataAudit(audit: Omit<MarketDataAudit, 'id' | 'timestamp'>): MarketDataAudit {
    const newAudit: MarketDataAudit = {
      ...audit,
      id: `mda-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST'
    };
    this.marketDataAuditLogs.unshift(newAudit);
    this.persist();
    return newAudit;
  }

  // Admin moderation for Farmer Sales Point products
  public adminUpdateFarmerProduct(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'HIDE' | 'RESTORE' | 'DELETE' | 'EDIT',
    adminId: string,
    updates?: Partial<FarmerProduct>,
    reason?: string
  ): boolean {
    // Security check: caller must be ADMIN
    const isCallerAdmin = this.user.activeRole === 'ADMIN' || this.user.roles.includes('ADMIN') || adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action ${action} on produce ${id}`);
      return false;
    }

    const prod = this.farmerProducts.find(p => p.id === id);
    if (!prod) return false;

    const prevValue = { ...prod };

    if (action === 'DELETE') {
      this.farmerProducts = this.farmerProducts.filter(p => p.id !== id);
    } else if (action === 'APPROVE') {
      prod.verified = true;
      prod.status = 'ACTIVE';
    } else if (action === 'REJECT') {
      prod.verified = false;
      prod.status = 'INACTIVE';
    } else if (action === 'HIDE') {
      prod.status = 'INACTIVE';
    } else if (action === 'RESTORE') {
      prod.status = 'ACTIVE';
    } else if (action === 'EDIT' && updates) {
      Object.assign(prod, updates);
    }

    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType: action as any,
      targetModule: 'SALE_POINT',
      targetId: id,
      targetName: prod.productName,
      details: reason || `Admin performed ${action} on produce listing ${prod.productName}.`,
      previousValue: prevValue,
      newValue: action === 'DELETE' ? null : prod
    });

    this.persist();
    return true;
  }

  // Admin moderation for Equipment (Rent & Used)
  public adminUpdateEquipment(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'HIDE' | 'RESTORE' | 'DELETE' | 'EDIT' | 'PHOTO_UPDATE',
    adminId: string,
    updates?: Partial<EquipmentItem>,
    reason?: string
  ): boolean {
    // Security check: caller must be ADMIN
    const isCallerAdmin = this.user.activeRole === 'ADMIN' || this.user.roles.includes('ADMIN') || adminId === 'usr-admin';
    if (!isCallerAdmin) {
      console.error(`Unauthorized access: User ${adminId} attempted admin action ${action} on equipment ${id}`);
      return false;
    }

    const eq = this.equipment.find(e => e.id === id);
    if (!eq) return false;

    const prevValue = { ...eq };
    const targetModule = eq.isUsedEquipmentSale ? 'USED_EQUIPMENT' : 'EQUIPMENT_RENT';

    if (action === 'DELETE') {
      this.equipment = this.equipment.filter(e => e.id !== id);
    } else if (action === 'APPROVE') {
      eq.verified = true;
    } else if (action === 'REJECT') {
      eq.verified = false;
    } else if (action === 'HIDE') {
      eq.availability = 'Booked';
    } else if (action === 'RESTORE') {
      eq.availability = 'Available';
    } else if (action === 'EDIT' || action === 'PHOTO_UPDATE') {
      if (updates) Object.assign(eq, updates);
    }

    this.addAdminActionLog({
      adminId,
      adminRole: 'ADMIN',
      actionType: action as any,
      targetModule,
      targetId: id,
      targetName: eq.equipmentName,
      details: reason || `Admin updated ${targetModule} item ${eq.equipmentName}.`,
      previousValue: prevValue,
      newValue: action === 'DELETE' ? null : eq
    });

    this.persist();
    return true;
  }

  // Dedicated Photo Management for Admin
  public adminUpdatePhotos(
    targetModule: 'EQUIPMENT_RENT' | 'USED_EQUIPMENT' | 'SALE_POINT',
    targetId: string,
    photos: string[],
    primaryPhotoUrl: string,
    adminId: string
  ): boolean {
    const isCallerAdmin = this.user.activeRole === 'ADMIN' || this.user.roles.includes('ADMIN') || adminId === 'usr-admin';
    if (!isCallerAdmin) return false;

    if (targetModule === 'SALE_POINT') {
      const prod = this.farmerProducts.find(p => p.id === targetId);
      if (!prod) return false;
      prod.primaryImageUrl = primaryPhotoUrl;
      prod.imageUrls = photos;
      this.persist();
      this.addAdminActionLog({
        adminId,
        adminRole: 'ADMIN',
        actionType: 'PHOTO_UPDATE',
        targetModule: 'SALE_POINT',
        targetId,
        targetName: prod.productName,
        details: `Updated ${photos.length} photos with new primary photo.`
      });
      return true;
    } else {
      const eq = this.equipment.find(e => e.id === targetId);
      if (!eq) return false;
      eq.primaryImageUrl = primaryPhotoUrl;
      eq.image = primaryPhotoUrl;
      eq.imageUrls = photos;
      this.persist();
      this.addAdminActionLog({
        adminId,
        adminRole: 'ADMIN',
        actionType: 'PHOTO_UPDATE',
        targetModule,
        targetId,
        targetName: eq.equipmentName,
        details: `Updated ${photos.length} photos with new primary photo.`
      });
      return true;
    }
  }


  // Reset to default datasets
  public resetToDefaults() {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    this.user = { ...initialUser };
    this.produce = [...initialProduce];
    this.farmerProducts = [...initialFarmerProducts];
    this.equipment = [...initialEquipment];
    this.providers = [...initialProviders];
    this.vehicles = [...initialVehicles];
    this.bookings = [...initialBookings];
    this.blockchainRecords = [...initialBlockchainRecords];
    this.notifications = [...initialNotifications];
    this.emergencyList = [...emergencyContacts];
    this.hospitalList = [...nearbyHospitals];
    this.helplines = [...INITIAL_VERIFIED_HELPLINES];
    this.facilities = [...INITIAL_VERIFIED_FACILITIES];
    this.currentScreen = 'home';
    this.currentSearchQuery = '';
    this.notify();
  }
}

export const store = new AppStore();

