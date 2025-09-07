import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useAccount } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { Market } from "@/types/market";
import { useUserPositions } from "@/hooks/useUserPositions";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cofhejs, FheTypes } from "cofhejs/web";
import {
  useCofhejsIsActivePermitValid,
  useCofhejsModalStore,
} from "@/hooks/useCofhejs";
import { toast } from "@/components/ui/use-toast";

// Format number for display with proper decimal places and commas
// This handles both number and string inputs to account for large values
function formatNumber(value: number | string | bigint): string {
  // Convert to string if it's not already
  const valueStr = value.toString();

  // If it's a very large number in scientific notation or with many digits
  if (valueStr.includes("e") || valueStr.length > 15) {
    // Convert from BigInt or large string to a human-readable format
    // For crypto amounts with 18 decimals
    try {
      // If it's a bigint or a string representation of a large integer
      if (typeof value === "bigint" || /^\d+$/.test(valueStr)) {
        // Format with 18 decimal places (standard for ETH/tokens)
        const formatted = formatUnits(BigInt(valueStr), 18);

        // Parse to float for further formatting
        const numValue = parseFloat(formatted);

        // Apply appropriate formatting based on the size
        if (numValue < 0.0001 && numValue > 0) {
          return numValue.toExponential(4);
        } else if (numValue < 1) {
          return numValue.toFixed(4);
        } else if (numValue < 1000) {
          return numValue.toFixed(2);
        } else {
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
      }
    } catch (e) {
      console.error("Error formatting large number:", e);
      // Fallback to truncation if conversion fails
      return valueStr.slice(0, 10) + "...";
    }
  }

  // For regular numbers
  const numValue = typeof value === "number" ? value : parseFloat(valueStr);

  // If the number is very small (near zero), show more decimal places
  if (numValue > 0 && numValue < 0.0001) {
    return numValue.toExponential(2);
  }
  // For small numbers, show 4 decimal places
  else if (numValue < 1) {
    return numValue.toFixed(4);
  }
  // For medium numbers, show 2 decimal places
  else if (numValue < 1000) {
    return numValue.toFixed(2);
  }
  // For large numbers, use locale string with 2 decimal places
  else {
    return numValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}

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

  // State to track decrypted values for each position
  const [decryptedValues, setDecryptedValues] = useState<{
    [posIndex: number]: { collateral?: string; borrow?: string };
  }>({});
  const [decryptingPositions, setDecryptingPositions] = useState<{
    [posIndex: number]: { collateral: boolean; borrow: boolean };
  }>({});

  // Permit validation
  const { valid: isPermitValid } = useCofhejsIsActivePermitValid();
  const { setGeneratePermitModalOpen } = useCofhejsModalStore();

  console.log("User positions:", positions);

  // Only show loader for connected users
  const showLoading = isConnected && loading;

  // Function to handle permit generation
  const handleGeneratePermit = (posIndex: number) => {
    setGeneratePermitModalOpen(true, () => {
      // After permit is generated, attempt to decrypt again
      toast({
        title: "Permit generated",
        description: "Decrypting your position data...",
      });

      // Retry decryption after permit is generated
      decryptPosition(posIndex, true);
    });
  };

  // Function to decrypt an individual value
  const decryptValue = async (
    posIndex: number,
    valueType: "collateral" | "borrow",
    encryptedValue: bigint
  ): Promise<string | null> => {
    try {
      // Decrypt the value
      const decryptedResult = await cofhejs.decrypt(
        encryptedValue,
        FheTypes.Uint128
      );

      if (decryptedResult.success) {
        // Format the value
        const valueInWei = decryptedResult.data;
        return formatNumber(valueInWei);
      } else {
        throw new Error(decryptedResult.error?.code || "Decryption failed");
      }
    } catch (error) {
      console.error(`Error decrypting ${valueType}:`, error);
      return null;
    }
  };

  // Function to decrypt both collateral and borrow amounts of a position
  const decryptPosition = async (posIndex: number, skipPermitCheck = false) => {
    // Set loading state for this position
    setDecryptingPositions((prev) => ({
      ...prev,
      [posIndex]: {
        collateral: true,
        borrow: true,
      },
    }));

    try {
      if (!skipPermitCheck && !isPermitValid) {
        // Reset loading state
        setDecryptingPositions((prev) => ({
          ...prev,
          [posIndex]: {
            collateral: false,
            borrow: false,
          },
        }));

        // Show permit modal if no valid permit exists
        handleGeneratePermit(posIndex);
        return;
      }

      // Get the encrypted values
      const encryptedCollateral = BigInt(
        positions[posIndex].collateralAmount || "0"
      );
      const encryptedBorrow = BigInt(positions[posIndex].borrowAmount || "0");

      // Decrypt both values in parallel
      const [decryptedCollateral, decryptedBorrow] = await Promise.all([
        decryptValue(posIndex, "collateral", encryptedCollateral),
        decryptValue(posIndex, "borrow", encryptedBorrow),
      ]);

      // If either decryption failed, throw error
      if (!decryptedCollateral || !decryptedBorrow) {
        throw new Error("Failed to decrypt one or both values");
      }

      // Store the decrypted values
      setDecryptedValues((prev) => ({
        ...prev,
        [posIndex]: {
          collateral: decryptedCollateral,
          borrow: decryptedBorrow,
        },
      }));
    } catch (error) {
      console.error(`Error decrypting position:`, error);
      toast({
        title: `Error decrypting position`,
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setDecryptingPositions((prev) => ({
        ...prev,
        [posIndex]: {
          collateral: false,
          borrow: false,
        },
      }));
    }
  };

  // Calculate total values based on decrypted data
  const calculateTotals = () => {
    // Initialize with encrypted placeholders
    let totalCollateral = "*****";
    let totalBorrowed = "*****";
    let ltvPercentage = "*****";

    // Check if we have decrypted values for all positions
    const allCollateralDecrypted = positions.every(
      (_, idx) => !!decryptedValues[idx]?.collateral
    );
    const allBorrowDecrypted = positions.every(
      (_, idx) => !!decryptedValues[idx]?.borrow
    );

    // If all values are decrypted, calculate totals
    if (allCollateralDecrypted && allBorrowDecrypted) {
      let collateralTotal = 0;
      let borrowTotal = 0;

      positions.forEach((_, idx) => {
        // Get the decrypted values and convert to numbers
        const collateral = parseFloat(
          decryptedValues[idx]?.collateral?.replace(/,/g, "") || "0"
        );
        const borrow = parseFloat(
          decryptedValues[idx]?.borrow?.replace(/,/g, "") || "0"
        );

        collateralTotal += collateral;
        borrowTotal += borrow;
      });

      // Format totals for display
      totalCollateral = collateralTotal.toFixed(2);
      totalBorrowed = borrowTotal.toFixed(2);

      // Calculate LTV
      const ltv =
        collateralTotal > 0 ? (borrowTotal / collateralTotal) * 100 : 0;
      ltvPercentage = ltv.toFixed(2);
    }

    return { totalCollateral, totalBorrowed, ltvPercentage };
  };

  const { totalCollateral, totalBorrowed, ltvPercentage } = calculateTotals();

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
                      // Get the decryption status for this position
                      const isDecryptingCollateral =
                        decryptingPositions[idx]?.collateral || false;
                      const isDecryptingBorrow =
                        decryptingPositions[idx]?.borrow || false;

                      // Get decrypted values if available
                      const decryptedCollateral =
                        decryptedValues[idx]?.collateral;
                      const decryptedBorrow = decryptedValues[idx]?.borrow;

                      // Display value based on decryption status
                      const displayCollateral = decryptedCollateral || "******";
                      const displayBorrowed = decryptedBorrow || "******";

                      // Calculate LTV (only if both values are decrypted)
                      let posLtv = 0;
                      if (decryptedCollateral && decryptedBorrow) {
                        // Convert from formatted string back to numbers for LTV calc
                        const collateralValue = parseFloat(
                          decryptedCollateral.replace(/,/g, "")
                        );
                        const borrowValue = parseFloat(
                          decryptedBorrow.replace(/,/g, "")
                        );
                        posLtv =
                          collateralValue > 0
                            ? (borrowValue / collateralValue) * 100
                            : 0;
                      }

                      return (
                        <div
                          key={`position-${idx}`}
                          className="bg-background-subtle p-3 rounded-lg"
                        >
                          <div className="flex justify-between text-xs mb-1">
                            <span>
                              Position {idx + 1} (Tick: {position.tick})
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                            <div>
                              <span className="block text-muted-foreground">
                                Collateral
                              </span>
                              <span className="font-medium">
                                {displayCollateral}{" "}
                                {market.collateralToken.symbol}
                              </span>
                            </div>
                            <div>
                              <span className="block text-muted-foreground">
                                Borrowed
                              </span>
                              <span className="font-medium">
                                {displayBorrowed} {market.loanToken.symbol}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                LTV:{" "}
                                {decryptedCollateral && decryptedBorrow
                                  ? `${posLtv.toFixed(2)}%`
                                  : "*****"}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => decryptPosition(idx)}
                                disabled={
                                  isDecryptingCollateral ||
                                  isDecryptingBorrow ||
                                  (!!decryptedCollateral && !!decryptedBorrow)
                                }
                              >
                                {isDecryptingCollateral ||
                                isDecryptingBorrow ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Decrypting...
                                  </>
                                ) : decryptedCollateral && decryptedBorrow ? (
                                  <>
                                    <Unlock className="h-3 w-3 mr-1" />
                                    Decrypted
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-3 w-3 mr-1" />
                                    Decrypt
                                  </>
                                )}
                              </Button>
                              <Button className="h-7 text-xs ml-3">
                                Repay
                              </Button>
                            </div>
                          </div>
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
