import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:400%_100%] ",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
