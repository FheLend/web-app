
import { useState } from 'react';
import { Menu, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { WalletButton } from '@/components/WalletButton';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="py-4 px-4 sm:px-6 border-b border-cryptic-accent/20 bg-cryptic-darker/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Key className="h-7 w-7 text-cryptic-accent mr-2" />
            <span className="font-spaceGrotesk text-xl sm:text-2xl font-semibold text-glow">
              Fe<span className="text-cryptic-accent">lend</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center text-base">
          <NavLink href="#" active>
            Lend
          </NavLink>
          <NavLink href="#">
            Borrow
          </NavLink>
          <NavLink href="#">
            Vaults
          </NavLink>
          <WalletButton />
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
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
        <div className="md:hidden pt-4 pb-3 border-t border-cryptic-accent/20 mt-4">
          <div className="space-y-3 px-2">
            <NavLink href="#" active mobile>
              Lend
            </NavLink>
            <NavLink href="#" mobile>
              Borrow
            </NavLink>
            <NavLink href="#" mobile>
              Vaults
            </NavLink>
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
    <a
      href={href}
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
    </a>
  );
}
