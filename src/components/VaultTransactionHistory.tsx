
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VaultProps {
  vault: any;
}

export function VaultTransactionHistory({ vault }: VaultProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-cinzel mb-4">Allocation History</h2>
      
      <Card className="bg-cryptic-dark border-cryptic-purple/20">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Transaction History</CardTitle>
          <Tabs defaultValue="all">
            <TabsList className="bg-cryptic-purple/10">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
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
