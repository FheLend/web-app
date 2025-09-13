import { useState } from "react";
import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "@/components/WalletButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useThemeStyles } from "@/lib/themeUtils";
import { useAdminAuthContext } from "@/providers/AdminAuthProvider";
import { useAccount } from "wagmi";
import Logo from "@/assets/logo.svg";
import LogoWhite from "@/assets/logo-white.svg";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, navbarStyles, mobileMenuDivider } = useThemeStyles();
  const location = useLocation();
  const { potentialAdmin } = useAdminAuthContext();
  const { address } = useAccount();

  const isEarnActive =
    location.pathname === "/" ||
    location.pathname === "/lending" ||
    location.pathname.startsWith("/vault");
  const isBorrowActive =
    location.pathname === "/borrow" || location.pathname.startsWith("/market");
  const isFaucetActive = location.pathname === "/transfer";
  const isSettingsActive = location.pathname === "/settings";

  return (
    <nav className={navbarStyles}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-white">
            <img
              src={isDark ? LogoWhite : Logo}
              alt="Felend Logo"
              className="h-8 mr-2"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center text-base">
          <NavLink href="/earn" active={isEarnActive}>
            Earn
          </NavLink>
          <NavLink href="/borrow" active={isBorrowActive}>
            Borrow
          </NavLink>
          <NavLink href="/transfer" active={isFaucetActive}>
            Faucet
          </NavLink>
          {potentialAdmin && (
            <NavLink href="/settings" active={isSettingsActive}>
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </NavLink>
          )}
          <ThemeToggle />
          <WalletButton />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground hover:bg-cryptic-accent/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={mobileMenuDivider}>
          <div className="space-y-3 px-2">
            <NavLink href="/earn" active={isEarnActive} mobile>
              Earn
            </NavLink>
            <NavLink href="/borrow" active={isBorrowActive} mobile>
              Borrow
            </NavLink>
            {potentialAdmin && (
              <>
                <NavLink href="/settings" active={isSettingsActive} mobile>
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </NavLink>
              </>
            )}
            <div className="mt-4">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  mobile?: boolean;
}

function NavLink({ href, children, active, mobile }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "transition-colors duration-200 text-base",
        mobile ? "block py-2 px-3 rounded-md" : "inline-flex items-center",
        active
          ? "text-cryptic-accent font-medium"
          : "text-muted-foreground hover:text-cryptic-accent",
        active && mobile && "bg-cryptic-accent/10"
      )}
    >
      {children}
    </Link>
  );
}
