
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionLoading } from "@/components/ui/transaction-loading";

export function TransactionLoadingDemo() {
  const [isOpen, setIsOpen] = useState(false);

  const mockTxHash = "0x8523448ee9b5689e00dfd4613a6855ca63df93341f0fcb3fe002ed7dab64cd7e";
  const mockChainId = 1; // Ethereum Mainnet

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Show Transaction Loading
      </Button>
      <TransactionLoading
        txHash={mockTxHash}
        chainId={mockChainId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
