import * as React from "react";
import { cn } from "@/lib/utils";

export const Tooltip = ({ children, content, side = "top", className }) => {
  const [open, setOpen] = React.useState(false);

  const getSideClasses = () => {
    switch (side) {
      case "top":
        return "bottom-full left-1/2 mb-2 -translate-x-1/2";
      case "bottom":
        return "top-full left-1/2 mt-2 -translate-x-1/2";
      case "left":
        return "right-full top-1/2 mr-2 -translate-y-1/2";
      case "right":
        return "left-full top-1/2 ml-2 -translate-y-1/2";
      default:
        return "bottom-full left-1/2 mb-2 -translate-x-1/2";
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-md animate-in fade-in zoom-in-95 duration-200 pointer-events-none",
            getSideClasses(),
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
