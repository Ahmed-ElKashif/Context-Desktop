import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { fetchLibraryDocuments } from "../../../store/library/librarySlice";

export function useWorkspaceBoot() {
  const dispatch = useAppDispatch();
  const [shouldBoot] = useState(() => sessionStorage.getItem("context_boot_after_auth") === "1");
  const [isBooting, setIsBooting] = useState(shouldBoot);
  const [isBootComplete, setIsBootComplete] = useState(!shouldBoot);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchLibraryDocuments()).unwrap();
      } catch (error) {
        console.error("Failed to load documents", error);
        setIsError(true);
      } finally {
        if (shouldBoot) {
          sessionStorage.removeItem("context_boot_after_auth");
          setTimeout(() => {
            setIsBootComplete(true);
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

  return { isBooting, isBootComplete, isError };
}
