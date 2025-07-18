
import { Shield, Key } from 'lucide-react';
import { useThemeStyles } from '@/lib/themeUtils';
import { cn } from '@/lib/utils';
import Logo from "@/assets/logo.svg";
import LogoWhite from "@/assets/logo-white.svg";
import { Link } from 'react-router-dom';
import { useAdminAuthContext } from '@/providers/AdminAuthProvider';

export function Footer() {
  const { isDark, footerStyles, footerDivider } = useThemeStyles();
  const { potentialAdmin } = useAdminAuthContext();
  
  return (
    <footer className={footerStyles}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src={isDark ? LogoWhite : Logo} alt="Felend Logo" className="h-8" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              A revolutionary lending protocol that leverages Fully Homomorphic Encryption to secure user financial data on the blockchain.
            </p>
          </div>
          
          <div>
            <h3 className="font-spaceGrotesk text-sm font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Earn</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Borrow</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Vaults</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Markets</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-spaceGrotesk text-sm font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Security</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">FHE Explainer</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-spaceGrotesk text-sm font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Discord</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Twitter</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Forum</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Governance</a></li>
              <li>
                <Link 
                  to="/transfer" 
                  className="text-muted-foreground hover:text-cryptic-accent inline-flex items-center"
                >
                  Transfer Tokens
                </Link>
              </li>
              {potentialAdmin && (
                <li>
                  <Link 
                    to="/ui-library" 
                    className="text-muted-foreground hover:text-cryptic-accent inline-flex items-center"
                  >
                    UI Library
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className={footerDivider}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Felend. All rights reserved. Secured with Fully Homomorphic Encryption.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-cryptic-accent">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-cryptic-accent">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-cryptic-accent">Disclaimers</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
