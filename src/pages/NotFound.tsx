
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useThemeStyles } from "@/lib/themeUtils";

const NotFound = () => {
  const location = useLocation();
  const { cardStyles } = useThemeStyles();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`${cardStyles} p-8 text-center rounded-lg max-w-md`}>
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          Oops! Page not found
        </p>
        <a
          href="/"
          className="text-cryptic-accent hover:text-cryptic-accent/80 underline transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
