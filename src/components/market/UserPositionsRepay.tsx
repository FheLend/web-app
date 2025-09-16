import { useState } from "react";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { Market } from "@/types/market";
import { CofhejsPermitModal } from "../cofhe/CofhejsPermitModal";
import { PositionsList } from "./PositionsList";
import { useUserPositions } from "@/hooks/useUserPositions";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";

interface UserPositionsRepayProps {
  market: Market;
  theme?: string;
}

export function UserPositionsRepay({ market, theme }: UserPositionsRepayProps) {
  const { address } = useAccount();
  const [showPermitModal, setShowPermitModal] = useState(false);
  const activePermitHash = useCofhejsActivePermit();

  // Get user positions from the hook
  const { positions, loading } = useUserPositions({
    marketAddress: market.id as `0x${string}`,
    enabled: !!address,
  });

  return (
    <div className="space-y-6">
      {/* User positions */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <PositionsList positions={positions} market={market} theme={theme} />
      )}

      {/* Permit modal */}
      {showPermitModal && <CofhejsPermitModal />}
    </div>
  );
}
