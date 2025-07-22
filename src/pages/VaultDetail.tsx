import { useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import {
  Shield,
  Star,
  Vault,
  ExternalLink,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { useThemeStyles } from "@/lib/themeUtils";
import { useAccount, useReadContracts } from "wagmi";
import VaultAbi from "@/constant/abi/VaultFHE.json";
import { useAppKit } from "@reown/appkit/react";
import { DepositForm, WithdrawForm } from "@/components/vault";
import { useContractConfig } from "@/hooks/useContractConfig";

const vaultDetailsMock = {
  id: "0x367D3BBd8D78202452eB7Ca3930Cf17740C2dC5E",
  name: "Felend FHE MUSDC Vault",
  icon: "🔒",
  description:
    "This FHE MUSDC Vault uses Fully Homomorphic Encryption to secure your deposits for privacy. Your balance is known only to you.",
  tvl: "> 350.06M MUSDC",
  tvlValue: "$349.87M",
  apy: "7.41%",
  curator: "FeLend DAO",
  curatorIcon: "🛡️",
  collateral: ["ETH"],
  totalUsers: "8,294",
  performance: {
    day: "0.021%",
    week: "0.14%",
    month: "0.62%",
    ytd: "6.3%",
    allTime: "11.4%",
  },
  risk: {
    score: "3/10",
    collateralization: "150%",
    liquidationThreshold: "125%",
    reserveFactor: "10%",
  },
  assets: [
    {
      symbol: "ETH",
      name: "Ethereum",
      icon: "⬨",
      allocation: "48.3%",
      value: "$164.82M",
      status: "collateral",
      apy: "4.7%",
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      icon: "₿",
      allocation: "34.5%",
      value: "$103.98M",
      status: "collateral",
      apy: "3.8%",
    },
    {
      symbol: "LINK",
      name: "Chainlink",
      icon: "🔗",
      allocation: "12.6%",
      value: "$32.46M",
      status: "collateral",
      apy: "7.2%",
    },
    {
      symbol: "AAVE",
      name: "Aave",
      icon: "◎",
      allocation: "4.6%",
      value: "$12.65M",
      status: "collateral",
      apy: "5.9%",
    },
  ],
  transactions: [
    {
      id: "tx1",
      type: "deposit",
      user: "0x89a...4f21",
      amount: "25,000 DAI",
      value: "$24,982",
      timestamp: "2 days ago",
    },
    {
      id: "tx2",
      type: "withdraw",
      user: "0x3b7...8e2a",
      amount: "12,500 DAI",
      value: "$12,475",
      timestamp: "3 days ago",
    },
    {
      id: "tx3",
      type: "deposit",
      user: "0xc52...2e94",
      amount: "50,000 DAI",
      value: "$49,950",
      timestamp: "4 days ago",
    },
    {
      id: "tx4",
      type: "withdraw",
      user: "0x67f...1a3d",
      amount: "8,000 DAI",
      value: "$7,984",
      timestamp: "5 days ago",
    },
    {
      id: "tx5",
      type: "deposit",
      user: "0xf41...7b26",
      amount: "100,000 DAI",
      value: "$99,870",
      timestamp: "5 days ago",
    },
  ],
  depositors: [
    {
      id: "user1",
      address: "0x89a...4f21",
      amount: "150,000 DAI",
      percentage: "1.2%",
    },
    {
      id: "user2",
      address: "0xc52...2e94",
      amount: "275,000 DAI",
      percentage: "2.1%",
    },
    {
      id: "user3",
      address: "0xf41...7b26",
      amount: "520,000 DAI",
      percentage: "4.0%",
    },
  ],
};

export default function VaultDetail() {
  const { id } = useParams();
  const { theme } = useTheme();
  const { cardStyles, tableRow, iconBadge, tableHeader, boxInfo } =
    useThemeStyles();
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const vault = useMemo(() => {
    const vaultDetails = { ...vaultDetailsMock };
    vaultDetails.id === id;
    return vaultDetails;
  }, [id]);

  const vaultInfoKey = useMemo(() => {
    return ["asset", "name", "symbol", "decimals"].map((key) => ({
      address: id as `0x${string}`,
      abi: VaultAbi.abi as any,
      functionName: key,
    }));
  }, [id]);

  // @ts-ignore
  const { data, isLoading } = useReadContracts({
    contracts: vaultInfoKey as any,
  });

  const vaultAsset = data?.[0]?.result as string;
  const vaultName = data?.[1]?.result as string;
  const vaultSymbol = data?.[2]?.result as string;
  const vaultDecimals = data?.[3]?.result as number;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cryptic-accent" />
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Vault not found</h1>
            <p className="text-muted-foreground mt-2">
              The requested vault could not be found.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Vault Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className={iconBadge}>{vault.icon}</div>
              <div>
                <h1 className="text-3xl font-spaceGrotesk font-bold text-foreground">
                  {vault.name}
                </h1>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <Shield className="h-4 w-4 mr-1" />
                    <span>{vault.curator}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-amber-400" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-2 max-w-3xl">
              {vault.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Vault Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Card className={cardStyles}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                      Total Value Locked
                    </div>
                    <div className="mt-1 text-2xl font-bold text-foreground">
                      {vault.tvl}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vault.tvlValue}
                    </div>
                  </CardContent>
                </Card>
                <Card className={cardStyles}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                      Current APY
                    </div>
                    <div className="mt-1 text-2xl font-bold text-emerald-400">
                      {vault.apy}
                    </div>
                    <div className="text-sm text-emerald-400/70">
                      ↑ 0.2% from last week
                    </div>
                  </CardContent>
                </Card>
                <Card className={cardStyles}>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">
                      Depositors
                    </div>
                    <div className="mt-1 text-2xl font-bold text-foreground">
                      {vault.totalUsers}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active users
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card className={cardStyles}>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>
                    Historical yield performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        24H
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.performance.day}
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        7D
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.performance.week}
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        30D
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.performance.month}
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        YTD
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.performance.ytd}
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        All Time
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.performance.allTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card className={cardStyles}>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>
                    Key risk parameters for this vault
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        Risk Score
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.risk.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Low risk
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        Collateralization
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.risk.collateralization}
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        Liquidation Threshold
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.risk.liquidationThreshold}
                      </div>
                    </div>
                    <div className={boxInfo}>
                      <div className="text-xs text-muted-foreground mb-1">
                        Reserve Factor
                      </div>
                      <div className="text-foreground font-semibold">
                        {vault.risk.reserveFactor}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Collateral Assets */}
              <Card className={cardStyles}>
                <CardHeader>
                  <CardTitle>Collateral Assets</CardTitle>
                  <CardDescription>
                    Assets used to secure this vault
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className={tableHeader}>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Asset</TableHead>
                          <TableHead>Allocation</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>APY</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vault.assets.map((asset, index) => (
                          <TableRow key={index} className={tableRow}>
                            <TableCell>
                              <div className="flex items-center">
                                <div
                                  className={cn(
                                    "h-8 w-8 flex items-center justify-center rounded-full mr-2",
                                    theme === "dark"
                                      ? "bg-cryptic-purple/10"
                                      : "bg-blue-50"
                                  )}
                                >
                                  <span className="text-lg">{asset.icon}</span>
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {asset.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {asset.symbol}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{asset.allocation}</TableCell>
                            <TableCell>{asset.value}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                  theme === "dark"
                                    ? "bg-cryptic-purple/10 text-cryptic-highlight"
                                    : "bg-blue-50 text-cryptic-accent"
                                )}
                              >
                                {asset.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-emerald-400">
                              {asset.apy}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity & Depositors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card className={cardStyles}>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest transactions in this vault
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vault.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg hover:bg-cryptic-purple/10 transition-colors",
                            theme === "dark"
                              ? "bg-cryptic-purple/5"
                              : "bg-slate-50"
                          )}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                tx.type === "deposit"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {tx.type === "deposit" ? (
                                <ArrowDownRight size={16} />
                              ) : (
                                <ArrowUpRight size={16} />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {tx.type === "deposit"
                                  ? "Deposit"
                                  : "Withdrawal"}{" "}
                                - {tx.amount}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.user} • {tx.timestamp}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">{tx.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Depositors */}
                <Card className={cardStyles}>
                  <CardHeader>
                    <CardTitle>Top Depositors</CardTitle>
                    <CardDescription>
                      Largest depositors in this vault
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vault.depositors.map((depositor) => (
                        <div
                          key={depositor.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg hover:bg-cryptic-purple/10 transition-colors",
                            theme === "dark"
                              ? "bg-cryptic-purple/5"
                              : "bg-slate-50"
                          )}
                        >
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-cryptic-accent",
                                theme === "dark"
                                  ? "bg-cryptic-purple/10"
                                  : "bg-blue-50"
                              )}
                            >
                              <Shield size={16} />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {depositor.address}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {depositor.amount}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {depositor.percentage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Deposit/Withdraw Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className={cardStyles}>
                  <CardHeader>
                    <CardTitle>Interact with Vault</CardTitle>
                    <CardDescription>Deposit or withdraw funds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="deposit" className="w-full">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                      </TabsList>

                      <TabsContent value="deposit">
                        <DepositForm
                          vaultId={id as string}
                          vaultSymbol={vaultSymbol}
                          vaultDecimals={vaultDecimals}
                          vaultAsset={vaultAsset}
                          theme={theme}
                          isConnected={isConnected}
                          openWalletModal={open}
                        />
                      </TabsContent>

                      <TabsContent value="withdraw">
                        <WithdrawForm
                          vaultSymbol={vaultSymbol}
                          theme={theme}
                          isConnected={isConnected}
                          openWalletModal={open}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter
                    className={cn(
                      "border-t pt-4 flex flex-col items-start",
                      theme === "dark"
                        ? "border-cryptic-purple/10"
                        : "border-slate-100"
                    )}
                  >
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>Protected by Fully Homomorphic Encryption</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      <a href="#" className="underline">
                        View Contract
                      </a>
                      <span className="mx-2">•</span>
                      <a href="#" className="underline">
                        Audit Report
                      </a>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
