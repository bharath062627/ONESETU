import React, { useState, useRef, useEffect } from 'react';
import { store } from '../../services/store';
import { compressAndValidateImage } from '../../services/equipmentImages';
import { FarmerProductCategory, FarmerProductUnit, FarmerProduct } from '../../types';
import { marketDataService } from '../../services/marketDataService';
import {
  X,
  Wheat,
  Camera,
  Image as ImageIcon,
  Plus,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface CreateFarmerSalesProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editProduct?: FarmerProduct | null;
}

export const CreateFarmerSalesProductModal: React.FC<CreateFarmerSalesProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editProduct
}) => {
  const user = store.getUser();

  const [productName, setProductName] = useState('Organic Red Tomatoes');
  const [category, setCategory] = useState<FarmerProductCategory>('Vegetables');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState<FarmerProductUnit>('kg');
  const [sellingPrice, setSellingPrice] = useState('28');
  const [location, setLocation] = useState(user.location || 'Mysuru, Karnataka');
  const [paymentMethods, setPaymentMethods] = useState<'CASH' | 'ONLINE' | 'BOTH'>('BOTH');
  const [contact, setContact] = useState(user.phone || '+91 98450 12345');
  const [farmerName, setFarmerName] = useState(user.name ? `${user.name} Farms` : 'Ravi Farms');
  const [description, setDescription] = useState('Freshly harvested grade-A tomatoes directly from our farm soil. Clean and sorted.');
  const [availability, setAvailability] = useState<'AVAILABLE' | 'LOW STOCK' | 'OUT OF STOCK' | 'INACTIVE'>('AVAILABLE');

  // Photo Collection State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Market Reference
  const [mandiRate, setMandiRate] = useState<number | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editProduct) {
      setProductName(editProduct.productName);
      setCategory(editProduct.category);
      setQuantity(editProduct.quantity.toString());
      setUnit(editProduct.unit);
      setSellingPrice(editProduct.sellingPrice.toString());
      setLocation(editProduct.location);
      setPaymentMethods(editProduct.paymentMethods);
      setContact(editProduct.contact || user.phone || '');
      setFarmerName(editProduct.farmerName);
      setDescription(editProduct.description);
      setAvailability(editProduct.availability);
      if (editProduct.imageUrls && editProduct.imageUrls.length > 0) {
        setUploadedPhotos(editProduct.imageUrls);
      } else if (editProduct.primaryImageUrl) {
        setUploadedPhotos([editProduct.primaryImageUrl]);
      }
    }
  }, [editProduct]);

  useEffect(() => {
    // Fetch latest Mandi benchmark for reference
    const records = marketDataService.getPrices(productName);
    if (records.length > 0) {
      setMandiRate(records[0].modalPrice);
    } else {
      setMandiRate(null);
    }
  }, [productName]);

  if (!isOpen) return null;

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setPhotoError(null);
    setIsProcessingPhoto(true);

    try {
      const remainingSlots = 5 - uploadedPhotos.length;
      if (remainingSlots <= 0) {
        setPhotoError('Maximum 5 photos allowed.');
        setIsProcessingPhoto(false);
        return;
      }

      if (files.length > remainingSlots) {
        setPhotoError(`Maximum 5 photos allowed. Added first ${remainingSlots} photo(s).`);
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newPhotoUrls: string[] = [];

      for (const file of filesToProcess) {
        const compressedDataUrl = await compressAndValidateImage(file);
        newPhotoUrls.push(compressedDataUrl);
      }

      setUploadedPhotos((prev) => [...prev, ...newPhotoUrls].slice(0, 5));
    } catch (err: any) {
      setPhotoError(err.message || 'Photo upload failed. Please try again.');
    } finally {
      setIsProcessingPhoto(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (primaryPhotoIndex === indexToRemove) {
        setPrimaryPhotoIndex(0);
      } else if (primaryPhotoIndex > indexToRemove) {
        setPrimaryPhotoIndex(primaryPhotoIndex - 1);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Idempotent submit protection

    setFormError(null);
    const parsedQty = parseFloat(quantity);
    const parsedPrice = parseFloat(sellingPrice);

    if (!productName.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setFormError('Valid quantity greater than 0 is required.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Valid selling price is required.');
      return;
    }
    if (!location.trim()) {
      setFormError('Location is required.');
      return;
    }

    setIsSubmitting(true);

    const primaryUrl = uploadedPhotos[primaryPhotoIndex] || uploadedPhotos[0] || '';

    if (editProduct) {
      store.updateFarmerProduct(editProduct.id, {
        productName: productName.trim(),
        category,
        quantity: parsedQty,
        unit,
        sellingPrice: parsedPrice,
        location: location.trim(),
        paymentMethods,
        contact: contact.trim(),
        farmerName: farmerName.trim(),
        description: description.trim(),
        availability,
        primaryImageUrl: primaryUrl,
        imageUrls: uploadedPhotos
      });
      setSuccessMsg('Product listing updated successfully.');
    } else {
      store.addFarmerProduct({
        farmerId: user.id,
        farmerName: farmerName.trim(),
        farmerPhone: contact.trim(),
        productName: productName.trim(),
        category,
        quantity: parsedQty,
        unit,
        sellingPrice: parsedPrice,
        currency: 'INR',
        location: location.trim(),
        description: description.trim(),
        primaryImageUrl: primaryUrl,
        imageUrls: uploadedPhotos,
        availability,
        contact: contact.trim(),
        paymentMethods,
        status: 'ACTIVE',
        verified: user.verified,
        mandiReferencePrice: mandiRate || undefined
      });
      setSuccessMsg('Product listed for direct sale successfully.');
    }

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-200">
              <Wheat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editProduct ? 'Edit Sales Listing' : 'Add Product for Sale'}
              </h2>
              <p className="text-[11px] text-emerald-200">Farmer Sales Point Direct Marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Organic Red Tomatoes, Yelakki Banana, Sona Masoori Paddy"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FarmerProductCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains">Grains</option>
                <option value="Pulses">Pulses</option>
                <option value="Spices">Spices</option>
                <option value="Other Farm Products">Other Farm Products</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantity Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as FarmerProductUnit)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="quintal">Quintal (100 kg)</option>
                <option value="tonne">Tonne (1000 kg)</option>
                <option value="piece">Piece</option>
                <option value="dozen">Dozen</option>
                <option value="bundle">Bundle</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Quantity & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Available Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Selling Price (₹ / {unit}) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="e.g. 28"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Optional Mandi Benchmark Display */}
          {mandiRate !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                <span>Latest Mandi Modal Benchmark:</span>
              </div>
              <span className="font-extrabold text-emerald-950">₹{mandiRate} / kg</span>
            </div>
          )}

          {/* Location & Farmer Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Farm Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mysuru, Karnataka"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. +91 98450 12345"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Accepted Payment Methods</label>
            <div className="flex items-center gap-2">
              {[
                { id: 'CASH', label: 'Cash Only' },
                { id: 'ONLINE', label: 'Online Only' },
                { id: 'BOTH', label: 'Cash + Online' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethods(method.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    paymentMethods === method.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Product Photos ({uploadedPhotos.length}/5)</label>
              <span className="text-[10px] text-slate-500">First photo is Primary</span>
            </div>

            {/* Photo Action Buttons */}
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadedPhotos.length >= 5 || isProcessingPhoto}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadedPhotos.length >= 5 || isProcessingPhoto}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Choose Gallery</span>
              </button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => processFiles(e.target.files)}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => processFiles(e.target.files)}
              />
            </div>

            {photoError && (
              <p className="text-[10px] font-bold text-rose-600 mb-2">{photoError}</p>
            )}

            {/* Photo Preview Strip */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPrimaryPhotoIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group ${
                      primaryPhotoIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200'
                    }`}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {primaryPhotoIndex === idx && (
                      <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black text-center py-0.5 uppercase">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(idx);
                      }}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe quality, farm soil, organic certification, packaging details..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
            >
              {isSubmitting ? (
                <span>Saving Listing...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{editProduct ? 'Update Product Listing' : 'Publish Product for Direct Sale'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
