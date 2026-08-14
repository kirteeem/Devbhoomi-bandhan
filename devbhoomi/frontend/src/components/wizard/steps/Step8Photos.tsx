import { useState, useRef } from "react";
import { uploadProfilePhoto } from "../../../lib/profileApi";
import { resolvePhotoUrl } from "../../../lib/media";
import { useAuth } from "../../../context/AuthContext";
import { Camera, Plus, Loader2, CheckCircle2, RefreshCw, Trash2, MoveVertical } from "lucide-react";

interface PhotoItem {
  id: string;
  url: string;
  isProfilePhoto: boolean;
  verticalOffset?: number; // Added to store the y-axis positioning percentage
}

interface Step8PhotosProps {
  data: any;
  updateData: (fields: any) => void;
  onPhotosChange: (photos: PhotoItem[]) => void;
  existingPhotos?: PhotoItem[];
}

export const Step8Photos = ({
  data,
  updateData,
  onPhotosChange,
  existingPhotos = [],
}: Step8PhotosProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetIndexRef = useRef<number | null>(null);
  const { user, updateUser } = useAuth();

  // Source of truth for photos list
  const photosList: PhotoItem[] = data?.photos ?? existingPhotos ?? [];

  const handleSlotClick = (index: number) => {
    if (uploading) return;
    targetIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploading) return;

    let updatedPhotos = photosList.filter((_, idx) => idx !== indexToRemove);

    if (indexToRemove === 0 && updatedPhotos.length > 0) {
      updatedPhotos[0] = { ...updatedPhotos[0], isProfilePhoto: true };
    }

    onPhotosChange(updatedPhotos);
    updateData({ photos: updatedPhotos });
  };

  const handleOffsetChange = (index: number, value: number) => {
    const updatedPhotos = [...photosList];
    if (updatedPhotos[index]) {
      updatedPhotos[index] = {
        ...updatedPhotos[index],
        verticalOffset: value,
      };
      onPhotosChange(updatedPhotos);
      updateData({ photos: updatedPhotos });
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      let accumulatedPhotos = [...photosList];
      const targetIndex = targetIndexRef.current;

      const isProfilePhoto =
        targetIndex === 0 ||
        (targetIndex === null && accumulatedPhotos.length === 0);

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;

        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} is over 5MB.`);
          continue;
        }

        const uploadedPhoto = await uploadProfilePhoto(file, isProfilePhoto);

        if (uploadedPhoto) {
          if (user) {
            updateUser({ ...user, profileCompletion: uploadedPhoto.profileCompletion });
          }

          if (isProfilePhoto) {
            accumulatedPhotos = accumulatedPhotos.map((photo) => ({
              ...photo,
              isProfilePhoto: false,
            }));
          }

          const photoPayload = {
            ...uploadedPhoto,
            isProfilePhoto,
            verticalOffset: 50, // Default to center (50%) on initial upload
          };

          if (
            targetIndex !== null &&
            targetIndex >= 0 &&
            targetIndex < accumulatedPhotos.length
          ) {
            accumulatedPhotos[targetIndex] = photoPayload;
          } else {
            accumulatedPhotos.push(photoPayload);
          }

          accumulatedPhotos = accumulatedPhotos.slice(0, 2);
        }

        break;
      }

      onPhotosChange(accumulatedPhotos);
      updateData({ photos: accumulatedPhotos });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Upload failed. Please verify credentials."
      );
    } finally {
      setUploading(false);
      targetIndexRef.current = null;
    }
  };

  const totalSlots = 2;
  const slots = Array.from({ length: totalSlots }).map((_, index) => {
    return photosList[index] || null;
  });

  return (
    <div className="space-y-8 w-full font-sans antialiased max-w-2xl mx-auto">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[#7B1E3D] bg-[#7B1E3D]/5 px-3 py-1 rounded-full border border-[#7B1E3D]/10 mb-3">
          <Camera size={12} /> Visual Verification Profile
        </span>
        <h3 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Upload Presentation Gallery</h3>
        <p className="text-xs text-zinc-400 font-medium mt-1">
          Profiles with clear photographs receive up to 8x higher engagement rates. Curate your presentation with up to 2 premium images — entirely optional. Prefer not to upload? We'll show a tasteful default avatar on your profile instead.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3.5 rounded-xl font-medium">
          {error}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        disabled={uploading}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <div className="bg-[#FBF9F6] border border-[#ECE8E2] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {slots.map((photo, index) => {
            const isMandatoryProfileSlot = index === 0;

            return (
              <div
                key={index}
                onClick={() => !photo && handleSlotClick(index)}
                className={`relative aspect-[4/5] rounded-xl border flex flex-col items-center justify-center transition-all duration-300 group overflow-hidden select-none ${
                  photo 
                    ? "border-[#ECE8E2] bg-white" 
                    : isMandatoryProfileSlot
                      ? "border-dashed border-[#7B1E3D]/40 bg-[#7B1E3D]/5 hover:bg-[#7B1E3D]/10 cursor-pointer"
                      : "border-dashed border-zinc-200 bg-white hover:border-zinc-400 cursor-pointer"
                }`}
              >
                {photo ? (
                  <>
                    <img
                      src={resolvePhotoUrl(photo.url)}
                      alt={`Gallery slot ${index + 1}`}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      style={{
                        objectPosition: `center ${photo.verticalOffset ?? 50}%`
                      }}
                    />

                    {/* INTERACTIVE ACTION BACKDROP OVERLAY */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 z-10">
                      
                      {/* TOP ACTIONS ROW */}
                      <div className="flex justify-end gap-2 w-full">
                        <button
                          type="button"
                          title="Change / Replace Photo"
                          onClick={() => handleSlotClick(index)}
                          className="p-2 bg-white/90 hover:bg-white text-zinc-800 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                        >
                          <RefreshCw size={14} className={uploading && targetIndexRef.current === index ? "animate-spin" : ""} />
                        </button>
                        <button
                          type="button"
                          title="Remove Photo"
                          onClick={(e) => handleRemovePhoto(index, e)}
                          className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* MIDDLE: POSITION ADJUSTMENT SLIDER */}
                      <div 
                        className="w-full px-2 py-2 bg-black/40 rounded-xl backdrop-blur-md border border-white/10 space-y-1.5"
                        onClick={(e) => e.stopPropagation()} // Stop click from bubbling up
                      >
                        <div className="flex items-center justify-between text-white text-[10px] font-semibold tracking-wide">
                          <span className="flex items-center gap-1">
                            <MoveVertical size={11} className="text-zinc-300" /> Position Face
                          </span>
                          <span className="text-zinc-300 text-[9px]">{photo.verticalOffset ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={photo.verticalOffset ?? 50}
                          onChange={(e) => handleOffsetChange(index, parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#7B1E3D]"
                        />
                      </div>

                      {/* BOTTOM TEXT METADATA */}
                      <div className="text-center text-white/70 font-medium text-[9px] tracking-wide">
                        Use slider to adjust display alignment
                      </div>
                    </div>

                      {/* STATUS SHIELDS */}
                    {photo.isProfilePhoto || isMandatoryProfileSlot ? (
                      <span className="absolute bottom-3 left-3 right-3 bg-[#7B1E3D] text-white text-[9px] uppercase font-bold tracking-widest py-1 px-2 rounded-md shadow-md text-center flex items-center justify-center gap-1 backdrop-blur-sm bg-opacity-95 z-0 group-hover:opacity-0 transition-opacity">
                        <CheckCircle2 size={10} className="text-[#C89A45]" /> Primary Display
                      </span>
                    ) : (
                      <span className="absolute bottom-3 left-3 right-3 bg-zinc-900/90 text-white text-[9px] uppercase font-bold tracking-widest py-1 px-2 rounded-md shadow-md text-center backdrop-blur-sm z-0 group-hover:opacity-0 transition-opacity">
                        Secondary Photo
                      </span>
                    )}
                  </>
                ) : (
                  /* EMPTY WORKFLOW STATE DISPLAY */
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    {uploading && targetIndexRef.current === index ? (
                      <Loader2 size={20} className="animate-spin text-[#7B1E3D]" />
                    ) : (
                      <div className={`p-2.5 rounded-full transition-all ${
                        isMandatoryProfileSlot 
                          ? "bg-[#7B1E3D]/10 text-[#7B1E3D] group-hover:scale-110" 
                          : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-600"
                      }`}>
                        <Plus size={16} strokeWidth={2.5} />
                      </div>
                    )}
                    
                    <span className={`text-[11px] font-semibold tracking-tight ${
                      isMandatoryProfileSlot ? "text-[#7B1E3D]" : "text-zinc-400 group-hover:text-zinc-600"
                    }`}>
                      {isMandatoryProfileSlot ? "Profile Photo" : "Add Image"}
                    </span>

                    {isMandatoryProfileSlot && (
                      <span className="text-[9px] text-zinc-400 font-medium -mt-1">
                        Optional
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};