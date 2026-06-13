interface CheckoutSuccessProps {
  planName: string;
  total: number;
  onBack: () => void;
}

export const CheckoutSuccess = ({
  planName,
  total,
  onBack,
}: CheckoutSuccessProps) => {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-[#121214] flex items-center justify-center p-4 font-sans w-full">
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 rounded-2xl max-w-[500px] w-full p-8 shadow-[0_4px_24px_rgba(16,55,102,0.08)] dark:shadow-[0_4px_24px_rgba(139,92,246,0.1)] text-center">
        {/* Animated Check */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center animate-[bounceIn_0.5s_ease-out]">
          <span className="material-symbols-rounded text-[40px] text-green-500">
            check_circle
          </span>
        </div>

        <h2 className="text-2xl font-bold text-light-text dark:text-white mb-2">
          Payment Submitted!
        </h2>
        <p className="text-sm text-light-text/60 dark:text-dark-text/60 mb-6 leading-relaxed">
          Your payment for the{" "}
          <span className="font-semibold text-light-text dark:text-white">
            {planName}
          </span>{" "}
          plan ({total.toLocaleString()} EGP) is under review. We'll verify it
          within{" "}
          <span className="font-semibold text-light-text dark:text-white">
            24 hours
          </span>
          .
        </p>

        {/* Status Card */}
        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Pending Review
            </span>
          </div>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/60">
            You'll receive a notification once your payment is verified.
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full bg-light-primary dark:bg-dark-primary text-white font-bold py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
};
