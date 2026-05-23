import { useEffect, useState } from "react";
import { useAppDispatch } from "../store/hooks";
// 1. Import your new Thunk along with setActiveDocument!
import {
  fetchLibraryDocuments,
} from "../store/documentSlice";
import { DashboardFeature } from "../features/dashboard";

import { BootSequence } from "../components/layout/BootSequence";
import { NotFoundPage } from "./NotFoundPage";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const [shouldBoot] = useState(
    () => sessionStorage.getItem("context_boot_after_auth") === "1",
  );

  // 2. The Two-Step Loading State for perfect animations!
  const [isBooting, setIsBooting] = useState(shouldBoot);
  const [isBootComplete, setIsBootComplete] = useState(!shouldBoot);

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 3. Dispatch the Thunk and .unwrap() it to get the raw data back!
        // This populates the global Redux state AND gives us the docs locally.
        await dispatch(fetchLibraryDocuments()).unwrap();
      } catch (error) {
        console.error("Failed to load documents", error);
        setIsError(true);
      } finally {
        if (shouldBoot) {
          sessionStorage.removeItem("context_boot_after_auth");
          // Step A: Give the boot sequence at least 1s to play, then trigger exit
          setTimeout(() => {
            setIsBootComplete(true);

            // Step B: Wait 800ms for the CSS exit animation to finish, then unmount
            setTimeout(() => {
              setIsBooting(false);
            }, 800);
          }, 1000);
        } else {
          setIsBootComplete(true);
          setIsBooting(false);
        }
      }
    };

    fetchInitialData();
  }, [dispatch, shouldBoot]);

  // THE FAIL STATE
  if (isError) {
    return <NotFoundPage />;
  }

  // THE LOADING STATE (Properly passing the isComplete prop!)
  if (isBooting) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <BootSequence isComplete={isBootComplete} />
      </div>
    );
  }

  // THE SUCCESS STATE
  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full">
      <DashboardFeature />
    </div>
  );
}
