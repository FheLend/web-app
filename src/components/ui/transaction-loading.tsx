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

  const truncateTxHash = (hash: string) => {
    if (!hash) return "";
    return `${hash.substring(0, 16)}...${hash.substring(hash.length - 12)}`;
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
      setStatus("pending");
      checkTransaction();
    }

    return () => {
      mounted = false;
    };
  }, [txHash, publicClient, isOpen]);

  const handleClose = () => {
    onClose();
  };

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-7 w-7 animate-spin text-primary" />;
      case "success":
        return <Check className="h-7 w-7 text-green-500" />;
      case "failed":
        return <X className="h-7 w-7 text-red-500" />;
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

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "text-primary";
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case "pending":
        return "bg-primary hover:bg-primary-600";
      case "success":
        return "bg-green-500 hover:bg-green-600";
      case "failed":
        return "bg-red-500 hover:bg-red-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-background/95 to-muted/50 backdrop-blur-xl border-2">
        <div className="flex flex-col items-center gap-6 py-6 px-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`absolute inset-0 ${getStatusColor()} opacity-20 blur-xl rounded-full`} />
              <div className="relative bg-gradient-to-br from-background/80 to-muted/50 p-4 rounded-full border border-primary/10">
                {getStatusIcon()}
              </div>
            </div>
            <div className={`text-xl font-semibold ${getStatusColor()} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              {getStatusMessage()}
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2 p-4 rounded-xl border bg-card/50 backdrop-blur-sm shadow-inner hover:bg-card/80 transition-colors duration-200">
              <button
                onClick={() => window.open(getExplorerLink(), "_blank")}
                className="truncate text-primary/90 hover:text-primary flex-grow text-center font-mono text-sm transition-colors duration-200"
                title={txHash}
              >
                {truncateTxHash(txHash)}
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                  title="Copy transaction hash"
                >
                  <Copy className="h-4 w-4 text-primary/70 hover:text-primary" />
                </button>
                <div className="w-px h-6 bg-border/50" />
                <button 
                  onClick={() => window.open(getExplorerLink(), "_blank")}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                  title="View in explorer"
                >
                  <ExternalLink className="h-4 w-4 text-primary/70 hover:text-primary" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="bg-background/50 hover:bg-background/80 transition-colors duration-200"
            >
              Close
            </Button>
            <Button 
              onClick={() => window.open(getExplorerLink(), "_blank")}
              className={`${getButtonColor()} text-white transition-colors duration-200`}
            >
              View in Explorer 
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
