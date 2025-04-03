
import { Shield, Info, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface VaultProps {
  vault: {
    name: string;
    symbol: string;
    verified: boolean;
    description: string;
    tvl: string;
    borrowed: string;
    apy: string;
  };
}

export function VaultHeader({ vault }: VaultProps) {
  return (
    <div className="rounded-lg bg-cryptic-dark p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-cinzel font-bold">
            <span className="text-white">Spark</span>{" "}
            <span className="text-cryptic-accent">DAI</span>{" "}
            <span className="text-white">Vault</span>
          </h1>
          {vault.verified && (
            <div className="bg-cryptic-accent/20 text-cryptic-accent text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Shield size={14} />
              <span>SparkDAO</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-cryptic-accent border-cryptic-accent/30">
            <ExternalLink size={14} className="mr-1" /> View Explorer
          </Button>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-6">{vault.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-cryptic-purple/20">
        <div>
          <div className="text-muted-foreground text-sm mb-1">Total Value Locked</div>
          <div className="text-2xl font-mono">{vault.tvl}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-sm mb-1">Borrowed</div>
          <div className="text-2xl font-mono">{vault.borrowed}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-sm mb-1">APY</div>
          <div className="text-2xl font-mono text-cryptic-accent">{vault.apy}</div>
        </div>
      </div>
    </div>
  );
}
