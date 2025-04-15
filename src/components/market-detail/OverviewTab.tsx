
import React from "react";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "@/lib/themeUtils";

interface OverviewTabProps {
  market: any;
  timeframe: string;
}

export function OverviewTab({ market, timeframe }: OverviewTabProps) {
  const { cardStyles } = useThemeStyles();
  
  return (
    <div className="space-y-8 mt-0">
      <Card className={cardStyles}>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Collateral Token
              </p>
              <div className="flex items-center">
                <Image
                  src={market.collateralToken.logo}
                  alt={market.collateralToken.symbol}
                  className="h-6 w-6 mr-2 rounded-full"
                />
                <p className="font-medium">
                  {market.collateralToken.symbol}
                </p>
              </div>
              {market.collateralToken.apy && (
                <p className="text-xs text-green-400 mt-1">
                  APY: {market.collateralToken.apy}
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Loan Token
              </p>
              <div className="flex items-center">
                <Image
                  src={market.loanToken.logo}
                  alt={market.loanToken.symbol}
                  className="h-6 w-6 mr-2 rounded-full"
                />
                <p className="font-medium">
                  {market.loanToken.symbol}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Loan-to-Value (LTV)
              </p>
              <p className="font-medium">{market.ltv}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Date of Creation
              </p>
              <p className="font-medium">10/04/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardStyles}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              Total Borrow ({market.loanToken.symbol})
            </CardTitle>
            <CardDescription className="text-3xl font-bold mt-1">
              {parseFloat(`${market.liquidityValue * 0.6}`).toFixed(2)}M
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-sm">
              Borrow
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              Supply
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              Liquidity
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sm flex items-center"
            >
              {timeframe}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Chart visualization would go here
          </p>
        </CardContent>
      </Card>

      <Card className={cardStyles}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
              Rate
              <span
                className={cn(
                  "ml-2",
                  market.rateChange === "up"
                    ? "text-emerald-400"
                    : market.rateChange === "down"
                    ? "text-rose-400"
                    : "text-amber-400"
                )}
              >
                {market.rateChange === "up" && "↑"}
                {market.rateChange === "down" && "↓"}
                {market.rateChange === "stable" && "→"}
              </span>
            </CardTitle>
            <CardDescription
              className={cn(
                "text-3xl font-bold mt-1",
                market.rateChange === "up"
                  ? "text-emerald-400"
                  : market.rateChange === "down"
                  ? "text-rose-400"
                  : "text-amber-400"
              )}
            >
              {market.rate}
            </CardDescription>
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm flex items-center"
            >
              1 month
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Rate chart visualization would go here
          </p>
        </CardContent>
        <div className="px-6 py-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="font-medium">Native Rate</div>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="font-medium">
              {(market.rateValue - 0.15).toFixed(2)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
