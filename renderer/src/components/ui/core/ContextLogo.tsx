import React from "react";
import { cn } from "@/lib/utils";

interface ContextLogoProps {
  className?: string;
}

export const ContextLogo: React.FC<ContextLogoProps> = ({ className }) => (
  <svg
    className={cn(
      "w-6 h-6 transition-transform duration-500 group-hover:scale-110",
      className,
    )}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="30"
      cy="30"
      r="6"
      className="fill-light-text/60 dark:fill-white/40 group-hover:fill-light-primary dark:group-hover:fill-dark-primary transition-colors"
    />
    <path
      d="M30 30 C 30 30, 45 45, 50 50"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className="text-light-border dark:text-white/20 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors"
    />
    <circle
      cx="70"
      cy="30"
      r="6"
      className="fill-light-text/60 dark:fill-white/40 group-hover:fill-light-primary dark:group-hover:fill-dark-primary transition-colors"
    />
    <path
      d="M70 30 C 70 30, 55 45, 50 50"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className="text-light-border dark:text-white/20 group-hover:text-light-primary dark:group-hover:text-dark-primary transition-colors"
    />
    <circle
      cx="50"
      cy="80"
      r="6"
      className="fill-light-accent/80 dark:fill-dark-secondary/60 group-hover:fill-light-accent dark:group-hover:fill-dark-secondary transition-colors"
    />
    <path
      d="M50 80 C 50 80, 50 65, 50 50"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className="text-light-accent/60 dark:text-dark-secondary/40 group-hover:text-light-accent dark:group-hover:text-dark-secondary transition-colors"
    />
    <circle
      cx="50"
      cy="50"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      className="text-light-primary dark:text-dark-primary animate-pulse opacity-50"
    />
    <circle
      cx="50"
      cy="50"
      r="6"
      className="fill-light-primary dark:fill-dark-primary"
    />
  </svg>
);
