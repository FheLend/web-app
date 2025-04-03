
import { Lock, Shield, Database, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [encryptedValues, setEncryptedValues] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState<string>("72,538.45");
  
  // Generate animated encrypted data representation
  useEffect(() => {
    // Generate random encrypted-looking strings
    const generateEncryptedData = () => {
      const chars = '01αβγδεζηθικλμνξοπρστυφχψω$%#@!*^&';
      const newValues = [];
      
      for (let i = 0; i < 8; i++) {
        let str = '';
        const length = Math.floor(Math.random() * 6) + 4;
        
        for (let j = 0; j < length; j++) {
          str += chars[Math.floor(Math.random() * chars.length)];
        }
        
        newValues.push(str);
      }
      
      setEncryptedValues(newValues);
    };
    
    generateEncryptedData();
    const interval = setInterval(generateEncryptedData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden py-16 md:py-24 bg-cryptic-dark">
      {/* Subtle background elements */}
      <div 
        className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-glow opacity-20 blur-3xl"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-glow opacity-10 blur-3xl"
        style={{ animationDelay: '-3s' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Total Encrypted Value - positioned to the left, above the heading */}
        <div className="mb-4">
          <div className="inline-flex items-center">
            <DollarSign className="text-cryptic-accent w-5 h-5 mr-2" />
            <div>
              <span className="block text-cryptic-accent text-sm">Total Encrypted Value</span>
              <span className="text-cryptic-highlight text-xl font-bold">${totalValue} USD</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative">
              <span className="text-glow">Private</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">
                encrypted lending
              </span>
              <div className="absolute -left-6 -top-6 w-12 h-12 border border-cryptic-accent/30 rounded-full opacity-70"></div>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              Felend leverages Fully Homomorphic Encryption (FHE) to secure your financial data while enabling computations on encrypted data, ensuring both privacy and functionality.
            </p>
            
            <Button className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white">
              <Lock className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
          
          <div className="hidden md:block">
            {/* New Privacy-Focused Lending Visualization */}
            <div className="relative flex justify-center">
              {/* Main secured vault */}
              <div className="relative z-10 w-64 h-64 rounded-lg bg-gradient-to-br from-cryptic-dark to-[#1F2433] border border-cryptic-accent/20 shadow-lg flex flex-col items-center justify-center p-6">
                <Shield className="w-12 h-12 text-cryptic-accent mb-4" />
                
                {/* Digital lock/vault effect */}
                <div className="w-full h-1 bg-cryptic-accent/20 mb-4 relative">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cryptic-accent to-cryptic-highlight" style={{ width: '70%' }}></div>
                </div>
                
                {/* Encrypted data display */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {encryptedValues.slice(0, 4).map((value, index) => (
                    <div key={index} className="bg-cryptic-dark border border-cryptic-accent/10 rounded px-2 py-1">
                      <p className="text-xs font-mono text-cryptic-highlight opacity-70">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Loan indicators */}
                <div className="flex justify-between w-full mt-4">
                  <div>
                    <p className="text-xs text-cryptic-highlight/70">Secure Loans</p>
                    <p className="text-sm font-bold text-white">$40,234</p>
                  </div>
                  <div>
                    <p className="text-xs text-cryptic-highlight/70">APR</p>
                    <p className="text-sm font-bold text-cryptic-accent">3.2%</p>
                  </div>
                </div>
              </div>
              
              {/* Security layers */}
              <div className="absolute inset-0 -z-10 w-64 h-64 border border-cryptic-accent/5 rounded-lg transform translate-x-2 translate-y-2"></div>
              <div className="absolute inset-0 -z-20 w-64 h-64 border border-cryptic-accent/5 rounded-lg transform translate-x-4 translate-y-4"></div>
              
              {/* Privacy shield elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-br from-cryptic-accent/20 to-transparent flex items-center justify-center">
                <Lock className="w-5 h-5 text-cryptic-accent" />
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-gradient-to-br from-cryptic-accent/20 to-transparent flex items-center justify-center">
                <Database className="w-5 h-5 text-cryptic-accent" />
              </div>
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full -z-30" viewBox="0 0 260 260">
                <path d="M50,50 L210,210" stroke="url(#gradientLine)" strokeWidth="1" fill="none" />
                <path d="M50,210 L210,50" stroke="url(#gradientLine)" strokeWidth="1" fill="none" />
                <defs>
                  <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(138, 79, 255, 0.1)" />
                    <stop offset="100%" stopColor="rgba(192, 168, 255, 0.1)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
