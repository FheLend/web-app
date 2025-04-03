
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VaultProps {
  vault: {
    performanceFee: string;
    feeRecipient: {
      amount: string;
      value: string;
    };
  };
}

export function VaultPerformance({ vault }: VaultProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-cinzel mb-4">Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Daily</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">6%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">7.31%</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">All-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">11.38%</div>
            <p className="text-xs text-muted-foreground">Since inception</p>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Performance Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono">{vault.performanceFee}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-cryptic-dark border-cryptic-purple/20 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-muted-foreground">Fee Recipient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-xl font-mono">{vault.feeRecipient.amount}</div>
              <div className="text-sm text-muted-foreground">({vault.feeRecipient.value})</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
