import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className = "" }) {
  const baseStyles =
    "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 border";
  const variants = {
    default: "bg-brand-50 text-brand-900 border-brand-100",
    success: "bg-accent-100/50 text-accent-600 border-accent-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    outline: "bg-transparent text-gray-700 border-gray-200",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)}>
      {children}
    </span>
  );
}
