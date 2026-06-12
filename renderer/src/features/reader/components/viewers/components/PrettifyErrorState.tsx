import { Icon } from "../../../../../components/ui/core/Icons";
import {
  PrettifyLimitError,
  PrettifyResult,
} from "../../../../../services/prettify.service";

interface PrettifyErrorStateProps {
  reduxLimitError: PrettifyLimitError | null;
  reduxError: string | null;
  handlePrettify: (force?: boolean) => void;
  previousResult: PrettifyResult | null;
  restorePrevious: () => void;
}

export const PrettifyErrorState = ({
  reduxLimitError,
  reduxError,
  handlePrettify,
  previousResult,
  restorePrevious,
}: PrettifyErrorStateProps) => {
  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center gap-5 p-8">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <Icon name="error" className="text-[32px] text-red-500" />
      </div>

      {reduxLimitError ? (
        <>
          <div className="text-center max-w-lg">
            <h3 className="text-lg font-bold text-light-text dark:text-white mb-2">
              Document Too Large for Prettify
            </h3>
            <p className="text-light-text/60 dark:text-white/50 mb-6 max-w-sm mx-auto">
              {reduxLimitError?.message || reduxError}
            </p>
          </div>
          {/* Suggestion box */}
          <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20 max-w-lg">
            <Icon
              name="lightbulb"
              className="text-[18px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
              {reduxLimitError.suggestion}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center max-w-md">
          <h3 className="text-lg font-bold text-light-text dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-light-text/60 dark:text-white/50 leading-relaxed">
            {reduxError || "An unexpected error occurred."}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-2">
        {!reduxLimitError && (
          <button
            onClick={() => handlePrettify(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Icon name="refresh" className="text-[16px]" />
            Try Again
          </button>
        )}
        {previousResult && (
          <button
            onClick={restorePrevious}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-light-bg dark:bg-[#0A0A0C] border border-light-border dark:border-white/8 text-light-text/60 dark:text-white/50 hover:text-light-text dark:hover:text-white transition-all cursor-pointer"
          >
            Restore Previous
          </button>
        )}
      </div>
    </div>
  );
};
