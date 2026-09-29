import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { authService } from '../../services/authService';
import { marketDataService } from '../../services/marketDataService';
import { FarmerProductImageResolver } from '../../services/productImages';
import { EquipmentImageResolver } from '../../services/equipmentImages';
import { EquipmentItem, FarmerProduct, EmergencyHelpline, MedicalFacility, UserRole } from '../../types';
import { AdminEditEquipmentModal } from '../modals/AdminEditEquipmentModal';
import { AdminManagePhotosModal } from '../modals/AdminManagePhotosModal';
import { CreateFarmerSalesProductModal } from '../modals/CreateFarmerSalesProductModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Tractor,
  Truck,
  PhoneCall,
  Search,
  Check,
  X,
  Database,
  RotateCcw,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Wheat,
  Tag,
  History,
  Lock,
  Camera,
  Image as ImageIcon,
  Hospital,
  Plus,
  Phone,
  BarChart3,
  Settings as SettingsIcon
} from 'lucide-react';

export const AdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'market_data'
    | 'sale_point'
    | 'equipment_rent'
    | 'used_equipment'
    | 'providers'
    | 'medical_resources'
    | 'photos'
    | 'audit_logs'
    | 'settings'
  >('dashboard');

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Admin Modal States
  const [adminEditingEquipment, setAdminEditingEquipment] = useState<EquipmentItem | null>(null);
  const [adminEditingProduce, setAdminEditingProduce] = useState<FarmerProduct | null>(null);
  const [adminPhotosTarget, setAdminPhotosTarget] = useState<{
    targetModule: 'EQUIPMENT_RENT' | 'USED_EQUIPMENT' | 'SALE_POINT';
    targetId: string;
    targetTitle: string;
    initialPhotos: string[];
    initialPrimaryPhoto?: string;
  } | null>(null);

  // Operator price correction modal
  const [operatorRecordId, setOperatorRecordId] = useState('');
  const [operatorNewPrice, setOperatorNewPrice] = useState('25');
  const [operatorReason, setOperatorReason] = useState('');
  const [operatorEvidence, setOperatorEvidence] = useState('');

  const [, setTick] = useState(0);
  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      const token = authService.getToken() || '';
      const res = await authService.getAdminUsersList(token);
      if (isMounted && res.success && res.users) {
        setAdminUsers(res.users);
      }
    };
    loadUsers();

    const unsubStore = store.subscribe(() => {
      setTick((t) => t + 1);
      loadUsers();
    });
    const unsubMarket = marketDataService.subscribe(() => setTick((t) => t + 1));
    return () => {
      isMounted = false;
      unsubStore();
      unsubMarket();
    };
  }, []);

  const handleToggleUserStatus = async (targetId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    const token = authService.getToken() || '';
    const res = await authService.setAdminUserStatus(token, targetId, newStatus);
    if (res.success) {
      setActionFeedback(`User status updated to ${newStatus}`);
      const updated = await authService.getAdminUsersList(token);
      if (updated.success && updated.users) setAdminUsers(updated.users);
    } else {
      setActionFeedback(res.error || 'Failed to update user status');
    }
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleUpdateUserRole = async (targetId: string, newRole: UserRole) => {
    const token = authService.getToken() || '';
    const res = await authService.setAdminUserRole(token, targetId, newRole);
    if (res.success) {
      setActionFeedback(`User role changed to ${newRole}`);
      const updated = await authService.getAdminUsersList(token);
      if (updated.success && updated.users) setAdminUsers(updated.users);
    } else {
      setActionFeedback(res.error || 'Failed to update user role');
    }
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const user = store.getUser();
  const isAdmin = user.activeRole === 'ADMIN' || user.roles.includes('ADMIN');

  const providers = store.getProviders();
  const farmerProducts = store.getFarmerProducts();
  const equipment = store.getEquipment();
  const rentalEquipment = equipment.filter((e) => !e.isUsedEquipmentSale);
  const usedEquipment = equipment.filter((e) => e.isUsedEquipmentSale);
  const syncStatus = marketDataService.getSyncStatus();
  const marketRecords = marketDataService.getPrices();
  const adminLogs = store.getAdminActionLogs();
  const marketAudits = store.getMarketDataAuditLogs();
  const allHelplines = store.getAllHelplinesAdmin();
  const allFacilities = store.getAllFacilitiesAdmin();

  // Medical Admin State
  const [medicalSubTab, setMedicalSubTab] = useState<'helplines' | 'facilities'>('helplines');
  const [editingHelpline, setEditingHelpline] = useState<EmergencyHelpline | null>(null);
  const [isAddHelplineModalOpen, setIsAddHelplineModalOpen] = useState(false);
  const [helplineForm, setHelplineForm] = useState({
    service_name: '',
    number: '',
    category: 'Ambulance' as any,
    scope: 'NATIONAL' as any,
    availability: '24x7 Toll Free',
    description: '',
    source: '',
    source_url: '',
    reason: 'Admin helpline registry update',
    evidence: 'Official Government Directory'
  });

  const [editingFacility, setEditingFacility] = useState<MedicalFacility | null>(null);
  const [isAddFacilityModalOpen, setIsAddFacilityModalOpen] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'Hospital' as any,
    address: '',
    city: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    phone: '',
    hasEmergencyDepartment: true,
    is24x7: true,
    openingHours: '24 Hours',
    specialties: 'Emergency Medicine, Trauma Care',
    distanceKm: 2.5,
    source: 'Karnataka State Health Dept',
    reason: 'Admin facility registry update',
    evidence: 'Healthcare Establishment Licensing'
  });

  const handleToggleHelplineStatus = (id: string, currentEnabled: boolean) => {
    store.adminUpdateHelpline(
      id,
      { enabled: !currentEnabled },
      user.id,
      `Toggled helpline active status to ${!currentEnabled}`,
      'Administrative moderation'
    );
    setActionFeedback('Helpline status updated.');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleToggleHelplineVerification = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED';
    store.adminUpdateHelpline(
      id,
      { verification_status: nextStatus as any, verified_at: new Date().toISOString().slice(0, 10) },
      user.id,
      `Updated verification status to ${nextStatus}`,
      'Verified with authoritative source'
    );
    setActionFeedback(`Helpline verification updated to ${nextStatus}.`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleDeleteHelpline = (id: string, name: string) => {
    store.adminDeleteHelpline(
      id,
      user.id,
      'Administrative decommission of emergency number',
      'Official government gazette'
    );
    setActionFeedback(`Helpline ${name} deleted.`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleToggleFacilityVerification = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED';
    store.adminUpdateMedicalFacility(
      id,
      { verificationStatus: nextStatus as any, verifiedAt: new Date().toISOString().slice(0, 10) },
      user.id,
      `Updated facility verification to ${nextStatus}`,
      'Hospital inspection and licensing check'
    );
    setActionFeedback(`Facility verification updated to ${nextStatus}.`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleToggleFacilityStatus = (id: string, currentEnabled: boolean) => {
    store.adminUpdateMedicalFacility(
      id,
      { enabled: !currentEnabled },
      user.id,
      `Toggled facility active status to ${!currentEnabled}`,
      'Administrative listing moderation'
    );
    setActionFeedback('Facility status updated.');
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleDeleteFacility = (id: string, name: string) => {
    store.adminDeleteMedicalFacility(
      id,
      user.id,
      'Facility decommissioned or unlisted',
      'Hospital registry notification'
    );
    setActionFeedback(`Facility ${name} removed.`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleToggleVerify = (id: string, current: boolean) => {
    store.toggleProviderVerification(id, !current);
  };

  const handleAdminSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const result = await marketDataService.syncMarketData('Mysuru');
    setIsSyncing(false);
    if (result.currentSyncStatus === 'SUCCESS') {
      setSyncFeedback(`Successfully synchronized ${result.recordsAccepted} daily records from Government OGD / AGMARKNET!`);
    } else {
      setSyncFeedback(`Sync encountered an issue: ${result.lastError}`);
    }
  };

  const handleFarmerProductAction = (id: string, action: 'APPROVE' | 'REJECT' | 'HIDE' | 'RESTORE' | 'DELETE') => {
    store.adminUpdateFarmerProduct(id, action, user.id);
    setActionFeedback(`Produce listing #${id} updated: ${action}`);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handleEquipmentAction = (id: string, action: 'APPROVE' | 'REJECT' | 'HIDE' | 'RESTORE' | 'DELETE') => {
    store.adminUpdateEquipment(id, action, user.id);
    setActionFeedback(`Equipment listing #${id} updated: ${action}`);
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const handlePriceCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(operatorNewPrice);
    if (!operatorRecordId || isNaN(price) || price <= 0) return;

    marketDataService.updatePriceRecord(
      operatorRecordId,
      'modalPrice',
      price,
      user.id,
      'ADMIN',
      operatorReason || 'Admin quality audit adjustment',
      operatorEvidence || 'Verified APMC Gate Observation'
    );

    setActionFeedback(`Market record updated to ₹${price}/kg with audit log entry.`);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  // Role Access Guard
  const isAuthorizedAdmin = (user.activeRole === 'ADMIN' || (user.roles && user.roles.includes('ADMIN'))) && (authService.isAuthenticated() ? authService.isAdmin() : true);
  if (!isAuthorizedAdmin) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-6 text-center select-none space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">ADMIN ACCESS REQUIRED</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Administrator privileges required. You must sign in with a verified administrator account.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => store.navigateTo('admin-login')}
            className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Sign In as Admin
          </button>
          <button
            onClick={() => store.navigateTo('home')}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Header */}
      <div className="bg-indigo-950 text-white px-4 pt-7 pb-3.5 rounded-b-[28px] shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>ONESETU Admin</span>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </h2>
            <p className="text-[10px] text-indigo-200 mt-0.5">
              Market Rate Pipeline, Moderation & Audit Ledger
            </p>
          </div>
          <span className="text-[9px] font-black bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-md uppercase">
            Admin Mode
          </span>
        </div>

        {/* Tab Pills */}
        <div className="mt-3.5 p-1 bg-indigo-900/70 rounded-xl flex gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Users ({adminUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('market_data')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'market_data'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Market Rate
          </button>
          <button
            onClick={() => setActiveTab('sale_point')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'sale_point'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Sale Point ({farmerProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('equipment_rent')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'equipment_rent'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Rental ({rentalEquipment.length})
          </button>
          <button
            onClick={() => setActiveTab('used_equipment')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'used_equipment'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Used ({usedEquipment.length})
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'providers'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Providers ({providers.length})
          </button>
          <button
            onClick={() => setActiveTab('medical_resources')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'medical_resources'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Medical ({allHelplines.length + allFacilities.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'photos'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Photos ({rentalEquipment.length + farmerProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'audit_logs'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Audit Logs ({adminLogs.length + marketAudits.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 px-2.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {actionFeedback && (
          <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* 0. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                    ONESETU CONTROL DASHBOARD
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Unified Local Needs, Service Governance & Trust Ecosystem
                  </p>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  AUTHENTICATED
                </span>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div
                  onClick={() => setActiveTab('users')}
                  className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl cursor-pointer hover:bg-indigo-100/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-900 uppercase">Users</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xl font-black text-indigo-950 mt-1">{adminUsers.length}</div>
                  <div className="text-[10px] text-indigo-700 mt-0.5">Accounts configured</div>
                </div>

                <div
                  onClick={() => setActiveTab('market_data')}
                  className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl cursor-pointer hover:bg-emerald-100/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase">Mandi Rates</span>
                    <Database className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-emerald-950 mt-1">{marketRecords.length}</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Official AGMARKNET</div>
                </div>

                <div
                  onClick={() => setActiveTab('sale_point')}
                  className="bg-amber-50/70 border border-amber-100 p-3 rounded-2xl cursor-pointer hover:bg-amber-100/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Produce</span>
                    <Wheat className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xl font-black text-amber-950 mt-1">{farmerProducts.length}</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">Farmer Direct Sale</div>
                </div>

                <div
                  onClick={() => setActiveTab('equipment_rent')}
                  className="bg-sky-50/70 border border-sky-100 p-3 rounded-2xl cursor-pointer hover:bg-sky-100/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-900 uppercase">Rent Fleet</span>
                    <Tractor className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-xl font-black text-sky-950 mt-1">{rentalEquipment.length}</div>
                  <div className="text-[10px] text-sky-700 mt-0.5">Verified Machinery</div>
                </div>

                <div
                  onClick={() => setActiveTab('medical_resources')}
                  className="bg-rose-50/70 border border-rose-100 p-3 rounded-2xl cursor-pointer hover:bg-rose-100/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-900 uppercase">Medical</span>
                    <Hospital className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="text-xl font-black text-rose-950 mt-1">
                    {allHelplines.length + allFacilities.length}
                  </div>
                  <div className="text-[10px] text-rose-700 mt-0.5">Emergency & Hospitals</div>
                </div>

                <div
                  onClick={() => setActiveTab('audit_logs')}
                  className="bg-purple-50/70 border border-purple-100 p-3 rounded-2xl cursor-pointer hover:bg-purple-100/70 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-900 uppercase">Audits</span>
                    <History className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-xl font-black text-purple-950 mt-1">
                    {adminLogs.length + marketAudits.length}
                  </div>
                  <div className="text-[10px] text-purple-700 mt-0.5">Provenance Logs</div>
                </div>
              </div>
            </div>

            {/* Quick Moderation Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quick Administrative Actions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 text-left transition-all"
                >
                  <Users className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="font-bold text-slate-800 block">Manage Users</span>
                  <span className="text-[10px] text-slate-500">Enable/disable & change roles</span>
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 text-left transition-all"
                >
                  <Camera className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="font-bold text-slate-800 block">Photo Control</span>
                  <span className="text-[10px] text-slate-500">Moderate Farm & Equipment</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 0.1 USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-700" />
                    <span>USER ACCOUNT GOVERNANCE</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Server-Verified User Registry with Role & Status Controls
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {adminUsers.length} Users
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search user by name, email, or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* User List */}
              <div className="space-y-2.5 pt-1">
                {adminUsers
                  .filter(
                    (u) =>
                      !userSearchTerm ||
                      u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      u.phone?.includes(userSearchTerm)
                  )
                  .map((u) => {
                    const isRootAdmin = u.id === 'usr-admin-01';
                    const isDisabled = u.status === 'DISABLED';
                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDisabled ? 'bg-slate-100 border-slate-300 opacity-70' : 'bg-slate-50/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                  u.activeRole === 'ADMIN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : u.activeRole === 'FARMER'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.activeRole === 'WORKER'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {u.activeRole}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  isDisabled ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                                }`}
                              >
                                {u.status || 'ACTIVE'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5 font-mono">
                              <div>ID: {u.id}</div>
                              <div>Email: {u.email}</div>
                              <div>Phone: {u.phone}</div>
                              <div>Created: {u.createdAt}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          {!isRootAdmin && (
                            <div className="flex flex-col gap-1.5 items-end">
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                  isDisabled
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                                }`}
                              >
                                {isDisabled ? 'Enable' : 'Disable'}
                              </button>

                              {/* Role Selector */}
                              <select
                                value={u.activeRole}
                                onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                                className="text-[10px] font-bold bg-white border border-slate-300 rounded-md px-1 py-0.5 text-slate-700 focus:outline-none"
                              >
                                <option value="CUSTOMER">CUSTOMER</option>
                                <option value="FARMER">FARMER</option>
                                <option value="WORKER">WORKER</option>
                                <option value="DRIVER">DRIVER</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </div>
                          )}
                          {isRootAdmin && (
                            <span className="text-[10px] font-bold text-slate-400 italic">Root Admin</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 1. MARKET DATA STATUS & OPERATOR PRICE CORRECTION */}
        {activeTab === 'market_data' && (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <span>GOVERNMENT OGD / AGMARKNET PIPELINE</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Source: {syncStatus.source}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    syncStatus.currentSyncStatus === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : syncStatus.currentSyncStatus === 'RUNNING'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {syncStatus.currentSyncStatus}
                </span>
              </div>

              {/* Status details grid */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Last Successful Sync</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {syncStatus.lastSuccessfulSync}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Latest Market Date</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {syncStatus.latestMarketDate}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-bold">Fetched</span>
                    <span className="text-sm font-black text-slate-800">{syncStatus.recordsFetched}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <span className="text-[10px] text-emerald-700 block font-bold">Accepted</span>
                    <span className="text-sm font-black text-emerald-800">{syncStatus.recordsAccepted}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-xl">
                    <span className="text-[10px] text-rose-700 block font-bold">Rejected</span>
                    <span className="text-sm font-black text-rose-800">{syncStatus.recordsRejected}</span>
                  </div>
                </div>
              </div>

              {syncFeedback && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* SYNC NOW CTA */}
              <button
                onClick={handleAdminSyncNow}
                disabled={isSyncing}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing with data.gov.in...' : 'SYNC NOW WITH data.gov.in'}</span>
              </button>
            </div>

            {/* Operator Manual Price Correction Form */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>Market Data Operator Price Correction</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Audit records will be created permanently. Never silently overwrites official records.
              </p>

              <form onSubmit={handlePriceCorrectionSubmit} className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Select Market Record</label>
                  <select
                    value={operatorRecordId}
                    onChange={(e) => setOperatorRecordId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold"
                    required
                  >
                    <option value="">-- Choose Mandi Record --</option>
                    {marketRecords.slice(0, 20).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.commodityNormalized} • {r.market} (Current: ₹{r.modalPrice}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">New Modal Price (₹/kg)</label>
                    <input
                      type="number"
                      value={operatorNewPrice}
                      onChange={(e) => setOperatorNewPrice(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Evidence Reference</label>
                    <input
                      type="text"
                      value={operatorEvidence}
                      onChange={(e) => setOperatorEvidence(e.target.value)}
                      placeholder="e.g. APMC Gate Sheet #491"
                      className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Audit Reason</label>
                  <input
                    type="text"
                    value={operatorReason}
                    onChange={(e) => setOperatorReason(e.target.value)}
                    placeholder="e.g. Physical auction closing rate adjustment"
                    className="w-full px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Price & Log Market Audit
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. SALE POINT MODERATION */}
        {activeTab === 'sale_point' && (
          <div className="space-y-3">
            {farmerProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={FarmerProductImageResolver.resolve(prod.productName, prod.category, prod.primaryImageUrl)}
                    alt={prod.productName}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">{prod.productName}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        prod.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {prod.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Farmer: {prod.farmerName} • ₹{prod.sellingPrice}/{prod.unit}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Location: {prod.location} • Available: {prod.quantity} {prod.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {prod.id}</span>
                  <div className="flex items-center gap-1.5">
                    {prod.verified ? (
                      <button
                        onClick={() => handleFarmerProductAction(prod.id, 'REJECT')}
                        className="px-2 py-1 bg-amber-50 text-amber-800 rounded-lg text-[10px] font-bold"
                      >
                        Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFarmerProductAction(prod.id, 'APPROVE')}
                        className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold"
                      >
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => setAdminEditingProduce(prod)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-amber-200"
                      title="Edit Produce"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setAdminPhotosTarget({
                        targetModule: 'SALE_POINT',
                        targetId: prod.id,
                        targetTitle: prod.productName,
                        initialPhotos: prod.imageUrls || (prod.primaryImageUrl ? [prod.primaryImageUrl] : []),
                        initialPrimaryPhoto: prod.primaryImageUrl
                      })}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-blue-200"
                      title="Manage Photos"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Photos</span>
                    </button>

                    {prod.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleFarmerProductAction(prod.id, 'HIDE')}
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px]"
                        title="Hide Listing"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFarmerProductAction(prod.id, 'RESTORE')}
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px]"
                        title="Restore Listing"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleFarmerProductAction(prod.id, 'DELETE')}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px]"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. EQUIPMENT RENTAL MODERATION */}
        {activeTab === 'equipment_rent' && (
          <div className="space-y-3">
            {rentalEquipment.map((eq) => (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={EquipmentImageResolver.resolve(eq)}
                    alt={eq.equipmentName}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900">{eq.equipmentName}</h4>
                    <p className="text-[11px] text-slate-500">
                      Owner: {eq.ownerName} • ₹{eq.pricePerHour}/hr
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Location: {eq.location} • Condition: {eq.condition}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {eq.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEquipmentAction(eq.id, eq.verified ? 'REJECT' : 'APPROVE')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        eq.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {eq.verified ? 'Verified' : 'Verify'}
                    </button>

                    <button
                      onClick={() => setAdminEditingEquipment(eq)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-amber-200"
                      title="Edit Equipment"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setAdminPhotosTarget({
                        targetModule: 'EQUIPMENT_RENT',
                        targetId: eq.id,
                        targetTitle: eq.equipmentName,
                        initialPhotos: eq.imageUrls || (eq.image ? [eq.image] : []),
                        initialPrimaryPhoto: eq.primaryImageUrl || eq.image
                      })}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-blue-200"
                      title="Manage Photos"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Photos</span>
                    </button>

                    <button
                      onClick={() => handleEquipmentAction(eq.id, eq.availability === 'Booked' ? 'RESTORE' : 'HIDE')}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px]"
                      title={eq.availability === 'Booked' ? 'Restore' : 'Hide'}
                    >
                      {eq.availability === 'Booked' ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    <button
                      onClick={() => handleEquipmentAction(eq.id, 'DELETE')}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px]"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. USED EQUIPMENT MODERATION */}
        {activeTab === 'used_equipment' && (
          <div className="space-y-3">
            {usedEquipment.map((eq) => (
              <div
                key={eq.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={EquipmentImageResolver.resolve(eq)}
                    alt={eq.equipmentName}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-900">{eq.equipmentName}</h4>
                    <p className="text-[11px] text-amber-900 font-bold">
                      Price: ₹{eq.priceToBuy?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Seller: {eq.ownerName} • {eq.condition} ({eq.year})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-mono">ID: {eq.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEquipmentAction(eq.id, eq.verified ? 'REJECT' : 'APPROVE')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        eq.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {eq.verified ? 'Verified' : 'Verify'}
                    </button>

                    <button
                      onClick={() => setAdminEditingEquipment(eq)}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-amber-200"
                      title="Edit Equipment"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setAdminPhotosTarget({
                        targetModule: 'USED_EQUIPMENT',
                        targetId: eq.id,
                        targetTitle: eq.equipmentName,
                        initialPhotos: eq.imageUrls || (eq.image ? [eq.image] : []),
                        initialPrimaryPhoto: eq.primaryImageUrl || eq.image
                      })}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold flex items-center gap-0.5 border border-blue-200"
                      title="Manage Photos"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Photos</span>
                    </button>

                    <button
                      onClick={() => handleEquipmentAction(eq.id, eq.availability === 'Booked' ? 'RESTORE' : 'HIDE')}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-[10px]"
                      title={eq.availability === 'Booked' ? 'Restore' : 'Hide'}
                    >
                      {eq.availability === 'Booked' ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    <button
                      onClick={() => handleEquipmentAction(eq.id, 'DELETE')}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px]"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. PROVIDERS */}
        {activeTab === 'providers' && (
          <div className="space-y-3">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-11 h-11 rounded-xl object-cover bg-slate-100"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {p.serviceCategory} • {p.completedJobs} jobs
                    </p>
                    <div className="text-[10px] font-mono text-slate-400">
                      Tx: {p.blockchainTxHash ? `${p.blockchainTxHash.slice(0, 14)}...` : 'Unverified'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleVerify(p.id, p.verified)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    p.verified
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                >
                  {p.verified ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>Unverified</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 6. MEDICAL MANAGEMENT (Section 13) */}
        {activeTab === 'medical_resources' && (
          <div className="space-y-3">
            {/* Medical Sub-Tabs */}
            <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setMedicalSubTab('helplines')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  medicalSubTab === 'helplines'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Emergency Helplines ({allHelplines.length})
              </button>
              <button
                onClick={() => setMedicalSubTab('facilities')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  medicalSubTab === 'facilities'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Medical Facilities ({allFacilities.length})
              </button>
            </div>

            {/* Sub-Tab 1: Emergency Helplines Management */}
            {medicalSubTab === 'helplines' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Verified Emergency Helplines
                  </h4>
                  <button
                    onClick={() => {
                      setHelplineForm({
                        service_name: '',
                        number: '',
                        category: 'Ambulance',
                        scope: 'NATIONAL',
                        availability: '24x7 Toll Free',
                        description: '',
                        source: '',
                        source_url: '',
                        reason: 'Added new emergency helpline',
                        evidence: 'Official Government Gazette / MHA Directory'
                      });
                      setIsAddHelplineModalOpen(true);
                    }}
                    className="py-1 px-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Helpline</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {allHelplines.map((hl) => (
                    <div
                      key={hl.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{hl.service_name}</span>
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              {hl.number}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                              {hl.scope}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                hl.verification_status === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {hl.verification_status}
                            </span>
                            {!hl.enabled && (
                              <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                                DISABLED
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                            {hl.description}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Source: <strong>{hl.source}</strong> • Verified: {hl.verified_at}
                          </div>
                        </div>
                      </div>

                      {/* Admin Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleHelplineVerification(hl.id, hl.verification_status)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                              hl.verification_status === 'VERIFIED'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {hl.verification_status === 'VERIFIED' ? 'Mark Unverified' : 'Mark Verified'}
                          </button>
                          <button
                            onClick={() => handleToggleHelplineStatus(hl.id, hl.enabled !== false)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                              hl.enabled !== false
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {hl.enabled !== false ? 'Disable' : 'Enable'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingHelpline(hl);
                              setHelplineForm({
                                service_name: hl.service_name,
                                number: hl.number,
                                category: hl.category,
                                scope: hl.scope,
                                availability: hl.availability,
                                description: hl.description,
                                source: hl.source,
                                source_url: hl.source_url || '',
                                reason: 'Updated helpline records',
                                evidence: 'Official verification'
                              });
                            }}
                            className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg"
                            title="Edit Helpline"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHelpline(hl.id, hl.service_name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Helpline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Medical Facilities Management */}
            {medicalSubTab === 'facilities' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Verified Medical Facilities
                  </h4>
                  <button
                    onClick={() => {
                      setFacilityForm({
                        name: '',
                        type: 'Hospital',
                        address: '',
                        city: 'Mysuru',
                        district: 'Mysuru',
                        state: 'Karnataka',
                        phone: '',
                        hasEmergencyDepartment: true,
                        is24x7: true,
                        openingHours: '24 Hours',
                        specialties: 'Emergency Medicine, Trauma Care',
                        distanceKm: 2.0,
                        source: 'Karnataka State Health Dept',
                        reason: 'Added new facility',
                        evidence: 'Hospital license accreditation'
                      });
                      setIsAddFacilityModalOpen(true);
                    }}
                    className="py-1 px-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Facility</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {allFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{fac.name}</span>
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                              {fac.type}
                            </span>
                            {fac.hasEmergencyDepartment && (
                              <span className="text-[9px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded">
                                🚨 Emergency Dept
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                fac.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {fac.verificationStatus}
                            </span>
                            {!fac.enabled && (
                              <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                                DISABLED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            📍 {fac.address} • Phone: <strong>{fac.phone}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Source: <strong>{fac.source}</strong> • Verified: {fac.verifiedAt}
                          </div>
                        </div>
                      </div>

                      {/* Admin Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleFacilityVerification(fac.id, fac.verificationStatus)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                              fac.verificationStatus === 'VERIFIED'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {fac.verificationStatus === 'VERIFIED' ? 'Mark Unverified' : 'Mark Verified'}
                          </button>
                          <button
                            onClick={() => handleToggleFacilityStatus(fac.id, fac.enabled !== false)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                              fac.enabled !== false
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {fac.enabled !== false ? 'Disable' : 'Enable'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingFacility(fac);
                              setFacilityForm({
                                name: fac.name,
                                type: fac.type,
                                address: fac.address,
                                city: fac.city,
                                district: fac.district,
                                state: fac.state,
                                phone: fac.phone,
                                hasEmergencyDepartment: fac.hasEmergencyDepartment,
                                is24x7: fac.is24x7,
                                openingHours: fac.openingHours || '24 Hours',
                                specialties: fac.specialties.join(', '),
                                distanceKm: fac.distanceKm,
                                source: fac.source,
                                reason: 'Updated facility record',
                                evidence: 'Official licensing audit'
                              });
                            }}
                            className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-lg"
                            title="Edit Facility"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFacility(fac.id, fac.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Facility"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. AUDIT LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-3">
            {/* Market Data Audit Logs */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-700" />
                <span>Market Price Audit Ledger ({marketAudits.length})</span>
              </h4>

              {marketAudits.length === 0 ? (
                <p className="text-xs text-slate-400">No market price audits recorded.</p>
              ) : (
                <div className="space-y-2">
                  {marketAudits.map((audit) => (
                    <div
                      key={audit.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{audit.commodity} • {audit.market}</span>
                        <span className="text-[10px] font-mono text-slate-400">{audit.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-mono">
                        Price Adjusted: ₹{audit.previousValue} &rarr; ₹{audit.newValue}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        <strong>Reason:</strong> {audit.reason}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <strong>Evidence:</strong> {audit.evidenceSource} • By: {audit.editorRole} ({audit.editorId})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Action Logs */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2.5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-700" />
                <span>Admin Moderation Action Logs ({adminLogs.length})</span>
              </h4>

              {adminLogs.length === 0 ? (
                <p className="text-xs text-slate-400">No moderation actions logged.</p>
              ) : (
                <div className="space-y-2">
                  {adminLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          [{log.actionType}] {log.targetModule}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-700">{log.details}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Target: {log.targetName} ({log.targetId})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. PHOTOS MANAGEMENT */}
        {activeTab === 'photos' && (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-700" />
                  <span>PHOTO MODERATION & ASSET CONTROL</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Manage primary thumbnails, replace photos, and enforce max 5-photo limits.
                </p>
              </div>

              {/* Equipment Photos */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Equipment Machinery Photos ({equipment.length})
                </h4>
                <div className="space-y-2">
                  {equipment.map((eq) => {
                    const photos = eq.imageUrls || [eq.image || EquipmentImageResolver.resolve(eq)];
                    return (
                      <div
                        key={eq.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={eq.primaryImageUrl || eq.image || photos[0]}
                            alt={eq.equipmentName}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{eq.equipmentName}</h5>
                            <span className="text-[10px] text-slate-500">
                              {photos.length}/5 Photos • Primary Thumbnail Set
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setAdminPhotosTarget({
                              targetModule: eq.isUsedEquipmentSale ? 'USED_EQUIPMENT' : 'EQUIPMENT_RENT',
                              targetId: eq.id,
                              targetTitle: eq.equipmentName,
                              initialPhotos: photos,
                              initialPrimaryPhoto: eq.primaryImageUrl || eq.image
                            })
                          }
                          className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-[11px] font-bold shadow-2xs"
                        >
                          Manage Photos
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>SECURITY GOVERNANCE & AUTH CONFIGURATION</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cryptographic standards, session verification, and cloud provider inspection
                </p>
              </div>

              {/* Cryptographic Standards */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Cryptographic Authentication Engine</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold text-[10px]">PASSWORD HASHING</span>
                    <span className="font-mono text-slate-800 font-bold">PBKDF2 / SHA-512</span>
                    <span className="text-emerald-700 block text-[9px] font-bold">10,000 Rounds + Salt</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold text-[10px]">SESSION TOKENS</span>
                    <span className="font-mono text-slate-800 font-bold">HMAC-SHA256</span>
                    <span className="text-emerald-700 block text-[9px] font-bold">7-Day Signed Bearer</span>
                  </div>
                </div>
              </div>

              {/* Cloud Provider Inspection */}
              {(() => {
                const cloud = authService.getCloudConfig();
                return (
                  <div className="space-y-2.5 pt-1">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Federated & Cloud Auth Status
                    </h4>

                    {/* Google OAuth */}
                    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Google Sign-In Provider</span>
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            cloud.googleConfigured
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {cloud.googleConfigured ? 'CONFIGURED' : 'BLOCKED — CONFIG REQUIRED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {cloud.googleConfigured
                          ? 'Google OAuth credentials active and authorized.'
                          : 'Awaiting GOOGLE_CLIENT_ID / Firebase Google Sign-In Provider.'}
                      </p>
                    </div>

                    {/* Phone OTP */}
                    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Phone SMS / OTP Gateway</span>
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            cloud.phoneConfigured
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {cloud.phoneConfigured ? 'CONFIGURED' : 'BLOCKED — CONFIG REQUIRED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {cloud.phoneConfigured
                          ? 'SMS gateway configured for Indian +91 numbers.'
                          : 'Awaiting SMS_GATEWAY_API_KEY / Firebase Phone Auth reCAPTCHA.'}
                      </p>
                    </div>

                    {/* Firebase Auth */}
                    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Firebase Authentication Suite</span>
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            cloud.firebaseConfigured
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {cloud.firebaseConfigured ? 'CONFIGURED' : 'BLOCKED — FIREBASE CONFIG REQUIRED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {cloud.firebaseConfigured
                          ? 'Firebase Project linked and authorized.'
                          : 'Awaiting VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID.'}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Admin Edit Equipment Modal */}
      <AdminEditEquipmentModal
        isOpen={Boolean(adminEditingEquipment)}
        equipment={adminEditingEquipment}
        onClose={() => setAdminEditingEquipment(null)}
        onSuccess={() => {
          setAdminEditingEquipment(null);
          setActionFeedback('Equipment record successfully updated.');
          setTimeout(() => setActionFeedback(null), 2500);
        }}
      />

      {/* Admin Manage Photos Modal */}
      <AdminManagePhotosModal
        isOpen={Boolean(adminPhotosTarget)}
        targetModule={adminPhotosTarget?.targetModule || 'EQUIPMENT_RENT'}
        targetId={adminPhotosTarget?.targetId || ''}
        targetTitle={adminPhotosTarget?.targetTitle || ''}
        initialPhotos={adminPhotosTarget?.initialPhotos || []}
        initialPrimaryPhoto={adminPhotosTarget?.initialPrimaryPhoto}
        onClose={() => setAdminPhotosTarget(null)}
        onSuccess={() => {
          setAdminPhotosTarget(null);
          setActionFeedback('Photos successfully updated.');
          setTimeout(() => setActionFeedback(null), 2500);
        }}
      />

      {/* Admin Edit Produce Modal */}
      <CreateFarmerSalesProductModal
        isOpen={Boolean(adminEditingProduce)}
        editProduct={adminEditingProduce}
        onClose={() => setAdminEditingProduce(null)}
        onSuccess={() => {
          setAdminEditingProduce(null);
          setActionFeedback('Produce listing updated.');
          setTimeout(() => setActionFeedback(null), 2500);
        }}
      />

      {/* Admin Add/Edit Helpline Modal */}
      {(isAddHelplineModalOpen || editingHelpline) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                {editingHelpline ? 'Edit Emergency Helpline' : 'Add Emergency Helpline'}
              </h3>
              <button
                onClick={() => {
                  setIsAddHelplineModalOpen(false);
                  setEditingHelpline(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Service Name *</label>
                <input
                  type="text"
                  value={helplineForm.service_name}
                  onChange={(e) => setHelplineForm({ ...helplineForm, service_name: e.target.value })}
                  placeholder="e.g. Arogyakavacha Ambulance Service"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Emergency Number *</label>
                  <input
                    type="text"
                    value={helplineForm.number}
                    onChange={(e) => setHelplineForm({ ...helplineForm, number: e.target.value })}
                    placeholder="e.g. 108 or 1800-xxx-xxx"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Scope</label>
                  <select
                    value={helplineForm.scope}
                    onChange={(e) => setHelplineForm({ ...helplineForm, scope: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="NATIONAL">NATIONAL</option>
                    <option value="STATE">STATE</option>
                    <option value="DISTRICT">DISTRICT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Description *</label>
                <textarea
                  value={helplineForm.description}
                  onChange={(e) => setHelplineForm({ ...helplineForm, description: e.target.value })}
                  rows={2}
                  placeholder="Purpose and dispatch instructions"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Authoritative Source *</label>
                <input
                  type="text"
                  value={helplineForm.source}
                  onChange={(e) => setHelplineForm({ ...helplineForm, source: e.target.value })}
                  placeholder="e.g. Ministry of Health / Govt of Karnataka"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[9px] font-black uppercase text-amber-900 block">
                  Mandatory Audit Trail Evidence:
                </span>
                <div>
                  <label className="text-[9px] font-bold text-amber-800 block">Audit Reason *</label>
                  <input
                    type="text"
                    value={helplineForm.reason}
                    onChange={(e) => setHelplineForm({ ...helplineForm, reason: e.target.value })}
                    placeholder="Reason for change"
                    className="w-full mt-0.5 p-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-800 block">Evidence Source *</label>
                  <input
                    type="text"
                    value={helplineForm.evidence}
                    onChange={(e) => setHelplineForm({ ...helplineForm, evidence: e.target.value })}
                    placeholder="Government gazette, notification, or URL"
                    className="w-full mt-0.5 p-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  if (!helplineForm.service_name || !helplineForm.number || !helplineForm.source) {
                    alert('Please complete all required fields.');
                    return;
                  }

                  if (editingHelpline) {
                    const ok = store.adminUpdateHelpline(
                      editingHelpline.id,
                      {
                        service_name: helplineForm.service_name,
                        number: helplineForm.number,
                        scope: helplineForm.scope,
                        availability: helplineForm.availability,
                        description: helplineForm.description,
                        source: helplineForm.source,
                        source_url: helplineForm.source_url
                      },
                      user.id,
                      helplineForm.reason,
                      helplineForm.evidence
                    );
                    if (!ok) {
                      alert('Phone format validation failed. Check number format.');
                      return;
                    }
                    setActionFeedback(`Helpline #${editingHelpline.id} updated.`);
                  } else {
                    const result = store.adminAddHelpline(
                      {
                        service_name: helplineForm.service_name,
                        number: helplineForm.number,
                        category: helplineForm.category,
                        scope: helplineForm.scope,
                        availability: helplineForm.availability,
                        description: helplineForm.description,
                        source: helplineForm.source,
                        source_url: helplineForm.source_url,
                        country: 'India',
                        state: 'Karnataka',
                        verified_at: new Date().toISOString().slice(0, 10),
                        verification_status: 'VERIFIED',
                        last_checked_by: 'Admin / Verified Health Board',
                        notes: 'Newly registered helpline'
                      },
                      user.id,
                      helplineForm.reason,
                      helplineForm.evidence
                    );
                    if (!result) {
                      alert('Phone number format validation failed.');
                      return;
                    }
                    setActionFeedback(`Helpline ${helplineForm.service_name} created.`);
                  }

                  setIsAddHelplineModalOpen(false);
                  setEditingHelpline(null);
                  setTimeout(() => setActionFeedback(null), 2500);
                }}
                className="flex-1 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {editingHelpline ? 'Save Changes' : 'Create Helpline'}
              </button>
              <button
                onClick={() => {
                  setIsAddHelplineModalOpen(false);
                  setEditingHelpline(null);
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Facility Modal */}
      {(isAddFacilityModalOpen || editingFacility) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                {editingFacility ? 'Edit Medical Facility' : 'Add Medical Facility'}
              </h3>
              <button
                onClick={() => {
                  setIsAddFacilityModalOpen(false);
                  setEditingFacility(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Facility Name *</label>
                <input
                  type="text"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  placeholder="e.g. Apollo BGS Hospital"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Type</label>
                  <select
                    value={facilityForm.type}
                    onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Ambulance">Ambulance</option>
                    <option value="Blood Bank">Blood Bank</option>
                    <option value="Diagnostic Center">Diagnostic Center</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block">Phone *</label>
                  <input
                    type="text"
                    value={facilityForm.phone}
                    onChange={(e) => setFacilityForm({ ...facilityForm, phone: e.target.value })}
                    placeholder="0821-2520512"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Address *</label>
                <input
                  type="text"
                  value={facilityForm.address}
                  onChange={(e) => setFacilityForm({ ...facilityForm, address: e.target.value })}
                  placeholder="Street address, Area, City"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={facilityForm.hasEmergencyDepartment}
                    onChange={(e) => setFacilityForm({ ...facilityForm, hasEmergencyDepartment: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-slate-700">24x7 Emergency Dept</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={facilityForm.is24x7}
                    onChange={(e) => setFacilityForm({ ...facilityForm, is24x7: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[10px] font-bold text-slate-700">24x7 Open</span>
                </label>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={facilityForm.specialties}
                  onChange={(e) => setFacilityForm({ ...facilityForm, specialties: e.target.value })}
                  placeholder="Cardiology, Maternity, Pediatrics"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block">Source *</label>
                <input
                  type="text"
                  value={facilityForm.source}
                  onChange={(e) => setFacilityForm({ ...facilityForm, source: e.target.value })}
                  placeholder="NABH / Govt of Karnataka Registry"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[9px] font-black uppercase text-amber-900 block">
                  Mandatory Audit Trail Evidence:
                </span>
                <div>
                  <label className="text-[9px] font-bold text-amber-800 block">Audit Reason *</label>
                  <input
                    type="text"
                    value={facilityForm.reason}
                    onChange={(e) => setFacilityForm({ ...facilityForm, reason: e.target.value })}
                    placeholder="Reason for change"
                    className="w-full mt-0.5 p-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-800 block">Evidence Source *</label>
                  <input
                    type="text"
                    value={facilityForm.evidence}
                    onChange={(e) => setFacilityForm({ ...facilityForm, evidence: e.target.value })}
                    placeholder="Hospital license or registration record"
                    className="w-full mt-0.5 p-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => {
                  if (!facilityForm.name || !facilityForm.phone || !facilityForm.address || !facilityForm.source) {
                    alert('Please complete all required fields.');
                    return;
                  }

                  const specs = facilityForm.specialties
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);

                  if (editingFacility) {
                    const ok = store.adminUpdateMedicalFacility(
                      editingFacility.id,
                      {
                        name: facilityForm.name,
                        type: facilityForm.type,
                        phone: facilityForm.phone,
                        address: facilityForm.address,
                        hasEmergencyDepartment: facilityForm.hasEmergencyDepartment,
                        is24x7: facilityForm.is24x7,
                        specialties: specs,
                        source: facilityForm.source
                      },
                      user.id,
                      facilityForm.reason,
                      facilityForm.evidence
                    );
                    if (!ok) {
                      alert('Phone validation failed.');
                      return;
                    }
                    setActionFeedback(`Facility #${editingFacility.id} updated.`);
                  } else {
                    const result = store.adminAddMedicalFacility(
                      {
                        name: facilityForm.name,
                        type: facilityForm.type,
                        phone: facilityForm.phone,
                        address: facilityForm.address,
                        city: facilityForm.city || 'Mysuru',
                        district: facilityForm.district || 'Mysuru',
                        state: facilityForm.state || 'Karnataka',
                        hasEmergencyDepartment: facilityForm.hasEmergencyDepartment,
                        is24x7: facilityForm.is24x7,
                        openingHours: facilityForm.openingHours,
                        specialties: specs,
                        distanceKm: facilityForm.distanceKm || 2.0,
                        source: facilityForm.source,
                        verifiedAt: new Date().toISOString().slice(0, 10),
                        verificationStatus: 'VERIFIED',
                        notes: 'Hospital facility registered by administrator'
                      },
                      user.id,
                      facilityForm.reason,
                      facilityForm.evidence
                    );
                    if (!result) {
                      alert('Phone format validation failed.');
                      return;
                    }
                    setActionFeedback(`Facility ${facilityForm.name} created.`);
                  }

                  setIsAddFacilityModalOpen(false);
                  setEditingFacility(null);
                  setTimeout(() => setActionFeedback(null), 2500);
                }}
                className="flex-1 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {editingFacility ? 'Save Changes' : 'Create Facility'}
              </button>
              <button
                onClick={() => {
                  setIsAddFacilityModalOpen(false);
                  setEditingFacility(null);
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
