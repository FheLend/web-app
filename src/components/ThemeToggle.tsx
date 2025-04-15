
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useThemeStyles } from "@/lib/themeUtils";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();
  const { isDark } = useThemeStyles();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-foreground hover:bg-cryptic-accent/20 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-cryptic-accent" />
      ) : (
        <Moon className="h-5 w-5 text-cryptic-accent" />
      )}
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  );
}
