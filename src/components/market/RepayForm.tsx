import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { Market } from "@/types/market";
import { useUserPositions } from "@/hooks/useUserPositions";
import { UserPositionsRepay } from "./UserPositionsRepay";

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
  const activePermitHash = useCofhejsActivePermit();

  // Get user positions
  const {
    positions,
    loading,
    error: positionsError,
  } = useUserPositions({
    marketAddress: market.id as `0x${string}`,
    enabled: !!isConnected,
  });

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

  if (loading) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Loading your positions...</p>
      </div>
    );
  }

  if (positionsError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 py-4">
        <AlertCircle className="h-4 w-4" />
        <span>Failed to load positions. Please try again.</span>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          You don't have any active positions to repay.
        </p>
      </div>
    );
  }

  return <UserPositionsRepay market={market} theme={theme} />;
}
