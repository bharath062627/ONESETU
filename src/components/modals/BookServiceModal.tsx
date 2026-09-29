import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';
import { ServiceProvider, EquipmentItem } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Banknote,
  AlertTriangle,
  Info
} from 'lucide-react';

interface BookServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: ServiceProvider;
  equipment?: EquipmentItem;
}

const CATEGORY_SERVICES: Record<string, string[]> = {
  Electrician: [
    'Wiring',
    'Switch Repair',
    'Fan Installation',
    'Light Installation',
    'Electrical Inspection',
    'Other'
  ],
  Plumber: [
    'Pipe Repair',
    'Tap Repair',
    'Leak Repair',
    'Bathroom Plumbing',
    'Water Tank Connection',
    'Other'
  ],
  Carpenter: [
    'Furniture Repair',
    'Door Repair',
    'Shelf Installation',
    'Furniture Assembly',
    'Other'
  ],
  Painter: [
    'Wall Painting',
    'Room Painting',
    'Exterior Painting',
    'Touch-up',
    'Other'
  ],
  'AC Repair': [
    'AC Service',
    'Cooling Problem',
    'Gas Check',
    'Installation',
    'Maintenance',
    'Other'
  ],
  'Appliance Repair': [
    'Washing Machine',
    'Refrigerator',
    'Microwave',
    'TV',
    'Other'
  ],
  Mechanic: [
    'Bike Repair',
    'Car Repair',
    'Oil Service',
    'Brake Check',
    'General Service',
    'Other'
  ],
  Cleaning: [
    'Home Cleaning',
    'Kitchen Cleaning',
    'Bathroom Cleaning',
    'Deep Cleaning',
    'Move-out Cleaning',
    'Other'
  ],
  'Pest Control': [
    'Cockroach Control',
    'Termite Treatment',
    'Bedbug Treatment',
    'Mosquito Fogging',
    'Other'
  ]
};

