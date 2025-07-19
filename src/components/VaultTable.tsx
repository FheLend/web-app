import { useEffect, useState } from "react";
import { Search, Vault, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/providers/ThemeProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useThemeStyles } from "@/lib/themeUtils";
import { readContract, readContracts } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import VaultAbi from "@/constant/abi/VaultFHE.json";
import type { Abi } from "viem";
import FHERC20Abi from "@/constant/abi/FHERC20.json";
import { Image } from "./ui/image";
import { cofhejs, FheTypes } from "cofhejs/web";
import { ethers } from "ethers";

type Filter = "All" | "ETH" | "BTC" | "USDC" | "DAI";
type SortField = "deposits" | "value" | "apy" | null;
type SortDirection = "asc" | "desc";

interface Vault {
  id: string; // Vault address
  asset: `0x${string}`;
  name: string;
  logo: string;
  symbol: string;
  decimals: number;
  deposits: string;
  value: string;
  curator: string;
  curatorIcon: string;
  collateral: string[];
  apy: number;
  depositsValue: number;
  valueInUsd: number;
}
//  {
//     id: "1",
//     name: "Private DAI Vault",
//     icon: "🔒",
//     deposits: "350.06M DAI",
//     value: "$349.87M",
//     curator: "FeLend DAO",
//     curatorIcon: "🛡️",
//     collateral: ["ETH", "BTC", "LINK", "AAVE"],
//     apy: "7.41%",
//     apyTrend: "up",
//     depositsValue: 350.06,
//     valueInUsd: 349.87,
//     apyValue: 7.41,
//   },

