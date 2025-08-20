import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorrowForm, RepayForm } from "@/components/market";

interface MarketInteractionCardProps {
  isConnected: boolean;
  market: {
    id: string;
    collateralToken: {
      symbol: string;
      logo: string;
      address: string;
      decimals?: number;
    };
    loanToken: {
      symbol: string;
      logo: string;
      address: string;
      decimals?: number;
    };
    ltv: string;
    ltvValue?: number;
    tickSpacing?: number;
  };
  cardStyles: string;
  open: () => void;
  theme?: string | null | undefined;
}

export function MarketInteractionCard({
  isConnected,
  market,
  cardStyles,
  open,
  theme = "light",
}: MarketInteractionCardProps) {
  const [activeTab, setActiveTab] = useState<string>("borrow");

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="borrow">Borrow</TabsTrigger>
            <TabsTrigger value="repay">Repay</TabsTrigger>
          </TabsList>

          <TabsContent value="borrow">
            <BorrowForm
              isConnected={isConnected}
              market={{
                ...market,
                tickSpacing: market.tickSpacing || 60, // Provide a default value for tickSpacing
              }}
              open={open}
              theme={theme}
            />
          </TabsContent>

          <TabsContent value="repay">
            <RepayForm
              isConnected={isConnected}
              market={market}
              open={open}
              theme={theme}
            />
          </TabsContent>
        </Tabs>
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
