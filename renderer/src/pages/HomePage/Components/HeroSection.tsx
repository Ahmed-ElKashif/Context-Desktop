import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../../components/ui/Icons";
import { Button } from "../../../components/ui/Button";

interface HeroSectionProps {
  scrollToCapabilities: (e: React.MouseEvent) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  scrollToCapabilities,
}) => {
  return (
    <section className="w-full min-h-[90vh] lg:min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(16,55,102,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)] pointer-events-none -z-10"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-light-primary/10 dark:bg-dark-primary/10 blur-[100px] rounded-full -z-10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-light-accent/10 dark:bg-dark-secondary/10 blur-[100px] rounded-full -z-10 animate-float pointer-events-none"></div>

      {/* Floating Files */}
      <div className="absolute top-[25%] left-[5%] lg:left-[15%] hidden md:flex animate-float-slow z-0 opacity-80 hover:opacity-100 transition-opacity cursor-default -rotate-6">
        <div className="px-4 py-2 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-md border border-light-border dark:border-white/10 rounded-xl shadow-xl flex items-center gap-3">
          <Icon name="picture_as_pdf" className="text-red-500 text-[18px]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-light-text dark:text-white font-mono">
              Q3_Report.pdf
            </span>
            <span className="text-[9px] font-semibold text-light-primary dark:text-white/60 uppercase tracking-widest">
              Heavy Load
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[25%] right-[5%] lg:right-[15%] hidden md:flex animate-float-medium z-0 opacity-80 hover:opacity-100 transition-opacity cursor-default rotate-3"
        style={{ animationDelay: "1s" }}
      >
        <div className="px-4 py-2 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-md border border-light-border dark:border-white/10 rounded-xl shadow-xl flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-light-primary dark:bg-dark-primary animate-pulse shadow-[0_0_8px_rgba(16,55,102,0.4)] dark:shadow-[0_0_8px_rgba(139,92,246,0.4)]"></span>
            <span className="text-[10px] font-bold text-light-text dark:text-white font-mono">
              Visual OCR Active
            </span>
          </div>
          <span className="text-[11px] font-medium text-light-primary dark:text-white/60">
            Whiteboard_04.jpg
          </span>
        </div>
      </div>

      <div
        className="absolute top-[30%] right-[10%] lg:right-[20%] hidden lg:flex animate-float z-0 opacity-80 hover:opacity-100 transition-opacity cursor-default rotate-12"
        style={{ animationDelay: "2s" }}
      >
        <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg shadow-lg flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 font-mono tracking-wider">
            #Legal_Review
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto text-center z-10 relative mt-10 md:mt-0 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#121214] border border-light-border dark:border-white/10 rounded-full text-xs font-mono mb-8 shadow-sm cursor-default hover:border-light-primary/30 dark:hover:border-dark-primary/30 transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-light-primary dark:bg-dark-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-light-primary dark:bg-dark-primary"></span>
          </span>
          <span className="text-light-primary dark:text-white/80 tracking-widest uppercase font-bold">
            Multimodal Engine{" "}
            <span className="text-light-primary dark:text-dark-primary">
              Active
            </span>
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-light-text dark:text-white leading-[1.05] mb-8 tracking-tight drop-shadow-sm flex flex-col items-center">
          <span className="relative block w-fit text-light-text/50 dark:text-white/40 cursor-default group transition-colors duration-300 hover:text-light-text/30 dark:hover:text-white/20">
            Stop organizing
            <span className="absolute left-0 top-[55%] -translate-y-1/2 w-0 h-2 md:h-3 bg-light-primary dark:bg-dark-primary group-hover:w-full transition-all duration-300 ease-out rounded-full opacity-90"></span>
          </span>
          <span className="block text-transparent bg-clip-text bg-linear-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-secondary mt-1 pb-2">
            Start understanding.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-light-text/80 dark:text-white/70 leading-relaxed mb-10 max-w-xl mx-auto font-medium border-l-2 border-transparent">
          Context is the smart file system that reads, tags, and connects your
          documents for you
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-light-primary dark:bg-dark-primary text-white dark:text-black px-8 py-4 rounded-2xl text-lg font-bold hover:scale-[1.02] hover:opacity-90 active:scale-95 transition-all shadow-[0_10px_40px_-10px_rgba(16,55,102,0.4)] dark:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.15)] flex items-center justify-center gap-2 group"
          >
            Try Context Free
            <Icon
              name="arrow_forward"
              className="text-[20px] group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Button
            variant="outline"
            onClick={scrollToCapabilities}
            className="w-full sm:w-auto !h-auto !py-4 px-8 !rounded-2xl text-lg bg-transparent border border-light-border dark:border-white/10 hover:bg-light-surface/5 dark:hover:bg-white/5 hover:border-light-primary/30 dark:hover:border-dark-primary/30 flex items-center justify-center gap-2 group transition-all cursor-pointer"
          >
            View Capabilities
            <Icon
              name="expand_more"
              className="text-[20px] group-hover:translate-y-1 transition-transform"
            />
          </Button>
        </div>

        {/* Feature Badges */}
        <div className="mt-16 flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-lg text-xs font-mono text-light-primary dark:text-white/60 font-semibold shadow-sm">
            <Icon name="description" className="text-[14px]" /> PDF & DOCX
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/5 border border-light-border dark:border-white/10 rounded-lg text-xs font-mono text-light-primary dark:text-white/60 font-semibold shadow-sm">
            <Icon name="image" className="text-[14px]" /> Visual OCR
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-light-primary/5 dark:bg-dark-primary/5 border border-light-primary/20 dark:border-dark-primary/20 rounded-lg text-xs font-mono text-light-primary dark:text-dark-primary font-bold shadow-sm">
            <Icon name="lock" className="text-[14px]" /> Local-First Privacy
          </div>
        </div>
      </div>
    </section>
  );
};
