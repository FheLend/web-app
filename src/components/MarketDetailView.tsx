import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Info,
  Lock,
  RefreshCw,
  Percent,
  ChevronDown,
  Users,
  Activity,
  Database,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useThemeStyles } from "@/lib/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { useContractConfig } from "@/hooks/useContractConfig";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import { readContracts } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { getTokenLogo } from "@/utils/token";
import { MarketInteractionCard, UserPositionCard } from "@/components/market";
import { Market } from "@/types/market";

interface MarketDetailProps {
  marketId: string;
}

export function MarketDetailView({ marketId }: MarketDetailProps) {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const theme = themeContext?.theme;
  const { cardStyles, marketBadge } = useThemeStyles();
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  const [timeframe, setTimeframe] = useState("3 months");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const { configs } = useContractConfig();
  const { chainId } = useAccount();
  const [market, setMarket] = useState<Market | null>(null);

  const marketAddress = useMemo(() => {
    const matchingConfig = configs.find(
      (c) => +c.network === chainId && c.contract_address === marketId
    );
    return matchingConfig ? matchingConfig.contract_address : null;
  }, [chainId, configs, marketId]);

  useEffect(() => {
    async function fetchMarket() {
      try {
        setLoading(true);
        const vaultInfo = [
          "asset",
          "name",
          "borrowToken",
          "collateralToken",
          "oracle",
          "maxLtvBasisPoint",
          "liquidationThresholdBasisPoint",
          "tickSpacing",
        ].map((key) => ({
          address: marketAddress as `0x${string}`,
          abi: MarketFHEAbi.abi as any,
          functionName: key,
        }));

        // @ts-expect-error - Type instantiation too deep for wagmi ABI types
        const results = await readContracts(config, {
          contracts: vaultInfo,
        });
        const [
          asset,
          marketName,
          borrowToken,
          collateralToken,
          oracle,
          maxLtvBasisPoint,
          liquidationThresholdBasisPoint,
          tickSpacing,
        ] = results;

        const tokens = [borrowToken, collateralToken].map((token) => ({
          address: token.result as `0x${string}`,
          abi: FHERC20Abi.abi as any,
          functionName: "symbol",
        }));

        const tokensResults = await readContracts(config, {
          contracts: tokens,
        });

        console.log({
          address: marketAddress,
          asset: asset.result,
          name: marketName.result,
          borrowToken: borrowToken.result,
          collateralToken: collateralToken.result,
        });

        setMarket({
          id: marketAddress,
          name: marketName.result as string,
          collateralToken: {
            symbol: tokensResults[1].result as string,
            logo: getTokenLogo(tokensResults[1].result as string),
            address: collateralToken.result as string,
            decimals: 18, // Default to 18 decimals for ERC20 tokens
          },
          loanToken: {
            symbol: tokensResults[0].result as string,
            logo: getTokenLogo(tokensResults[0].result as string),
            address: borrowToken.result as string,
            decimals: 18, // Default to 18 decimals for ERC20 tokens
          },
          ltv: "*******",
          ltvValue: 72,
          liquidity: "********",
          liquidityValue: 24.48,
          rate: "*******",
          rateValue: 5.04,
          rateChange: "up",
          vaultRating: 10,
          maxLtvBasisPoint: maxLtvBasisPoint.result as number,
          liquidationThresholdBasisPoint:
            liquidationThresholdBasisPoint.result as number,
          tickSpacing: tickSpacing.result as number,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching markets:", error);
      }
    }

    fetchMarket();
  }, [marketAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cryptic-accent" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl text-muted-foreground">Market not found</p>
        <Button className="mt-4" onClick={() => navigate("/borrow")}>
          Back to Markets
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
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
            <div className={marketBadge}>{market.ltv}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <Card className={cardStyles}>
                <CardContent className="pt-6">
                  <div className="text-muted-foreground text-sm mb-1">
                    Total Supply ({market.collateralToken.symbol})
                  </div>
                  <div className="text-4xl font-bold">********</div>
                  <div className="text-muted-foreground text-sm">********</div>
                </CardContent>
              </Card>
              <Card className={cardStyles}>
                <CardContent className="pt-6">
                  <div className="text-muted-foreground text-sm mb-1">
                    Liquidity ({market.loanToken.symbol})
                  </div>
                  <div className="text-4xl font-bold">********</div>
                  <div className="text-muted-foreground text-sm">********</div>
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
                <TabsTrigger
                  value="positions"
                  className={cn(
                    "px-6 rounded-none data-[state=active]:shadow-none data-[state=active]:bg-transparent h-16 text-base",
                    "border-b-2 border-transparent data-[state=active]:border-primary"
                  )}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Your positions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-0">
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
                        {parseFloat(`${market.liquidityValue * 0.6}`).toFixed(
                          2
                        )}
                        M
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
              </TabsContent>

              <TabsContent value="activity" className="space-y-8 mt-0">
                <Card className={cardStyles}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">
                      Recent Market Activity
                    </CardTitle>
                    <CardDescription>
                      Recent borrowing and supply transactions in this market
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>TX</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-green-500">
                            Supply
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.collateralToken.logo}
                                alt={market.collateralToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>
                                1,245.50 {market.collateralToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            0x72e...5d3a
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            5 mins ago
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-blue-500">
                            Borrow
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.loanToken.logo}
                                alt={market.loanToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>823.75 {market.loanToken.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            0x4f8...9c21
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            15 mins ago
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-500">
                            Repay
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.loanToken.logo}
                                alt={market.loanToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>512.30 {market.loanToken.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            0x91b...7f42
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            32 mins ago
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-green-500">
                            Supply
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.collateralToken.logo}
                                alt={market.collateralToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>
                                2,150.00 {market.collateralToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            0x36a...8b27
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            45 mins ago
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className={cardStyles}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Activity Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Total Transactions
                        </p>
                        <p className="text-2xl font-bold">1,248</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          24h Volume
                        </p>
                        <p className="text-2xl font-bold">$1.24M</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Unique Borrowers
                        </p>
                        <p className="text-2xl font-bold">87</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Unique Suppliers
                        </p>
                        <p className="text-2xl font-bold">156</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="borrowers" className="space-y-8 mt-0">
                <Card className={cardStyles}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Active Borrowers</CardTitle>
                    <CardDescription>
                      Current borrowers sorted by position size
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Borrower</TableHead>
                          <TableHead>Collateral</TableHead>
                          <TableHead>Loan</TableHead>
                          <TableHead>Current LTV</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            0x72e...5d3a
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.collateralToken.logo}
                                alt={market.collateralToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>
                                5,120.50 {market.collateralToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.loanToken.logo}
                                alt={market.loanToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>4,845.20 {market.loanToken.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-amber-500">92.3%</span>
                              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-amber-500 rounded-full"
                                  style={{ width: "92.3%" }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            0x4f8...9c21
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.collateralToken.logo}
                                alt={market.collateralToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>
                                2,650.25 {market.collateralToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.loanToken.logo}
                                alt={market.loanToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>2,310.75 {market.loanToken.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-green-500">85.2%</span>
                              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: "85.2%" }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            0x91b...7f42
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.collateralToken.logo}
                                alt={market.collateralToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>
                                1,845.60 {market.collateralToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Image
                                src={market.loanToken.logo}
                                alt={market.loanToken.symbol}
                                className="h-5 w-5 mr-2 rounded-full"
                              />
                              <span>1,512.45 {market.loanToken.symbol}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-green-500">80.5%</span>
                              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: "80.5%" }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <a
                              href="#"
                              className="text-primary hover:underline"
                            >
                              View
                            </a>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className={cardStyles}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">
                      Borrower Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Average LTV
                        </p>
                        <p className="text-2xl font-bold">84.5%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Average Loan Size
                        </p>
                        <p className="text-2xl font-bold">$24.6K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Largest Borrower
                        </p>
                        <p className="text-2xl font-bold">$156K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">
                          Total Borrowers
                        </p>
                        <p className="text-2xl font-bold">87</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="oracles" className="space-y-8 mt-0">
                <Card className={cardStyles}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Oracle Providers</CardTitle>
                    <CardDescription>
                      Price feed oracles used for this market
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>Feed</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>Last Update</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Chainlink
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex items-center mr-2">
                                <Image
                                  src={market.collateralToken.logo}
                                  alt={market.collateralToken.symbol}
                                  className="h-5 w-5 rounded-full"
                                />
                                <span className="mx-1">/</span>
                                <Image
                                  src={market.loanToken.logo}
                                  alt={market.loanToken.symbol}
                                  className="h-5 w-5 rounded-full"
                                />
                              </div>
                              <span>
                                {market.collateralToken.symbol}/
                                {market.loanToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>$1.0002</TableCell>
                          <TableCell>2 mins ago</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                              Active
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Uniswap TWAP
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex items-center mr-2">
                                <Image
                                  src={market.collateralToken.logo}
                                  alt={market.collateralToken.symbol}
                                  className="h-5 w-5 rounded-full"
                                />
                                <span className="mx-1">/</span>
                                <Image
                                  src={market.loanToken.logo}
                                  alt={market.loanToken.symbol}
                                  className="h-5 w-5 rounded-full"
                                />
                              </div>
                              <span>
                                {market.collateralToken.symbol}/
                                {market.loanToken.symbol}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>$1.0001</TableCell>
                          <TableCell>5 mins ago</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                              Active
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Pyth Network
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex items-center mr-2">
                                <Image
                                  src={market.collateralToken.logo}
                                  alt={market.collateralToken.symbol}
                                  className="h-5 w-5 rounded-full"
                                />
                                <span className="mx-1">/</span>
                                <Image
                                  src="https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png?1696513206"
                                  alt="USD"
                                  className="h-5 w-5 rounded-full"
                                />
                              </div>
                              <span>{market.collateralToken.symbol}/USD</span>
                            </div>
                          </TableCell>
                          <TableCell>$1.0005</TableCell>
                          <TableCell>3 mins ago</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400">
                              Backup
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className={cardStyles}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">
                      Oracle Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="text-muted-foreground">
                          Liquidation Threshold
                        </span>
                        <span className="font-medium">
                          {(
                            parseFloat(market.ltv.replace("%", "")) + 2
                          ).toFixed(2)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="text-muted-foreground">
                          Price Deviation Threshold
                        </span>
                        <span className="font-medium">0.5%</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="text-muted-foreground">
                          Minimum Oracle Sources
                        </span>
                        <span className="font-medium">2</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-border">
                        <span className="text-muted-foreground">
                          Oracle Update Frequency
                        </span>
                        <span className="font-medium">1 hour</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Emergency Oracle
                        </span>
                        <span className="font-medium">DAO Multisig</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="positions" className="space-y-8 mt-0">
                <UserPositionCard market={market} cardStyles={cardStyles} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="md:col-span-1 relative">
            <div className="lg:sticky lg:top-24 space-y-6">
              <MarketInteractionCard
                isConnected={isConnected}
                market={market}
                cardStyles={cardStyles}
                open={open}
                theme={theme || "light"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
