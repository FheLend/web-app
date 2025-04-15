
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
      "rounded-lg border shadow-sm cryptic-shadow",
      isDark 
        ? "bg-cryptic-darker border-cryptic-accent/20" 
        : "bg-card border-slate-200"
    ),
    navbarStyles: cn(
      "py-4 px-4 sm:px-6 border-b sticky top-0 z-50 backdrop-blur-md",
      isDark 
        ? "bg-cryptic-darker/80 border-cryptic-accent/20" 
        : "bg-slate-50/90 border-slate-200"
    ),
    tableStyles: cn(
      "w-full",
      isDark ? "text-foreground" : "text-foreground"
    ),
    tableHeaderStyles: cn(
      isDark ? "bg-cryptic-darker" : "bg-slate-50"
    ),
    tableRowStyles: cn(
      "transition duration-150 cursor-pointer",
      isDark 
        ? "bg-cryptic-dark/50 hover:bg-cryptic-purple/10" 
        : "bg-white hover:bg-slate-50"
    ),
    tableDividerStyles: cn(
      "divide-y",
      isDark ? "divide-cryptic-muted/20" : "divide-slate-100"
    ),
    badgeStyles: cn(
      "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium",
      isDark 
        ? "bg-cryptic-purple/10 text-cryptic-highlight" 
        : "bg-blue-50 text-cryptic-accent"
    ),
    inputStyles: cn(
      "text-base",
      isDark 
        ? "bg-cryptic-darker border-cryptic-muted" 
        : "bg-white border-slate-200"
    ),
    tableContainerStyles: cn(
      "overflow-x-auto cryptic-shadow rounded-lg border",
      isDark ? "border-cryptic-accent/20" : "border-slate-200"
    ),
    mobileTileStyles: cn(
      "mb-4 p-4 rounded-lg border hover:bg-cryptic-purple/10 transition duration-150 cursor-pointer",
      isDark 
        ? "bg-cryptic-dark/50 border-cryptic-muted/20" 
        : "bg-white border-slate-200 hover:bg-slate-50"
    )
  };
}
