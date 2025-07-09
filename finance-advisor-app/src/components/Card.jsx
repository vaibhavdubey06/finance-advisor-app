import React from "react";
import { cn } from "../utils/cn";

export const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-white text-gray-900 shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardContent = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent"; 