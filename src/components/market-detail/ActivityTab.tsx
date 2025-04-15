
import React from "react";
import { Image } from "@/components/ui/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useThemeStyles } from "@/lib/themeUtils";

interface ActivityTabProps {
  market: any;
}

export function ActivityTab({ market }: ActivityTabProps) {
  const { cardStyles } = useThemeStyles();

  return (
    <div className="space-y-8 mt-0">
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
    </div>
  );
}
