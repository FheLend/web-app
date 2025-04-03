
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-cryptic-darker py-12 px-4 sm:px-6 border-t border-cryptic-purple/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-cryptic-accent mr-2" />
              <span className="font-cinzel text-lg font-semibold">
                Cryptic<span className="text-cryptic-accent">Loan</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Explore the shadows of decentralized finance where your assets work in mysterious ways.
            </p>
          </div>
          
          <div>
            <h3 className="font-cinzel text-sm font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Earn</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Borrow</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Vaults</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Markets</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-cinzel text-sm font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">API</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Security</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Audit Reports</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-cinzel text-sm font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Discord</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Twitter</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Forum</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-cryptic-accent">Governance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-cryptic-purple/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 CrypticLoan. All rights reserved. Enter at your own risk.
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
