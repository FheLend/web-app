import { useState } from "react";
import { useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { cn } from "@/lib/utils";

interface DepositFormProps {
  vaultId: string;
  vaultSymbol: string;
  vaultDecimals: number;
  theme: string;
  isConnected: boolean;
  address?: `0x${string}`;
  openWalletModal: () => void;
}

export function DepositForm({
  vaultId,
  vaultSymbol,
  vaultDecimals,
  theme,
  isConnected,
  address,
  openWalletModal,
}: DepositFormProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { writeContractAsync, isPending: isDepositPending } = useWriteContract();
  const activePermitHash = useCofhejsActivePermit();

  const handleDeposit = async () => {
    if (!depositAmount || !vaultId || !activePermitHash) return;

    try {
      // Convert the amount to BigInt with proper decimals
      const amountBigInt = BigInt(
        Math.floor(parseFloat(depositAmount) * 10 ** (vaultDecimals || 18))
      );
      // Encrypt the amount using cofhejs
      setIsEncrypting(true);
      const encryptedAmount = await cofhejs.encrypt([
        Encryptable.uint128(amountBigInt),
      ]);
      setIsEncrypting(false);

      if (!encryptedAmount.success) {
        throw new Error(`Failed to encrypt data: ${encryptedAmount.error}`);
      }

      const txResult = await writeContractAsync({
        address: vaultId as `0x${string}`,
        abi: [
          {
            inputs: [
              { name: "_encryptedAmount", type: "uint256" },
              { name: "_depositor", type: "address" },
              { name: "_permitHash", type: "bytes32" }
            ],
            name: "encDeposit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
          }
        ],
        functionName: "encDeposit",
        args: [encryptedAmount.data[0], address, activePermitHash],
      });

      toast({
        title: "Deposit Initiated",
        description: `Transaction submitted for ${depositAmount} ${vaultSymbol}`,
      });

      console.log("Deposit transaction hash:", txResult);

      // Reset the deposit amount
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      setIsEncrypting(false);
      toast({
        title: "Deposit Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing the deposit.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm text-muted-foreground">
            Amount to Deposit
          </label>
          <span className="text-sm text-muted-foreground">
            Balance: 0.00
          </span>
        </div>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="pr-16"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-muted-foreground">
              {vaultSymbol}
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "p-3 rounded-lg flex items-center",
          theme === "dark" ? "bg-cryptic-purple/10" : "bg-blue-50"
        )}
      >
        <Info className="h-4 w-4 text-cryptic-accent mr-2" />
        <span className="text-xs text-muted-foreground">
          Deposits are encrypted using FHE technology for maximum privacy
        </span>
      </div>

      {isConnected ? (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={handleDeposit}
          disabled={isDepositPending || !depositAmount || isEncrypting}
        >
          {isEncrypting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Encrypting...
            </>
          ) : isDepositPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Deposit {depositAmount} {vaultSymbol}</>
          )}
        </Button>
      ) : (
        <Button
          className="w-full bg-cryptic-accent hover:bg-cryptic-accent/90"
          onClick={openWalletModal}
        >
          Connect Wallet to Deposit
        </Button>
      )}
    </div>
  );
}
