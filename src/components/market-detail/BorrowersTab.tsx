
import React from "react";
import { Image } from "@/components/ui/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useThemeStyles } from "@/lib/themeUtils";

interface BorrowersTabProps {
  market: any;
}

export function BorrowersTab({ market }: BorrowersTabProps) {
  const { cardStyles } = useThemeStyles();

  return (
    <div className="space-y-8 mt-0">
      <Card className={cardStyles}>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Active Borrowers</CardTitle>
          <CardDescription>
            Current borrowers sorted by position size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Collateral</TableHead>
                <TableHead>Loan</TableHead>
                <TableHead>Current LTV</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  0x72e...5d3a
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={market.collateralToken.logo}
                      alt={market.collateralToken.symbol}
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <span>
                      5,120.50 {market.collateralToken.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={market.loanToken.logo}
                      alt={market.loanToken.symbol}
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <span>4,845.20 {market.loanToken.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-amber-500">92.3%</span>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: "92.3%" }}
                      ></div>
                    </div>
                  </div>
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
                <TableCell className="font-medium">
                  0x4f8...9c21
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={market.collateralToken.logo}
                      alt={market.collateralToken.symbol}
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <span>
                      2,650.25 {market.collateralToken.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={market.loanToken.logo}
                      alt={market.loanToken.symbol}
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <span>2,310.75 {market.loanToken.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-green-500">85.2%</span>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "85.2%" }}
                      ></div>
                    </div>
                  </div>
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
                <TableCell className="font-medium">
                  0x91b...7f42
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={market.collateralToken.logo}
                      alt={market.collateralToken.symbol}
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <span>
                      1,845.60 {market.collateralToken.symbol}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Image
                      src={market.loanToken.logo}
                      alt={market.loanToken.symbol}
                      className="h-5 w-5 mr-2 rounded-full"
                    />
                    <span>1,512.45 {market.loanToken.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-green-500">80.5%</span>
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "80.5%" }}
                      ></div>
                    </div>
                  </div>
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
          <CardTitle className="text-2xl">
            Borrower Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Average LTV
              </p>
              <p className="text-2xl font-bold">84.5%</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Average Loan Size
              </p>
              <p className="text-2xl font-bold">$24.6K</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Largest Borrower
              </p>
              <p className="text-2xl font-bold">$156K</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Total Borrowers
              </p>
              <p className="text-2xl font-bold">87</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
