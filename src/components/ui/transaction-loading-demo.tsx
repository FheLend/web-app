
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionLoading } from "@/components/ui/transaction-loading";

export function TransactionLoadingDemo() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFailedOpen, setIsFailedOpen] = useState(false);

  const mockSuccessTxHash = "0x8523448ee9b5689e00dfd4613a6855ca63df93341f0fcb3fe002ed7dab64cd7e";
  const mockFailedTxHash = "0x64cfa8feecee2569d05bc0602dcc74f8946ad72aa9a5719070718ba210dfd23e";
  const mockChainId = 1; // Ethereum Mainnet

  return (
    <div className="flex flex-wrap gap-4">
      <Button onClick={() => setIsSuccessOpen(true)}>
        Show Success Transaction
      </Button>
      <Button 
        onClick={() => setIsFailedOpen(true)}
        variant="destructive"
      >
        Show Failed Transaction
      </Button>
      
      <TransactionLoading
        txHash={mockSuccessTxHash}
        chainId={mockChainId}
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
      />
      <TransactionLoading
        txHash={mockFailedTxHash}
        chainId={mockChainId}
        isOpen={isFailedOpen}
        onClose={() => setIsFailedOpen(false)}
      />
    </div>
  );
}
