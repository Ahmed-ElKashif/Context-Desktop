import React from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { Icon } from "../../../components/ui/Icons";
import { Button } from "../../../components/ui/Button";
import { useAvatarCrop } from "../hooks/useAvatarCrop";

interface AvatarUploadProps {
  userAvatar?: string | null;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ userAvatar }) => {
  const {
    isUploadingAvatar,
    imageSrc,
    crop,
    setCrop,
    zoom,
    setZoom,
    rotation,
    previewUrl,
    isCropOpen,
    fileInputRef,
    handleRotate,
    onCropComplete,
    showFilePicker,
    onFileChange,
    uploadCroppedImage,
    closeCropModal,
    resetCropState,
    croppedAreaPixels,
  } = useAvatarCrop();

  return (
    <>
      {/* Avatar Dropzone Placeholder */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <div
          onClick={showFilePicker}
          className="w-28 h-28 rounded-full border-2 border-dashed border-light-border dark:border-white/20 flex flex-col items-center justify-center bg-light-bg dark:bg-[#121214] hover:border-light-primary dark:hover:border-dark-primary hover:bg-light-primary/5 dark:hover:bg-dark-primary/5 transition-all cursor-pointer group shadow-inner overflow-hidden"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <Icon
              name="add_a_photo"
              className="text-[28px] text-light-text/40 dark:text-white/30 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors"
            />
          )}
        </div>
        <input ref={fileInputRef} onChange={onFileChange} type="file" accept="image/*" className="hidden" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-light-text/50 dark:text-white/40 uppercase">
          Upload Avatar
        </span>
      </div>

      {/* Crop Modal */}
      {isCropOpen &&
        imageSrc &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-4">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] dark:bg-dark-surface max-h-[calc(100vh-2rem)] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-light-border/60 px-5 py-3.5 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-light-primary/10 dark:bg-dark-primary/15">
                    <Icon name="crop" className="text-base text-light-primary dark:text-dark-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-light-text dark:text-white leading-tight">Crop Avatar</h3>
                    <p className="text-[11px] text-light-text/50 dark:text-white/40">Drag to reposition &bull; scroll to zoom</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={closeCropModal} className="rounded-full -mr-1">
                  <Icon name="close" className="text-lg" />
                </Button>
              </div>

              {/* Cropper Area */}
              <div className="relative w-full bg-[#111] dark:bg-black shrink-0" style={{ height: "clamp(200px, 45vh, 320px)" }}>
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  minZoom={1}
                  maxZoom={3}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Controls */}
              <div className="border-t border-light-border/60 dark:border-white/10 px-5 py-3 space-y-3 shrink-0">
                {/* Preview + Zoom row */}
                <div className="flex items-center gap-4">
                  {/* Mini preview */}
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-light-primary/30 dark:border-dark-primary/30 bg-light-bg shadow-sm dark:bg-[#0E0E10]">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Icon name="person" className="text-lg text-light-text/20 dark:text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Zoom slider */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-light-text/50 dark:text-white/35">
                      <span>Zoom</span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      className="h-1.5 w-full cursor-pointer accent-light-primary dark:accent-dark-primary"
                    />
                  </div>
                </div>

                {/* Rotate buttons */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleRotate(-1)} className="flex-1 text-xs">
                    <Icon name="rotate_left" className="text-sm mr-1" />
                    Rotate Left
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleRotate(1)} className="flex-1 text-xs">
                    <Icon name="rotate_right" className="text-sm mr-1" />
                    Rotate Right
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetCropState} className="text-xs px-3">
                    <Icon name="restart_alt" className="text-sm" />
                  </Button>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-3 border-t border-light-border/60 dark:border-white/10 px-5 py-3 bg-light-bg/40 dark:bg-[#0c0c0e] shrink-0">
                <Button type="button" variant="outline" className="flex-1" onClick={closeCropModal}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold"
                  onClick={uploadCroppedImage}
                  disabled={isUploadingAvatar || !croppedAreaPixels}
                >
                  {isUploadingAvatar ? (
                    <Icon name="sync" className="mr-2 animate-spin text-base" />
                  ) : (
                    <Icon name="upload" className="mr-2 text-base" />
                  )}
                  Save Avatar
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
