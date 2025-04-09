
import { Eye, Lock, Shield, Vault, Code, GanttChart, User } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

export function Features() {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "py-16 px-4 sm:px-6",
      theme === "dark" ? "bg-cryptic-darker" : "bg-slate-50"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-spaceGrotesk font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">Cutting-Edge Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FeLend combines the power of fully homomorphic encryption with DeFi lending to enable a new generation of private financial services.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-cryptic-accent" />}
            title="Privacy by Default"
            description="All user data is encrypted by default using Fully Homomorphic Encryption, ensuring your financial information remains confidential on-chain."
          />
          
          <FeatureCard 
            icon={<Lock className="h-6 w-6 text-cryptic-accent" />}
            title="Encrypted Credit Scoring"
            description="Our protocol performs lending risk assessments on encrypted data, without ever exposing your sensitive information."
          />
          
          <FeatureCard 
            icon={<Code className="h-6 w-6 text-cryptic-accent" />}
            title="Private Smart Contracts"
            description="Built on FHE-enabled smart contracts that can compute on encrypted data while keeping inputs, outputs, and the computation itself private."
          />
          
          <FeatureCard 
            icon={<Vault className="h-6 w-6 text-cryptic-accent" />}
            title="Secure Lending Pools"
            description="Access various lending pools with competitive interest rates, all while maintaining the privacy of your transactions and balances."
          />
          
          <FeatureCard 
            icon={<GanttChart className="h-6 w-6 text-cryptic-accent" />}
            title="Real-time Risk Management"
            description="Our protocol continuously evaluates lending risks while preserving data privacy, creating a more secure lending environment."
          />
          
          <FeatureCard 
            icon={<User className="h-6 w-6 text-cryptic-accent" />}
            title="Cross-Chain Compatibility"
            description="Designed to work across multiple blockchain networks, expanding the reach of private DeFi lending services."
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "p-6 rounded-lg border cryptic-shadow transition duration-300",
      theme === "dark" 
        ? "border-cryptic-purple/20 bg-glass hover:border-cryptic-accent/30 text-foreground" 
        : "border-slate-200 bg-white hover:border-cryptic-accent/30"
    )}>
      <div className="h-12 w-12 rounded-full bg-cryptic-purple/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-spaceGrotesk text-xl font-medium mb-2 text-cryptic-highlight">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
