
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Lock, UnlockKeyhole } from "lucide-react";

interface DepositWithdrawFormProps {
  vaultSymbol: string;
  apy: string;
}

export function DepositWithdrawForm({ vaultSymbol, apy }: DepositWithdrawFormProps) {
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(parseFloat(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive"
      });
      return;
    }
    
    if (activeTab === 'deposit') {
      toast({
        title: "Deposit Successful",
        description: `You've deposited ${amount} into ${vaultSymbol}`,
      });
    } else {
      toast({
        title: "Withdrawal Successful",
        description: `You've withdrawn ${amount} from ${vaultSymbol}`,
      });
    }
    
    setAmount('');
  };

  return (
    <Card className="bg-cryptic-dark border-cryptic-purple/20 h-full flex flex-col">
      <CardHeader className="pb-2">
        <Tabs 
          defaultValue="deposit" 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full bg-cryptic-purple/10">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="pt-4">
            <div className="bg-cryptic-dark rounded-lg p-4 mb-4">
              <h2 className="text-xl font-cinzel mb-4">APY</h2>
              <div className="text-4xl font-mono text-cryptic-accent">{apy}</div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Amount to Deposit</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="font-mono bg-cryptic-darker border-cryptic-purple/20 pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                    {vaultSymbol}
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-cryptic-accent hover:bg-cryptic-accent/80 font-medium flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Deposit
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="withdraw" className="pt-4">
            <div className="bg-cryptic-dark rounded-lg p-4 mb-4">
              <h2 className="text-xl font-cinzel mb-4">Available to Withdraw</h2>
              <div className="text-2xl font-mono">350.02M {vaultSymbol}</div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-muted-foreground">Amount to Withdraw</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="font-mono bg-cryptic-darker border-cryptic-purple/20 pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                    {vaultSymbol}
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-cryptic-accent hover:bg-cryptic-accent/80 font-medium flex items-center justify-center gap-2"
              >
                <UnlockKeyhole className="h-4 w-4" />
                Withdraw
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardHeader>
      
      <CardContent className="flex-grow flex items-end pb-6">
        <div className="text-sm text-muted-foreground w-full">
          <div className="flex justify-between mb-2">
            <span>Protocol Fee</span>
            <span className="font-mono">0.00%</span>
          </div>
          <div className="flex justify-between">
            <span>Gas Fee (est.)</span>
            <span className="font-mono">~$2.34</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
