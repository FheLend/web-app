import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/ui/BalanceInput";
import { useAccount } from "wagmi";

interface RepayFormProps {
  isConnected: boolean;
  market: {
    id: string;
    loanToken: {
      symbol: string;
      logo: string;
      address: string;
      decimals?: number;
    };
  };
  open: () => void;
  theme?: string;
}

export function RepayForm({
  isConnected,
  market,
  open,
  theme,
}: RepayFormProps) {
  const { address } = useAccount();

  // Manage repayAmount state internally
  const [repayAmount, setRepayAmount] = useState("");

  // Handle repay amount changes internally
  const handleRepayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepayAmount(value);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-lg font-bold">X</span>
        </div>
        <p className="text-lg mb-2">0.00</p>
        <p className="text-muted-foreground text-sm mb-6">$0</p>
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={() => open()}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BalanceInput
        label="Repay Amount"
        value={repayAmount}
        onChange={handleRepayChange}
        tokenAddress={market.loanToken.address}
        userAddress={address}
        decimals={market.loanToken.decimals || 18}
        suffixSymbol={market.loanToken.symbol}
      />

      <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
        <span className="text-muted-foreground">Current loan</span>
        <span className="font-medium">0.00 {market.loanToken.symbol}</span>
      </div>

      <Button className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 mt-4">
        Repay
      </Button>
    </div>
  );
}
