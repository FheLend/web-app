
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl border-2">
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-xl rounded-full" />
            <div className="relative">
              {getStatusIcon()}
            </div>
          </div>
          
          <div className={`text-lg font-semibold ${
            status === "success" ? "text-green-500" : 
            status === "failed" ? "text-red-500" : "text-primary"
          } animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {getStatusMessage()}
          </div>

          <div className="w-full max-w-full px-4">
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-card/50 backdrop-blur-sm shadow-inner hover:bg-card/80 transition-colors duration-200">
              <button
                onClick={() => window.open(getExplorerLink(), "_blank")}
                className="truncate text-primary/90 hover:text-primary flex-grow text-center font-mono text-sm transition-colors duration-200"
                title={txHash}
              >
                {truncateTxHash(txHash)}
              </button>
              <button 
                onClick={copyToClipboard}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-primary/10 transition-colors duration-200"
                title="Copy transaction hash"
              >
                <Copy className="h-4 w-4 text-primary/70 hover:text-primary" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="bg-background/50 hover:bg-background/80 transition-colors duration-200"
            >
              Close
            </Button>
            <Button 
              onClick={() => window.open(getExplorerLink(), "_blank")}
              className="bg-primary/90 hover:bg-primary transition-colors duration-200"
            >
              Open Explorer 
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
