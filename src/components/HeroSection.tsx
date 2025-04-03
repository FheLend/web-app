
import { Lock, Shield, CircuitBoard, Link, Bitcoin, Database, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [encryptedValues, setEncryptedValues] = useState<string[]>([]);
  const [blockchainBlocks, setBlockchainBlocks] = useState<{id: number, hash: string}[]>([]);
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

  // Generate blockchain blocks
  useEffect(() => {
    const generateBlockchain = () => {
      const blocks = [];
      for (let i = 0; i < 5; i++) {
        const hash = Array(8).fill(0).map(() => 
          Math.random().toString(16).substring(2, 4)).join('');
        blocks.push({ id: i, hash: `0x${hash}` });
      }
      setBlockchainBlocks(blocks);
    };

    generateBlockchain();
    const interval = setInterval(generateBlockchain, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden py-16 md:py-24 bg-cryptic-dark">
      {/* Animated background elements */}
      <div 
        className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-glow opacity-20 animate-float"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-glow opacity-10 animate-float"
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
            
            {/* Co-branded "Powered By" section */}
            <div className="mb-8 flex flex-col space-y-2">
              <p className="text-sm text-cryptic-highlight">Powered by</p>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-cryptic-accent to-cryptic-highlight p-[1px] rounded-md">
                  <div className="bg-cryptic-dark px-4 py-2 rounded-md flex items-center">
                    <span className="font-cinzel font-bold mr-1 text-white">Felend</span>
                    <span className="text-cryptic-highlight text-lg">×</span>
                    <img 
                      src="/lovable-uploads/b0a11051-a1f3-44b0-8dd9-4bad74f9eab7.png" 
                      alt="Fhenix" 
                      className="h-6 ml-1" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white">
              <Lock className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
          
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-purple-glow opacity-40 blur-2xl rounded-full"></div>
            
            {/* Simplified co-branded visualization */}
            <div className="relative z-10 flex justify-center items-center h-72">
              {/* Felend encrypted circle */}
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-2 border-cryptic-accent/50 flex items-center justify-center">
                  <CircuitBoard className="text-cryptic-accent w-8 h-8" />
                  
                  {/* Animated encrypted data points */}
                  {encryptedValues.slice(0, 3).map((value, index) => {
                    const angle = (index / 3) * Math.PI * 2;
                    const x = Math.cos(angle) * 30;
                    const y = Math.sin(angle) * 30;
                    
                    return (
                      <div 
                        key={index}
                        className="absolute text-xs font-mono text-cryptic-highlight"
                        style={{ 
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
                <div className="absolute w-48 h-48 rounded-full border border-cryptic-accent/20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-slow-spin"></div>
              </div>
              
              {/* Connection beam between logos */}
              <div className="w-16 h-2 bg-gradient-to-r from-cryptic-accent to-[#ff5e00] mx-2"></div>
              
              {/* Fhenix circle with orange gradient */}
              <div className="relative">
                <div className="w-36 h-36 rounded-full border-2 border-[#ff5e00]/50 flex items-center justify-center bg-gradient-to-br from-black to-[#150a02] p-2">
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-black">
                    <Zap className="text-[#ff5e00] w-8 h-8" />
                    
                    {/* Fhenix animated elements */}
                    {[1, 2, 3].map((_, index) => {
                      const angle = (index / 3) * Math.PI * 2;
                      const x = Math.cos(angle) * 30;
                      const y = Math.sin(angle) * 30;
                      
                      return (
                        <div 
                          key={index}
                          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#ff5e00] to-[#ffae00]"
                          style={{ 
                            transform: `translate(${x}px, ${y}px)`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="absolute w-48 h-48 rounded-full border border-[#ff5e00]/20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-reverse-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
