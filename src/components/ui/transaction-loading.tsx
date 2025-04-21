
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, ExternalLink } from "lucide-react";
import { usePublicClient } from "wagmi";

interface TransactionLoadingProps {
  txHash: string;
  chainId: number;
  isOpen: boolean;
  onClose: () => void;
}

type TransactionStatus = "pending" | "success" | "failed";

export function TransactionLoading({
  txHash,
  chainId,
  isOpen,
  onClose,
}: TransactionLoadingProps) {
  const [status, setStatus] = useState<TransactionStatus>("pending");
  const { toast } = useToast();
  const publicClient = usePublicClient();

  const getExplorerLink = () => {
    // This is a simplified version. In production, you'd want to support more chains
    const baseUrl = chainId === 1 ? "https://etherscan.io" : "https://goerli.etherscan.io";
    return `${baseUrl}/tx/${txHash}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(txHash);
      toast({
        description: "Transaction hash copied to clipboard",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy transaction hash",
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkTransaction = async () => {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });
        
        if (!mounted) return;
        
        setStatus(receipt.status === "success" ? "success" : "failed");
      } catch (error) {
        if (!mounted) return;
        setStatus("failed");
        console.error("Error checking transaction:", error);
      }
    };

    if (isOpen && txHash) {
      checkTransaction();
    }

    return () => {
      mounted = false;
    };
  }, [txHash, publicClient, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-4 py-4">
          {status === "pending" && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {status === "success" && (
            <div className="text-green-500 font-semibold">Transaction Successful!</div>
          )}
          {status === "failed" && (
            <div className="text-red-500 font-semibold">Transaction Failed</div>
          )}

          <div className="flex items-center gap-2 max-w-full px-4">
            <button
              onClick={() => window.open(getExplorerLink(), "_blank")}
              className="truncate text-primary hover:underline"
            >
              {txHash}
            </button>
            <button onClick={copyToClipboard} className="flex-shrink-0">
              <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => window.open(getExplorerLink(), "_blank")}>
              Open Explorer <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
