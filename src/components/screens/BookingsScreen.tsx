import React, { useState } from 'react';
import { store } from '../../services/store';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Clock4,
  XCircle,
  PlayCircle,
  Star,
  ShieldCheck,
  Package,
  CreditCard,
  Banknote,
  FileText,
  X,
  Printer,
  Check
} from 'lucide-react';

interface BookingsScreenProps {
  onOpenExplorer?: (txHash: string) => void;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ onOpenExplorer }) => {
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('Excellent service and very prompt.');

  // Payment & Receipt States (Sections 46 to 53)
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [activeReceipt, setActiveReceipt] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const bookings = store.getBookings();

  const filteredBookings = bookings.filter((b) => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'ACTIVE') return b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS' || b.status === 'REQUESTED';
    if (selectedTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (selectedTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await store.updateBookingStatus(id, newStatus);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingBookingId) {
      store.rateBooking(ratingBookingId, ratingValue, ratingComment);
      setRatingBookingId(null);
    }
  };

  const parseAmount = (estimate: string): number => {
    const matched = estimate.replace(/,/g, '').match(/\d+/);
    return matched ? parseInt(matched[0], 10) : 450;
  };

  const handleExecutePayment = async () => {
    if (!payingBooking) return;
    setIsProcessingPayment(true);

    const amount = payingBooking.paymentAmount || parseAmount(payingBooking.priceEstimate);
    const updated = await store.recordPayment(payingBooking.id, paymentMethodChoice, amount);

    setIsProcessingPayment(false);
    setPayingBooking(null);
    if (updated) {
      setActiveReceipt(updated);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock4 className="w-3 h-3 text-emerald-700" />
            <span>Accepted</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <PlayCircle className="w-3 h-3 text-blue-700" />
            <span>In Progress</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            Requested
          </span>
        );
    }
  };

  const getPaymentBadge = (status?: PaymentStatus, method?: string) => {
    switch (status) {
      case 'PAID_ONLINE':
        return (
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-emerald-700" />
            <span>Paid Online</span>
          </span>
        );
      case 'PAID_CASH':
        return (
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Banknote className="w-3 h-3 text-emerald-700" />
            <span>Paid Cash</span>
          </span>
        );
      case 'PAYMENT_PENDING':
        return (
          <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
            Payment Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 select-none">
      {/* Top Header */}
      <div className="bg-white px-5 pt-8 pb-3 border-b border-slate-100 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900">My Bookings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Unified tracking & payment for Farm, Work & Move
        </p>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 mt-3">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTab === tab
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl p-6 border border-slate-100">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No bookings in this tab</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your service, transport, and equipment requests will appear here.
            </p>
          </div>
        ) : (
          filteredBookings.map((b, idx) => (
            <div
              key={`${b.id}-${idx}`}
              className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-3"
            >
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {b.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{b.id}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{b.serviceTitle}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Provider: {b.providerName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(b.status)}
                  {getPaymentBadge(b.paymentStatus, b.paymentMethod)}
                </div>
              </div>

              {/* Timing & Location */}
              <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{b.scheduledDate}, {b.scheduledTime}</span>
                </div>
                {b.pickupLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {b.pickupLocation} {b.destinationLocation ? `→ ${b.destinationLocation}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-emerald-800 font-bold">
                    Total: {b.priceEstimate}
                  </span>
                  {b.paymentTxId && (
                    <span className="text-[9px] font-mono text-slate-400">
                      Ref: {b.paymentTxId}
                    </span>
                  )}
                </div>
              </div>

              {/* Blockchain proof badge if available */}
              {b.blockchainTxHash && (
                <div
                  onClick={() => onOpenExplorer?.(b.blockchainTxHash!)}
                  className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2 flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-900 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-mono truncate max-w-[190px]">
                      Tx: {b.blockchainTxHash.slice(0, 16)}...
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 hover:underline">
                    Trust Proof →
                  </span>
                </div>
              )}

              {/* Status progression actions & Payment triggers (Section 50) */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
                {b.status === 'REQUESTED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b.id, 'ACCEPTED')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all text-center"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'REJECTED')}
                      className="py-1.5 px-3 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {b.status === 'ACCEPTED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all text-center"
                    >
                      Start Service
                    </button>
                    <button
                      onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {b.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all text-center"
                  >
                    Complete Service & Anchor on Chain
                  </button>
                )}

                {b.status === 'COMPLETED' && !b.customerConfirmedAt && (
                  <button
                    onClick={() => store.confirmBookingCompletion(b.id)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all text-center"
                  >
                    Confirm Completion
                  </button>
                )}

                {/* Payment Buttons (Online or Cash) */}
                {b.status === 'COMPLETED' && (!b.paymentStatus || b.paymentStatus === 'PAYMENT_PENDING') && (
                  <button
                    onClick={() => setPayingBooking(b)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Online / Confirm Cash</span>
                  </button>
                )}

                {/* View Receipt Button (Section 52) */}
                {(b.paymentStatus === 'PAID_ONLINE' || b.paymentStatus === 'PAID_CASH') && (
                  <button
                    onClick={() => setActiveReceipt(b)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-slate-600" />
                    <span>View Receipt</span>
                  </button>
                )}

                {b.status === 'COMPLETED' && !b.rating && (
                  <button
                    onClick={() => setRatingBookingId(b.id)}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>Rate Provider</span>
                  </button>
                )}

                {b.status === 'COMPLETED' && b.rating && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 ml-auto">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Rated {b.rating} / 5</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Processing Modal (Section 47, 48, 49) */}
      {payingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Unified Payment</h3>
              </div>
              <button
                onClick={() => setPayingBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Service</span>
              <h4 className="font-bold text-slate-900">{payingBooking.serviceTitle}</h4>
              <p className="text-[11px] text-slate-600">Provider: {payingBooking.providerName}</p>
              <div className="text-base font-extrabold text-emerald-800 pt-1">
                Amount: {payingBooking.priceEstimate}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice('ONLINE')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    paymentMethodChoice === 'ONLINE'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-bold">Online Payment</span>
                  <span className="text-[9px] text-slate-400">UPI / Card / NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice('CASH')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    paymentMethodChoice === 'CASH'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-bold">Cash on Service</span>
                  <span className="text-[9px] text-slate-400">Direct Cash Handover</span>
                </button>
              </div>
            </div>

            {paymentMethodChoice === 'ONLINE' ? (
              <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/50 text-[11px] text-emerald-950 space-y-1">
                <span className="font-bold block">🔒 Secure Gateway (Testnet Mode)</span>
                <p className="text-[10px] text-emerald-800">
                  Instant receipt generation & automatic blockchain verification anchor.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50 text-[11px] text-amber-950 space-y-1">
                <span className="font-bold block">💵 Cash Verification</span>
                <p className="text-[10px] text-amber-800">
                  Customer and provider confirm physical cash payment. Updates booking to CASH PAID.
                </p>
              </div>
            )}

            <button
              onClick={handleExecutePayment}
              disabled={isProcessingPayment}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              {paymentMethodChoice === 'ONLINE' ? 'Pay Online & Generate Receipt' : 'Confirm Cash Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Formal Payment Receipt Modal (Section 52) */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl">
            <div className="text-center space-y-1 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {activeReceipt.paymentStatus === 'PAID_ONLINE' ? 'Payment Receipt' : 'Cash Payment Confirmation'}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {activeReceipt.paymentTxId || `REC-${activeReceipt.id}`}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Service</span>
                <span className="font-bold text-slate-800 text-right">{activeReceipt.serviceTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Provider</span>
                <span className="font-bold text-slate-800">{activeReceipt.providerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Customer</span>
                <span className="font-bold text-slate-800">{activeReceipt.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-bold text-emerald-800">
                  {activeReceipt.paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Service'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-bold text-emerald-700">
                  {activeReceipt.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between pt-0.5 text-sm font-extrabold">
                <span className="text-slate-900">Total Amount</span>
                <span className="text-emerald-800">
                  {activeReceipt.priceEstimate}
                </span>
              </div>
            </div>

            {activeReceipt.blockchainTxHash && (
              <div className="p-2 bg-emerald-50 rounded-xl text-[10px] text-emerald-900 space-y-0.5">
                <span className="font-bold block">🔗 Blockchain Proof Anchored:</span>
                <span className="font-mono truncate block text-[9px] text-emerald-700">
                  {activeReceipt.blockchainTxHash}
                </span>
              </div>
            )}

            <button
              onClick={() => setActiveReceipt(null)}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingBookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">Rate Service Experience</h3>
            <p className="text-xs text-slate-500">
              Your feedback is cryptographically linked to the provider's trust score.
            </p>

            <form onSubmit={handleRatingSubmit} className="space-y-3">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    className="p-1 text-slate-300 hover:text-amber-400"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={2}
                placeholder="Write feedback..."
                className="w-full px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none"
                required
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingBookingId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-700 text-xs font-bold text-white shadow-xs"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
