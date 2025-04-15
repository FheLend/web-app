
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Utility hook that provides theme-conditional classnames
 * @returns Object with theme utility functions
 */
export function useThemeStyles() {
  const { theme } = useTheme();
  
  const isDark = theme === "dark";
  
  return {
    isDark,
    // Common conditional classes
    heroContainer: cn(
      "relative overflow-hidden py-16 md:py-24",
      isDark
        ? "bg-cryptic-dark"
        : "bg-gradient-to-b from-accent/5 to-accent/10"
    ),
    glowText: cn(
      "text-cryptic-highlight",
      isDark ? "animate-glow" : ""
    ),
    headingText: cn(
      isDark ? "text-glow" : "text-foreground"
    ),
    cardStyles: cn(
      "rounded-lg border shadow-sm",
      isDark 
        ? "bg-cryptic-darker border-cryptic-accent/20 cryptic-shadow" 
        : "bg-card border-slate-200 cryptic-shadow"
    ),
    navbarStyles: cn(
      "py-4 px-4 sm:px-6 border-b sticky top-0 z-50 backdrop-blur-md",
      isDark 
        ? "bg-cryptic-darker/80 border-cryptic-accent/20" 
        : "bg-slate-50/90 border-slate-200"
    ),
    featureContainer: cn(
      "py-16 px-4 sm:px-6",
      isDark ? "bg-cryptic-darker" : "bg-slate-50"
    ),
    featureCard: cn(
      "p-6 rounded-lg border cryptic-shadow transition duration-300",
      isDark 
        ? "border-cryptic-purple/20 bg-glass hover:border-cryptic-accent/30" 
        : "border-slate-200 bg-white hover:border-cryptic-accent/30"
    ),
    footerStyles: cn(
      "py-12 px-4 sm:px-6 border-t",
      isDark 
        ? "bg-cryptic-darker border-cryptic-purple/20" 
        : "bg-slate-50 border-slate-200"
    ),
    footerDivider: cn(
      "mt-12 pt-8 border-t", 
      isDark ? "border-cryptic-purple/10" : "border-slate-200"
    ),
    mobileMenuDivider: cn(
      "md:hidden pt-4 pb-3 mt-4",
      isDark ? "border-t border-cryptic-accent/20" : "border-t border-slate-200"
    ),
    marketCard: cn(
      "mb-4 p-4 rounded-lg border hover:bg-cryptic-purple/10 transition duration-150 cursor-pointer",
      isDark 
        ? "bg-cryptic-dark/50 border-cryptic-muted/20" 
        : "bg-white border-slate-200 hover:bg-slate-50"
    ),
    marketBadge: cn(
      "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium",
      isDark 
        ? "bg-cryptic-purple/10 text-cryptic-highlight" 
        : "bg-blue-50 text-cryptic-accent"
    ),
    marketTableContainer: cn(
      "overflow-x-auto cryptic-shadow rounded-lg border",
      isDark ? "border-cryptic-accent/20" : "border-slate-200"
    ),
    tableHeader: cn(
      isDark ? "bg-cryptic-darker" : "bg-slate-50"
    ),
    tableBody: cn(
      "divide-y",
      isDark ? "divide-cryptic-muted/20" : "divide-slate-100"
    ),
    tableRow: cn(
      "transition duration-150 cursor-pointer",
      isDark 
        ? "bg-cryptic-dark/50 hover:bg-cryptic-purple/10" 
        : "bg-white hover:bg-slate-50"
    ),
    marketSearchInput: cn(
      "pl-10 w-full sm:w-64 text-base",
      isDark 
        ? "bg-cryptic-darker border-cryptic-muted" 
        : "bg-white border-slate-200"
    ),
    walletButtonStyles: cn(
      "border-cryptic-accent/50 bg-transparent text-cryptic-accent text-base",
      "hover:bg-cryptic-accent/10",
      isDark ? "" : "hover:text-cryptic-accent"
    ),
    dropdownMenuContent: cn(
      "w-56 border-cryptic-accent/20",
      isDark ? "bg-cryptic-darker" : "bg-card"
    ),
    dropdownMenuItem: cn(
      "cursor-pointer flex items-center",
      isDark ? "hover:bg-cryptic-accent/10" : "hover:bg-secondary"
    )
  };
}
