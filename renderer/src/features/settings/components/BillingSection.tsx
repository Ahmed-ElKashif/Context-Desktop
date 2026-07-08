import { useState } from "react";
import { PlanId, BillingCycle, getPlanDetails } from "../../billing/constants/plans";
import { UsageEstimator } from "../../billing/components/UsageEstimator";
import { AddonCard } from "./AddonCard";

interface BillingSectionProps {
  onCheckout: (planId: string, cycle: string) => void;
}

export const BillingSection = ({ onCheckout }: BillingSectionProps) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("sandbox");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const startupMonthly = getPlanDetails("startup", "monthly").price;
  const startupCurrent = getPlanDetails("startup", billingCycle).price;
  
  const growthMonthly = getPlanDetails("growth", "monthly").price;
  const growthCurrent = getPlanDetails("growth", billingCycle).price;

  const handleOpenCheckout = (planId: PlanId) => {
    onCheckout(planId, billingCycle);
  };

  const getPlanClassName = (planId: string) => {
    const isSelected = selectedPlan === planId;
    return `bg-white dark:bg-dark-surface rounded-2xl p-6 flex flex-col h-full relative cursor-pointer transition-all duration-300 focus-ring-standard outline-none ${
      isSelected
        ? "border-2 border-light-primary dark:border-dark-primary shadow-[0_4px_24px_rgba(16,55,102,0.08)] dark:shadow-[0_4px_24px_rgba(139,92,246,0.1)] transform scale-[1.02] z-10"
        : "border border-light-border dark:border-white/5 shadow-sm group hover:border-light-primary/30 dark:hover:border-dark-primary/30"
    }`;
  };

  const getButtonClassName = (planId: string) => {
    const isSelected = selectedPlan === planId;
    return `mt-6 w-full py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-1 transition-all duration-300 ${
      isSelected
        ? "bg-light-primary dark:bg-dark-primary text-white shadow-md hover:opacity-90"
        : "border border-light-border dark:border-white/10 text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 shadow-sm"
    }`;
  };

  const renderFeature = (
    text: string,
    icon: string = "check",
    iconColor: string = "text-green-500",
    isLock = false,
  ) => (
    <div className="flex items-start gap-2 text-xs font-medium text-light-text dark:text-dark-text/80 leading-relaxed mb-3">
      <span
        className={`material-symbols-rounded text-[14px] mt-[1px] shrink-0 ${iconColor} ${isLock ? "text-[#8b5cf6]" : ""}`}
      >
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );

  return (
    <section className="font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-1">
            Plans
          </h2>
          <p className="text-sm text-light-text/70 dark:text-dark-text/70 font-medium">
            Scale your AI document intelligence. Cancel anytime.
          </p>
        </div>

        {/* Monthly / Annual Toggle */}
        <div className="flex bg-light-bg dark:bg-[#121214] p-1 rounded-xl border border-light-border dark:border-white/5 shadow-inner w-max">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors focus-ring-standard ${
              billingCycle === "monthly"
                ? "text-light-primary dark:text-white bg-white dark:bg-white/10 shadow-sm border border-light-border dark:border-white/10"
                : "text-light-text/70 dark:text-white/70 bg-transparent hover:text-light-text border border-transparent"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 focus-ring-standard ${
              billingCycle === "annual"
                ? "text-light-primary dark:text-white bg-white dark:bg-white/10 shadow-sm border border-light-border dark:border-white/10"
                : "text-light-text/70 dark:text-white/70 bg-transparent hover:text-light-text border border-transparent"
            }`}
          >
            Annual
            <span className="bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
              Save up to 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {/* Sandbox */}
        <div
          onClick={() => setSelectedPlan("sandbox")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan("sandbox"); }}
          tabIndex={0}
          className={getPlanClassName("sandbox")}
        >
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold tracking-wide uppercase mb-4 w-max">
            Free embed
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">
            Sandbox
          </h3>
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-4 h-8">
            Try Context inside your product
          </p>
          <div className="mb-2 h-14 flex flex-col justify-center">
            <div>
              <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">
                0 EGP
              </span>
              <span className="text-sm font-semibold text-light-text/70 dark:text-dark-text/70 ml-1">
                / mo
              </span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-light-text/70 dark:text-dark-text/70 mb-6 h-8">
            Up to 3 seats &middot; no card needed
          </p>

          <div className="flex-1 border-t border-light-border/50 dark:border-white/5 pt-6">
            {renderFeature("50 documents / month")}
            {renderFeature("Full AI summaries + tags")}
            {renderFeature("Cognitive load on every doc")}
            {renderFeature("Visual Cortex OCR")}
            {renderFeature("RAG chat + semantic search")}
            {renderFeature("30,000 tokens / day")}
            {renderFeature("DeepThinker comparison", "lock", "", true)}
            {renderFeature("AI folder organizer", "lock", "", true)}
            {renderFeature("Synthesizer", "lock", "", true)}
            {renderFeature("ZIP export", "lock", "", true)}
          </div>

          <button
            className={getButtonClassName("sandbox")}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlan("sandbox");
              handleOpenCheckout("sandbox");
            }}
          >
            Start free{" "}
            <span className="material-symbols-rounded text-[16px]">
              arrow_outward
            </span>
          </button>
        </div>

        {/* Startup (Highlighted) */}
        <div
          onClick={() => setSelectedPlan("startup")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan("startup"); }}
          tabIndex={0}
          className={getPlanClassName("startup")}
        >
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary text-[10px] font-bold tracking-wide uppercase mb-4 w-max border border-light-primary/20 dark:border-dark-primary/20">
            Most adopted
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">
            Startup
          </h3>
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-4 h-8">
            Growing products embedding Context
          </p>
          <div className="mb-2 h-14 flex flex-col justify-center">
            {billingCycle === "annual" && (
              <span className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 line-through mb-0.5">
                Was {startupMonthly} EGP / mo
              </span>
            )}
            <div>
              <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">
                {startupCurrent} EGP
              </span>
              <span className="text-sm font-semibold text-light-text/70 dark:text-dark-text/70 ml-1">
                / mo
              </span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-light-text/70 dark:text-dark-text/70 mb-6 h-8">
            1 seat &middot;{" "}
            {billingCycle === "annual" ? "billed annually" : "billed monthly"}
          </p>

          <div className="flex-1 border-t border-light-primary/20 dark:border-dark-primary/20 pt-6">
            {renderFeature("500 documents / month")}
            {renderFeature("Everything in Sandbox")}
            {renderFeature("150,000 tokens / day")}
            {renderFeature("DeepThinker comparison")}
            {renderFeature("AI folder organizer")}
            {renderFeature("Document synthesizer")}
            {renderFeature("ZIP export of organized folders")}
            {renderFeature("Admin panel + CSV export")}
            {renderFeature("Usage analytics dashboard")}
            {renderFeature("Pay-per-use overage available")}
          </div>

          <button
            className={getButtonClassName("startup")}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlan("startup");
              handleOpenCheckout("startup");
            }}
          >
            Get started{" "}
            <span className="material-symbols-rounded text-[16px]">
              arrow_outward
            </span>
          </button>
        </div>

        {/* Growth */}
        <div
          onClick={() => setSelectedPlan("growth")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan("growth"); }}
          tabIndex={0}
          className={getPlanClassName("growth")}
        >
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-[10px] font-bold tracking-wide uppercase mb-4 w-max">
            Scale
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">
            Growth
          </h3>
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-4 h-8">
            High-volume or multi-product teams
          </p>
          <div className="mb-2 h-14 flex flex-col justify-center">
            {billingCycle === "annual" && (
              <span className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 line-through mb-0.5">
                Was {growthMonthly} EGP / mo
              </span>
            )}
            <div>
              <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">
                {growthCurrent} EGP
              </span>
              <span className="text-sm font-semibold text-light-text/70 dark:text-dark-text/70 ml-1">
                / mo
              </span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-light-text/70 dark:text-dark-text/70 mb-6 h-8">
            Up to 5 seats &middot;{" "}
            {billingCycle === "annual" ? "billed annually" : "billed monthly"}
          </p>

          <div className="flex-1 border-t border-light-border/50 dark:border-white/5 pt-6">
            {renderFeature("Unlimited documents")}
            {renderFeature("Everything in Startup")}
            {renderFeature("450,000 tokens / day")}
            {renderFeature("Custom persona fine-tuning")}
            {renderFeature("Priority AI processing queue")}
            {renderFeature("Isolated tenant namespace")}
            {renderFeature("SLA: 99.5% uptime")}
            {renderFeature("Dedicated account manager")}
            {renderFeature("Onboarding session (3 hrs)")}
            {renderFeature("Lower overage rates (-30%)")}
          </div>

          <button
            className={getButtonClassName("growth")}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlan("growth");
              handleOpenCheckout("growth");
            }}
          >
            Get started{" "}
            <span className="material-symbols-rounded text-[16px]">
              arrow_outward
            </span>
          </button>
        </div>

        {/* Embed / Enterprise */}
        <div
          onClick={() => setSelectedPlan("embed")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedPlan("embed"); }}
          tabIndex={0}
          className={getPlanClassName("embed")}
        >
          <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-bold tracking-wide uppercase mb-4 w-max">
            Enterprise
          </div>
          <h3 className="text-xl font-bold text-light-text dark:text-white mb-1">
            Embed
          </h3>
          <p className="text-xs text-light-text/70 dark:text-dark-text/70 mb-4 h-8">
            White-label inside your platform
          </p>
          <div className="mb-2 h-14 flex items-center">
            <span className="text-3xl font-black text-light-text dark:text-white tracking-tighter">
              Custom
            </span>
          </div>
          <p className="text-[11px] font-medium text-light-text/70 dark:text-dark-text/70 mb-6 h-8">
            Revenue share or flat licence
          </p>

          <div className="flex-1 border-t border-light-border/50 dark:border-white/5 pt-6">
            {renderFeature("Everything in Growth")}
            {renderFeature("Full white-label UI")}
            {renderFeature("REST API for all AI services")}
            {renderFeature("Custom token budget per user")}
            {renderFeature("Dedicated infra environment")}
            {renderFeature("Co-marketing in Egypt")}
            {renderFeature("Source code escrow option")}
            {renderFeature("Joint GTM planning")}
            {renderFeature("NDA + MSA provided")}
            {renderFeature("Negotiated overage caps")}
          </div>

          <button
            className={getButtonClassName("embed")}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlan("embed");
              //gmail business account
              window.open(
                "https://mail.google.com/mail/?view=cm&fs=1&to=marioemad426@gmail.com",
                "_blank",
              );
            }}
          >
            Talk to founders{" "}
            <span className="material-symbols-rounded text-[16px]">
              arrow_outward
            </span>
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="flex items-center gap-2 text-[11px] font-semibold text-light-text/70 dark:text-dark-text/70 mb-12">
        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]"></div>
        <p>
          Purple lock icons = paywalled features (DeepThinker, AI folder
          organizer, synthesizer, ZIP export) — unlocked from Startup upward
        </p>
      </div>

      {/* Estimator Section */}
      <UsageEstimator selectedPlan={selectedPlan} billingCycle={billingCycle} />

      {/* Add-ons Package Section */}
      <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-4">
        Add-ons Package
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <AddonCard
          icon="description"
          iconBgClass="bg-green-500/10"
          iconTextClass="text-green-600 dark:text-green-400"
          checkClass="text-green-500"
          title="Extra Documents"
          description="Increase document capacity and intelligence limits instantly"
          priceText="500 EGP"
          cycleText="/ one-time"
          features={[
            "Pay-as-you-go flexibility",
            "Unlocks extra source file uploads"
          ]}
          onAction={() => onCheckout("extra_docs", "monthly")}
        />

        <AddonCard
          icon="memory"
          iconBgClass="bg-purple-500/10"
          iconTextClass="text-purple-600 dark:text-purple-400"
          checkClass="text-purple-500"
          title="Extra Tokens"
          description="Extend daily LLM token quotas for high-volume execution"
          priceText="700 EGP"
          cycleText="/ one-time"
          features={[
            "Expanded daily AI usage limit",
            "Saves processing priority queue"
          ]}
          onAction={() => onCheckout("extra_tokens", "monthly")}
        />

        <AddonCard
          icon="dns"
          iconBgClass="bg-blue-500/10"
          iconTextClass="text-blue-600 dark:text-blue-400"
          checkClass="text-blue-500"
          title="High-Speed Storage"
          description="Extend cloud database capacity for massive knowledge repositories"
          priceText="Custom"
          cycleText="/ pay-as-you-go"
          features={[
            "7 EGP / GB / month over 20 GB",
            "Secure high-availability hosting"
          ]}
          onAction={() =>
            window.open(
              "https://mail.google.com/mail/?view=cm&fs=1&to=marioemad426@gmail.com",
              "_blank"
            )
          }
        />
      </div>
    </section>
  );
};
