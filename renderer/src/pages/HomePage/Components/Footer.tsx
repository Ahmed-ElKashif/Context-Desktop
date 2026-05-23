import { Icon } from "../../../components/ui/Icons";
import { ContextLogo } from "../../../components/ui/ContextLogo";

export const Footer = () => {
  return (
    <footer className="bg-light-surface dark:bg-[#0A0A0C] border-t border-light-border dark:border-white/5 pt-20 pb-10 px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        {/* Brand Column */}
        <div className="md:col-span-12 lg:col-span-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-8 h-8">
              <div className="relative w-full h-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-white/10 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                {/* 1. Using the reusable logo component here! */}
                <ContextLogo className="w-5 h-5" />
              </div>
            </div>
            <span className="text-2xl font-bold font-display text-light-primary dark:text-white tracking-tight">
              Context
            </span>
          </div>

          <p className="text-light-text/80 dark:text-white/60 font-medium text-sm leading-relaxed mb-8 max-w-sm">
            The intelligent file system designed for modern workflows. We
            replace folders with semantic understanding.
          </p>

          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 flex items-center justify-center text-light-text/80 dark:text-white/70 hover:text-light-primary dark:hover:text-dark-primary hover:border-light-primary dark:hover:border-dark-primary transition-all"
              href="#"
              aria-label="Twitter"
            >
              <Icon name="public" className="text-[20px]" />
            </a>
            <a
              className="w-10 h-10 rounded-full bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 flex items-center justify-center text-light-text/80 dark:text-white/70 hover:text-light-primary dark:hover:text-dark-primary hover:border-light-primary dark:hover:border-dark-primary transition-all"
              href="#"
              aria-label="Email"
            >
              <Icon name="alternate_email" className="text-[20px]" />
            </a>
            <a
              className="w-10 h-10 rounded-full bg-light-bg dark:bg-white/5 border border-light-border dark:border-white/10 flex items-center justify-center text-light-text/80 dark:text-white/70 hover:text-light-primary dark:hover:text-dark-primary hover:border-light-primary dark:hover:border-dark-primary transition-all"
              href="#"
              aria-label="Developer API"
            >
              <Icon name="code" className="text-[20px]" />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-4 lg:col-span-2">
          <h4 className="font-bold mb-6 text-light-primary dark:text-dark-primary uppercase tracking-wider text-xs font-mono">
            Product
          </h4>
          <ul className="space-y-4 text-sm text-light-text/80 dark:text-white/60 font-medium">
            <li>
              <a
                className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                href="#"
              >
                Capabilities
              </a>
            </li>
            <li>
              <a
                className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                href="#"
              >
                Pricing
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 lg:col-span-2">
          <h4 className="font-bold mb-6 text-light-primary dark:text-dark-primary uppercase tracking-wider text-xs font-mono">
            Resources
          </h4>
          <ul className="space-y-4 text-sm text-light-text/80 dark:text-white/60 font-medium">
            <li>
              <a
                className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                href="#"
              >
                Documentation
              </a>
            </li>
            <li>
              <a
                className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                href="#"
              >
                Blog
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 lg:col-span-3">
          <h4 className="font-bold mb-6 text-light-primary dark:text-dark-primary uppercase tracking-wider text-xs font-mono">
            Legal
          </h4>
          <ul className="space-y-4 text-sm text-light-text/80 dark:text-white/60 font-medium">
            <li>
              <a
                className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                href="#"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                className="hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                href="#"
              >
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-light-border dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono font-semibold text-light-text/60 dark:text-white/50">
        <p>© 2026 Context AI Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};
