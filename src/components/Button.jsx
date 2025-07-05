import React from "react";
import { cn } from "../utils/cn";

const buttonVariants = {
  default: "bg-teal-600 text-white hover:bg-teal-700",
  outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
  ghost: "hover:bg-gray-100 text-gray-900",
  // Add more variants as needed
};

export const Button = React.forwardRef(
  (
    { className = "", variant = "default", size = "md", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-base",
          buttonVariants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button"; 