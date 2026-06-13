import { useEffect, useRef, useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateProfile, updateUserLocalState } from "../../store/auth/authSlice";

/**
 * Tour step definitions — each targets a DOM element by its ID.
 * The IDs are added to Sidebar.tsx and TopNav.tsx.
 */
const TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-sidebar-workspace",
    popover: {
      title: "🏠 Your Workspace",
      description:
        "Your personalized command center. AI surfaces the most important documents for you to focus on, ranked by cognitive load and recency.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-library",
    popover: {
      title: "📚 Smart Library",
      description:
        "All your documents live here. Upload PDFs, images, or text — AI auto-analyzes, tags, and embeds everything. Drag & drop anywhere!",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-global-search",
    popover: {
      title: "🔍 Semantic Search",
      description:
        'Search with natural language across your entire library. Try "papers about machine learning" — Context finds relevant documents by meaning, not just keywords.',
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-sidebar-compare",
    popover: {
      title: "⚡ Document Compare",
      description:
        "Select any two documents and let AI deep-compare them — revealing similarities, differences, and unique insights side by side.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-sidebar-settings",
    popover: {
      title: "⚙️ Settings",
      description:
        "Customize your experience — theme and AI token budget tracking. You can also restart this tour anytime from here.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#tour-profile-menu",
    popover: {
      title: "👤 Your Profile",
      description:
        "Manage your avatar, name, and semantic persona. Your persona helps the AI tailor its responses to your workflow.",
      side: "bottom",
      align: "end",
    },
  },
];

/**
 * ProductTour — renders nothing visible. Triggers driver.js when
 * the authenticated user has not yet completed the onboarding tour.
 */
export const ProductTour = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const hasStartedRef = useRef(false);

  const completeTour = useCallback(() => {
    dispatch(updateUserLocalState({ hasCompletedTour: true }));
    dispatch(updateProfile({ hasCompletedTour: true }));
  }, [dispatch]);

  // Reset the guard when hasCompletedTour is set back to false (e.g. via Restart Tour)
  useEffect(() => {
    if (user && !user.hasCompletedTour) {
      hasStartedRef.current = false;
    }
  }, [user?.hasCompletedTour]);

  useEffect(() => {
    // Guard: only run for authenticated users who haven't completed the tour
    if (!user || user.hasCompletedTour || hasStartedRef.current) return;

    // Wait a moment for the layout to fully mount, especially after the boot sequence
    const timer = setTimeout(() => {
      // Final check — the dashboard element must exist (layout is mounted)
      const dashboardEl = document.getElementById("tour-sidebar-workspace");
      if (!dashboardEl) return;

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

        steps: TOUR_STEPS,

        // Mark as completed when the user finishes or closes the tour
        onDestroyStarted: () => {
          completeTour();
          driverObj.destroy();
        },
      });

      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, completeTour]);

  // This component renders nothing — it's purely side-effectful
  return null;
};
