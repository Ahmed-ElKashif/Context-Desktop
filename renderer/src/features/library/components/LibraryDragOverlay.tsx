import { Icon } from "../../../components/ui/Icons";

export const LibraryDragOverlay = ({
  isDragActive,
}: {
  isDragActive: boolean;
}) => {
  if (!isDragActive) return null;

  return (
    <div className="absolute inset-0 z-[300] bg-light-primary/20 dark:bg-dark-primary/20 backdrop-blur-sm border-[6px] border-light-primary dark:border-dark-primary border-dashed m-4 rounded-3xl flex flex-col items-center justify-center animate-in fade-in duration-200 pointer-events-none">
      <div className="bg-white dark:bg-dark-surface p-8 rounded-full shadow-2xl animate-bounce">
        <Icon
          name="cloud_upload"
          className="text-6xl text-light-primary dark:text-dark-primary"
        />
      </div>
      <h2 className="text-4xl font-black text-light-primary dark:text-dark-primary mt-6 tracking-tight drop-shadow-md">
        Drop files to add to Context
      </h2>
    </div>
  );
};
