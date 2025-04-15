
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "@/lib/themeUtils";

interface MarketOverviewCardsProps {
  market: any;
}

export function MarketOverviewCards({ market }: MarketOverviewCardsProps) {
  const { cardStyles } = useThemeStyles();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <Card className={cardStyles}>
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-sm mb-1">
            Total Supply ({market.loanToken.symbol})
          </div>
          <div className="text-4xl font-bold">
            {parseFloat(market.liquidity).toFixed(2)}M
          </div>
          <div className="text-muted-foreground text-sm">
            ${parseFloat(market.liquidity).toFixed(2)}M
          </div>
        </CardContent>
      </Card>
      <Card className={cardStyles}>
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-sm mb-1">
            Liquidity ({market.loanToken.symbol})
          </div>
          <div className="text-4xl font-bold">
            {parseFloat(market.liquidity).toFixed(2)}M
          </div>
          <div className="text-muted-foreground text-sm">
            ${parseFloat(market.liquidity).toFixed(2)}M
          </div>
        </CardContent>
      </Card>
      <Card className={cardStyles}>
        <CardContent className="pt-6">
          <div className="text-muted-foreground text-sm mb-1">Rate</div>
          <div
            className={cn(
              "text-4xl font-bold",
              market.rateChange === "up"
                ? "text-emerald-400"
                : market.rateChange === "down"
                ? "text-rose-400"
                : "text-amber-400"
            )}
          >
            {market.rate}
            <span className="ml-2">
              {market.rateChange === "up" && "↑"}
              {market.rateChange === "down" && "↓"}
              {market.rateChange === "stable" && "→"}
            </span>
          </div>
          <div className="text-muted-foreground text-sm">
            Variable rate
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
