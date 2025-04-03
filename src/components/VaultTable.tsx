
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Shield, TrendingUp } from 'lucide-react';
import { Link } from "react-router-dom";

const vaults = [
  {
    id: "spark-dai",
    name: "Spark DAI",
    symbol: "SparkDAI",
    provider: "SparkDAO",
    verified: true,
    tvl: "$350.06M",
    apy: "7.28%",
    change: "+2.3%",
    positive: true
  },
  {
    id: "aave-eth",
    name: "Aave ETH",
    symbol: "aETH",
    provider: "Aave",
    verified: true,
    tvl: "$423.12M",
    apy: "5.62%",
    change: "-0.8%",
    positive: false
  },
  {
    id: "compound-usdc",
    name: "Compound USDC",
    symbol: "cUSDC",
    provider: "Compound",
    verified: true,
    tvl: "$289.45M",
    apy: "3.95%",
    change: "+0.2%",
    positive: true
  },
  {
    id: "maker-dai",
    name: "Maker DAI",
    symbol: "mkrDAI",
    provider: "MakerDAO",
    verified: true,
    tvl: "$178.33M",
    apy: "4.12%",
    change: "+0.5%",
    positive: true
  },
  {
    id: "felend-eth",
    name: "Felend ETH",
    symbol: "fETH",
    provider: "Felend",
    verified: false,
    tvl: "$95.78M",
    apy: "8.45%",
    change: "+3.2%",
    positive: true
  }
];

export function VaultTable() {
  return (
    <div className="py-16 px-4 sm:px-6 bg-cryptic-dark">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cryptic-accent to-cryptic-highlight">Featured Vaults</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Private lending vaults with full homomorphic encryption to protect your financial data while earning yield.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-cryptic-purple/20 cryptic-shadow">
          <Table>
            <TableHeader>
              <TableRow className="bg-cryptic-purple/10">
                <TableHead className="font-medium">Vault</TableHead>
                <TableHead className="font-medium">TVL</TableHead>
                <TableHead className="font-medium">APY</TableHead>
                <TableHead className="font-medium hidden md:table-cell">24h Change</TableHead>
                <TableHead className="font-medium hidden lg:table-cell">Provider</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaults.map((vault) => (
                <Link 
                  key={vault.id} 
                  to={`/vaults/${vault.id}`}
                  className="block"
                >
                  <TableRow 
                    className="bg-glass hover:bg-cryptic-purple/10 transition duration-200 cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-cryptic-purple/30 flex items-center justify-center text-xl font-bold">
                          {vault.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {vault.name}
                            {vault.verified && (
                              <Shield size={14} className="text-cryptic-accent" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{vault.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{vault.tvl}</TableCell>
                    <TableCell className="text-cryptic-accent font-mono">{vault.apy}</TableCell>
                    <TableCell className={`hidden md:table-cell font-mono ${vault.positive ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className={vault.positive ? 'rotate-0' : 'rotate-180'} />
                        {vault.change}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cryptic-accent/70"></div>
                        <span>{vault.provider}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                </Link>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
