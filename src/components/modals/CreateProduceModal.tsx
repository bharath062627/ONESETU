import React, { useState, useRef } from 'react';
import { store } from '../../services/store';
import { compressAndValidateImage } from '../../services/equipmentImages';
import {
  X,
  Wheat,
  Camera,
  Image as ImageIcon,
  Plus,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface CreateProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProduceModal: React.FC<CreateProduceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const user = store.getUser();

  const [productName, setProductName] = useState('Fresh Organic Carrots');
  const [category, setCategory] = useState<'Vegetables' | 'Fruits' | 'Grains' | 'Pulses' | 'Spices' | 'Other'>('Vegetables');
  const [quantity, setQuantity] = useState('400');
  const [unit, setUnit] = useState('kg');
  const [sellingPrice, setSellingPrice] = useState('35');
  const [location, setLocation] = useState(user.location || 'Mysuru Rural');
  const [paymentMethods, setPaymentMethods] = useState<'CASH' | 'ONLINE' | 'BOTH'>('BOTH');
  const [farmerPhone, setFarmerPhone] = useState(user.phone || '+91 98450 12345');
  const [description, setDescription] = useState('Freshly harvested grade-A carrots directly from farm soil. Clean and sorted.');

  // Photo Collection State (Section 24)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  const getCategoryFallbackImage = (cat: string): string => {
    switch (cat) {
      case 'Vegetables':
        return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c731?w=500&auto=format&fit=crop&q=80';
      case 'Fruits':
        return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80';
      case 'Grains':
        return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80';
      case 'Pulses':
        return 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=500&auto=format&fit=crop&q=80';
      case 'Spices':
        return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80';
      default:
        return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setPhotoError('Please enter a product name.');
      return;
    }

    const primaryImg =
      uploadedPhotos.length > 0
        ? uploadedPhotos[primaryPhotoIndex] || uploadedPhotos[0]
        : getCategoryFallbackImage(category);

    store.addProduce({
      productName: productName.trim(),
      category,
      quantity: Number(quantity) || 100,
      unit,
      expectedPrice: Number(sellingPrice) || 30,
      sellingPrice: Number(sellingPrice) || 30,
      location: location.trim(),
      farmerName: `${user.name || 'Local'} Farms`,
      farmerId: user.id,
      farmerPhone: farmerPhone.trim(),
      harvestDate: new Date().toISOString().split('T')[0],
      description: description.trim(),
      image: primaryImg,
      primaryImageUrl: primaryImg,
      imageUrls: uploadedPhotos.length > 0 ? uploadedPhotos : [primaryImg],
      paymentMethods,
      availability: 'Available',
      verified: true
    });

    setSuccessMsg('Produce listed successfully in Farmer Sales Point.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
      onSuccess?.();
    }, 1200);
  };

  const currentPrimaryPhoto =
    uploadedPhotos.length > 0 ? uploadedPhotos[primaryPhotoIndex] || uploadedPhotos[0] : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Farmer Sales Point</h3>
              <p className="text-[10px] text-slate-500">Directly list your farm produce for buyers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-slate-900">{successMsg}</h4>
            <p className="text-xs text-slate-500">Buyers can now view your listing and contact you directly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Product Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Produce Name / Variety
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Organic Carrots, Sona Masoori Paddy"
                className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            {/* Category & Unit Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Spices">Spices</option>
                  <option value="Other">Other Produce</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                >
                  <option value="kg">kg (Kilogram)</option>
                  <option value="quintal">quintal (100 kg)</option>
                  <option value="crates">crates</option>
                  <option value="bags">bags</option>
                </select>
              </div>
            </div>

            {/* Quantity & Selling Price Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Available Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="400"
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Selling Price (₹ / {unit})
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="35"
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-emerald-800 rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            {/* Payment Method Accepted (Section 26) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Accepted Payment Methods
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => setPaymentMethods('BOTH')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    paymentMethods === 'BOTH' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Cash + Online
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethods('CASH')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    paymentMethods === 'CASH' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Cash Only
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethods('ONLINE')}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    paymentMethods === 'ONLINE' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Online Only
                </button>
              </div>
            </div>

            {/* Location & Contact Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mysuru Rural"
                  className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                  required
                />
              </div>
            </div>

            {/* ============================================================== */}
            {/* PRODUCE PHOTOS SECTION (Section 24: TAKE PHOTO / GALLERY) */}
            {/* ============================================================== */}
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide">
                    Produce Photos
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Add original photos of your harvest ({uploadedPhotos.length}/5)
                  </p>
                </div>
                {uploadedPhotos.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {uploadedPhotos.length} / 5
                  </span>
                )}
              </div>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => processFiles(e.target.files)}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => processFiles(e.target.files)}
                className="hidden"
              />

              {/* Error banner */}
              {photoError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span className="truncate">{photoError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoError(null);
                      galleryInputRef.current?.click();
                    }}
                    className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-900 rounded font-bold text-[10px] flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RETRY</span>
                  </button>
                </div>
              )}

              {uploadedPhotos.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-3.5 text-center space-y-2 bg-white">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                    <Camera className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Add photos of your harvest
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Real photos build trust and get quicker buyers
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>TAKE PHOTO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>CHOOSE PHOTO</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Primary Photo Preview */}
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shadow-2xs">
                    {currentPrimaryPhoto && (
                      <img
                        src={currentPrimaryPhoto}
                        alt="Primary harvest preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-emerald-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                      <span>PRIMARY PHOTO</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(primaryPhotoIndex)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Row */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    {uploadedPhotos.map((photo, idx) => {
                      const isPrimary = idx === primaryPhotoIndex;
                      return (
                        <div
                          key={idx}
                          className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                            isPrimary ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                          }`}
                          onClick={() => setPrimaryPhotoIndex(idx)}
                        >
                          <img src={photo} alt={`Harvest ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600"
                          >
                            <X className="w-2 h-2" />
                          </button>
                        </div>
                      );
                    })}

                    {uploadedPhotos.length < 5 && (
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="w-12 h-12 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-600 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[7px] font-bold">+ More</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Description & Crop Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Harvested this morning, naturally grown, graded and packed in 25kg crates."
                className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessingPhoto}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-1 disabled:opacity-50"
            >
              List Produce in Farmer Sales Point
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
