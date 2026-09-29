import React, { useState, useEffect, useRef } from 'react';
import { store } from '../../services/store';
import { compressAndValidateImage } from '../../services/equipmentImages';
import {
  X,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  RotateCcw,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';

interface AdminManagePhotosModalProps {
  isOpen: boolean;
  targetModule: 'EQUIPMENT_RENT' | 'USED_EQUIPMENT' | 'SALE_POINT';
  targetId: string;
  targetTitle: string;
  initialPhotos: string[];
  initialPrimaryPhoto?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminManagePhotosModal: React.FC<AdminManagePhotosModalProps> = ({
  isOpen,
  targetModule,
  targetId,
  targetTitle,
  initialPhotos,
  initialPrimaryPhoto,
  onClose,
  onSuccess
}) => {
  const user = store.getUser();

  const [photos, setPhotos] = useState<string[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentList = initialPhotos && initialPhotos.length > 0 ? [...initialPhotos] : [];
      setPhotos(currentList);

      if (initialPrimaryPhoto && currentList.includes(initialPrimaryPhoto)) {
        setPrimaryIndex(currentList.indexOf(initialPrimaryPhoto));
      } else {
        setPrimaryIndex(0);
      }
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialPhotos, initialPrimaryPhoto]);

  if (!isOpen) return null;

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const remainingSlots = 5 - photos.length;
      if (replaceIndexRef.current === null && remainingSlots <= 0) {
        setErrorMsg('Maximum 5 photos allowed per listing.');
        setIsProcessing(false);
        return;
      }

      if (replaceIndexRef.current !== null) {
        // Replacing photo at index
        const idx = replaceIndexRef.current;
        const compressed = await compressAndValidateImage(files[0]);
        setPhotos((prev) => {
          const next = [...prev];
          next[idx] = compressed;
          return next;
        });
        replaceIndexRef.current = null;
      } else {
        // Adding photos
        const filesToAdd = Array.from(files).slice(0, remainingSlots);
        const newUrls: string[] = [];
        for (const file of filesToAdd) {
          const compressed = await compressAndValidateImage(file);
          newUrls.push(compressed);
        }
        setPhotos((prev) => [...prev, ...newUrls].slice(0, 5));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Photo processing failed.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceClick = (idx: number) => {
    replaceIndexRef.current = idx;
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = (idx: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (primaryIndex === idx) {
        setPrimaryIndex(0);
      } else if (primaryIndex > idx) {
        setPrimaryIndex(primaryIndex - 1);
      }
      return next;
    });
  };

  const handleSetPrimary = (idx: number) => {
    setPrimaryIndex(idx);
  };

  const handleMoveLeft = (idx: number) => {
    if (idx <= 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
    if (primaryIndex === idx) setPrimaryIndex(idx - 1);
    else if (primaryIndex === idx - 1) setPrimaryIndex(idx);
  };

  const handleMoveRight = (idx: number) => {
    if (idx >= photos.length - 1) return;
    setPhotos((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
    if (primaryIndex === idx) setPrimaryIndex(idx + 1);
    else if (primaryIndex === idx + 1) setPrimaryIndex(idx);
  };

  const handleSavePhotos = () => {
    if (photos.length === 0) {
      setErrorMsg('At least one photo is required.');
      return;
    }

    const primaryUrl = photos[primaryIndex] || photos[0];
    const success = store.adminUpdatePhotos(
      targetModule,
      targetId,
      photos,
      primaryUrl,
      user.id
    );

    if (success) {
      setSuccessMsg('Photos and primary thumbnail updated successfully.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
        onSuccess?.();
      }, 1000);
    } else {
      setErrorMsg('Failed to update photos. Admin privilege required.');
    }
  };

  const currentPrimaryPhoto = photos[primaryIndex] || photos[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Manage Listing Photos</h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{targetTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={replaceIndexRef.current === null}
          onChange={(e) => handleAddPhotos(e.target.files)}
          className="hidden"
        />

        {successMsg ? (
          <div className="p-6 bg-emerald-50 text-emerald-900 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
            <h4 className="text-sm font-bold">{successMsg}</h4>
            <p className="text-xs text-emerald-700">Updated photos are now active across all screens.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Photo Preview */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shadow-2xs">
              {currentPrimaryPhoto ? (
                <img
                  src={currentPrimaryPhoto}
                  alt="Primary thumbnail preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs mt-1">No photos added</span>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-emerald-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>PRIMARY THUMBNAIL</span>
              </div>
            </div>

            {/* Photo List & Controls */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700">
                  Listing Photos ({photos.length}/5)
                </span>
                {photos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      replaceIndexRef.current = null;
                      fileInputRef.current?.click();
                    }}
                    disabled={isProcessing}
                    className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Photo</span>
                  </button>
                )}
              </div>

              {photos.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                  Tap &ldquo;Add Photo&rdquo; above to upload equipment photos.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {photos.map((url, idx) => {
                    const isPrimary = idx === primaryIndex;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                          isPrimary
                            ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={url}
                            alt={`Photo ${idx + 1}`}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-200"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Photo #{idx + 1}
                            </span>
                            {isPrimary && (
                              <span className="text-[9px] font-bold text-emerald-700 block">
                                ★ Primary Image
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="px-2 py-1 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-md text-[10px] font-bold"
                              title="Set as Primary"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReplaceClick(idx)}
                            className="p-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-slate-600"
                            title="Replace Photo"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLeft(idx)}
                            disabled={idx === 0}
                            className="p-1 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 rounded-md text-slate-600"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRight(idx)}
                            disabled={idx === photos.length - 1}
                            className="p-1 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 rounded-md text-slate-600"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(idx)}
                            className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSavePhotos}
              disabled={isProcessing || photos.length === 0}
              className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all mt-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>SAVE PHOTO UPDATES</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
