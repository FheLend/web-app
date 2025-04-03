
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Sample data for the charts
const generateChartData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: 350 + (Math.random() * 10 - 5)
    });
  }
  return data;
};

const chartData = generateChartData();
const ltvData = generateChartData().map(item => ({ ...item, value: 7 + (Math.random() * 1 - 0.5) }));

export function VaultOverview({ vault }: VaultProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-cryptic-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-cinzel">Your Deposited (APY)</h2>
          <Tabs defaultValue="1d">
            <TabsList className="bg-cryptic-purple/10">
              <TabsTrigger value="1d">1d</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="1m">1m</TabsTrigger>
              <TabsTrigger value="3m">3m</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="text-3xl font-mono mb-6">{vault.deposited}</div>
        
        <div className="h-64">
          <ChartContainer
            config={{
              line: {
                label: "Value",
                color: "#8A4FFF",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split("-")[2]}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}M`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-cryptic-dark p-2 shadow-md">
                          <div className="text-sm text-muted-foreground">{payload[0].payload.date}</div>
                          <div className="text-sm font-medium">{`${payload[0].value.toFixed(2)}M`}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8A4FFF" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 6, fill: "#8A4FFF", stroke: "#12151f", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="rounded-lg bg-cryptic-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-cinzel">LTV</h2>
          <Button variant="outline" size="sm" className="text-xs">Details</Button>
        </div>
        
        <div className="text-3xl font-mono mb-6 text-cryptic-accent">{vault.ltv}</div>
        
        <div className="h-64">
          <ChartContainer
            config={{
              line: {
                label: "LTV",
                color: "#8A4FFF",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ltvData}>
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split("-")[2]}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  domain={[0, 15]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-cryptic-dark p-2 shadow-md">
                          <div className="text-sm text-muted-foreground">{payload[0].payload.date}</div>
                          <div className="text-sm font-medium">{`${payload[0].value.toFixed(2)}%`}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8A4FFF" 
                  strokeWidth={2} 
                  dot={false} 
                  activeDot={{ r: 6, fill: "#8A4FFF", stroke: "#12151f", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

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
