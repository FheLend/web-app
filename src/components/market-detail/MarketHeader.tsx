
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { useThemeStyles } from "@/lib/themeUtils";

interface MarketHeaderProps {
  market: any;
}

export function MarketHeader({ market }: MarketHeaderProps) {
  const navigate = useNavigate();
  const { badgeStyles } = useThemeStyles();

  return (
    <>
      <Button
        variant="ghost"
        className="mb-6 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/borrow")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Markets
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <div className="h-10 w-10 mr-3 relative">
              <Image
                src={market.collateralToken.logo}
                alt={market.collateralToken.symbol}
                className="rounded-full absolute"
              />
            </div>
            <div className="h-10 w-10 relative -ml-6">
              <Image
                src={market.loanToken.logo}
                alt={market.loanToken.symbol}
                className="rounded-full absolute"
              />
            </div>
            <span className="text-3xl font-bold ml-3">
              {market.collateralToken.symbol} / {market.loanToken.symbol}
            </span>
          </div>
          <div className={badgeStyles}>
            {market.ltv}
          </div>
        </div>
      </div>
    </>
  );
}
