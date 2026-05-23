import React from "react";
import { cn } from "../../lib/utils"; // Adjust path as needed

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className,
  filled = false,
}) => {
  return (
    <span
      // Look how clean this is now!
      className={cn("material-symbols-rounded select-none", className)}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
};
