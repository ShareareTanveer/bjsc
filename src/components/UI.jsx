import React from "react";
import { Loader2 } from "lucide-react";

export function Button({ children, variant = "primary", size = "md", className = "", disabled, onClick, type = "button", ...rest }) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none select-none";
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm",
    secondary: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "gray", className = "" }) {
  const variants = {
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
    blue: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300",
    green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Card({ children, className = "", onClick }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${onClick ? "cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition-colors" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-brand-500" />;
}

export function ProgressBar({ value, max, className = "", colorClass = "bg-brand-500" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Divider({ className = "" }) {
  return <div className={`border-t border-gray-200 dark:border-gray-800 ${className}`} />;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
