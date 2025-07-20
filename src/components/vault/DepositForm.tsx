import { useState } from "react";
import React from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { Encryptable, cofhejs } from "cofhejs/web";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCofhejsActivePermit } from "@/hooks/useCofhejs";
import { cn } from "@/lib/utils";
import { BalanceInput } from "@/components/ui/BalanceInput";
import { CofhejsPermitModal } from "@/components/cofhe/CofhejsPermitModal";
import VaultAbi from "@/constant/abi/VaultFHE.json";
import { signTypedData } from "@wagmi/core";
import { config } from "@/configs/wagmi";
import { parseSignature } from "viem";
interface DepositFormProps {
  vaultId: string;
  vaultAsset: string;
  vaultSymbol: string;
  vaultDecimals: number;
  theme: string;
  isConnected: boolean;
  openWalletModal: () => void;
}

export function DepositForm({
  vaultId,
  vaultSymbol,
  vaultAsset,
  vaultDecimals,
  theme,
  isConnected,
  openWalletModal,
}: DepositFormProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const { writeContractAsync, isPending: isDepositPending } =
    useWriteContract();
  const activePermitHash = useCofhejsActivePermit();
  const { address } = useAccount();
  const publicClient = usePublicClient();

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

      const { domain } = await publicClient.getEip712Domain({
        address: vaultAsset as `0x${string}`,
      });

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value_hash", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      const message = {
        owner: address,
        spender: "0x74dDd26014d1f3783f109Ca67888c0FdFE4Ea425", // Felend FHE WETH/USDC Market
        value_hash: encryptedAmount.data[0].ctHash,
        deadline: activePermitHash.expiration,
      };

      const signature = await signTypedData(config, {
        account: address,
        domain,
        types,
        primaryType: "Permit",
        message,
      });
      const { v, r, s } = parseSignature(signature);

      const permit = {
        owner: address,
        spender: "0x74dDd26014d1f3783f109Ca67888c0FdFE4Ea425", // Felend FHE WETH/USDC Market
        value_hash: encryptedAmount.data[0].ctHash,
        deadline: activePermitHash.expiration,
        v,
        r,
        s,
      };

      // @ts-ignore
      const txResult = await writeContractAsync({
        address: vaultId as `0x${string}`,
        abi: VaultAbi.abi,
        functionName: "encDeposit",
        args: [encryptedAmount.data[0], address, permit],
      });

      const txUrl = `https://sepolia.arbiscan.io/tx/${txResult}`;
      
      toast({
        title: "Deposit Initiated",
        description: (
          <div>
            Transaction submitted for {depositAmount} {vaultSymbol}
            <br />
            <a 
              href={txUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-blue-500 hover:text-blue-700"
            >
              View on Arbiscan
            </a>
          </div>
        ),
        duration: 10000, // 10 seconds
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
        duration: 10000, // 10 seconds
      });
    }
  };

  return (
    <div className="space-y-4">
      <BalanceInput
        label="Amount to Deposit"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        tokenAddress={vaultAsset}
        userAddress={address}
        decimals={vaultDecimals}
        suffixSymbol={vaultSymbol}
      />

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
          needFHE
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
            <>Deposit {vaultSymbol}</>
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

      {/* Include the permit modal component */}
      <CofhejsPermitModal />
    </div>
  );
}
