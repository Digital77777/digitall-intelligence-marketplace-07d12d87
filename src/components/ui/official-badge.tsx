import React from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OfficialBadgeProps {
  label?: string;
  variant?: "inline" | "compact";
  className?: string;
}

export const OfficialBadge = ({
  label = "Official DIM",
  variant = "inline",
  className,
}: OfficialBadgeProps) => {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 shrink-0",
        variant === "inline" 
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          : "text-blue-500",
        className
      )}
    >
      <BadgeCheck className={cn(
        "shrink-0",
        variant === "inline" ? "w-3 h-3" : "w-4 h-4"
      )} />
      {variant === "inline" && <span className="leading-none">{label}</span>}
    </span>
  );

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
