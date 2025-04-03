
import { Eye, Lock, Shield, Vault, LineChart, Code, Zap } from 'lucide-react';

export function Features() {
  return (
    <div className="py-16 px-4 sm:px-6 bg-cryptic-darker">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">Private DeFi Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the first truly private lending protocol using fully homomorphic encryption to protect your financial data.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-cryptic-accent" />}
            title="True Privacy"
            description="FeLend uses fully homomorphic encryption (FHE) that allows computations directly on encrypted data, ensuring your financial information remains private."
          />
          
          <FeatureCard 
            icon={<Lock className="h-6 w-6 text-cryptic-accent" />}
            title="Trustless Protocol"
            description="No need to trust centralized entities with your data. Our protocol keeps your information encrypted at all times, even during transactions."
          />
          
          <FeatureCard 
            icon={<Eye className="h-6 w-6 text-cryptic-accent" />}
            title="Confidential Transactions"
            description="Borrow against your crypto holdings without revealing your balances, transaction history, or financial position to anyone."
          />
          
          <FeatureCard 
            icon={<LineChart className="h-6 w-6 text-cryptic-accent" />}
            title="Risk Assessment"
            description="Our protocol can assess creditworthiness and calculate risk scores on encrypted data, enabling accurate lending decisions while preserving privacy."
          />
          
          <FeatureCard 
            icon={<Code className="h-6 w-6 text-cryptic-accent" />}
            title="FHE Architecture"
            description="Built on Fhenix protocol, the first L1 blockchain with native FHE support, making computation on encrypted data practical and efficient."
          />
          
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-cryptic-accent" />}
            title="Compliance Without Compromise"
            description="Meet regulatory requirements while maintaining user privacy through zero-knowledge proofs and selective disclosure."
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
  return (
    <div className="p-6 rounded-lg border border-cryptic-purple/20 bg-glass cryptic-shadow hover:border-cryptic-accent/30 transition duration-300">
      <div className="h-12 w-12 rounded-full bg-cryptic-purple/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-cinzel text-xl font-medium mb-2 text-cryptic-highlight">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
