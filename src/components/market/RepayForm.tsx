import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BalanceInput } from "@/components/common/BalanceInput";
import { useAccount } from "wagmi";
import { useUserPositions } from "@/hooks/useUserPositions";
import { Market } from "@/types/market";
import { Loader2, AlertCircle, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { usePositionDecryption } from "@/hooks/usePositionDecryption";
import { PositionDisplay } from "./PositionDisplay";

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

  // Use our custom hook for position decryption
  const {
    decryptedValues,
    decryptCollateral,
    decryptBorrow,
    isDecryptingCollateral,
    isDecryptingBorrow,
    isDecryptedCollateral,
    isDecryptedBorrow,
  } = usePositionDecryption({
    positions,
    market,
  });

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
            const decryptedBorrow = decryptedValues[idx]?.borrow;

            return (
              <div
                key={`position-${idx}`}
                className="rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="p-4">
                  <PositionDisplay
                    position={position}
                    positionIndex={idx}
                    market={market}
                    decryptedCollateral={decryptedValues[idx]?.collateral}
                    decryptedBorrow={decryptedValues[idx]?.borrow}
                    isDecryptingCollateral={isDecryptingCollateral(idx)}
                    isDecryptingBorrow={isDecryptingBorrow(idx)}
                    isDecryptedCollateral={isDecryptedCollateral(idx)}
                    isDecryptedBorrow={isDecryptedBorrow(idx)}
                    onDecryptCollateral={() => decryptCollateral(idx)}
                    onDecryptBorrow={() => decryptBorrow(idx)}
                    displayCompact={false}
                  >
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
                  </PositionDisplay>
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
                  {expandedPositionIndex === idx && (
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
                            {decryptedValues[idx]?.borrow || "******"}{" "}
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
