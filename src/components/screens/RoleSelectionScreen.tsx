import React, { useState } from 'react';
import { store } from '../../services/store';
import { UserRole } from '../../types';
import {
  ArrowLeft,
  User,
  Wheat,
  Wrench,
  Tractor,
  Truck,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const RoleSelectionScreen: React.FC = () => {
  const currentUser = store.getUser();
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentUser.roles || ['CUSTOMER']);

  const roles: RoleOption[] = [
    {
      role: 'CUSTOMER',
      title: 'Customer',
      description: 'Find services and resources',
      icon: <User className="w-5 h-5 text-emerald-700" />,
      iconBg: 'bg-emerald-100'
    },
    {
      role: 'FARMER',
      title: 'Farmer',
      description: 'Sell produce, rent or buy equipment',
      icon: <Wheat className="w-5 h-5 text-emerald-800" />,
      iconBg: 'bg-emerald-100'
    },
    {
      role: 'WORKER',
      title: 'Worker / Service Provider',
      description: 'Offer home services',
      icon: <Wrench className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100'
    },
    {
      role: 'DRIVER',
      title: 'Driver / Transport Operator',
      description: 'Offer goods transport & delivery',
      icon: <Truck className="w-5 h-5 text-sky-600" />,
      iconBg: 'bg-sky-100'
    },
    {
      role: 'EQUIPMENT_OWNER',
      title: 'Equipment Owner',
      description: 'List farming equipment',
      icon: <Tractor className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100'
    },
    {
      role: 'VEHICLE_OWNER',
      title: 'Vehicle Fleet Owner',
      description: 'List vehicles for transport',
      icon: <Truck className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-100'
    }
  ];

  const toggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleContinue = () => {
    store.updateUser({
      roles: selectedRoles,
      activeRole: selectedRoles[0] || 'CUSTOMER'
    });
    store.navigateTo('home');
  };

  return (
    <div className="flex flex-col h-full bg-white px-5 pt-10 pb-6 overflow-y-auto select-none">
      {/* Back button */}
      <div>
        <button
          onClick={() => store.goBack()}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Heading */}
      <div className="mt-3">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          What best describes you?
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          You can choose multiple roles and change later.
        </p>
      </div>

      {/* Role list */}
      <div className="mt-5 space-y-2.5 flex-1">
        {roles.map((item) => {
          const isSelected = selectedRoles.includes(item.role);
          return (
            <div
              key={item.role}
              onClick={() => toggleRole(item.role)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.iconBg}`}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>

              {/* Radio / Checkmark */}
              <div className="ml-2 flex-shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 fill-emerald-100" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue CTA */}
      <div className="pt-4">
        <button
          onClick={handleContinue}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-sm rounded-xl shadow-md"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
