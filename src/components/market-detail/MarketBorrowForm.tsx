
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Percent, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useThemeStyles } from "@/lib/themeUtils";

interface MarketBorrowFormProps {
  market: any;
}

export function MarketBorrowForm({ market }: MarketBorrowFormProps) {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const { cardStyles } = useThemeStyles();
  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [timeframe, setTimeframe] = useState("3 months");

  const handleCollateralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollateralAmount(value);

    // Calculate borrow amount based on LTV
    if (value) {
      const collateral = parseFloat(value);
      const ltv = market.ltvValue / 100;
      setBorrowAmount((collateral * ltv).toFixed(2));
    } else {
      setBorrowAmount("");
    }
  };

  const handleBorrowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBorrowAmount(value);

    // Calculate required collateral based on LTV
    if (value) {
      const borrow = parseFloat(value);
      const ltv = market.ltvValue / 100;
      setCollateralAmount((borrow / ltv).toFixed(2));
    } else {
      setCollateralAmount("");
    }
  };

  return (
    <Card className={cn(cardStyles, "sticky top-24")}>
      <CardHeader>
        <CardTitle>Borrow {market.loanToken.symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">
            Supply Collateral ({market.collateralToken.symbol})
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={collateralAmount}
              onChange={handleCollateralChange}
              className="pr-20"
            />
            <div className="absolute inset-y-0 right-3 flex items-center text-sm font-medium">
              {market.collateralToken.symbol}
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Available: 0.00 {market.collateralToken.symbol}</span>
            <button className="text-primary hover:underline">MAX</button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">
            Borrow Amount ({market.loanToken.symbol})
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={handleBorrowChange}
              className="pr-20"
            />
            <div className="absolute inset-y-0 right-3 flex items-center text-sm font-medium">
              {market.loanToken.symbol}
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Available: {market.liquidity} {market.loanToken.symbol}</span>
            <button className="text-primary hover:underline">MAX</button>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Percent className="h-4 w-4 mr-1" />
              Interest Rate
            </span>
            <span className="font-medium">{market.rate}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              Loan-to-Value (LTV)
            </span>
            <span className="font-medium">{market.ltv}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" />
              Duration
            </span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-sm font-medium bg-transparent"
            >
              <option>1 month</option>
              <option>3 months</option>
              <option>6 months</option>
              <option>12 months</option>
            </select>
          </div>
        </div>

        <Button
          className="w-full mt-4"
          onClick={() => (isConnected ? null : open())}
        >
          {isConnected ? "Borrow Now" : "Connect Wallet"}
        </Button>
      </CardContent>
    </Card>
  );
}
