import { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { fetchSettings } from "../../store/settings/settingsSlice";
import { updateProfile, updateUserLocalState } from "../../store/auth/authSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notify } from "../../components/ui/feedback/ToastEngine";

import { AppearanceSection } from "./components/AppearanceSection";
import { IntelligenceSection } from "./components/IntelligenceSection";
import { DesktopSection } from "./components/DesktopSection";
import { DangerZoneSection } from "./components/DangerZoneSection";
import { BillingSection } from "./components/BillingSection";
import { CheckoutSection } from "./components/CheckoutSection";

export function SettingsFeature() {
  const dispatch = useAppDispatch();
  const [showPlans, setShowPlans] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{
    planId: string;
    cycle: string;
  } | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleRestartTour = () => {
    dispatch(updateUserLocalState({ hasCompletedTour: false }));
    dispatch(updateProfile({ hasCompletedTour: false }));
    notify("Tour restarted! Redirecting to dashboard...", "success");
    setTimeout(() => navigate("/workspace"), 600);
  };

  const handleRestartPopulatedTour = () => {
    dispatch(updateUserLocalState({ hasCompletedPopulatedTour: false }));
    dispatch(updateProfile({ hasCompletedPopulatedTour: false }));
    notify("Document Tour restarted! Redirecting...", "success");
    setTimeout(() => navigate("/workspace"), 600);
  };

  const handleRestartLibraryTour = () => {
    dispatch(updateUserLocalState({ hasCompletedLibraryTour: false }));
    dispatch(updateProfile({ hasCompletedLibraryTour: false }));
    notify("Library Tour restarted! Redirecting...", "success");
    setTimeout(() => navigate("/library"), 600);
  };

  const handleRestartComparisonTour = () => {
    dispatch(updateUserLocalState({ hasCompletedComparisonTour: false }));
    dispatch(updateProfile({ hasCompletedComparisonTour: false }));
    notify("Comparison Tour restarted! Redirecting...", "success");
    setTimeout(() => navigate("/compare"), 600);
  };

  // Fetch settings data (including AI token usage) when the page mounts
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Handle Deep-Linked Checkout Flow
  useEffect(() => {
    const checkoutPlan = searchParams.get("checkoutPlan");
    const cycle = searchParams.get("cycle") || "monthly";

    if (checkoutPlan) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPlans(true);
      setCheckoutData({ planId: checkoutPlan, cycle });

      // Clean up the URL so it doesn't re-trigger on refresh
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("checkoutPlan");
      newSearchParams.delete("cycle");
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // FULL SCREEN PLANS VIEW
  if (checkoutData) {
    return (
      <div className="flex-1 overflow-y-auto scroll-smooth bg-light-bg dark:bg-dark-bg h-full w-full">
        <CheckoutSection
          planId={checkoutData.planId}
          cycle={checkoutData.cycle}
          onBack={() => setCheckoutData(null)}
        />
      </div>
    );
  }

  if (showPlans) {
    return (
      <div className="flex-1 overflow-y-auto scroll-smooth bg-light-bg dark:bg-dark-bg h-full w-full">
        <div className="py-12 px-6 md:px-8 max-w-[1200px] mx-auto w-full animate-enter">
          <div className="mb-8 flex justify-start">
            <button
              onClick={() => setShowPlans(false)}
              className="flex items-center gap-2 text-sm font-bold text-light-text/80 dark:text-dark-text/70 hover:text-light-primary dark:hover:text-dark-primary transition-colors bg-white dark:bg-dark-surface px-4 py-2 rounded-lg border border-light-border dark:border-white/5 shadow-sm"
            >
              <span className="material-symbols-rounded text-[18px]">
                arrow_back
              </span>
              Back to Settings
            </button>
          </div>
          <BillingSection
            onCheckout={(planId, cycle) => setCheckoutData({ planId, cycle })}
          />
        </div>
      </div>
    );
  }

  // STANDARD SETTINGS VIEW
  return (
    <div className="flex-1 overflow-y-auto scroll-smooth bg-light-bg dark:bg-dark-bg h-full w-full">
      <div className="py-12 px-6 md:px-8 w-full animate-enter">
        {/* Header (Aligned with standard width) */}
        <div className="max-w-3xl mx-auto w-full mb-10">
          <h1 className="text-4xl font-black mb-2 text-light-text dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-light-text/80 dark:text-dark-text/60 font-medium text-sm md:text-base">
            Configure your personal AI file system, billing, and data
            preferences.
          </p>
        </div>

        <div className="space-y-16 pb-16">
          {/* Standard Sections */}
          <div className="max-w-3xl mx-auto w-full space-y-16">
            <AppearanceSection />
            <DesktopSection />
            <IntelligenceSection />
          </div>

          {/* Upgrade Button */}
          <div className="max-w-3xl mx-auto w-full text-center p-8 bg-white dark:bg-dark-surface border border-light-border dark:border-white/5 rounded-2xl shadow-sm">
            <span className="material-symbols-rounded text-4xl text-light-primary dark:text-dark-primary mb-4">
              rocket_launch
            </span>
            <h3 className="text-lg font-bold text-light-text dark:text-white mb-2">
              Unlock more power
            </h3>
            <p className="text-sm font-medium text-light-text/70 dark:text-dark-text/60 mb-6 max-w-sm mx-auto">
              Need more documents, API access, or a custom token budget? Check
              out our premium plans.
            </p>
            <button
              onClick={() => setShowPlans(true)}
              className="px-6 py-2.5 rounded-lg bg-light-primary dark:bg-dark-primary text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 mx-auto"
            >
              Upgrade plan
              <span className="material-symbols-rounded text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Onboarding Tour */}
          <div className="max-w-3xl mx-auto w-full">
            <section>
              <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-6 border-b border-light-border dark:border-white/5 pb-2">
                Tour Guide
              </h2>
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/5 overflow-hidden shadow-sm divide-y divide-light-border dark:divide-white/5">
                {/* Row 1: Platform Tour */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-light-bg/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="font-extrabold text-light-text dark:text-white text-sm">
                      Welcome Tour
                    </p>
                    <p className="text-[11px] font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
                      Take a quick tour of the main dashboard to learn the
                      basics of the app.
                    </p>
                  </div>
                  <button
                    onClick={handleRestartTour}
                    className="px-4 py-2 shrink-0 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 hover:bg-light-bg dark:hover:bg-white/10 text-light-text dark:text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-sm">
                      replay
                    </span>
                    Restart
                  </button>
                </div>

                {/* Row 2: Document Tour */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-light-bg/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="font-extrabold text-light-text dark:text-white text-sm">
                      Reading & AI Chat Tour
                    </p>
                    <p className="text-[11px] font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
                      Learn how to use the AI to summarize and ask questions
                      about your files.
                    </p>
                  </div>
                  <button
                    onClick={handleRestartPopulatedTour}
                    className="px-4 py-2 shrink-0 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 hover:bg-light-bg dark:hover:bg-white/10 text-light-text dark:text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-sm">
                      replay
                    </span>
                    Restart
                  </button>
                </div>

                {/* Row 3: Library Tour */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-light-bg/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="font-extrabold text-light-text dark:text-white text-sm">
                      File Manager Tour
                    </p>
                    <p className="text-[11px] font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
                      Learn how to organize your files, create folders, and
                      manage your library.
                    </p>
                  </div>
                  <button
                    onClick={handleRestartLibraryTour}
                    className="px-4 py-2 shrink-0 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 hover:bg-light-bg dark:hover:bg-white/10 text-light-text dark:text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-sm">
                      replay
                    </span>
                    Restart
                  </button>
                </div>

                {/* Row 4: Comparison Tour */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-light-bg/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="font-extrabold text-light-text dark:text-white text-sm">
                      Comparison Tour
                    </p>
                    <p className="text-[11px] font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
                      Learn how to compare multiple documents and analyze their
                      differences.
                    </p>
                  </div>
                  <button
                    onClick={handleRestartComparisonTour}
                    className="px-4 py-2 shrink-0 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 hover:bg-light-bg dark:hover:bg-white/10 text-light-text dark:text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-sm">
                      replay
                    </span>
                    Restart
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Danger Zone */}
          <div className="max-w-3xl mx-auto w-full">
            <DangerZoneSection />
          </div>
        </div>

        <p className="pb-8 text-center text-xs font-bold text-light-text/70 dark:text-dark-text/70 font-mono tracking-widest">
          CONTEXT SYSTEM VERSION 1.0.0
        </p>
      </div>
    </div>
  );
}
