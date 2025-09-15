import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAccount } from "wagmi";
import { Market } from "@/types/market";
import { useUserPositions } from "@/hooks/useUserPositions";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  usePositionDecryption,
  calculateTotalPositionValues,
} from "@/hooks/usePositionDecryption";
import { PositionDisplay } from "./PositionDisplay";

interface UserPositionCardProps {
  market: Market;
  cardStyles: string;
}

export function UserPositionCard({
  market,
  cardStyles,
}: UserPositionCardProps) {
  const { address, isConnected } = useAccount();
  const { positions, loading, error } = useUserPositions({
    marketAddress: market.id as `0x${string}`,
    enabled: !!isConnected && !!address,
  });

  // Use our custom hook for position decryption
  const {
    decryptedValues,
    decryptingPositions,
    decryptPosition,
    decryptCollateral,
    decryptBorrow,
    isDecryptingCollateral,
    isDecryptingBorrow,
    isDecryptedCollateral,
    isDecryptedBorrow,
    calculatePositionLtv,
  } = usePositionDecryption({
    positions,
    market,
  });

  console.log("User positions:", positions);

  // Only show loader for connected users
  const showLoading = isConnected && loading;

  // Calculate total values based on decrypted data
  const { totalCollateral, totalBorrowed, ltvPercentage } =
    calculateTotalPositionValues(positions, decryptedValues);

  return (
    <Card className={cardStyles}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Your positions
          <span className="text-xs text-muted-foreground ml-2">
            ({positions.length} active position
            {positions.length !== 1 ? "s" : ""})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-red-500 py-2">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load positions. Please try again.</span>
          </div>
        ) : (
          <>
            {positions.length > 0 && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Total collateral ({market.collateralToken.symbol})
                    </span>
                    <div className="flex items-center">
                      <span>{totalCollateral}</span>
                      <img
                        src={market.collateralToken.logo}
                        alt={market.collateralToken.symbol}
                        className="h-4 w-4 rounded-full ml-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Total borrowed ({market.loanToken.symbol})
                    </span>
                    <div className="flex items-center">
                      <span>{totalBorrowed}</span>
                      <img
                        src={market.loanToken.logo}
                        alt={market.loanToken.symbol}
                        className="h-4 w-4 rounded-full ml-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      LTV / Liquidation LTV
                    </span>
                    <span>
                      {ltvPercentage}% /{" "}
                      {market.liquidationThresholdBasisPoint / 100}%
                    </span>
                  </div>
                  {ltvPercentage !== "*****" && (
                    <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(parseFloat(ltvPercentage), 100)}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <div className="space-y-3">
                    {positions.map((position, idx) => {
                      // Using our custom hook helpers
                      const posLtv = calculatePositionLtv(idx);

                      return (
                        <div key={`position-${idx}`}>
                          <PositionDisplay
                            position={position}
                            positionIndex={idx}
                            market={market}
                            decryptedCollateral={
                              decryptedValues[idx]?.collateral
                            }
                            decryptedBorrow={decryptedValues[idx]?.borrow}
                            isDecryptingCollateral={isDecryptingCollateral(idx)}
                            isDecryptingBorrow={isDecryptingBorrow(idx)}
                            isDecryptedCollateral={isDecryptedCollateral(idx)}
                            isDecryptedBorrow={isDecryptedBorrow(idx)}
                            posLtv={posLtv}
                            onDecryptCollateral={() => decryptCollateral(idx)}
                            onDecryptBorrow={() => decryptBorrow(idx)}
                            displayCompact={true}
                          >
                            <Button className="h-7 text-xs ml-3">Repay</Button>
                          </PositionDisplay>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
