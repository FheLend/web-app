
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-foreground hover:bg-cryptic-accent/20 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-cryptic-accent" />
      ) : (
        <Moon className="h-5 w-5 text-cryptic-accent" />
      )}
      <span className="sr-only">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  );
}
