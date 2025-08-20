import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useThemeStyles } from "@/lib/themeUtils";
import { Image } from "@/components/ui/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContractConfig } from "@/hooks/useContractConfig";
import { useAccount } from "wagmi";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import MarketFHEAbi from "@/constant/abi/MarketFHE.json";
import { readContracts } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { getTokenLogo } from "@/utils/token";

type Filter = "All" | "ETH" | "USDC" | "USDT" | "WBTC";
type SortField = "ltv" | "liquidity" | "rate" | null;
type SortDirection = "asc" | "desc";

interface Market {
  id: string;
  name: string;
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
}

export function BorrowMarketsList() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    marketCard,
    marketBadge,
    marketTableContainer,
    tableHeader,
    tableBody,
    tableRow,
    marketSearchInput,
  } = useThemeStyles();
  const { configs } = useContractConfig();
  const { chainId } = useAccount();
  const [markets, setMarkets] = useState<Market[]>([]);

  const marketAddresses = useMemo(() => {
    const matchingConfigs = configs.filter(
      (c) => +c.network === chainId && c.description === "market"
    );
    return matchingConfigs.length > 0
      ? matchingConfigs.map((c) => c.contract_address)
      : [];
  }, [chainId, configs]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortMarkets = (marketsToSort: Market[]) => {
    if (!sortField) return marketsToSort;

    return [...marketsToSort].sort((a, b) => {
      let valueA: number, valueB: number;

      switch (sortField) {
        case "ltv":
          valueA = a.ltvValue;
          valueB = b.ltvValue;
          break;
        case "liquidity":
          valueA = a.liquidityValue;
          valueB = b.liquidityValue;
          break;
        case "rate":
          valueA = a.rateValue;
          valueB = b.rateValue;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch =
      searchTerm === "" ||
      market.collateralToken.symbol
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      market.loanToken.symbol.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      market.collateralToken.symbol === activeFilter ||
      market.loanToken.symbol === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const sortedMarkets = sortMarkets(filteredMarkets);

  const handleRowClick = (marketId: string) => {
    navigate(`/market/${marketId}`);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="h-4 w-4 ml-1 opacity-30" />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const allMarkets: Market[] = [];

        for (const marketAddress of marketAddresses) {
          const vaultInfo = [
            "asset",
            "name",
            "borrowToken",
            "collateralToken",
          ].map((key) => ({
            address: marketAddress as `0x${string}`,
            abi: MarketFHEAbi.abi as any,
            functionName: key,
          }));

          // @ts-expect-error - Type instantiation too deep for wagmi ABI types
          const results = await readContracts(config, {
            contracts: vaultInfo,
          });
          const [asset, marketName, borrowToken, collateralToken] = results;

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
          console.log("Tokens:", tokens, tokensResults);

          allMarkets.push({
            id: marketAddress,
            name: marketName.result,
            collateralToken: {
              symbol: tokensResults[1].result as string,
              logo: getTokenLogo(tokensResults[1].result as string),
            },
            loanToken: {
              symbol: tokensResults[0].result as string,
              logo: getTokenLogo(tokensResults[0].result as string),
            },
            ltv: "*******",
            ltvValue: 86.0,
            liquidity: "********",
            liquidityValue: 24.48,
            rate: "*******",
            rateValue: 5.04,
            rateChange: "up",
            vaultRating: 10,
          } as Market);
        }

        setMarkets(allMarkets);
      } catch (error) {
        console.error("Error fetching markets:", error);
      }
    }

    if (marketAddresses && marketAddresses.length > 0) {
      fetchMarkets();
    }
  }, [marketAddresses]);

  const renderMobileMarkets = () => {
    return sortedMarkets.map((market) => (
      <div
        key={market.id}
        className={marketCard}
        onClick={() => handleRowClick(market.id)}
      >
        <div className="flex items-center mb-3 justify-between">
          <div className="flex items-center">
            <div className="h-7 w-7 mr-3">
              <Image
                src={market.collateralToken.logo}
                alt={market.collateralToken.symbol}
                className="rounded-full"
              />
            </div>
            <div>
              <div className="font-medium text-foreground">
                {market.collateralToken.symbol}
              </div>
              {market.collateralToken.apy && (
                <div className="text-xs text-green-400">
                  APY: {market.collateralToken.apy}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-7 w-7 mr-3">
              <Image
                src={market.loanToken.logo}
                alt={market.loanToken.symbol}
                className="rounded-full"
              />
            </div>
            <div className="font-medium text-foreground">
              {market.loanToken.symbol}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <div className="text-muted-foreground">LTV</div>
            <div className="text-foreground font-medium">{market.ltv}</div>
          </div>

          <div>
            <div className="text-muted-foreground">Rate</div>
            <div
              className={cn(
                "font-medium",
                market.rateChange === "up"
                  ? "text-emerald-400"
                  : market.rateChange === "down"
                  ? "text-rose-400"
                  : "text-amber-400"
              )}
            >
              {market.rate}
              <span className="ml-1">
                {market.rateChange === "up" && "↑"}
                {market.rateChange === "down" && "↓"}
                {market.rateChange === "stable" && "→"}
              </span>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Liquidity</div>
            <div className="text-foreground font-medium">
              {market.liquidity}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Vault Rating</div>
            <div className="flex items-center">
              <span className={marketBadge}>+{market.vaultRating}</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="py-8 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Borrow Markets
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Choose which assets to use as collateral and which to borrow
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto mb-4 sm:mb-0 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex space-x-2 min-w-max">
              {(["All", "ETH", "WBTC", "USDC", "USDT"] as Filter[]).map(
                (filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "border-cryptic-muted text-base",
                      activeFilter === filter &&
                        "bg-cryptic-accent hover:bg-cryptic-accent"
                    )}
                  >
                    {filter}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search markets"
              className={marketSearchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-4">{renderMobileMarkets()}</div>
        ) : (
          <div className={marketTableContainer}>
            <Table className="w-full text-base">
              <TableHeader className={tableHeader}>
                <TableRow>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Collateral
                  </TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Loan
                  </TableHead>
                  <TableHead
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("ltv")}
                  >
                    <div className="flex items-center">
                      <span>LTV</span>
                      {renderSortIndicator("ltv")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("liquidity")}
                  >
                    <div className="flex items-center">
                      <span>Liquidity</span>
                      {renderSortIndicator("liquidity")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("rate")}
                  >
                    <div className="flex items-center">
                      <span>Rate</span>
                      {renderSortIndicator("rate")}
                    </div>
                  </TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Vault Rating
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={tableBody}>
                {sortedMarkets.map((market) => (
                  <TableRow
                    key={market.id}
                    className={tableRow}
                    onClick={() => handleRowClick(market.id)}
                  >
                    <TableCell className="whitespace-nowrap text-foreground font-medium">
                      {market.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 mr-3">
                          <Image
                            src={market.collateralToken.logo}
                            alt={market.collateralToken.symbol}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {market.collateralToken.symbol}
                          </div>
                          {market.collateralToken.apy && (
                            <div className="text-xs text-green-400">
                              APY: {market.collateralToken.apy}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 mr-3">
                          <Image
                            src={market.loanToken.logo}
                            alt={market.loanToken.symbol}
                            className="rounded-full"
                          />
                        </div>
                        <div className="font-medium text-foreground">
                          {market.loanToken.symbol}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground font-medium">
                      {market.ltv}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground font-medium">
                      {market.liquidity}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={cn(
                            "font-medium",
                            market.rateChange === "up"
                              ? "text-emerald-400"
                              : market.rateChange === "down"
                              ? "text-rose-400"
                              : "text-amber-400"
                          )}
                        >
                          {market.rate}
                        </span>
                        <div
                          className={cn(
                            "ml-2 text-xl",
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={marketBadge}>
                          +{market.vaultRating}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
