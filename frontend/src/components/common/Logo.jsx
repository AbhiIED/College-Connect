import React from "react";
import { Link } from "react-router-dom";

/**
 * Shared CC Logo component — mirrors the admin sidebar branding.
 *
 * @param {"sm"|"md"|"lg"|"xl"} size     – Controls the icon + text scale.
 * @param {boolean}              showText – Whether to show "CollegeConnect" text.
 * @param {string}               to       – Link destination (default: /homepage).
 * @param {"light"|"dark"}       variant  – Use "light" on dark backgrounds, "dark" on light backgrounds.
 * @param {string}               className – Extra wrapper classes.
 */

const sizeMap = {
  sm: { box: "h-8 w-8 text-sm", text: "text-base" },
  md: { box: "h-9 w-9 text-base", text: "text-xl" },
  lg: { box: "h-12 w-12 text-lg", text: "text-2xl" },
  xl: { box: "h-16 w-16 text-xl", text: "text-3xl" },
};

export default function Logo({
  size = "md",
  showText = true,
  to = "/homepage",
  variant = "dark",
  className = "",
  subtitle = "",
}) {
  const s = sizeMap[size] || sizeMap.md;

  const isLight = variant === "light";

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* The CC icon box */}
      <div
        className={`${s.box} rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/30 shrink-0 select-none`}
      >
        CC
      </div>

      {/* Brand text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-display ${s.text} font-bold tracking-tight leading-tight ${
              isLight ? "text-white" : "text-gray-900"
            }`}
          >
            College
            <span className={isLight ? "text-indigo-300" : "text-indigo-600"}>
              Connect
            </span>
          </span>
          {subtitle && (
            <span
              className={`text-[10px] font-medium tracking-wide -mt-0.5 ${
                isLight ? "text-indigo-200/80" : "text-gray-400"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
