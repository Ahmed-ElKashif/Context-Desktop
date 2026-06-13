import { useState } from "react";
import { getPlanDetails, PlanId, BillingCycle } from "../constants/plans";

interface UsageEstimatorProps {
  selectedPlan: PlanId;
  billingCycle: BillingCycle;
}

export const UsageEstimator = ({
  selectedPlan,
  billingCycle,
}: UsageEstimatorProps) => {
  const [docs, setDocs] = useState(500);
  const [tokens, setTokens] = useState(50000);

  const planDetails = getPlanDetails(selectedPlan, billingCycle);

  // Calculations
  const extraDocs = planDetails.hasDocOverage
    ? Math.max(0, docs - planDetails.baseDocs)
    : 0;
  const docOverage = extraDocs * planDetails.docRate;

  const extraTokensDaily = planDetails.hasTokenOverage
    ? Math.max(0, tokens - planDetails.baseTokens)
    : 0;
  const tokenOverage = Math.round(
    (extraTokensDaily / 100000) * planDetails.tokenRatePer100k * 30,
  );

  const total =
    typeof planDetails.price === "number"
      ? planDetails.price + docOverage + tokenOverage
      : "Custom";

  return (
    <div className="w-full">
      <h2 className="text-sm font-mono font-bold text-light-text/60 dark:text-dark-text/50 uppercase tracking-widest mb-4">
        Usage Estimator —{" "}
        {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
      </h2>
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-white/5 shadow-sm mb-10">
        <h3 className="text-base font-extrabold text-light-text dark:text-white mb-6">
          Estimate your monthly bill
        </h3>

        {/* Sliders */}
        <div className="space-y-6 max-w-4xl">
          {/* Docs Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="w-40 shrink-0 text-sm font-bold text-light-text/80 dark:text-white/80">
              Documents / month
            </div>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={docs}
                onChange={(e) => setDocs(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-light-primary dark:accent-dark-primary"
              />
            </div>
            <div className="w-20 shrink-0 text-left sm:text-right text-sm font-black font-mono">
              {docs.toLocaleString()}
            </div>
          </div>

          {/* Tokens Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div className="w-40 shrink-0 text-sm font-bold text-light-text/80 dark:text-white/80">
              Tokens / day (avg)
            </div>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max="200000"
                step="5000"
                value={tokens}
                onChange={(e) => setTokens(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-light-primary dark:accent-dark-primary"
              />
            </div>
            <div className="w-20 shrink-0 text-left sm:text-right text-sm font-black font-mono">
              {tokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-light-bg/40 dark:bg-white/[0.02] border border-light-border/70 dark:border-white/5 rounded-xl p-4 flex flex-col">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">
              Base plan
            </span>
            <span className="text-xl font-black text-light-text dark:text-white">
              {typeof planDetails.price === "number"
                ? `${planDetails.price.toLocaleString()} EGP`
                : planDetails.price}
            </span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">
              {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} /
              month
            </span>
          </div>
          <div className="bg-light-bg/40 dark:bg-white/[0.02] border border-light-border/70 dark:border-white/5 rounded-xl p-4 flex flex-col">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">
              Doc overage
            </span>
            <span className="text-xl font-black text-light-text dark:text-white">
              {docOverage.toLocaleString()} EGP
            </span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">
              {extraDocs} extra docs
            </span>
          </div>
          <div className="bg-light-bg/40 dark:bg-white/[0.02] border border-light-border/70 dark:border-white/5 rounded-xl p-4 flex flex-col">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">
              Token overage
            </span>
            <span className="text-xl font-black text-light-text dark:text-white">
              {tokenOverage.toLocaleString()} EGP
            </span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">
              {extraTokensDaily.toLocaleString()} extra / day
            </span>
          </div>
          <div className="bg-light-bg/40 dark:bg-white/[0.02] border-2 border-light-primary dark:border-dark-primary rounded-xl p-4 flex flex-col shadow-sm">
            <span className="text-[11px] font-bold text-light-text/50 dark:text-white/40 mb-1 uppercase tracking-wide">
              Total est.
            </span>
            <span className="text-xl font-black text-light-primary dark:text-dark-primary">
              {typeof total === "number"
                ? `${total.toLocaleString()} EGP`
                : total}
            </span>
            <span className="text-xs text-light-text/60 dark:text-white/50 font-medium">
              / month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
