import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawFormProps {
  vaultSymbol: string;
  theme: string;
  isConnected: boolean;
  openWalletModal: () => void;
}

export function WithdrawForm({
  vaultSymbol,
  theme,
  isConnected,
  openWalletModal,
}: WithdrawFormProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = async () => {
    // TODO: Implement withdraw functionality
    console.log("Withdraw:", withdrawAmount);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm text-muted-foreground">
            Amount to Withdraw
          </label>
          <span className="text-sm text-muted-foreground">
            Balance: 0.00
          </span>
        </div>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="pr-16"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-muted-foreground">
              {vaultSymbol}
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "p-3 rounded-lg flex items-center",
          theme === "dark" ? "bg-cryptic-purple/10" : "bg-blue-50"
        )}
      >
        <Clock className="h-4 w-4 text-yellow-400 mr-2" />
        <span className="text-xs text-muted-foreground">
          Withdrawals may take up to 24 hours to process
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Withdrawal Fee</span>
          <span className="text-foreground">0.1%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gas Fee (est.)</span>
          <span className="text-foreground">$5.67</span>
        </div>
      </div>

      {isConnected ? (
        <Button 
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={handleWithdraw}
        >
          Withdraw {withdrawAmount} {vaultSymbol}
        </Button>
      ) : (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={openWalletModal}
        >
          Connect Wallet to Withdraw
        </Button>
      )}
    </div>
  );
}
