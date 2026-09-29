import React, { useState } from 'react';
import { store } from '../../services/store';
import { FarmerProduct } from '../../types';
import { FarmerProductImageResolver } from '../../services/productImages';
import {
  X,
  MapPin,
  CheckCircle2,
  Phone,
  MessageSquare,
  Wheat,
  TrendingUp,
  Tag,
  Edit,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface FarmerProductDetailModalProps {
  product: FarmerProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: FarmerProduct) => void;
  onOpenChat?: () => void;
}

export const FarmerProductDetailModal: React.FC<FarmerProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onOpenChat
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const user = store.getUser();

  if (!isOpen || !product) return null;

  const isOwner = product.farmerId === user.id;

  const photos = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : [FarmerProductImageResolver.resolve(product.productName, product.category, product.primaryImageUrl)];

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const handleDelete = () => {
    store.deleteFarmerProduct(product.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Main Photo Gallery Preview */}
        <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
          <img
            src={currentPhoto}
            alt={product.productName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Top Bar Actions */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Farmer Direct Sale
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Header Title on Image */}
          <div className="absolute bottom-3 inset-x-4 text-white z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                {product.category}
              </span>
              {product.verified && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Farm
                </span>
              )}
            </div>
            <h2 className="text-xl font-black tracking-tight">{product.productName}</h2>
            <p className="text-xs text-emerald-200 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-300" />
              <span>{product.location}</span>
              {product.distanceKm && <span>• {product.distanceKm} km away</span>}
            </p>
          </div>
        </div>

        {/* Thumbnail Selector if multiple photos */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/95 overflow-x-auto no-scrollbar">
            {photos.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedPhotoIndex === idx ? 'border-emerald-400 ring-2 ring-emerald-400/40' : 'border-transparent opacity-60'
                }`}
              >
                <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Details Section */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Price & Quantity Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Selling Price</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-emerald-950">₹{product.sellingPrice}</span>
                <span className="text-xs font-bold text-emerald-700">/ {product.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Available Stock</p>
              <span className="text-sm font-black text-emerald-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 inline-block mt-0.5">
                {product.quantity} {product.unit} available
              </span>
            </div>
          </div>

          {/* Mandi Benchmark Reference if present */}
          {product.mandiReferencePrice && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-[11px] text-slate-700">
              <div className="flex items-center gap-1.5 font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Latest Mandi Benchmark:</span>
              </div>
              <span className="font-extrabold text-slate-900">₹{product.mandiReferencePrice} / kg</span>
            </div>
          )}

          {/* Farmer & Location Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black text-sm">
                  {product.farmerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{product.farmerName}</h4>
                  <p className="text-[10px] text-slate-500">{product.location}</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {product.availability}
              </span>
            </div>
          </div>

          {/* Accepted Payment Methods */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-slate-800 text-xs">Payment Accepted:</span>
            </div>
            <span className="font-extrabold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-[11px]">
              {product.paymentMethods === 'BOTH' ? 'Cash + Online' : product.paymentMethods === 'CASH' ? 'Cash Only' : 'Online Only'}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="font-bold text-slate-800 mb-1">Product Description</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {product.description}
              </p>
            </div>
          )}

          {/* Delete Confirm Alert */}
          {showDeleteConfirm && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-2">
              <p className="font-bold">Remove this product listing?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 py-1.5 bg-rose-600 text-white font-bold rounded-xl text-xs"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 bg-white border border-rose-200 text-rose-800 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          {isOwner ? (
            <>
              <button
                onClick={() => {
                  onClose();
                  if (onEdit) onEdit(product);
                }}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Listing</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-4 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl flex items-center justify-center gap-1 transition-colors text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <a
                href={`tel:${product.contact}`}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Farmer</span>
              </a>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Direct</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
