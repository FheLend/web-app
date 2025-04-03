
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
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
        <div className="text-center sm:text-left mb-10">
          <p className="text-cryptic-accent font-medium tracking-wide mb-3">
            Total Oracle Value: <span className="text-cryptic-highlight animate-glow">₿ 72,538.45</span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative">
              <span className="text-glow">Earn on</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">
                your terms
              </span>
              <div className="absolute -left-6 -top-6 w-12 h-12 border border-cryptic-accent/30 rounded-full opacity-70"></div>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              Access the hidden realm of decentralized lending, where your assets work in the shadows to generate yields beyond ordinary markets.
            </p>
            
            <Button className="bg-cryptic-accent hover:bg-cryptic-accent/90 text-white">
              <Lock className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
          
          <div className="hidden md:block relative">
            <div className="relative z-10 animate-float">
              <img 
                src="/lovable-uploads/cb54a236-2fe8-4b19-af7a-9f81d1d8902e.png" 
                alt="Cryptic Vault" 
                className="max-w-sm mx-auto opacity-80"
              />
            </div>
            <div className="absolute inset-0 bg-purple-glow opacity-40 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Lock } from "lucide-react";
