
import { Eye, Lock, Shield, Vault } from 'lucide-react';

export function Features() {
  return (
    <div className="py-16 px-4 sm:px-6 bg-cryptic-darker">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">Arcane Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Delve into the mysterious world of decentralized finance with features designed for the discerning cryptomancer.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-cryptic-accent" />}
            title="Protected by Sigils"
            description="Our smart contracts are audited by top security firms, with protection spells and sigils to guard your assets."
          />
          
          <FeatureCard 
            icon={<Lock className="h-6 w-6 text-cryptic-accent" />}
            title="Cryptic Privacy"
            description="Privacy features that ensure your financial movements remain hidden from prying eyes, cloaked in layers of cryptographic fog."
          />
          
          <FeatureCard 
            icon={<Eye className="h-6 w-6 text-cryptic-accent" />}
            title="Oracle Network"
            description="Our mystical oracle network sources pricing data from the beyond, ensuring accurate and manipulation-resistant asset valuation."
          />
          
          <FeatureCard 
            icon={<Vault className="h-6 w-6 text-cryptic-accent" />}
            title="Enigmatic Vaults"
            description="Specialized yield strategies accessible only to those who know where to look, offering returns from hidden corners of the ecosystem."
          />
          
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-cryptic-accent" />}
            title="Arcane Insurance"
            description="Optional protection rituals to shield your deposits against unforeseen events in the cryptosphere."
          />
          
          <FeatureCard 
            icon={<Lock className="h-6 w-6 text-cryptic-accent" />}
            title="Forbidden Knowledge"
            description="Access to exclusive market insights and alpha through our network of crypto-seers and blockchain oracles."
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
