import { Icon } from "../../../components/ui/Icons";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  onOrganizeAI?: () => void; // 🛠️ NEW: Optional prop for the AI Action
  onSynthesizeAI?: () => void; // For Synthesizing multiple documents
}

export const BulkActionBar = ({
  selectedCount,
  onDelete,
  onClear,
  onOrganizeAI,
  onSynthesizeAI,
}: BulkActionBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#18181B]/95 dark:bg-white/95 backdrop-blur-md border border-white/10 dark:border-black/10 text-white dark:text-black px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 z-40 animate-in slide-in-from-bottom-10 fade-in duration-200">
      <span className="font-extrabold text-xs tracking-wide uppercase font-mono opacity-80 px-2">{selectedCount} selected</span>

      {/* 🛠️ The Mastermind Organize Button */}
      {onOrganizeAI && (
        <button
          onClick={onOrganizeAI}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-all active:scale-95 shadow-sm bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-50 dark:text-blue-600 dark:border-blue-200 dark:hover:bg-blue-100 whitespace-nowrap"
        >
          <Icon name="auto_awesome" className="text-[16px]" /> Organize With AI
        </button>
      )}

      {/* 🛠️ Synthesis Button */}
      {onSynthesizeAI && selectedCount >= 2 && (
        <button
          onClick={onSynthesizeAI}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-all active:scale-95 shadow-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 dark:bg-purple-50 dark:text-purple-600 dark:border-purple-200 dark:hover:bg-purple-100 whitespace-nowrap"
        >
          <Icon name="psychology" className="text-[16px]" /> Synthesize With AI
        </button>
      )}

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-all active:scale-95 shadow-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 dark:bg-red-50 dark:text-red-600 dark:border-red-200 dark:hover:bg-red-100 whitespace-nowrap"
      >
        <Icon name="delete" className="text-[16px]" /> Delete
      </button>

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-all active:scale-95 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 dark:bg-black/5 dark:text-gray-600 dark:border-black/10 dark:hover:bg-black/10 dark:hover:text-black whitespace-nowrap ml-1"
      >
        <Icon name="close" className="text-[16px]" />
      </button>
    </div>
  );
};
