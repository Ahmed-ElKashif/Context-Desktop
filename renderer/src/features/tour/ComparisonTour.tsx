import { useEffect, useRef, useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateProfile, updateUserLocalState } from "../../store/auth/authSlice";

const COMPARISON_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-compare-history",
    popover: {
      title: "⏱️ Comparison History",
      description:
        "Access all your previous comparisons here. You can jump back into any analysis without waiting for reprocessing.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-compare-selectors",
    popover: {
      title: "📄 Select Documents",
      description:
        "Choose a base document and a comparison document. The AI will immediately analyze their differences, similarities, and unique insights.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#tour-compare-export",
    popover: {
      title: "📥 Export Report",
      description:
        "Download a comprehensive, formatted report of the comparison analysis as a markdown file to share with your team.",
      side: "left",
      align: "center",
    },
  },
  {
    element: "#tour-compare-chat",
    popover: {
      title: "💬 Dual-Document Chat",
      description:
        "Ask questions about both documents simultaneously. The AI will synthesize answers drawing from both sources with citations.",
      side: "top",
      align: "center",
    },
  },
];

export const ComparisonTour = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { baseDoc, compareDoc } = useAppSelector((state) => state.comparison);
  const hasStartedRef = useRef(false);

  const completeTour = useCallback(() => {
    dispatch(updateUserLocalState({ hasCompletedComparisonTour: true }));
    dispatch(updateProfile({ hasCompletedComparisonTour: true }));
  }, [dispatch]);

  // Reset the guard when hasCompletedComparisonTour is set back to false (e.g. via Restart Tour)
  useEffect(() => {
    if (user && !(user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).hasCompletedComparisonTour) {
      hasStartedRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    // Guard: Only run if they haven't completed this tour, 
    // AND they are actually on the comparison page (indicated by the presence of tour-compare-selectors in the DOM)
    if (
      !user || 
      (user as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).hasCompletedComparisonTour || 
      hasStartedRef.current
    ) {
      return;
    }

    // Wait for the Comparison layout to fully render
    const timer = setTimeout(() => {
      // Final safety check to make sure the target elements exist (only exists on compare page)
      const selectorsEl = document.getElementById("tour-compare-selectors");
      if (!selectorsEl) return;

      hasStartedRef.current = true;

      const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        stagePadding: 8,
        stageRadius: 12,
        popoverOffset: 12,
        progressText: "{{current}} of {{total}}",
        steps: COMPARISON_TOUR_STEPS,
        onDestroyStarted: () => {
          completeTour();
          driverObj.destroy();
        },
      });

      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, completeTour, baseDoc, compareDoc]);

  return null;
};
