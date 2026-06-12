import React, { useRef, useState } from 'react';

interface ImageDropzoneProps {
  screenshot: File | null;
  screenshotPreview: string | null;
  error?: string;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export const ImageDropzone = ({
  screenshot,
  screenshotPreview,
  error,
  onFileSelect,
  onFileRemove,
}: ImageDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const removeScreenshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-bold text-light-text dark:text-white mb-1.5">
        Payment Screenshot <span className="text-red-500">*</span>
      </label>

      {!screenshotPreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-light-primary dark:border-dark-primary bg-light-primary/5 dark:bg-dark-primary/5 scale-[1.01]'
              : error
              ? 'border-red-400 dark:border-red-500/50 bg-red-500/5'
              : 'border-light-border dark:border-white/10 hover:border-light-primary/50 dark:hover:border-dark-primary/50 hover:bg-light-bg dark:hover:bg-white/[0.02]'
          }`}
        >
          <span
            className={`material-symbols-rounded text-[36px] mb-2 ${
              isDragging
                ? 'text-light-primary dark:text-dark-primary'
                : 'text-light-text/20 dark:text-white/15'
            }`}
          >
            cloud_upload
          </span>
          <p className="text-sm font-semibold text-light-text/60 dark:text-dark-text/60 mb-1">
            {isDragging ? 'Drop your screenshot here' : 'Click or drag screenshot here'}
          </p>
          <p className="text-[11px] text-light-text/40 dark:text-dark-text/40">
            PNG, JPG up to 10MB
          </p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-light-border dark:border-white/10 group">
          <img
            src={screenshotPreview}
            alt="Payment screenshot"
            className="w-full max-h-[200px] object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <button
              onClick={removeScreenshot}
              className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-lg"
            >
              <span className="material-symbols-rounded text-[16px]">delete</span>
              Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
            {screenshot?.name}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1">
          <span className="material-symbols-rounded text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
};
