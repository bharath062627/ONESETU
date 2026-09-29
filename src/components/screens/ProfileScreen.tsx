import React, { useState } from 'react';
import { store } from '../../services/store';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';
import {
  User,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Settings,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const user = store.getUser();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.activeRole);
  const [selectedCity, setSelectedCity] = useState(user.location);
  const [saveAlert, setSaveAlert] = useState(false);

  // Protected role list: ADMIN only appears if user is already authenticated as ADMIN
  const isActualAdmin = user.activeRole === 'ADMIN' || (user.roles && user.roles.includes('ADMIN'));
  const availableRoles: UserRole[] = isActualAdmin
    ? ['CUSTOMER', 'FARMER', 'WORKER', 'DRIVER', 'EQUIPMENT_OWNER', 'VEHICLE_OWNER', 'ADMIN']
    : ['CUSTOMER', 'FARMER', 'WORKER', 'DRIVER', 'EQUIPMENT_OWNER', 'VEHICLE_OWNER'];

  const handleRoleChange = (role: UserRole) => {
    // Ordinary users cannot promote themselves to ADMIN
    if (role === 'ADMIN' && !isActualAdmin) {
      alert('Access Denied: Administrator role cannot be self-assigned.');
      return;
    }
    setSelectedRole(role);
    store.setActiveRole(role);
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 2000);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    store.setLocation(city);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Banner */}
      <div className="bg-emerald-900 text-white px-5 pt-8 pb-5 rounded-b-[28px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400/50 shadow-md">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">{user.phone}</p>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Aadhaar Verified</span>
            </div>
          </div>
        </div>
      </div>

      {saveAlert && (
        <div className="mx-4 mt-2 bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-xs text-center">
          Active Role updated to {selectedRole}!
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {/* Active Role Switcher */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
              Active Capability / Role
            </h4>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Switch anytime
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {availableRoles.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all border ${
                  selectedRole === r
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Location Preferences */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
            Current Location
          </h4>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="Mysuru, Karnataka">Mysuru, Karnataka</option>
              <option value="Mandya, Karnataka">Mandya, Karnataka</option>
              <option value="Bengaluru, Karnataka">Bengaluru, Karnataka</option>
              <option value="Hassan, Karnataka">Hassan, Karnataka</option>
              <option value="Chamarajanagar, Karnataka">Chamarajanagar, Karnataka</option>
            </select>
          </div>
        </div>

        {/* Quick Menu Options */}
        <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
          <button
            onClick={() => store.navigateTo('trust')}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">
                Blockchain Trust Records & Certificates
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => store.navigateTo('admin')}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-indigo-700" />
              <span className="text-xs font-bold text-slate-800">
                Admin & Trust Moderation Panel
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={async () => {
              await authService.logout();
              store.navigateTo('auth');
            }}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors text-rose-600"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">Sign Out / Switch Account</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
