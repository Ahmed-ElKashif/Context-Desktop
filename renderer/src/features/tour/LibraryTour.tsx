import { useEffect, useRef, useCallback } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateProfile, updateUserLocalState } from "../../store/authSlice";
import { useLocation } from "react-router-dom";

const LIBRARY_TOUR_STEPS: DriveStep[] = [
  {
    element: "#tour-library-header",
    popover: {
      title: "📂 Library Controls",
      description:
        "Here you can see your current folder path, search through all your files, and add new documents or folders.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-library-table",
    popover: {
      title: "🗄️ File Explorer",
      description:
        "Double-click any folder to enter it, or double-click a document to open it in the Context Engine view. You can also drag and drop files directly here!",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#tour-library-sidebar",
    popover: {
      title: "📂 Spaces & Folders",
      description:
        "Use this sidebar to quickly jump between your different spaces and manage your folder hierarchies.",
      side: "right",
      align: "center",
    },
  },
];

export const LibraryTour = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  const hasStartedRef = useRef(false);

  const completeTour = useCallback(() => {
    dispatch(updateUserLocalState({ hasCompletedLibraryTour: true }));
    dispatch(updateProfile({ hasCompletedLibraryTour: true }));
  }, [dispatch]);

  useEffect(() => {
    if (user && !user.hasCompletedLibraryTour) {
      hasStartedRef.current = false;
    }
  }, [user?.hasCompletedLibraryTour]);

  useEffect(() => {
    // Only run if they are on the library page, haven't completed this tour yet.
    if (
      !user || 
      user.hasCompletedLibraryTour || 
      hasStartedRef.current || 
      location.pathname !== "/library"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      // Check if elements exist
      const tableEl = document.getElementById("tour-library-table");
      if (!tableEl) return;

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
        steps: LIBRARY_TOUR_STEPS,
        onDestroyStarted: () => {
          completeTour();
          driverObj.destroy();
        },
      });

      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, completeTour, location.pathname]);

  return null;
};
