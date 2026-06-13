interface ScreenshotLightboxProps {
  url: string | null;
  onClose: () => void;
}

export const ScreenshotLightbox = ({
  url,
  onClose,
}: ScreenshotLightboxProps) => {
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <span className="material-symbols-rounded text-[20px]">close</span>
        </button>
        <img
          src={url}
          alt="Payment screenshot — full view"
          className="max-w-full max-h-[85vh] object-contain bg-white dark:bg-[#1A1A1E]"
        />
      </div>
    </div>
  );
};
