
import { Lock, Shield, CircuitBoard, Link, Bitcoin, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [encryptedValues, setEncryptedValues] = useState<string[]>([]);
  const [blockchainBlocks, setBlockchainBlocks] = useState<{id: number, hash: string}[]>([]);
  
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
        {/* Prominently displayed total encrypted value */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="px-6 py-4 bg-cryptic-accent/20 border-2 border-cryptic-accent rounded-lg shadow-lg backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <span className="text-cryptic-accent font-medium tracking-wide text-lg">Total Encrypted Value</span>
              <span className="text-cryptic-highlight text-3xl md:text-4xl font-bold animate-pulse">
                ₿ 72,538.45
              </span>
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
          
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-purple-glow opacity-40 blur-2xl rounded-full"></div>
            
            {/* Dynamic FHE + Blockchain Visualization */}
            <div className="relative z-10 flex justify-center">
              {/* Blockchain chain visualization */}
              <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 flex flex-col">
                {blockchainBlocks.map((block, index) => (
                  <div key={block.id} className="relative">
                    <div className="w-16 h-16 bg-cryptic-accent/20 border border-cryptic-accent mb-2 p-1 rounded-md flex items-center justify-center">
                      <Database className="text-cryptic-accent w-6 h-6" />
                    </div>
                    {index < blockchainBlocks.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 h-2 w-1 bg-cryptic-accent"></div>
                    )}
                    <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-xs text-cryptic-highlight opacity-70">
                      {block.hash}
                    </div>
                  </div>
                ))}
              </div>

              {/* FHE visualization */}
              <div className="w-64 h-64 rounded-full border-4 border-cryptic-accent/30 flex items-center justify-center relative animate-slow-spin">
                <div className="w-56 h-56 rounded-full border border-cryptic-accent/50 flex items-center justify-center animate-reverse-spin">
                  <div className="w-40 h-40 rounded-full border-2 border-cryptic-accent/70 flex items-center justify-center relative">
                    <CircuitBoard className="absolute text-cryptic-accent w-12 h-12 animate-pulse" />
                    
                    {/* Animated encrypted data points */}
                    {encryptedValues.map((value, index) => {
                      const angle = (index / 8) * Math.PI * 2;
                      const x = Math.cos(angle) * 60;
                      const y = Math.sin(angle) * 60;
                      
                      return (
                        <div 
                          key={index}
                          className="absolute text-xs font-mono text-cryptic-highlight animate-pulse"
                          style={{ 
                            transform: `translate(${x}px, ${y}px)`,
                            animationDelay: `${index * 0.2}s`
                          }}
                        >
                          {value}
                        </div>
                      );
                    })}
                    
                    <Bitcoin className="text-cryptic-accent w-10 h-10 animate-pulse" />
                  </div>
                </div>
                
                {/* Connection lines between FHE and blockchain */}
                <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-16 h-1 bg-cryptic-accent/50"></div>
              </div>
              
              {/* Transaction flow indicator */}
              <div className="absolute -bottom-12 flex space-x-3 items-center justify-center w-full">
                <div className="px-3 py-1 bg-cryptic-accent/20 border border-cryptic-accent/50 rounded text-xs animate-pulse">
                  <span className="text-cryptic-highlight">Encrypted Transaction</span>
                </div>
                <Link className="text-cryptic-accent animate-pulse" size={14} />
                <div className="px-3 py-1 bg-cryptic-accent/20 border border-cryptic-accent/50 rounded text-xs animate-pulse">
                  <span className="text-cryptic-highlight">Verified by FHE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
