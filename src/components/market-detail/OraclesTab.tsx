
import React from "react";
import { Image } from "@/components/ui/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useThemeStyles } from "@/lib/themeUtils";
import { Badge } from "@/components/ui/badge";

interface OraclesTabProps {
  market: any;
}

export function OraclesTab({ market }: OraclesTabProps) {
  const { cardStyles } = useThemeStyles();

  return (
    <div className="space-y-8 mt-0">
      <Card className={cardStyles}>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Oracle Providers</CardTitle>
          <CardDescription>
            Price feed oracles used for this market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Feed</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Chainlink
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <Image
                        src={market.collateralToken.logo}
                        alt={market.collateralToken.symbol}
                        className="h-5 w-5 mr-1 rounded-full"
                      />
                      <span>/</span>
                      <Image
                        src={market.loanToken.logo}
                        alt={market.loanToken.symbol}
                        className="h-5 w-5 ml-1 rounded-full"
                      />
                    </div>
                    <span>{market.collateralToken.symbol}/{market.loanToken.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  $28,516.42
                </TableCell>
                <TableCell className="text-muted-foreground">
                  2 mins ago
                </TableCell>
                <TableCell>
                  <Badge variant="success" className="bg-green-500/20 text-green-600 border-green-500/30">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Pyth Network
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <Image
                        src={market.collateralToken.logo}
                        alt={market.collateralToken.symbol}
                        className="h-5 w-5 mr-1 rounded-full"
                      />
                      <span>/</span>
                      <Image
                        src={market.loanToken.logo}
                        alt={market.loanToken.symbol}
                        className="h-5 w-5 ml-1 rounded-full"
                      />
                    </div>
                    <span>{market.collateralToken.symbol}/{market.loanToken.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  $28,513.11
                </TableCell>
                <TableCell className="text-muted-foreground">
                  1 min ago
                </TableCell>
                <TableCell>
                  <Badge variant="success" className="bg-green-500/20 text-green-600 border-green-500/30">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  SwitchBoard
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <Image
                        src={market.collateralToken.logo}
                        alt={market.collateralToken.symbol}
                        className="h-5 w-5 mr-1 rounded-full"
                      />
                      <span>/</span>
                      <Image
                        src={market.loanToken.logo}
                        alt={market.loanToken.symbol}
                        className="h-5 w-5 ml-1 rounded-full"
                      />
                    </div>
                    <span>{market.collateralToken.symbol}/{market.loanToken.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  $28,515.87
                </TableCell>
                <TableCell className="text-muted-foreground">
                  3 mins ago
                </TableCell>
                <TableCell>
                  <Badge variant="success" className="bg-green-500/20 text-green-600 border-green-500/30">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className={cardStyles}>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">Oracle Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Oracle Strategy
              </p>
              <p className="text-xl font-medium">Median with outlier rejection</p>
              <p className="text-muted-foreground text-xs mt-1">
                Uses the median price from all active oracles after removing outliers
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Required Confirmations
              </p>
              <p className="text-xl font-medium">2/3 oracles</p>
              <p className="text-muted-foreground text-xs mt-1">
                At least 2 oracles must provide valid price data
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Oracle Update Frequency
              </p>
              <p className="text-xl font-medium">1 minute</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Price Deviation Threshold
              </p>
              <p className="text-xl font-medium">0.5%</p>
              <p className="text-muted-foreground text-xs mt-1">
                Max allowed deviation between oracle prices
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
