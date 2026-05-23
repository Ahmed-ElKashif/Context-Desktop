import { Link } from "react-router-dom";
// Adjust this import path based on your folder structure
import { Icon } from "../../../components/ui/Icons";
import { Button } from "../../../components/ui/Button";

export const BottomCTASection = () => {
  return (
    <section className="w-full py-32 px-4 md:px-6 relative border-t border-light-border dark:border-white/5 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,55,102,0.12)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_60%)] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="relative w-full bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl border border-light-border dark:border-white/10 rounded-[2.5rem] p-8 md:p-16 text-center shadow-xl transition-shadow duration-700 hover:shadow-[0_0_80px_rgba(16,55,102,0.25)] dark:hover:shadow-[0_0_80px_rgba(139,92,246,0.15)] group overflow-hidden">
          {/* Laser Line Hover Animation */}
          <div className="absolute top-0 left-0 w-full h-[2px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="laser-line w-full h-full bg-gradient-to-r from-transparent via-light-primary dark:via-dark-primary to-transparent -translate-x-full"></div>
          </div>

          {/* Fake Window Controls & Status */}
          <div className="absolute top-6 left-8 right-8 items-center justify-between hidden md:flex">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-light-primary/30 dark:bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-light-primary/30 dark:bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-light-primary/30 dark:bg-white/20"></div>
            </div>
            <div className="text-[10px] font-mono font-bold text-light-primary dark:text-white/50 tracking-widest uppercase">
              Status: Awaiting Input
            </div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto mt-4 md:mt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 rounded-full text-xs font-mono mb-8 shadow-sm">
              <Icon
                name="power_settings_new"
                className="text-[14px] text-light-primary dark:text-dark-primary"
              />
              <span className="text-light-primary dark:text-dark-primary font-bold">
                System Ready
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-light-text dark:text-white mb-6 tracking-tight leading-[1.1]">
              Ready to initialize your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-secondary">
                second brain?
              </span>
            </h2>

            <p className="text-light-text/80 dark:text-white/70 text-lg md:text-xl mb-12 font-medium leading-relaxed max-w-xl mx-auto">
              Stop organizing folders and start working at the speed of thought.
              Context is free for individual thinkers.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Wrapping the custom link in Button asChild for consistency, or keeping your exact styling */}
              <Button
                asChild
                className="w-full sm:w-auto h-auto bg-light-primary dark:bg-dark-primary text-white dark:text-black px-10 py-5 rounded-2xl text-lg font-bold hover:scale-[1.02] hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_40px_-10px_rgba(16,55,102,0.4)] dark:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.15)] flex items-center justify-center gap-3 group/btn"
              >
                <Link to="/register">
                  Initialize Free Account
                  <Icon
                    name="arrow_forward"
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </Link>
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-light-border dark:border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-light-text/80 dark:text-white/60 font-semibold">
              <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-light-border dark:border-white/5 shadow-sm">
                <Icon
                  name="lock"
                  className="text-[18px] text-light-primary dark:text-dark-primary"
                />{" "}
                Local-First Privacy
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-light-border dark:border-white/5 shadow-sm">
                <Icon
                  name="credit_card_off"
                  className="text-[18px] text-light-primary dark:text-dark-primary"
                />{" "}
                No Card Required
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-light-border dark:border-white/5 shadow-sm">
                <Icon
                  name="bolt"
                  className="text-[18px] text-light-primary dark:text-dark-primary"
                />{" "}
                Instant Setup
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
