import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplyCollateralProps {
  isConnected: boolean;
  collateralAmount: string;
  borrowAmount: string;
  repayAmount: string;
  handleCollateralChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBorrowChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRepayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  market: {
    collateralToken: {
      symbol: string;
      logo: string;
    };
    loanToken: {
      symbol: string;
      logo: string;
    };
    ltv: string;
  };
  cardStyles: string;
  open: () => void;
  theme?: string | null | undefined;
}

export function SupplyCollateral({
  isConnected,
  collateralAmount,
  borrowAmount,
  repayAmount,
  handleCollateralChange,
  handleBorrowChange,
  handleRepayChange,
  market,
  cardStyles,
  open,
  theme = "light",
}: SupplyCollateralProps) {
  const [activeTab, setActiveTab] = useState<string>("borrow");

  const NotConnectedState = () => (
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

  return (
    <Card className={cardStyles}>
      <CardHeader>
        <CardTitle className="text-xl">Market Interaction</CardTitle>
        <CardDescription>
          Borrow or repay {market.loanToken.symbol} using{" "}
          {market.collateralToken.symbol} as collateral
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <NotConnectedState />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="borrow">Borrow</TabsTrigger>
              <TabsTrigger value="repay">Repay</TabsTrigger>
            </TabsList>

            <TabsContent value="borrow">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Collateral Amount
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-4 pr-24 py-6 text-lg"
                      value={collateralAmount}
                      onChange={handleCollateralChange}
                      min="0"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                      <Image
                        src={market.collateralToken.logo}
                        alt={market.collateralToken.symbol}
                        className="h-5 w-5 mr-1 rounded-full"
                      />
                      <span className="text-muted-foreground">
                        {market.collateralToken.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Balance: 0.00</span>
                    <span>$0</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Borrow Amount
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-4 pr-24 py-6 text-lg"
                      value={borrowAmount}
                      onChange={handleBorrowChange}
                      min="0"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                      <Image
                        src={market.loanToken.logo}
                        alt={market.loanToken.symbol}
                        className="h-5 w-5 mr-1 rounded-full"
                      />
                      <span className="text-muted-foreground">
                        {market.loanToken.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Available: 0.00</span>
                    <span>$0</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      LTV / Liquidation LTV
                    </span>
                    <span>0% / {market.ltv}</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                </div>

                <Button className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 mt-4">
                  Borrow
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="repay">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Repay Amount
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-4 pr-24 py-6 text-lg"
                      value={repayAmount}
                      onChange={handleRepayChange}
                      min="0"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                      <Image
                        src={market.loanToken.logo}
                        alt={market.loanToken.symbol}
                        className="h-5 w-5 mr-1 rounded-full"
                      />
                      <span className="text-muted-foreground">
                        {market.loanToken.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Balance: 0.00</span>
                    <span>$0</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                  <span className="text-muted-foreground">Current loan</span>
                  <span className="font-medium">
                    0.00 {market.loanToken.symbol}
                  </span>
                </div>

                <Button className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90 mt-4">
                  Repay
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter
        className={cn(
          "border-t pt-4 flex flex-col items-start",
          theme && theme === "dark"
            ? "border-cryptic-purple/10"
            : "border-slate-100"
        )}
      >
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Shield className="h-3 w-3 mr-1" />
          <span>Protected by Fully Homomorphic Encryption</span>
        </div>
      </CardFooter>
    </Card>
  );
}