export function VaultTable() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const { tableRow, tableHeader, tableBody } = useThemeStyles();
  const [vaults, setVaults] = useState<Vault[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortVaults = (vaultsToSort: Vault[]) => {
    if (!sortField) return vaultsToSort;

    return [...vaultsToSort].sort((a, b) => {
      let valueA: number, valueB: number;

      switch (sortField) {
        case "deposits":
          valueA = a.depositsValue;
          valueB = b.depositsValue;
          break;
        case "value":
          valueA = a.valueInUsd;
          valueB = b.valueInUsd;
          break;
        case "apy":
          valueA = a.apy;
          valueB = b.apy;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const filteredVaults = vaults.filter((vault) => {
    const matchesSearch =
      searchTerm === "" ||
      vault.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vault.curator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === "All" || vault.deposits.includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  const sortedVaults = sortVaults(filteredVaults);

  const handleRowClick = (vaultId: string) => {
    navigate(`/vault/${vaultId}`);
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
    async function fetchVaults() {
      const vaultAddress = "0x367D3BBd8D78202452eB7Ca3930Cf17740C2dC5E";
      try {
        const vaultInfo = ["asset", "name", "symbol", "decimals"].map(
          (key) => ({
            address: vaultAddress as `0x${string}`,
            abi: VaultAbi.abi as any,
            functionName: key,
          })
        );
        // @ts-expect-error
        const results = await readContracts(config, {
          contracts: vaultInfo,
        });
        const [asset, vaultName, vaultSymbol, vaultDecimals] = results;

        console.log(
          "Vaults fetched:",
          asset,
          vaultName,
          vaultSymbol,
          vaultDecimals
        );

        // const provider = new ethers.BrowserProvider(window.ethereum);
        // const signer = (await provider.getSigner()) as ethers.JsonRpcSigner;

        // const contract = new ethers.Contract(
        //   "0x367D3BBd8D78202452eB7Ca3930Cf17740C2dC5E",
        //   VaultAbi.abi,
        //   signer
        // );

        // // When creating a permit cofhejs will use it automatically, but you can pass it manually as well
        // const permit = await cofhejs.getPermit();

        setVaults([
          {
            id: vaultAddress,
            asset: asset.result,
            name: vaultName.result,
            symbol: vaultSymbol.result,
            decimals: vaultDecimals.result,
            logo: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
            deposits: "350.06",
            value: "349.87",
            curator: "FeLend",
            curatorIcon: "🛡️",
            collateral: ["ETH"],
            apy: 7.41,
            depositsValue: 350.06,
            valueInUsd: 349.87,
          } as Vault,
        ]);
      } catch (error) {
        console.error("Error fetching vaults:", error);
      }
    }
    fetchVaults();
  }, []);

  const renderMobileVaults = () => {
    return sortedVaults.map((vault) => (
      <div
        key={vault.asset}
        className={cn(
          "mb-4 p-4 rounded-lg border hover:bg-cryptic-purple/10 transition duration-150 cursor-pointer",
          theme === "dark"
            ? "bg-cryptic-dark/50 border-cryptic-muted/20"
            : "bg-white border-slate-200 hover:bg-slate-50"
        )}
        onClick={() => handleRowClick(vault.asset)}
      >
        <div className="flex items-center mb-3">
          <div
            className={cn(
              "flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full",
              theme === "dark" ? "bg-cryptic-purple/10" : "bg-blue-50"
            )}
          >
            <Image
              src={vault.logo}
              alt={vault.symbol}
              className="rounded-full h-8 w-8"
            />
          </div>
          <div className="ml-4">
            <div className="font-medium text-foreground text-lg">
              {vault.name}
            </div>
            <div className="text-muted-foreground">{vault.value}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <div className="text-muted-foreground">Deposits</div>
            <div className="text-foreground font-medium">{vault.deposits}</div>
          </div>

          <div>
            <div className="text-muted-foreground">APY</div>
            {/* {vault.apy} */}
            --
          </div>

          <div>
            <div className="text-muted-foreground">Curator</div>
            <div className="flex items-center text-foreground">
              <span className="mr-1">{vault.curatorIcon}</span> {vault.curator}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground">Collateral</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {vault.collateral.slice(0, 2).map((token, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    theme === "dark"
                      ? "bg-cryptic-purple/10 text-cryptic-highlight"
                      : "bg-blue-50 text-cryptic-accent"
                  )}
                >
                  {token}
                </span>
              ))}
              {vault.collateral.length > 2 && (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    theme === "dark"
                      ? "bg-cryptic-purple/10 text-cryptic-highlight"
                      : "bg-blue-50 text-cryptic-accent"
                  )}
                >
                  +{vault.collateral.length - 2}
                </span>
              )}
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
            Encrypted Lending Vaults
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Discover our FHE-powered lending pools with private transactions and
            balances
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto mb-4 sm:mb-0 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex space-x-2 min-w-max">
              {(["All", "ETH", "BTC", "USDC", "DAI"] as Filter[]).map(
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
              placeholder="Search vaults"
              className={cn(
                "pl-10 w-full sm:w-64 text-base",
                theme === "dark"
                  ? "bg-cryptic-darker border-cryptic-muted"
                  : "bg-white border-slate-200"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-4">{renderMobileVaults()}</div>
        ) : (
          <div
            className={cn(
              "overflow-x-auto cryptic-shadow rounded-lg border",
              theme === "dark" ? "border-cryptic-accent/20" : "border-slate-200"
            )}
          >
            <Table className="w-full text-base">
              <TableHeader className={tableHeader}>
                <TableRow>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Vault
                  </TableHead>
                  <TableHead
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground flex items-center"
                    onClick={() => handleSort("deposits")}
                  >
                    <span>Deposits</span>
                    {renderSortIndicator("deposits")}
                  </TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Curator
                  </TableHead>
                  <TableHead className="text-left font-medium text-muted-foreground">
                    Collateral
                  </TableHead>
                  <TableHead
                    className="text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground flex items-center"
                    onClick={() => handleSort("apy")}
                  >
                    <span>APY</span>
                    {renderSortIndicator("apy")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={tableBody}>
                {sortedVaults.map((vault) => (
                  <TableRow
                    key={vault.id}
                    className={tableRow}
                    onClick={() => handleRowClick(vault.id)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-7 w-7 mr-3">
                          <Image
                            src={vault.logo}
                            alt={vault.symbol}
                            className="rounded-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-foreground text-lg">
                            {vault.name}
                          </div>
                          <div className="text-muted-foreground">
                            {vault.value}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground">
                      {">"} {vault.deposits} {vault.symbol}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={cn(
                            "flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full",
                            theme === "dark"
                              ? "bg-cryptic-purple/10"
                              : "bg-blue-50"
                          )}
                        >
                          <span className="text-base">{vault.curatorIcon}</span>
                        </div>
                        <div className="ml-3 text-foreground">
                          {vault.curator}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {vault.collateral.map((token, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                              theme === "dark"
                                ? "bg-cryptic-purple/10 text-cryptic-highlight"
                                : "bg-blue-50 text-cryptic-accent"
                            )}
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium text-lg">--</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-md">
            <Button
              variant="outline"
              size="sm"
              className="rounded-r-none border-r-0 text-muted-foreground text-base"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-l-none text-muted-foreground text-base"
            >
              Next
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
