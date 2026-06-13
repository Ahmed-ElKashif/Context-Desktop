import { Icon } from "../../../components/ui/core/Icons";
import { useTheme } from "../../../hooks/useTheme";

export const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();

  return (
    <section>
      <h2 className="text-sm font-mono font-bold text-light-primary dark:text-dark-primary uppercase tracking-widest mb-6 border-b border-light-border dark:border-white/5 pb-2">
        Appearance
      </h2>
      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-light-text dark:text-white">Visual Theme</p>
            <p className="text-xs font-medium text-light-text/80 dark:text-dark-text/60 mt-1">
              Switch between Deep Intelligence and Modern Archive.
            </p>
          </div>
          <div className="flex bg-light-bg dark:bg-[#121214] p-1 rounded-xl border border-light-border dark:border-white/5 shadow-inner self-start sm:self-auto">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                theme === "light"
                  ? "bg-light-bg text-light-primary border-light-border/50 shadow-sm"
                  : "text-light-text/70 dark:text-light-text/70 bg-transparent hover:text-light-text border border-transparent"
              }`}
            >
              <Icon name="light_mode" className="text-sm" /> Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                theme === "dark"
                  ? "bg-[#252528] text-dark-primary border-white/10 shadow-sm"
                  : "text-light-text/70 dark:text-white/70 bg-transparent hover:text-white border border-transparent"
              }`}
            >
              <Icon name="dark_mode" className="text-sm" /> Dark
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};