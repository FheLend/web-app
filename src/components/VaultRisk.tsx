
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from 'lucide-react';

interface VaultProps {
  vault: {
    risk: {
      riskFactor: string;
      score: number;
      timeToLoss: string;
      collateral: string;
      totalOutstanding: string;
      debtCeiling: string;
    };
  };
}

export function VaultRisk({ vault }: VaultProps) {
  const { risk } = vault;
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-cinzel mb-4">Risk</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={18} className="text-cryptic-accent" />
              <span>Risk Factor</span>
              <span className="ml-auto text-sm bg-green-800/30 text-green-400 px-2 py-0.5 rounded-full">
                {risk.riskFactor}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">{risk.score}%</div>
            <p className="text-xs text-muted-foreground">These are based on model parameters</p>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Time to Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono">{risk.timeToLoss}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono">{risk.totalOutstanding}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Debt Ceiling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono">{risk.debtCeiling}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-cryptic-dark border-cryptic-purple/20 mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-muted-foreground">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground rounded-md bg-cryptic-purple/10 p-4">
            Collateral mix is distributed to multiple venues.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
