
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

interface VaultProps {
  vault: any;
}

export function VaultDepositors({ vault }: VaultProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-cinzel mb-4">Depositors</h2>
      
      <Card className="bg-cryptic-dark border-cryptic-purple/20">
        <CardHeader>
          <CardTitle className="text-xl">Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Deposit Amount</TableHead>
                <TableHead className="text-muted-foreground text-right">% Of Protocol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-cryptic-purple/5">
                <TableCell className="font-mono">0x0123...89ab</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cryptic-accent"></div>
                    <span className="font-mono">122.45 ETH</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">42.35%</TableCell>
              </TableRow>
              <TableRow className="hover:bg-cryptic-purple/5">
                <TableCell className="font-mono">0xabcd...ef01</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cryptic-accent"></div>
                    <span className="font-mono">87.32 ETH</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">28.16%</TableCell>
              </TableRow>
              <TableRow className="hover:bg-cryptic-purple/5">
                <TableCell className="font-mono">0x7890...cdef</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cryptic-purple"></div>
                    <span className="font-mono">12,500 USDC</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">13.45%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