export const BookServiceModal: React.FC<BookServiceModalProps> = ({
  isOpen,
  onClose,
  provider,
  equipment
}) => {
  const user = store.getUser();

  // Get default date (tomorrow formatted as YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [scheduledDate, setScheduledDate] = useState(defaultDateStr);
  const [scheduledTime, setScheduledTime] = useState('10:30 AM');
  const [selectedService, setSelectedService] = useState('General Service');
  const [description, setDescription] = useState('Need service at my residence/facility.');
  const [address, setAddress] = useState(user.location || 'Mysuru, Karnataka');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [notes, setNotes] = useState('Please call 15 minutes before arrival.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  // Set category-appropriate services when provider changes
  useEffect(() => {
    if (provider) {
      const catServices = CATEGORY_SERVICES[provider.serviceCategory] || provider.servicesList;
      if (catServices && catServices.length > 0) {
        setSelectedService(catServices[0]);
      }
    } else if (equipment) {
      setSelectedService(`Rental: ${equipment.equipmentName}`);
    }
  }, [provider, equipment]);

  if (!isOpen) return null;

  const getAvailableServices = () => {
    if (!provider) return ['Standard Service'];
    return CATEGORY_SERVICES[provider.serviceCategory] || provider.servicesList || ['General Repair', 'Other'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission (Section 35)

    setFormError(null);

    // Validate date is not in past (Section 16, 46)
    const selectedDateObj = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateObj < today) {
      setFormError('Appointment date cannot be in the past. Please select a valid future date.');
      return;
    }

    if (!address.trim()) {
      setFormError('Service address is required.');
      return;
    }

    // Check for double booking / conflict (Section 34)
    const providerId = provider ? provider.id : equipment ? equipment.ownerId : '';
    if (providerId && store.hasBookingConflict(providerId, scheduledDate, scheduledTime)) {
      setFormError('This time slot is no longer available. Please choose a different date or time slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (equipment) {
        const b = await store.createBooking({
          category: 'FARM',
          serviceTitle: `Equipment Rental: ${equipment.equipmentName}`,
          providerId: equipment.ownerId,
          providerName: equipment.ownerName,
          providerContact: equipment.ownerPhone,
          pickupLocation: equipment.location,
          destinationLocation: address,
          scheduledDate,
          scheduledTime,
          priceEstimate: `₹${equipment.pricePerHour ? equipment.pricePerHour * 4 : 2000}`,
          paymentMethod,
          notes: `Rental details: ${notes}. Address: ${address}`
        });
        setSuccessBookingId(b.id);
      } else if (provider) {
        const b = await store.createBooking({
          category: 'WORK',
          serviceTitle: `${selectedService} (${provider.serviceCategory})`,
          providerId: provider.id,
          providerName: provider.name,
          providerContact: provider.contact,
          pickupLocation: address,
          scheduledDate,
          scheduledTime,
          priceEstimate: provider.priceRange,
          paymentMethod,
          notes: `${description}. Additional notes: ${notes}`
        });
        setSuccessBookingId(b.id);
      }
    } catch (err: any) {
      setFormError(err.message || 'Unable to create booking. Please retry.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setTimeout(() => {
      onClose();
      store.navigateTo('bookings');
    }, 1600);
  };

  const estimatedPrice = equipment
    ? `₹${equipment.pricePerHour ? equipment.pricePerHour * 4 : 2000} (Estimated for 4 hrs)`
    : provider
    ? provider.priceRange
    : '₹300 - ₹600';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 select-none">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl overflow-y-auto max-h-[92vh] animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {equipment ? `Rent ${equipment.equipmentName}` : `Book ${provider?.name}`}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {provider ? `${provider.serviceCategory} • Verified Booking Flow` : 'Agricultural Machinery'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successBookingId ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">BOOKING CONFIRMED</h4>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-left space-y-1">
              <p><strong className="text-slate-800">Booking ID:</strong> <span className="font-mono text-emerald-800 font-bold">{successBookingId}</span></p>
              <p><strong className="text-slate-800">Provider:</strong> {provider?.name || equipment?.ownerName}</p>
              <p><strong className="text-slate-800">Service:</strong> {selectedService}</p>
              <p><strong className="text-slate-800">Date & Time:</strong> {scheduledDate} at {scheduledTime}</p>
              <p><strong className="text-slate-800">Payment:</strong> {paymentMethod === 'CASH' ? 'Cash on Service' : 'Online Payment'}</p>
              <p><strong className="text-slate-800">Status:</strong> <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">REQUESTED</span></p>
            </div>
            <p className="text-[11px] text-slate-500">Redirecting to My Bookings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px]">{formError}</span>
              </div>
            )}

            {/* Service Selection */}
            {provider && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Specific Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 font-medium text-slate-900 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  {getAvailableServices().map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Description of problem */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Service Description / Scope
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Switchboard sparking, tap leaking, AC cooling low"
                className="w-full px-3 py-2 bg-slate-50 font-medium text-slate-900 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* Date and Time Picker */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Appointment Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 bg-slate-50 font-medium text-slate-900 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Preferred Time *
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 font-medium text-slate-900 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Customer Location / Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, City"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 font-medium text-slate-900 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Estimated Price Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px]">Estimated Service Price:</span>
              <span className="font-extrabold text-emerald-800 text-xs">{estimatedPrice}</span>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash on Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Online Payment</span>
                </button>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Additional Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate code, parking instructions, special requests..."
                className="w-full px-3 py-2 bg-slate-50 font-medium text-slate-900 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* Trust Assurance */}
            <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-emerald-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Cryptographic booking ID anchored on OneSetu Trust Ledger upon confirmation.</span>
            </div>

            {/* Submit Action with Double Submission Protection */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all"
            >
              {isSubmitting ? 'Confirming Booking...' : 'CONFIRM BOOKING'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
