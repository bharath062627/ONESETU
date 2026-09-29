import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { EquipmentItem, EquipmentCategory } from '../../types';
import {
  X,
  CheckCircle2,
  Tractor,
  AlertTriangle,
  Save,
  ShieldCheck
} from 'lucide-react';

interface AdminEditEquipmentModalProps {
  isOpen: boolean;
  equipment: EquipmentItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminEditEquipmentModal: React.FC<AdminEditEquipmentModalProps> = ({
  isOpen,
  equipment,
  onClose,
  onSuccess
}) => {
  const user = store.getUser();

  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('Tractor');
  const [brand, setBrand] = useState('Mahindra');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2022');
  const [condition, setCondition] = useState<'Brand New' | 'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [pricePerHour, setPricePerHour] = useState('800');
  const [pricePerDay, setPricePerDay] = useState('4800');
  const [priceToBuy, setPriceToBuy] = useState('350000');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<'Available' | 'In Use' | 'Booked'>('Available');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [description, setDescription] = useState('');
  const [adminReason, setAdminReason] = useState('Admin quality & rate verification update');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (equipment) {
      setEquipmentName(equipment.equipmentName || '');
      setCategory(equipment.type || 'Tractor');
      setBrand(equipment.brand || 'Mahindra');
      setModel(equipment.model || '');
      setYear(String(equipment.year || 2022));
      setCondition(equipment.condition || 'Excellent');
      setPricePerHour(String(equipment.pricePerHour || 800));
      setPricePerDay(String(equipment.pricePerDay || 4800));
      setPriceToBuy(String(equipment.priceToBuy || 350000));
      setLocation(equipment.location || '');
      setAvailability(equipment.availability || 'Available');
      setOwnerName(equipment.ownerName || '');
      setOwnerPhone(equipment.ownerPhone || '');
      setDescription(equipment.description || '');
    }
  }, [equipment]);

  if (!isOpen || !equipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim()) {
      setErrorMsg('Equipment name is required.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Location is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const updates: Partial<EquipmentItem> = {
      equipmentName: equipmentName.trim(),
      type: category,
      brand,
      model: model.trim() || undefined,
      year: Number(year) || undefined,
      condition,
      pricePerHour: Number(pricePerHour) || undefined,
      pricePerDay: Number(pricePerDay) || undefined,
      priceToBuy: equipment.isUsedEquipmentSale ? Number(priceToBuy) || undefined : undefined,
      location: location.trim(),
      availability,
      ownerName: ownerName.trim() || equipment.ownerName,
      ownerPhone: ownerPhone.trim() || equipment.ownerPhone,
      description: description.trim()
    };

    const success = store.adminUpdateEquipment(
      equipment.id,
      'EDIT',
      user.id,
      updates,
      adminReason
    );

    if (success) {
      setSuccessMsg('Equipment updated successfully in database.');
      setTimeout(() => {
        setSuccessMsg(null);
        setIsSubmitting(false);
        onClose();
        onSuccess?.();
      }, 1000);
    } else {
      setErrorMsg('Failed to update equipment. Ensure you have admin authorization.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Tractor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Admin Edit Equipment</h3>
              <p className="text-[10px] text-slate-500">ID: {equipment.id} • Updates database record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            <h4 className="text-sm font-bold">{successMsg}</h4>
            <p className="text-xs text-emerald-700">Audit record generated on OneSetu admin ledger.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Equipment Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Equipment Title / Name *
              </label>
              <input
                type="text"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-semibold rounded-xl border border-slate-200"
                >
                  <option value="Tractor">Tractor</option>
                  <option value="Sprayer">Sprayer</option>
                  <option value="Harvester">Harvester</option>
                  <option value="Rotavator">Rotavator</option>
                  <option value="Cultivator">Cultivator</option>
                  <option value="Seeder">Seeder</option>
                  <option value="Plough">Plough</option>
                  <option value="Power Tiller">Power Tiller</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {/* Model & Year */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 575 DI"
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Manufacturing Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {/* Condition & Availability */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Booked">Booked (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Pricing Rates */}
            {equipment.isUsedEquipmentSale ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Asking Price (₹) *</label>
                <input
                  type="number"
                  value={priceToBuy}
                  onChange={(e) => setPriceToBuy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 font-black text-amber-900 rounded-xl border border-slate-200"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hourly Rate (₹) *</label>
                  <input
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 font-black text-emerald-800 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 font-black text-emerald-800 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Owner Details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Owner / Seller Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 font-medium rounded-xl border border-slate-200"
              />
            </div>

            {/* Audit Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Admin Audit Reason *</label>
              <input
                type="text"
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                className="w-full px-3 py-2 bg-indigo-50 font-medium text-indigo-900 rounded-xl border border-indigo-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-indigo-900 hover:bg-indigo-950 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-3"
            >
              <Save className="w-4 h-4" />
              <span>SAVE & PERSIST UPDATES</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
