import { useState } from "react";

import { Link } from "react-router-dom";

import { Icon } from "../../../components/ui/Icons";

import { Button } from "../../../components/ui/Button";

import { ContextLogo } from "../../../components/ui/ContextLogo";

export const Header = () => {
  // Localized state and functions keep the parent component clean

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

 

  const scrollToCapabilities = (e: React.MouseEvent) => {
    e.preventDefault();

    document

      .getElementById("capabilities")

      ?.scrollIntoView({ behavior: "smooth" });

    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-light-border dark:border-white/5 bg-white/80 dark:bg-[#0A0A0C]/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none"
          aria-label="Refresh Context"
        >
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-light-primary/20 dark:bg-dark-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-full h-full bg-light-surface dark:bg-dark-surface/80 border border-light-border dark:border-white/10 rounded-xl flex items-center justify-center shadow-sm z-10 overflow-hidden group-hover:border-light-primary/50 dark:group-hover:border-dark-primary/50 transition-colors">
              <ContextLogo />
            </div>
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-light-primary dark:text-white group-hover:text-light-accent dark:group-hover:text-dark-primary transition-colors duration-300">
            Context
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            className="text-light-text/80 dark:text-dark-text/80 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primary/5 dark:hover:bg-dark-primary/10"
          >
            <a href="#">Platform</a>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-light-text/80 dark:text-dark-text/80 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primary/5 dark:hover:bg-dark-primary/10"
          >
            <a href="#capabilities" onClick={scrollToCapabilities}>
              Solutions
            </a>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="text-light-text/80 dark:text-dark-text/80 hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primary/5 dark:hover:bg-dark-primary/10"
          >
            <a href="#">Documentation</a>
          </Button>
        </nav>

        {/* Action Buttons & Theme Toggle */}

        <div className="flex items-center gap-3">
          

          <div className="hidden md:flex items-center gap-3 ml-2">
            <Button
              variant="ghost"
              asChild
              className="font-bold text-light-text dark:text-white hover:text-light-primary dark:hover:text-dark-primary hover:bg-light-primary/5 dark:hover:bg-white/5 border border-transparent hover:border-light-border dark:hover:border-white/10"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-light-primary dark:bg-dark-primary text-white dark:text-black rounded-xl font-bold hover:scale-[1.02] hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_14px_rgba(16,55,102,0.3)] dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)]"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-light-text dark:text-white hover:bg-light-primary/5 dark:hover:bg-white/10 z-50"
          >
            <Icon
              name={isMobileMenuOpen ? "close" : "menu"}
              className="text-[22px]"
            />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`absolute top-[64px] left-0 w-full bg-white dark:bg-[#121214] border-b border-light-border dark:border-white/10 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        } z-40`}
      >
        <div className="p-4 flex flex-col gap-2">
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start font-bold text-light-text dark:text-white hover:bg-light-primary/5 dark:hover:bg-white/5"
          >
            <a href="#">Platform</a>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start font-bold text-light-text dark:text-white hover:bg-light-primary/5 dark:hover:bg-white/5"
          >
            <a href="#capabilities" onClick={scrollToCapabilities}>
              Solutions
            </a>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start font-bold text-light-text dark:text-white hover:bg-light-primary/5 dark:hover:bg-white/5"
          >
            <a href="#">Documentation</a>
          </Button>

          <div className="h-px bg-light-border dark:bg-white/10 my-2 mx-2"></div>

          <div className="flex gap-3 px-2 pb-2">
            <Button
              variant="outline"
              asChild
              className="flex-1 font-bold text-light-text dark:text-white border-light-border dark:border-white/10 hover:bg-light-primary/5 dark:hover:bg-white/5"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-bold hover:opacity-90 active:scale-95 shadow-md dark:shadow-[0_4px_14px_rgba(139,92,246,0.15)]"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
