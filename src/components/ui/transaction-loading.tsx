
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Loader2, Check, X } from "lucide-react";
import { usePublicClient } from "wagmi";
import { useThemeStyles } from "@/lib/themeUtils";

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
  const { isDark } = useThemeStyles();

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

  // Helper function to truncate transaction hash
  const truncateTxHash = (hash: string) => {
    if (!hash) return "";
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
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
      // Reset status to pending when dialog opens
      setStatus("pending");
      checkTransaction();
    }

    return () => {
      mounted = false;
    };
  }, [txHash, publicClient, isOpen]);

  // Reset status when dialog closes
  const handleClose = () => {
    onClose();
    // We don't reset the status immediately to avoid UI flicker during closing animation
  };

  // Status icons and messages
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case "success":
        return <Check className="h-8 w-8 text-green-500" />;
      case "failed":
        return <X className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return "Transaction Pending";
      case "success":
        return "Transaction Successful!";
      case "failed":
        return "Transaction Failed";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-4 py-4">
          {getStatusIcon()}
          <div className={`font-semibold ${
            status === "success" ? "text-green-500" : 
            status === "failed" ? "text-red-500" : "text-primary"
          }`}>
            {getStatusMessage()}
          </div>

          <div className="flex items-center gap-2 w-full max-w-full px-4 py-2 border rounded-md bg-background/50">
            <button
              onClick={() => window.open(getExplorerLink(), "_blank")}
              className="truncate text-primary hover:underline flex-grow text-center"
              title={txHash}
            >
              {truncateTxHash(txHash)}
            </button>
            <button 
              onClick={copyToClipboard} 
              className="flex-shrink-0"
              title="Copy transaction hash"
            >
              <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={handleClose}>
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
