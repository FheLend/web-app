import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Market } from "@/types/market";
import { Position } from "@/types/position";
import { usePositionDecryption } from "@/hooks/usePositionDecryption";
import { PositionDisplay } from "./PositionDisplay";
import { RepayPositionForm } from "./RepayPositionForm";

interface PositionsListProps {
  positions: Position[];
  market: Market;
  theme?: string;
}

export function PositionsList({
  positions,
  market,
  theme,
}: PositionsListProps) {
  const [expandedPosition, setExpandedPosition] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-xl font-medium mb-4">Your Positions</div>

      {positions.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          You don't have any positions in this market yet.
        </div>
      ) : (
        positions.map((position, index) => (
          <PositionItem
            key={`position-${index}`}
            position={position}
            positionIndex={index}
            market={market}
            isExpanded={expandedPosition === index}
            onToggleExpand={() => {
              setExpandedPosition(expandedPosition === index ? null : index);
            }}
            theme={theme}
          />
        ))
      )}
    </div>
  );
}

interface PositionItemProps {
  position: Position;
  positionIndex: number;
  market: Market;
  isExpanded: boolean;
  onToggleExpand: () => void;
  theme?: string;
}

function PositionItem({
  position,
  positionIndex,
  market,
  isExpanded,
  onToggleExpand,
  theme,
}: PositionItemProps) {
  const {
    decryptedValues,
    decryptCollateral,
    decryptBorrow,
    isDecryptingCollateral,
    isDecryptingBorrow,
    isDecryptedCollateral,
    isDecryptedBorrow,
  } = usePositionDecryption({
    positions: [position],
    market,
  });

  const decryptedCollateral = decryptedValues[0]?.collateral;
  const decryptedBorrow = decryptedValues[0]?.borrow;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        theme === "dark" ? "bg-cryptic-card" : ""
      )}
    >
      <CardContent className="p-0">
        <div
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={onToggleExpand}
        >
          <div className="flex-1">
            <PositionDisplay
              position={position}
              positionIndex={0}
              market={market}
              decryptedCollateral={decryptedCollateral}
              decryptedBorrow={decryptedBorrow}
              isDecryptingCollateral={isDecryptingCollateral(0)}
              isDecryptingBorrow={isDecryptingBorrow(0)}
              isDecryptedCollateral={isDecryptedCollateral(0)}
              isDecryptedBorrow={isDecryptedBorrow(0)}
              onDecryptCollateral={() => decryptCollateral(0)}
              onDecryptBorrow={() => decryptBorrow(0)}
              displayCompact={false}
            />
          </div>

          <div className="flex space-x-2 items-center">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <RepayPositionForm
            positionIndex={positionIndex}
            market={market}
            position={position}
            decryptedCollateral={decryptedCollateral}
            decryptedBorrow={decryptedBorrow}
            onClose={onToggleExpand}
            theme={theme}
          />
        )}
      </CardContent>
    </Card>
  );
}
