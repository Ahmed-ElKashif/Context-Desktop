import { useEffect, useRef, useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateProfile, updateUserLocalState } from "../../store/auth/authSlice";

const POPULATED_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-doc-header",
    popover: {
      title: "📄 Document Header",
      description:
        "Check your document's processing status, toggle between Original and Prettify viewing modes, and control your zoom.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#tour-exec-summary",
    popover: {
      title: "🧠 Metadata & Summary",
      description:
        "AI automatically extracts the core meaning, tags, and evaluates the cognitive load of the document so you don't have to read the whole file.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-ai-chat",
    popover: {
      title: "💬 Context Engine",
      description:
        "Ask questions! The AI reads this specific document and gives you precise answers with citations.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "#tour-sidebar-smart-library",
    popover: {
      title: "📚 The Full Library",
      description:
        "Click here anytime to view all your documents in a traditional file-explorer view, perform bulk actions, or organize with AI. Let's go there next!",
      side: "right",
      align: "center",
    },
  },
];

export const PopulatedTour = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { isUploading } = useAppSelector((state) => state.library);
  const { activeDocument } = useAppSelector((state) => state.workspace);
  const hasStartedRef = useRef(false);

  const completeTour = useCallback(() => {
    dispatch(updateUserLocalState({ hasCompletedPopulatedTour: true }));
    dispatch(updateProfile({ hasCompletedPopulatedTour: true }));
  }, [dispatch]);

  // Reset the guard when hasCompletedPopulatedTour is set back to false (e.g. via Restart Tour)
  useEffect(() => {
    if (user && !user.hasCompletedPopulatedTour) {
      hasStartedRef.current = false;
    }
  }, [user?.hasCompletedPopulatedTour]);

  useEffect(() => {
    // Guard: Only run if they haven't completed this tour, 
    // AND they have an active document (Populated Dashboard is active)
    // AND we aren't currently uploading
    if (
      !user || 
      user.hasCompletedPopulatedTour || 
      hasStartedRef.current || 
      !activeDocument || 
      isUploading
    ) {
      return;
    }

    // Wait for the PopulatedDashboard layout to fully render
    const timer = setTimeout(() => {
      // Final safety check to make sure the target elements exist
      const headerEl = document.getElementById("tour-doc-header");
      if (!headerEl) return;

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
        steps: POPULATED_TOUR_STEPS,
        onDestroyStarted: () => {
          completeTour();
          driverObj.destroy();
        },
      });

      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, completeTour, activeDocument, isUploading]);

  return null;
};
