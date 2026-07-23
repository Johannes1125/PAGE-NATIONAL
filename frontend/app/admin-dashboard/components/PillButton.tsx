"use client";

import type { ReactNode, ButtonHTMLAttributes } from "react";

type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
};

export default function PillButton({
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  children,
  className = "",
  style,
  ...props
}: PillButtonProps) {
  // Determine standard classes
  const baseClass = "inline-flex items-center justify-center gap-2.5 font-semibold transition-all duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-600 whitespace-nowrap";
  
  // Variant styling
  let variantClass = "";
  if (variant === "primary") {
    // Matches .about-btn--primary / .chapters-btn--primary
    variantClass = "bg-[#1E538E] text-white border border-[#1E538E] hover:bg-[#143152] hover:border-[#143152] shadow-sm";
  } else if (variant === "secondary") {
    // Matches .about-btn--secondary / .chapters-btn--secondary
    variantClass = "bg-[#fdfdfd] text-[#334e6e] border border-[#cbd5e1] hover:bg-slate-50 hover:text-[#143152] hover:border-[#cbd5e1]";
  } else if (variant === "danger") {
    // Matches .about-btn--danger
    variantClass = "bg-[#ffe4e9] text-[#f43f5e] border border-[#ffe4e9] hover:bg-[#ffd1da]";
  } else if (variant === "outline") {
    // Matches outline style buttons
    variantClass = "bg-white text-[#334e6e] border border-[#cbd5e1] hover:bg-[#f8fafc] hover:border-[#94a3b8]";
  } else if (variant === "ghost") {
    variantClass = "bg-transparent text-[#6b87a4] hover:bg-slate-100 hover:text-[#1e538e]";
  }

  // Size styling
  let sizeClass = "";
  if (size === "sm") {
    sizeClass = children
      ? "min-h-[40px] px-6 py-2 rounded-xl text-[14.5px] min-w-[92px]"
      : "w-[40px] h-[40px] rounded-xl flex items-center justify-center flex-shrink-0";
  } else if (size === "md") {
    sizeClass = children
      ? "min-h-[44px] px-7 py-2.5 rounded-xl text-[15px] min-w-[104px]"
      : "w-[44px] h-[44px] rounded-xl flex items-center justify-center flex-shrink-0";
  } else if (size === "lg") {
    sizeClass = children
      ? "min-h-[48px] px-8 py-3 rounded-2xl text-[16px] min-w-[116px]"
      : "w-[48px] h-[48px] rounded-2xl flex items-center justify-center flex-shrink-0";
  }

  // Width
  const widthClass = fullWidth ? "w-full flex justify-between" : "";

  // Combine all classes
  const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`;

  return (
    <button className={combinedClassName} style={style} {...props}>
      <span className="inline-flex items-center justify-center gap-2">
        {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
        {children && <span>{children}</span>}
      </span>
    </button>
  );
}
