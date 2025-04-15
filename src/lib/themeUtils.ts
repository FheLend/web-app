
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
    )
  };
}
