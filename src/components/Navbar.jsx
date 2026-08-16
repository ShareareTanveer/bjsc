import React from "react";
import { NavLink } from "react-router-dom";
import { Sun, Moon, BookOpen, LayoutDashboard, History, Bookmark, FileText, BrainIcon } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/practice", label: "Practice", icon: BookOpen },
  { to: "/history", label: "History", icon: History },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/guide", label: "Guide", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: BrainIcon },
];

export default function Navbar({ theme, toggleTheme }) {
  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex fixed top-0 inset-x-0 z-40 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 items-center px-6 gap-6">
        {/* Logo - left side */}
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <BookOpen size={15} className="text-white" />
          </div>
          <span className="text-sm">BJSC</span>
        </NavLink>

        {/* Navigation - centered */}
        <nav className="flex items-center justify-center gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle - right side */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 flex">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors ${
                isActive
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-gray-500 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={toggleTheme}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] text-gray-500 dark:text-gray-400"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
          <span className="font-medium">Theme</span>
        </button>
      </nav>
    </>
  );
}