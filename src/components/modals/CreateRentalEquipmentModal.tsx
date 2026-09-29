import React, { useState, useRef } from 'react';
import { store } from '../../services/store';
import { EquipmentImageResolver, compressAndValidateImage } from '../../services/equipmentImages';
import { EquipmentCategory } from '../../types';
import {
  X,
  CheckCircle2,
  Tractor,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface CreateRentalEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateRentalEquipmentModal: React.FC<CreateRentalEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const user = store.getUser();

  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('Tractor');
  const [brand, setBrand] = useState('Mahindra');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<'Brand New' | 'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [pricePerHour, setPricePerHour] = useState('800');
  const [pricePerDay, setPricePerDay] = useState('4800');
  const [location, setLocation] = useState(user.location || 'Mysuru Rural');
  const [description, setDescription] = useState('');

  // Equipment Photos State (Section 3, 4, 5, 6, 7)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hidden File Inputs for Camera and Gallery
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process files from camera or gallery
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

      setUploadedPhotos((prev) => {
        const updated = [...prev, ...newPhotoUrls];
        return updated.slice(0, 5);
      });
    } catch (err: any) {
      setPhotoError(err.message || 'Photo upload failed. Please try again.');
    } finally {
      setIsProcessingPhoto(false);
      // Reset input values so same file can be re-selected if desired
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    setPhotoError(null);
    if (uploadedPhotos.length >= 5) {
      setPhotoError('Maximum 5 photos allowed.');
      return;
    }
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    setPhotoError(null);
    if (uploadedPhotos.length >= 5) {
      setPhotoError('Maximum 5 photos allowed.');
      return;
    }
    galleryInputRef.current?.click();
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setUploadedPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      // If primary was removed, default primary to index 0 of remaining
      if (primaryPhotoIndex === indexToRemove) {
        setPrimaryPhotoIndex(0);
      } else if (primaryPhotoIndex > indexToRemove) {
        setPrimaryPhotoIndex(primaryPhotoIndex - 1);
      }
      return next;
    });
    setPhotoError(null);
  };

  const handleSetPrimary = (index: number) => {
    setPrimaryPhotoIndex(index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim()) {
      setPhotoError('Please enter the equipment title or model.');
      return;
    }

    // Resolve primary photo according to preferred order (Section 2 & 13)
    const primaryImg =
      uploadedPhotos.length > 0
        ? uploadedPhotos[primaryPhotoIndex] || uploadedPhotos[0]
        : EquipmentImageResolver.resolve({ equipmentName, type: category });

    store.addEquipment({
      equipmentName: equipmentName.trim(),
      type: category,
      brand,
      model: model.trim() || undefined,
      isUsedEquipmentSale: false,
      pricePerHour: Number(pricePerHour) || 800,
      pricePerDay: Number(pricePerDay) || 4800,
      ownerName: user.name || 'Owner',
      ownerId: user.id,
      ownerPhone: user.phone || '+91 98450 11223',
      location: location.trim(),
      distanceKm: 2.1,
      availability: 'Available',
      condition,
      rating: 5.0,
      reviewCount: 1,
      verified: true,
      image: primaryImg,
      primaryImageUrl: primaryImg,
      imageUrls: uploadedPhotos.length > 0 ? uploadedPhotos : [primaryImg],
      description:
        description.trim() ||
        `${category} by ${brand} ${model ? model : ''}. Available for daily or hourly agricultural rental.`
    });

    setSuccessMsg('Equipment listed successfully.');
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
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Tractor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Add Rental Equipment</h3>
              <p className="text-[10px] text-slate-500">List machinery for hourly or daily farm rent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            <h4 className="text-sm font-bold">{successMsg}</h4>
            <p className="text-xs text-emerald-700">Your machinery is now visible to regional farmers.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Equipment Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Equipment Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className="w-full px-3 py-2 bg-slate-50 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="Tractor">Tractor</option>
                <option value="Sprayer">Sprayer</option>
                <option value="Harvester">Harvester</option>
                <option value="Rotavator">Rotavator</option>
                <option value="Cultivator">Cultivator</option>
                <option value="Seeder">Seeder</option>
                <option value="Plough">Plough</option>
                <option value="Other">Other Agricultural Machinery</option>
              </select>
            </div>

            {/* Equipment Name / Model */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Equipment Title / Model
              </label>
              <input
                type="text"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                placeholder="e.g. Mahindra 575 DI Tractor"
                className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            {/* Brand & Condition */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                >
                  <option value="Mahindra">Mahindra</option>
                  <option value="Swaraj">Swaraj</option>
                  <option value="John Deere">John Deere</option>
                  <option value="Sonalika">Sonalika</option>
                  <option value="Kubota">Kubota</option>
                  <option value="Shaktiman">Shaktiman</option>
                  <option value="Preet">Preet</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Rates Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rate / Hour (₹)</label>
                <input
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  placeholder="800"
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-800"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rate / Day (₹)</label>
                <input
                  type="number"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  placeholder="4800"
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-emerald-800"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mysuru Rural"
                className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                required
              />
            </div>

            {/* ============================================================== */}
            {/* EQUIPMENT PHOTOS SECTION (Sections 3, 4, 5, 6, 7, 12, 20) */}
            {/* ============================================================== */}
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wide">
                    Equipment Photos
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Add up to 5 original photos of your equipment ({uploadedPhotos.length}/5)
                  </p>
                </div>
                {uploadedPhotos.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
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

              {/* Photo Error Banner with Retry */}
              {photoError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                    <span className="truncate">{photoError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoError(null);
                      handleGalleryClick();
                    }}
                    className="ml-2 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-bold text-[10px] flex items-center gap-0.5 flex-shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>RETRY</span>
                  </button>
                </div>
              )}

              {/* Empty State vs. Photo Preview */}
              {uploadedPhotos.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2 bg-white">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                    <Camera className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Add photos of your equipment
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Clear photos increase farmer booking requests
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      disabled={isProcessingPhoto}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>TAKE PHOTO</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGalleryClick}
                      disabled={isProcessingPhoto}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>CHOOSE PHOTO</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Primary Photo Large Preview */}
                  <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shadow-2xs">
                    {currentPrimaryPhoto && (
                      <img
                        src={currentPrimaryPhoto}
                        alt="Primary equipment preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-emerald-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>PRIMARY PHOTO</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(primaryPhotoIndex)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xs"
                      title="Remove Primary Photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail Row of Additional Photos */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {uploadedPhotos.map((photo, idx) => {
                      const isPrimary = idx === primaryPhotoIndex;
                      return (
                        <div
                          key={idx}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                            isPrimary
                              ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                          onClick={() => handleSetPrimary(idx)}
                          title="Click to set as primary photo"
                        >
                          <img src={photo} alt={`Equipment ${idx + 1}`} className="w-full h-full object-cover" />
                          {isPrimary && (
                            <div className="absolute inset-0 bg-emerald-900/25 flex items-center justify-center pointer-events-none">
                              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add More Button if < 5 */}
                    {uploadedPhotos.length < 5 && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={handleCameraClick}
                          disabled={isProcessingPhoto}
                          className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-600 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 transition-colors bg-white"
                          title="Take another photo"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="text-[8px] font-bold mt-0.5">+ Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGalleryClick}
                          disabled={isProcessingPhoto}
                          className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-600 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-700 transition-colors bg-white"
                          title="Choose more from gallery"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[8px] font-bold mt-0.5">Gallery</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Description / Attachments Included
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Includes rotavator and disc plough hitch. Experienced driver provided if requested."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessingPhoto}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2 disabled:opacity-50"
            >
              Add Equipment For Rent
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
