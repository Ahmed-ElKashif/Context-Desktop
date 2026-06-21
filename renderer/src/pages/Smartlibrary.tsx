import { LibraryFeature } from "../features/library/LibraryFeature";
import { ContextMenuProvider } from "../contexts/ContextMenuContext";

export default function SmartLibraryPage() {
  return (
    // React Router will automatically inject this into the <Outlet /> in MainLayout!
    // We use a negative margin (-m-8) if you want the library sidebar to touch the edges,
    // overriding the padding (p-8) from your MainLayout's <main> tag.
    <ContextMenuProvider>
      <div className="h-full w-full m-0 flex flex-col">
        <LibraryFeature />
      </div>
    </ContextMenuProvider>
  );
}
