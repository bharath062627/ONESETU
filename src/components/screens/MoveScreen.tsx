import React, { useState } from 'react';
import { store } from '../../services/store';
import { VehicleCategory, TransportVehicle } from '../../types';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  Weight,
  ShieldCheck,
  Star,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';

interface MoveScreenProps {
  onVehicleBooked?: (vehicle: TransportVehicle) => void;
}

export const MoveScreen: React.FC<MoveScreenProps> = () => {
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');
  const [pickup, setPickup] = useState('Mysuru');
  const [destination, setDestination] = useState('Bengaluru');
  const [loadType, setLoadType] = useState('House Shifting');
  const [approxWeight, setApproxWeight] = useState('1000 kg');
  const [preferredDate, setPreferredDate] = useState('15 Apr 2025');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [vehicleType, setVehicleType] = useState<string>('Truck (2-5 ton)');
  const [specialReq, setSpecialReq] = useState('Fragile items, need helper, etc.');

  const [matchingResults, setMatchingResults] = useState<TransportVehicle[] | null>(null);
  const [bookingSuccessAlert, setBookingSuccessAlert] = useState<string | null>(null);

  const allVehicles = store.getVehicles();
  const bookings = store.getBookings().filter((b) => b.category === 'MOVE');

  const handleFindVehicles = (e: React.FormEvent) => {
    e.preventDefault();
    // Deterministic matching based on requested load & vehicle preference
    const matched = allVehicles.filter((v) => {
      if (vehicleType.includes('Truck')) {
        return v.vehicleType === 'Truck' || v.capacityKg >= 1000;
      }
      return true;
    });
    setMatchingResults(matched.length > 0 ? matched : allVehicles);
  };

  const handleBookVehicle = async (veh: TransportVehicle) => {
    const booking = await store.createBooking({
      category: 'MOVE',
      serviceTitle: `${loadType} (${veh.vehicleName})`,
      providerId: veh.id,
      providerName: veh.ownerName,
      providerContact: veh.ownerContact,
      pickupLocation: pickup,
      destinationLocation: destination,
      scheduledDate: preferredDate,
      scheduledTime: preferredTime,
      priceEstimate: `₹${veh.pricePerKm * 140}`, // approx 140km Mysuru -> Bengaluru
      loadDetails: `${loadType}, ~${approxWeight}, ${specialReq}`,
      notes: `Vehicle: ${veh.vehicleName} (${veh.vehicleNumber})`
    });

    setBookingSuccessAlert(`Booking confirmed with ${veh.ownerName}! Blockchain Tx: ${booking.blockchainTxHash?.slice(0, 14)}...`);
    setTimeout(() => {
      setBookingSuccessAlert(null);
      store.navigateTo('bookings');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Banner Header with Transport Theme */}
      <div className="relative bg-amber-900 text-white px-5 pt-8 pb-4 rounded-b-[28px] overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-25 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80"
            alt="Transport truck"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Move</h2>
              <p className="text-xs text-amber-200 mt-0.5">
                Transport, Shifting & Goods Movement
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Truck className="w-5 h-5 text-amber-200" />
            </div>
          </div>

          {/* Segmented Tab: Find Vehicle | My Requests */}
          <div className="mt-4 p-1 bg-amber-950/60 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('find')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'find'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-200 hover:text-white'
              }`}
            >
              Find Vehicle
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'requests'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-200 hover:text-white'
              }`}
            >
              My Requests ({bookings.length})
            </button>
          </div>
        </div>
      </div>

      {bookingSuccessAlert && (
        <div className="mx-4 mt-2 bg-emerald-600 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{bookingSuccessAlert}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-20 space-y-4">
        {activeTab === 'find' ? (
          <div>
            {!matchingResults ? (
              <form onSubmit={handleFindVehicles} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs space-y-3">
                {/* Pickup Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <select
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      <option value="Mysuru">Mysuru</option>
                      <option value="Mandya">Mandya</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Hassan">Hassan</option>
                      <option value="Chamarajanagar">Chamarajanagar</option>
                    </select>
                  </div>
                </div>

                {/* Destination Location */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Destination
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mysuru">Mysuru</option>
                      <option value="Mandya">Mandya</option>
                      <option value="Hassan">Hassan</option>
                      <option value="Tumakuru">Tumakuru</option>
                    </select>
                  </div>
                </div>

                {/* Load Type & Approx Weight in 2 cols */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Load Type
                    </label>
                    <select
                      value={loadType}
                      onChange={(e) => setLoadType(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      <option value="House Shifting">House Shifting</option>
                      <option value="Farm Goods">Farm Goods</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Construction Materials">Construction Materials</option>
                      <option value="Shop Inventory">Shop Inventory</option>
                      <option value="Local Cargo">Local Cargo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Approx. Weight
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Weight className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={approxWeight}
                        onChange={(e) => setApproxWeight(e.target.value)}
                        placeholder="1000 kg"
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Date & Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Truck (2-5 ton)">Truck (2-5 ton)</option>
                    <option value="Mini Truck (under 1 ton)">Mini Truck (under 1 ton)</option>
                    <option value="Pickup / Bolero (1-2 ton)">Pickup / Bolero (1-2 ton)</option>
                    <option value="Heavy Lorry (10+ ton)">Heavy Lorry (10+ ton)</option>
                  </select>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Special Requirements (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialReq}
                    onChange={(e) => setSpecialReq(e.target.value)}
                    placeholder="Fragile items, need helper, etc."
                    className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white font-semibold text-xs rounded-xl shadow-md mt-2"
                >
                  Find Vehicles
                </button>
              </form>
            ) : (
              /* Matching Results View */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    Matching Vehicles ({matchingResults.length})
                  </h4>
                  <button
                    onClick={() => setMatchingResults(null)}
                    className="text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    Edit Search
                  </button>
                </div>

                {matchingResults.map((veh, idx) => (
                  <div
                    key={`${veh.id}-${idx}`}
                    className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={veh.image}
                          alt={veh.vehicleName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h5 className="text-xs font-bold text-slate-900 truncate">
                            {veh.vehicleName}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-800">{veh.rating}</span>
                          <span>({veh.reviewCount})</span>
                        </div>
                        <div className="text-xs font-extrabold text-emerald-800 mt-1">
                          ₹{veh.pricePerKm} / km
                          <span className="text-[10px] font-normal text-slate-400 ml-1.5">
                            • {veh.distanceKm} km away
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Capacity: {veh.capacityKg} kg
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Vehicle</span>
                      </div>
                      <button
                        onClick={() => handleBookVehicle(veh)}
                        className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all"
                      >
                        Request Vehicle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* My Requests tab */
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl p-6 border border-slate-100">
                <PackageCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No transport requests yet</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Fill the vehicle finder form to submit a transport request.
                </p>
              </div>
            ) : (
              bookings.map((b, idx) => (
                <div key={`${b.id}-${idx}`} className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{b.serviceTitle}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Route: {b.pickupLocation} → {b.destinationLocation}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Scheduled: {b.scheduledDate}, {b.scheduledTime}
                  </div>
                  {b.blockchainTxHash && (
                    <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Tx: {b.blockchainTxHash.slice(0, 16)}...</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
