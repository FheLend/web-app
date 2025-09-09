import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/common/BalanceInput";
import { useAccount } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { useUserPositions } from "@/hooks/useUserPositions";
import { Market } from "@/types/market";
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cofhejs, FheTypes } from "cofhejs/web";
import {
  useCofhejsIsActivePermitValid,
  useCofhejsModalStore,
} from "@/hooks/useCofhejs";
import { toast } from "@/components/ui/use-toast";

// Format number helper function
function formatNumber(value: number | string | bigint): string {
  // Convert to string if it's not already
  const valueStr = value.toString();

  // If it's a very large number in scientific notation or with many digits
  if (valueStr.includes("e") || valueStr.length > 15) {
    // Convert from BigInt or large string to a human-readable format
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

interface RepayFormProps {
  isConnected: boolean;
  market: Market;
  open: () => void;
  theme?: string;
}

export function RepayForm({
  isConnected,
  market,
  open,
  theme,
}: RepayFormProps) {
  const { address } = useAccount();
  const { positions, loading, error } = useUserPositions({
    marketAddress: market.id as `0x${string}`,
    enabled: !!isConnected && !!address,
  });

  // State for expanded position and repay amount
  const [expandedPositionIndex, setExpandedPositionIndex] = useState<
    number | null
  >(null);
  const [repayAmounts, setRepayAmounts] = useState<{
    [posIndex: number]: string;
  }>({});

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

  // Toggle position expansion
  const togglePositionExpand = (index: number) => {
    if (expandedPositionIndex === index) {
      setExpandedPositionIndex(null);
    } else {
      setExpandedPositionIndex(index);
      // Initialize repay amount for this position if not already set
      if (!repayAmounts[index]) {
        setRepayAmounts({
          ...repayAmounts,
          [index]: "",
        });
      }
    }
  };

  // Handle repay amount changes
  const handleRepayAmountChange = (index: number, value: string) => {
    setRepayAmounts({
      ...repayAmounts,
      [index]: value,
    });
  };

  // Handle repay action
  const handleRepay = (positionIndex: number) => {
    const amount = repayAmounts[positionIndex];
    // Implement actual repay logic here
    toast({
      title: "Repay Submitted",
      description: `Repaying ${amount} ${
        market.loanToken.symbol
      } for position ${positionIndex + 1}`,
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <span className="text-lg font-bold">X</span>
        </div>
        <p className="text-lg mb-2">0.00</p>
        <p className="text-muted-foreground text-sm mb-6">$0</p>
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={() => open()}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-red-500 py-4">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load positions. Please try again.</span>
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            You don't have any active positions to repay.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">Your Positions</h3>
          {positions.map((position, idx) => {
            // Get decryption status for this position
            const isDecryptingCollateral =
              decryptingPositions[idx]?.collateral || false;
            const isDecryptingBorrow =
              decryptingPositions[idx]?.borrow || false;
            const isDecrypting = isDecryptingCollateral || isDecryptingBorrow;

            // Get decrypted values if available
            const decryptedCollateral = decryptedValues[idx]?.collateral;
            const decryptedBorrow = decryptedValues[idx]?.borrow;

            // Display values based on decryption status
            const displayCollateral = decryptedCollateral || "******";
            const displayBorrowed = decryptedBorrow || "******";

            return (
              <div
                key={`position-${idx}`}
                className="rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-sm">
                          Position {idx + 1}
                        </h4>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 ml-2"
                          onClick={() => decryptPosition(idx)}
                          disabled={
                            isDecrypting ||
                            (!!decryptedCollateral && !!decryptedBorrow)
                          }
                        >
                          {isDecrypting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : decryptedCollateral && decryptedBorrow ? (
                            <Unlock className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Collateral
                          </p>
                          <p className="text-sm">
                            {displayCollateral} {market.collateralToken.symbol}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Borrowed
                          </p>
                          <p className="text-sm">
                            {displayBorrowed} {market.loanToken.symbol}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => togglePositionExpand(idx)}
                      >
                        {expandedPositionIndex === idx ? "Cancel" : "Repay"}
                        {expandedPositionIndex === idx ? (
                          <ChevronUp className="h-3 w-3 ml-1" />
                        ) : null}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expandable repay section */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    expandedPositionIndex === idx
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="p-4 border-t">
                    <div className="space-y-4">
                      <BalanceInput
                        label="Repay Amount"
                        value={repayAmounts[idx] || ""}
                        onChange={(e) =>
                          handleRepayAmountChange(idx, e.target.value)
                        }
                        tokenAddress={market.loanToken.address}
                        userAddress={address}
                        decimals={market.loanToken.decimals || 18}
                        suffixSymbol={market.loanToken.symbol}
                      />

                      <div className="flex justify-between text-sm p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                        <span className="text-muted-foreground">
                          Current loan
                        </span>
                        <span className="font-medium">
                          {decryptedBorrow || "******"}{" "}
                          {market.loanToken.symbol}
                        </span>
                      </div>

                      <Button
                        className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
                        onClick={() => handleRepay(idx)}
                        disabled={!repayAmounts[idx] || !decryptedBorrow}
                      >
                        Repay
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
