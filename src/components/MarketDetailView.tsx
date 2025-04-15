
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, Users, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeStyles } from "@/lib/themeUtils";

// Import all the new components
import { MarketHeader } from "@/components/market-detail/MarketHeader";
import { MarketOverviewCards } from "@/components/market-detail/MarketOverviewCards";
import { MarketBorrowForm } from "@/components/market-detail/MarketBorrowForm";
import { OverviewTab } from "@/components/market-detail/OverviewTab";
import { ActivityTab } from "@/components/market-detail/ActivityTab";
import { BorrowersTab } from "@/components/market-detail/BorrowersTab";
import { OraclesTab } from "@/components/market-detail/OraclesTab";

interface MarketDetailProps {
  marketId: string;
}

interface Market {
  id: string;
  collateralToken: {
    symbol: string;
    logo: string;
    apy?: string;
  };
  loanToken: {
    symbol: string;
    logo: string;
  };
  ltv: string;
  ltvValue: number;
  liquidity: string;
  liquidityValue: number;
  rate: string;
  rateValue: number;
  rateChange: "up" | "down" | "stable";
  vaultRating: number;
  totalLoans: string;
}

const markets: Market[] = [
  {
    id: "1",
    collateralToken: {
      symbol: "USDT",
      logo: "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
    },
    loanToken: {
      symbol: "USDC",
      logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694",
    },
    ltv: "96.50%",
    ltvValue: 96.5,
    liquidity: "66.24M USDC",
    liquidityValue: 66.24,
    rate: "5.33%",
    rateValue: 5.33,
    rateChange: "up",
    vaultRating: 1,
    totalLoans: "$1,704,909,971",
  },
  {
    id: "2",
    collateralToken: {
      symbol: "WBTC",
      logo: "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png?1696507857",
    },
    loanToken: {
      symbol: "USDC",
      logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694",
    },
    ltv: "86.00%",
    ltvValue: 86.0,
    liquidity: "29.8M USDC",
    liquidityValue: 29.8,
    rate: "4.90%",
    rateValue: 4.9,
    rateChange: "up",
    vaultRating: 15,
    totalLoans: "$1,253,490,256",
  },
  {
    id: "3",
    collateralToken: {
      symbol: "wstETH",
      logo: "https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png?1696513206",
      apy: "3.53%",
    },
    loanToken: {
      symbol: "USDC",
      logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694",
    },
    ltv: "88.00%",
    ltvValue: 88.0,
    liquidity: "26.81M USDC",
    liquidityValue: 26.81,
    rate: "5.24%",
    rateValue: 5.24,
    rateChange: "up",
    vaultRating: 16,
    totalLoans: "$984,671,345",
  },
  {
    id: "4",
    collateralToken: {
      symbol: "ETH",
      logo: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
    },
    loanToken: {
      symbol: "USDC",
      logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694",
    },
    ltv: "86.00%",
    ltvValue: 86.0,
    liquidity: "24.48M USDC",
    liquidityValue: 24.48,
    rate: "5.04%",
    rateValue: 5.04,
    rateChange: "up",
    vaultRating: 10,
    totalLoans: "$873,562,190",
  },
  {
    id: "5",
    collateralToken: {
      symbol: "wstETH",
      logo: "https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png?1696513206",
      apy: "3.53%",
    },
    loanToken: {
      symbol: "USDT",
      logo: "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661",
    },
    ltv: "88.00%",
    ltvValue: 88.0,
    liquidity: "17.58M USDT",
    liquidityValue: 17.58,
    rate: "3.07%",
    rateValue: 3.07,
    rateChange: "up",
    vaultRating: 7,
    totalLoans: "$642,897,345",
  },
];

export function MarketDetailView({ marketId }: MarketDetailProps) {
  const { cardStyles } = useThemeStyles();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("3 months");

  const market = markets.find((m) => m.id === marketId);

  if (!market) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl text-muted-foreground">Market not found</p>
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md" onClick={() => window.history.back()}>
          Back to Markets
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <MarketHeader market={market} />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <MarketOverviewCards market={market} />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-background border-b border-border h-16 rounded-none bg-transparent p-0 mb-6 justify-start">
                <TabsTrigger
                  value="overview"
                  className={cn(
                    "px-6 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-16 text-base",
                    "border-b-2 border-transparent data-[state=active]:border-primary"
                  )}
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className={cn(
                    "px-6 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-16 text-base",
                    "border-b-2 border-transparent data-[state=active]:border-primary"
                  )}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Market Activity
                </TabsTrigger>
                <TabsTrigger
                  value="borrowers"
                  className={cn(
                    "px-6 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-16 text-base",
                    "border-b-2 border-transparent data-[state=active]:border-primary"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Borrowers
                </TabsTrigger>
                <TabsTrigger
                  value="oracles"
                  className={cn(
                    "px-6 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-16 text-base",
                    "border-b-2 border-transparent data-[state=active]:border-primary"
                  )}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Oracles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <OverviewTab market={market} timeframe={timeframe} />
              </TabsContent>

              <TabsContent value="activity">
                <ActivityTab market={market} />
              </TabsContent>

              <TabsContent value="borrowers">
                <BorrowersTab market={market} />
              </TabsContent>

              <TabsContent value="oracles">
                <OraclesTab market={market} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-1">
            <MarketBorrowForm market={market} />
          </div>
        </div>
      </div>
    </div>
  );
}
