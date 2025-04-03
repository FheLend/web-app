
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from '@/components/ui/chart';

interface VaultProps {
  vault: any;
}

// Sample data for the charts
const generateActivityData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 15 + 5
    });
  }
  return data;
};

const activityData = generateActivityData();

export function VaultTransactionHistory({ vault }: VaultProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-cinzel mb-4">Allocation History</h2>
      
      <Card className="bg-cryptic-dark border-cryptic-purple/20">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">All-time Activity</CardTitle>
          <Tabs defaultValue="all">
            <TabsList className="bg-cryptic-purple/10">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-6">
            <ChartContainer
              config={{
                line: {
                  label: "Activity",
                  color: "#8A4FFF",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
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
                    domain={[0, 'auto']}
                    tickFormatter={(value) => `$${value}K`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-cryptic-dark p-2 shadow-md">
                            <div className="text-sm text-muted-foreground">{payload[0].payload.date}</div>
                            <div className="text-sm font-medium">{`$${payload[0].value.toFixed(2)}K`}</div>
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
          
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground w-1/4">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { time: "2 days ago", action: "Deposit", amount: "0.5 ETH", user: "0x0123...89ab", value: "$1,025.45" },
                { time: "3 days ago", action: "Withdraw", amount: "1,500 USDC", user: "0xabcd...ef01", value: "$1,500.00" },
                { time: "5 days ago", action: "Deposit", amount: "2.3 ETH", user: "0x7890...cdef", value: "$4,715.80" },
                { time: "1 week ago", action: "Deposit", amount: "5,000 DAI", user: "0xdef0...1234", value: "$5,000.00" },
                { time: "2 weeks ago", action: "Withdraw", amount: "1.2 ETH", user: "0x4567...89ab", value: "$2,460.36" }
              ].map((item, i) => (
                <TableRow key={i} className="hover:bg-cryptic-purple/5">
                  <TableCell>{item.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.action === 'Deposit' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{item.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-cryptic-accent/70"></div>
                      <span className="font-mono">{item.amount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{item.user}</TableCell>
                  <TableCell className="text-right font-mono">{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
