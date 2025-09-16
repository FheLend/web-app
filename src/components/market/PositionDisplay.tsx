import React from "react";
import { Button } from "@/components/ui/button";
import { Market } from "@/types/market";
import { Loader2, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { Position } from "@/types/position";
import { formatNumber } from "@/utils/converter";

interface PositionDisplayProps {
  position: Position;
  positionIndex: number;
  market: Market;
  decryptedCollateral?: string;
  decryptedBorrow?: string;
  isDecryptingCollateral?: boolean;
  isDecryptingBorrow?: boolean;
  isDecryptedCollateral: boolean;
  isDecryptedBorrow: boolean;
  posLtv?: number;
  onDecryptCollateral: () => void;
  onDecryptBorrow: () => void;
  displayCompact?: boolean;
  children?: React.ReactNode;
}

/**
 * A reusable component for displaying encrypted/decrypted position data
 */
export function PositionDisplay({
  position,
  positionIndex,
  market,
  decryptedCollateral,
  decryptedBorrow,
  isDecryptingCollateral = false,
  isDecryptingBorrow = false,
  isDecryptedCollateral,
  isDecryptedBorrow,
  posLtv,
  onDecryptCollateral,
  onDecryptBorrow,
  displayCompact = false,
  children,
}: PositionDisplayProps) {
  // Display value based on decryption status
  const displayCollateral = decryptedCollateral
    ? formatNumber(decryptedCollateral)
    : "******";
  const displayBorrowed = decryptedBorrow
    ? formatNumber(decryptedBorrow)
    : "******";

  // Derived state for backward compatibility
  const isDecrypting = isDecryptingCollateral || isDecryptingBorrow;
  const isDecrypted = isDecryptedCollateral && isDecryptedBorrow;

  return (
    <div
      className={`${
        displayCompact ? "bg-background-subtle p-3 rounded-lg" : ""
      }`}
    >
      <div className="flex justify-between text-xs mb-1">
        <span>Position {positionIndex + 1}</span>
      </div>
      <div
        className={`${
          displayCompact
            ? "grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm"
            : "grid grid-cols-2 gap-2 mt-1"
        }`}
      >
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span
              className={`text-muted-foreground ${
                displayCompact ? "" : "text-xs"
              }`}
            >
              Collateral
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={onDecryptCollateral}
              disabled={isDecryptingCollateral || isDecryptedCollateral}
            >
              {isDecryptingCollateral ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isDecryptedCollateral ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </div>
          <span className={`${displayCompact ? "font-medium" : "text-sm"}`}>
            {displayCollateral} {market.collateralToken.symbol}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span
              className={`text-muted-foreground ${
                displayCompact ? "" : "text-xs"
              }`}
            >
              Borrowed
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 p-0"
              onClick={onDecryptBorrow}
              disabled={isDecryptingBorrow || isDecryptedBorrow}
            >
              {isDecryptingBorrow ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isDecryptedBorrow ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </div>
          <span className={`${displayCompact ? "font-medium" : "text-sm"}`}>
            {displayBorrowed} {market.loanToken.symbol}
          </span>
        </div>

        {displayCompact && (
          <>
            <div>
              <span className="text-muted-foreground">
                LTV: {isDecrypted ? `${posLtv?.toFixed(2)}%` : "*****"}
              </span>
            </div>
            <div className="flex justify-end">{children}</div>
          </>
        )}

        {!displayCompact && (
          <div className="col-span-2 flex items-center mt-2">{children}</div>
        )}
      </div>
    </div>
  );
}
