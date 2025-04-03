
import { Table } from "@/components/ui/table";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';

interface VaultProps {
  vault: {
    deposited: string;
    ltv: string;
  };
}

export function VaultOverview({ vault }: VaultProps) {
  return (
    <div className="space-y-10">
      {/* Overview Information */}
      <div className="rounded-lg bg-cryptic-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-cinzel">Your Deposited (APY)</h2>
        </div>
        
        <div className="text-3xl font-mono mb-8">{vault.deposited}</div>
      </div>

      {/* LTV Information */}
      <div className="rounded-lg bg-cryptic-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-cinzel">LTV</h2>
        </div>
        
        <div className="text-3xl font-mono mb-8 text-cryptic-accent">{vault.ltv}</div>
      </div>

      {/* Market Allocation Table */}
      <div className="rounded-lg bg-cryptic-dark p-6">
        <h2 className="text-xl font-cinzel mb-4">Market Allocation</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-cryptic-purple/10">
                <th className="text-left font-normal py-3 px-4">Asset</th>
                <th className="text-left font-normal py-3 px-4">Allocation</th>
                <th className="text-left font-normal py-3 px-4">Value</th>
                <th className="text-left font-normal py-3 px-4">Type</th>
                <th className="text-left font-normal py-3 px-4">LTV</th>
              </tr>
            </thead>
            <tbody>
              {[
                { asset: "ETH-USD (Bband 15%)", allocation: "49.78%", value: "$174.34M", collateral: "Collateral", ltv: "6.17%" },
                { asset: "ETH-USD (Nautilus 8%)", allocation: "24.38%", value: "$85.36M", collateral: "Collateral", ltv: "6.64%" },
                { asset: "USDC-USDT", allocation: "8.57%", value: "$29.97M", collateral: "Collateral", ltv: "6.0%" },
                { asset: "DAI", allocation: "4.90%", value: "$17.15M", collateral: "-", ltv: "0.00%" },
                { asset: "WBTC-USD", allocation: "3.93%", value: "$13.75M", collateral: "Collateral", ltv: "7.32%" }
              ].map((item, i) => (
                <tr key={i} className="border-b border-cryptic-purple/10">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cryptic-purple/50"></div>
                      <span>{item.asset}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{item.allocation}</td>
                  <td className="py-4 px-4 font-mono">{item.value}</td>
                  <td className="py-4 px-4">{item.collateral}</td>
                  <td className="py-4 px-4">{item.ltv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
