import { OnboardingWorkspace } from "./components/OnboardingWorkspace";
import { EngineRouterSkeleton } from "../../components/ui/loaders/EngineRouterSkeleton";
import { PopulatedWorkspace } from "./components/PopulatedWorkspace";
import { BootSequence } from "../../components/layout/BootSequence";
import { NotFoundPage } from "../../pages/NotFoundPage";

import { useWorkspaceBoot } from "./hooks/useWorkspaceBoot";
import { useWorkspaceState } from "./hooks/useWorkspaceState";

const WorkspaceContent = () => {
  const {
    isBrandNewUser,
    isUploading,
    activeDocument,
    isRestoring,
    handleUploadSuccess,
  } = useWorkspaceState();

  // State 1: The TRUE Onboarding (Zero files/folders in their entire account)
  if (isBrandNewUser && !isUploading && !activeDocument) {
    return <OnboardingWorkspace onUploadSuccess={handleUploadSuccess} />;
  }

  // State 2: Uploading only (AI can continue in background)
  if (isUploading) {
    return <EngineRouterSkeleton />;
  }

  // State 3: Done! (Or waiting for them to select a file from the Library)
  return <PopulatedWorkspace isRestoring={isRestoring} />;
};

export const WorkspaceFeature = () => {
  const { isBooting, isBootComplete, isError } = useWorkspaceBoot();

  if (isError) {
    return <NotFoundPage />;
  }

  if (isBooting) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <BootSequence isComplete={isBootComplete} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full h-full">
      <WorkspaceContent />
    </div>
  );
};
